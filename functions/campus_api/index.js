/* Software Operativo · Campus Experience — API en Zoho Catalyst (función Advanced I/O, Node.js)
   URL: /server/campus_api/...

   Doble control de acceso:
     1) Usuario ACTIVO del Zoho CRM de ISL (al crear la cuenta, al entrar y cada 30 min de uso).
     2) Accesos por apartado y subapartado que da el administrador (sin acceso / ver / editar).
   Las contraseñas las gestiona este software (scrypt con sal) y se guardan en el Data Store.
*/
"use strict";
const crypto = require("crypto");

const env = (k, d) => (process.env[k] === undefined || process.env[k] === "" ? d : process.env[k]);
const CFG = {
  idleMin: +env("SESSION_IDLE_MIN", 480),
  maxHours: +env("SESSION_MAX_HOURS", 72),
  zohoRecheckMin: +env("ZOHO_RECHECK_MIN", 30),
  zohoGraceHours: +env("ZOHO_GRACE_HOURS", 12),
  setupKey: env("CE_SETUP_KEY", ""),
  origins: env("CE_ALLOWED_ORIGINS", "").split(",").map(s => s.trim()).filter(Boolean),
  loginUrl: env("CE_LOGIN_URL", "/app/login.html"),
  zoho: {
    clientId: env("ZOHO_CLIENT_ID", ""), clientSecret: env("ZOHO_CLIENT_SECRET", ""), refreshToken: env("ZOHO_REFRESH_TOKEN", ""),
    accountsUrl: env("ZOHO_ACCOUNTS_URL", "https://accounts.zoho.eu").replace(/\/$/, ""),
    apiUrl: env("ZOHO_API_URL", "https://www.zohoapis.eu").replace(/\/$/, ""),
  },
};
const makeStore = require(env("CE_STORE_MODULE", "./store.js"));

/* ---------- catálogo de permisos ---------- */
const CATALOG = [
  { k: "registros", b: "Registros", l: "Registros", subs: [["madrid", "Madrid (semanas)"], ["campus", "Nacionales e institucionales"], ["todos", "Todos los registros"]] },
  { k: "horarios", b: "Operativa", l: "Horarios", subs: [["semanas", "Horarios de las semanas"], ["campus", "Nacionales"], ["simulador", "Simulador"]] },
  { k: "equipos", b: "Operativa", l: "Equipos", subs: [["madrid", "Madrid (semanas)"], ["campus", "Nacionales e institucionales"]] },
  { k: "contabilidad", b: "Administración", l: "Contabilidad", subs: [["pagos", "Pagos"], ["devoluciones", "Devoluciones"], ["cancelaciones", "Cancelaciones"], ["facturas", "Control de facturas"]] },
  { k: "atencion", b: "Atención al público", l: "Atención al público", subs: [["general", "Atención al público"]] },
  { k: "marketing", b: "Marketing", l: "Marketing", subs: [["general", "Marketing"]] },
  { k: "rrhh", b: "Recursos Humanos", l: "Recursos Humanos", subs: [["general", "Recursos Humanos"]] },
];
const PERM_KEYS = CATALOG.flatMap(a => a.subs.map(s => a.k + "." + s[0]));
const cleanPerms = p => { const o = {}; if (p && typeof p === "object") for (const k of PERM_KEYS) { const v = +p[k]; if (v === 1 || v === 2) o[k] = v; } return o; };
const hydrate = u => { if (!u) return null; let p = {}; try { p = JSON.parse(u.perms || "{}"); } catch (e) {} u.permsObj = cleanPerms(p); return u; };
const lvl = (u, key) => (u.is_admin ? 2 : (u.permsObj[key] || 0));
const anyOf = (u, a, min = 1) => u.is_admin || PERM_KEYS.some(k => k.startsWith(a + ".") && (u.permsObj[k] || 0) >= min);
const COLS = {
  ops:   { read: u => anyOf(u, "registros"), write: u => anyOf(u, "registros", 2) },
  teams: { read: u => anyOf(u, "equipos") || anyOf(u, "horarios"), write: (u, id) => lvl(u, String(id).startsWith("c-") ? "equipos.campus" : "equipos.madrid") >= 2 },
  reqs:  { read: u => anyOf(u, "equipos"), write: (u, id) => lvl(u, String(id).startsWith("c-") ? "equipos.campus" : "equipos.madrid") >= 2 },
  hor:   { read: u => anyOf(u, "horarios"), write: (u, id) => lvl(u, String(id).startsWith("c-") ? "horarios.campus" : "horarios.semanas") >= 2 },
  hweek: { read: u => anyOf(u, "horarios"), write: (u, id) => lvl(u, String(id).startsWith("c-") ? "horarios.campus" : "horarios.semanas") >= 2 },
  happr: { read: u => anyOf(u, "horarios"), write: (u, id) => lvl(u, String(id).startsWith("c-") ? "horarios.campus" : "horarios.semanas") >= 2 },
  hbus:  { read: u => anyOf(u, "horarios"), write: (u, id) => lvl(u, String(id).startsWith("c-") ? "horarios.campus" : "horarios.semanas") >= 2 },
  hsim:  { read: u => lvl(u, "horarios.simulador") >= 1, write: u => lvl(u, "horarios.simulador") >= 2 },
};
const canZoho = u => ["registros", "equipos", "horarios", "contabilidad"].some(a => anyOf(u, a));
const DOC_ID = /^[A-Za-z0-9_.:|\-]{1,200}$/;
const EMAIL = /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/;

/* ---------- contraseñas ---------- */
const SC = { N: 32768, r: 8, p: 1, len: 64, maxmem: 96 * 1024 * 1024 };
const hashPw = pw => new Promise((res, rej) => { const salt = crypto.randomBytes(16); crypto.scrypt(pw, salt, SC.len, { N: SC.N, r: SC.r, p: SC.p, maxmem: SC.maxmem }, (e, k) => e ? rej(e) : res(["scrypt", SC.N, SC.r, SC.p, salt.toString("base64"), k.toString("base64")].join("$"))); });
const checkPw = (pw, stored) => new Promise(res => {
  const parts = String(stored || "").split("$"); if (parts.length !== 6 || parts[0] !== "scrypt") return res(false);
  const [, N, r, p, salt, hash] = parts; const want = Buffer.from(hash, "base64");
  crypto.scrypt(pw, Buffer.from(salt, "base64"), want.length, { N: +N, r: +r, p: +p, maxmem: SC.maxmem }, (e, k) => res(!e && crypto.timingSafeEqual(k, want)));
});
let DUMMY = null; const dummyHash = async () => DUMMY || (DUMMY = await hashPw(crypto.randomBytes(12).toString("hex")));
const pwProblem = pw => {
  if (typeof pw !== "string" || pw.length < 10) return "La contraseña debe tener al menos 10 caracteres.";
  if (pw.length > 200) return "La contraseña es demasiado larga.";
  if (!/[A-Za-zÀ-ÿ]/.test(pw) || !/[0-9]/.test(pw)) return "La contraseña debe incluir letras y números.";
  return null;
};

/* ---------- Zoho CRM (solo lectura) ---------- */
const Z = { token: null, exp: 0, cache: new Map(), users: null, usersAt: 0 };
let MOCK = null; if (env("ZOHO_MOCK_FILE", "")) MOCK = JSON.parse(require("fs").readFileSync(env("ZOHO_MOCK_FILE"), "utf8")); // SOLO pruebas locales
const zohoConfigured = () => !!MOCK || !!(CFG.zoho.clientId && CFG.zoho.clientSecret && CFG.zoho.refreshToken);
async function zohoToken() {
  if (Z.token && Date.now() < Z.exp - 60000) return Z.token;
  const body = new URLSearchParams({ grant_type: "refresh_token", client_id: CFG.zoho.clientId, client_secret: CFG.zoho.clientSecret, refresh_token: CFG.zoho.refreshToken });
  const r = await fetch(CFG.zoho.accountsUrl + "/oauth/v2/token", { method: "POST", body, signal: AbortSignal.timeout(15000) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) throw Object.assign(new Error("No se pudo obtener el token de Zoho: " + (j.error || r.status)), { status: 502 });
  Z.token = j.access_token; Z.exp = Date.now() + (j.expires_in || 3600) * 1000; return Z.token;
}
async function zohoFetch(pathname, init = {}) {
  const t = await zohoToken();
  const r = await fetch(CFG.zoho.apiUrl + pathname, Object.assign({}, init, { headers: Object.assign({ Authorization: "Zoho-oauthtoken " + t }, init.headers || {}), signal: AbortSignal.timeout(30000) }));
  if (r.status === 204) return { status: 204, json: null };
  return { status: r.status, json: await r.json().catch(() => null) };
}
async function zohoCoql(q) {
  if (MOCK) { const m = /limit (\d+), (\d+)/i.exec(q); const o = m ? +m[1] : 0, n = m ? +m[2] : 100; const src = q.includes("Personas_Autorizadas") ? (MOCK.auth || []) : q.includes("Campus_y_servicios") ? (MOCK.weeks || []) : (MOCK.deals || []); return { data: src.slice(o, o + n), info: { more_records: o + n < src.length } }; }
  const { status, json } = await zohoFetch("/crm/v6/coql", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ select_query: q }) });
  if (status === 204) return { data: [], info: { count: 0, more_records: false } };
  if (status >= 400) throw Object.assign(new Error((json && (json.message || json.code)) || "Error de Zoho " + status), { status: 502 });
  return json;
}
async function zohoActiveUsers(force) {
  if (!force && Z.users && Date.now() - Z.usersAt < 5 * 60000) return Z.users;
  let list = [];
  if (MOCK) list = MOCK.users || [];
  else for (let page = 1; page <= 20; page++) {
    const { status, json } = await zohoFetch("/crm/v6/users?type=ActiveConfirmedUsers&per_page=200&page=" + page);
    if (status === 204 || !json) break;
    if (status >= 400) throw Object.assign(new Error("Zoho no devolvió los usuarios (" + status + ")"), { status: 502 });
    list.push(...(json.users || [])); if (!json.info || !json.info.more_records) break;
  }
  Z.users = list.filter(u => u.status === "active" && u.confirm !== false && u.email).map(u => ({ id: String(u.id), name: u.full_name || [u.first_name, u.last_name].filter(Boolean).join(" ") || u.email, email: String(u.email).toLowerCase(), role: (u.role && u.role.name) || "", profile: (u.profile && u.profile.name) || "" }));
  Z.usersAt = Date.now(); return Z.users;
}
async function zohoStatusOf(zohoId) {
  try {
    if (MOCK) { const u = (MOCK.users || []).find(x => String(x.id) === String(zohoId)); return u && u.status === "active" && u.confirm !== false ? "active" : "inactive"; }
    const { status, json } = await zohoFetch("/crm/v6/users/" + encodeURIComponent(zohoId));
    if (status === 204 || status === 404) return "inactive";
    if (status >= 500 || !json) return "unknown";
    if (status >= 400) return json && json.code === "INVALID_DATA" ? "inactive" : "unknown";
    const u = (json.users || [])[0]; return u && u.status === "active" && u.confirm !== false ? "active" : "inactive";
  } catch (e) { return "unknown"; }
}

/* Zoho Books: listado de facturas de una serie (solo lectura) */
const BOOKS = { org: env("ZOHO_BOOKS_ORG", "20110950454"), url: env("ZOHO_BOOKS_URL", "https://www.zohoapis.eu/books/v3").replace(/\/$/, "") };
async function booksInvoices(prefix, page, mode) {
  if (MOCK) { const pages = MOCK.invoices || []; return pages[page - 1] || { invoices: [], page_context: { has_more_page: false } }; }
  const t = await zohoToken();
  const u = BOOKS.url + "/invoices?organization_id=" + encodeURIComponent(BOOKS.org) + "&invoice_number_" + (mode === "contains" ? "contains" : "startswith") + "=" + encodeURIComponent(prefix) + "&per_page=200&page=" + page;
  const r = await fetch(u, { headers: { Authorization: "Zoho-oauthtoken " + t }, signal: AbortSignal.timeout(30000) });
  const j = await r.json().catch(() => null);
  if (!r.ok || !j) throw Object.assign(new Error((j && j.message) || "Error de Zoho Books " + r.status), { status: 502 });
  return j;
}
/* ---------- utilidades HTTP ---------- */
const SEC = { "X-Content-Type-Options": "nosniff", "Referrer-Policy": "same-origin", "Cache-Control": "no-store" };
const send = (res, code, body, headers = {}) => {
  const isObj = body !== null && typeof body === "object";
  res.writeHead(code, Object.assign({}, SEC, isObj ? { "Content-Type": "application/json; charset=utf-8" } : {}, headers));
  res.end(isObj ? JSON.stringify(body) : body);
};
const fail = (res, code, msg) => send(res, code, { error: msg });
const ipOf = req => String(req.headers["x-forwarded-for"] || (req.socket && req.socket.remoteAddress) || "").split(",")[0].trim();
const readBody = (req, max = 4 * 1024 * 1024) => new Promise((resolve, reject) => {
  if (req.body !== undefined && req.body !== null && typeof req.body === "object" && !Buffer.isBuffer(req.body)) return resolve(req.body);
  let n = 0; const chunks = [];
  req.on("data", c => { n += c.length; if (n > max) { reject(Object.assign(new Error("Demasiado grande"), { status: 413 })); } else chunks.push(c); });
  req.on("end", () => { if (!n) return resolve({}); try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8"))); } catch (e) { reject(Object.assign(new Error("JSON no válido"), { status: 400 })); } });
  req.on("error", reject);
});
const cookies = req => Object.fromEntries(String(req.headers.cookie || "").split(";").map(s => s.trim().split("=")).filter(p => p[0]).map(([k, ...v]) => [k, decodeURIComponent(v.join("="))]));
const LOCAL = env("CE_LOCAL_TEST", "") === "1";
const COOKIE = LOCAL ? "ce_sess" : "__Host-ce_sess";
const setCookie = (res, val, maxAge) => res.setHeader("Set-Cookie", COOKIE + "=" + val + "; Path=/; HttpOnly; SameSite=Strict" + (LOCAL ? "" : "; Secure") + (maxAge != null ? "; Max-Age=" + maxAge : ""));
const sha = t => crypto.createHash("sha256").update(t).digest("hex");
const nowISO = () => new Date().toISOString();

/* ---------- respuesta pública ---------- */
const pubUser = u => ({ id: u.id, email: u.email, name: u.name, zohoRole: u.zoho_role || "", zohoProfile: u.zoho_profile || "", admin: u.is_admin, active: u.active, perms: u.permsObj, mustChange: u.must_change, lastLogin: u.last_login, createdAt: u.created_at, zohoStatus: u.zoho_status || "", zohoOkAt: u.zoho_ok_at ? new Date(u.zoho_ok_at).toISOString() : null });
const aclFor = u => ({ id: "u" + u.id, name: u.name, email: u.email, admin: u.is_admin, perms: u.is_admin ? Object.fromEntries(PERM_KEYS.map(k => [k, 2])) : u.permsObj, mustChange: u.must_change, catalog: CATALOG });

/* ---------- la petición ---------- */
async function handle(req, res) {
  const st = makeStore(req);
  const url = new URL(req.url, "http://x");
  let p = url.pathname.replace(/^\/server\/campus_api/, "") || "/";
  const M = req.method, ip = ipOf(req);
  const audit = (u, action, detail) => st.audit.add({ ts: nowISO(), user_id: u ? u.id : null, email: u ? u.email : null, action, detail: detail ? String(detail).slice(0, 500) : null, ip });

  /* reglas de Zoho y sesión */
  const markZoho = async (u, s) => { if (s === "active") await st.users.update(u.id, { zoho_ok_at: Date.now(), zoho_status: "active" }); else if (s === "inactive") await st.users.update(u.id, { zoho_status: "inactive" }); };
  const zohoGate = async u => {
    const s = await zohoStatusOf(u.zoho_id); await markZoho(u, s);
    if (s === "active") return { ok: true };
    if (s === "inactive") return { ok: false, msg: "Tu usuario de Zoho CRM no está activo. Habla con el administrador." };
    return u.zoho_ok_at && Date.now() - u.zoho_ok_at < CFG.zohoGraceHours * 3600000 ? { ok: true, degraded: true } : { ok: false, msg: "No se ha podido comprobar tu usuario en Zoho CRM. Inténtalo en unos minutos." };
  };
  const sessionOf = async () => {
    const tok = cookies(req)[COOKIE]; if (!tok || tok.length < 40) return null;
    const th = sha(tok); const s = await st.sessions.get(th); if (!s) return null;
    const now = Date.now();
    if (now - s.last_seen > CFG.idleMin * 60000 || now - s.created_at > CFG.maxHours * 3600000) { await st.sessions.remove(s.id); return null; }
    const u = hydrate(await st.users.byId(s.user_id)); if (!u || !u.active) { await st.sessions.remove(s.id); return null; }
    if (now - s.zoho_checked_at > CFG.zohoRecheckMin * 60000) {
      const g = await zohoGate(u);
      if (!g.ok) { await st.sessions.removeByUser(u.id); await audit(u, "sesion_cerrada_zoho", g.msg); return null; }
      await st.sessions.update(s.id, { zoho_checked_at: now });
    }
    if (now - s.last_seen > 60000) await st.sessions.update(s.id, { last_seen: now });
    if (Math.random() < 0.02) st.sessions.gc(now - CFG.idleMin * 60000, now - CFG.maxHours * 3600000).catch(() => {});
    return { u, th, sid: s.id };
  };
  /* intentos fallidos: 5 por usuario y 20 por IP en 15 min */
  const failsOf = async k => { const r = await st.meta.get("fail:" + k); let a = []; try { a = JSON.parse(r ? r.v : "[]"); } catch (e) {} return a.filter(t => Date.now() - t < 15 * 60000); };
  const addFail = async k => { const a = await failsOf(k); a.push(Date.now()); await st.meta.set("fail:" + k, JSON.stringify(a.slice(-25))); };
  /* cambios por colección, para avisar a quien tiene la app abierta */
  const touch = async col => { const r = await st.meta.get("changes"); let m = {}; try { m = JSON.parse(r ? r.v : "{}"); } catch (e) {} m[col] = Date.now(); await st.meta.set("changes", JSON.stringify(m)); };

  /* protección CSRF: cabecera propia y, si se configura, origen permitido */
  if (M !== "GET") {
    if (req.headers["x-ce"] !== "1") return fail(res, 403, "Petición no permitida");
    const o = req.headers.origin;
    if (o && CFG.origins.length && !CFG.origins.includes(o)) return fail(res, 403, "Origen no permitido");
  }

  /* --- primera instalación: crear el administrador --- */
  if (p === "/api/setup" && M === "GET") { const n = (await st.users.all()).length; return send(res, 200, { needed: n === 0, enabled: !!CFG.setupKey, zoho: zohoConfigured() }); }
  if (p === "/api/setup" && M === "POST") {
    if (!CFG.setupKey) return fail(res, 403, "La instalación no está habilitada (falta CE_SETUP_KEY).");
    if ((await st.users.all()).length) return fail(res, 409, "Ya hay usuarios: la instalación ya se hizo.");
    const b = await readBody(req, 10000);
    const okKey = typeof b.key === "string" && b.key.length === CFG.setupKey.length && crypto.timingSafeEqual(Buffer.from(b.key), Buffer.from(CFG.setupKey));
    if (!okKey) { await audit(null, "instalacion_clave_incorrecta", "", ip); return fail(res, 403, "La clave de instalación no es correcta."); }
    if (!zohoConfigured()) return fail(res, 503, "Falta configurar Zoho CRM en las variables de la función.");
    const list = await zohoActiveUsers(true); const email = String(b.email || "").trim().toLowerCase();
    const z = list.find(x => x.email === email); if (!z) return fail(res, 400, "Ese email no es un usuario activo de Zoho CRM.");
    const prob = pwProblem(b.password); if (prob) return fail(res, 400, prob);
    const u = await st.users.insert({ email: z.email, name: z.name, zoho_id: z.id, zoho_role: z.role, zoho_profile: z.profile, pass_hash: await hashPw(b.password), is_admin: true, active: true, perms: "{}", must_change: false, zoho_ok_at: Date.now(), zoho_status: "active" });
    await audit(u, "admin_creado_instalacion", z.email);
    return send(res, 200, { ok: true });
  }

  /* --- sesión --- */
  if (p === "/api/login" && M === "POST") {
    const b = await readBody(req, 10000); const email = String(b.email || "").trim().toLowerCase(); const pw = String(b.password || "");
    if (!EMAIL.test(email)) { await checkPw(pw, await dummyHash()); return fail(res, 401, "Usuario o contraseña incorrectos."); }
    if ((await failsOf("e:" + email)).length >= 5 || (await failsOf("i:" + ip)).length >= 20) return fail(res, 429, "Demasiados intentos. Espera 15 minutos y vuelve a probar.");
    const u = hydrate(await st.users.byEmail(email));
    const ok = await checkPw(pw, u ? u.pass_hash : await dummyHash());
    if (!u || !ok || !u.active) { await addFail("e:" + email); await addFail("i:" + ip); await audit(u, "login_fallido", email); return fail(res, 401, "Usuario o contraseña incorrectos."); }
    if (!zohoConfigured()) return fail(res, 503, "El servidor no tiene configurada la conexión con Zoho CRM.");
    const g = await zohoGate(u); if (!g.ok) { await audit(u, "login_denegado_zoho", g.msg); return fail(res, 403, g.msg); }
    await st.meta.set("fail:e:" + email, "[]");
    const tok = crypto.randomBytes(32).toString("base64url"); const now = Date.now();
    await st.sessions.insert({ token_hash: sha(tok), user_id: u.id, created_at: now, last_seen: now, zoho_checked_at: now, ip, ua: String(req.headers["user-agent"] || "").slice(0, 200) });
    await st.users.update(u.id, { last_login: nowISO() });
    await audit(u, "login", g.degraded ? "Zoho sin respuesta: se usa la última comprobación" : "");
    setCookie(res, tok, CFG.maxHours * 3600);
    return send(res, 200, { ok: true, mustChange: u.must_change, name: u.name });
  }
  if (p === "/api/logout" && M === "POST") {
    const tok = cookies(req)[COOKIE]; if (tok) { const s = await st.sessions.get(sha(tok)); if (s) await st.sessions.remove(s.id); }
    setCookie(res, "", 0); return send(res, 200, { ok: true });
  }

  /* acl.js: la aplicación lo carga antes de arrancar; sin sesión, manda a la pantalla de acceso */
  if (p === "/acl.js" && M === "GET") {
    const S = await sessionOf();
    const js = !S ? 'location.replace(' + JSON.stringify(CFG.loginUrl) + ');document.documentElement.style.display="none";'
      : S.u.must_change ? 'location.replace(' + JSON.stringify(CFG.loginUrl + "?cambio=1") + ');document.documentElement.style.display="none";'
      : "window.CE_ACL=" + JSON.stringify(aclFor(S.u)).replace(/</g, "\\u003c") + ";";
    return send(res, 200, js, { "Content-Type": "text/javascript; charset=utf-8" });
  }

  const S = await sessionOf();
  if (!S) return fail(res, 401, "Sesión caducada. Vuelve a entrar.");
  const U = S.u;

  if (p === "/api/me" && M === "GET") return send(res, 200, aclFor(U));
  if (p === "/api/me/password" && M === "POST") {
    const b = await readBody(req, 10000);
    if (!(await checkPw(String(b.current || ""), U.pass_hash))) return fail(res, 400, "La contraseña actual no es correcta.");
    const prob = pwProblem(b.password); if (prob) return fail(res, 400, prob);
    if (b.password === b.current) return fail(res, 400, "La nueva contraseña debe ser distinta de la actual.");
    await st.users.update(U.id, { pass_hash: await hashPw(b.password), must_change: false });
    await st.sessions.removeByUser(U.id, S.th); await audit(U, "cambio_contraseña", "");
    return send(res, 200, { ok: true });
  }
  if (U.must_change) return fail(res, 403, "Tienes que cambiar tu contraseña antes de continuar.");

  let m;
  /* cambios desde la última consulta (sustituye a los avisos en vivo) */
  if (p === "/api/changes" && M === "GET") {
    const since = +url.searchParams.get("since") || 0; const r = await st.meta.get("changes"); let ch = {}; try { ch = JSON.parse(r ? r.v : "{}"); } catch (e) {}
    const cols = {}; Object.entries(ch).forEach(([c, t]) => { if (t > since && COLS[c] && COLS[c].read(U)) cols[c] = t; });
    return send(res, 200, { now: Date.now(), cols, me: U.ver || 0 });
  }
  if ((m = /^\/api\/db\/([a-z]+)$/.exec(p)) && M === "GET") {
    const col = m[1]; if (!COLS[col]) return fail(res, 404, "Colección desconocida"); if (!COLS[col].read(U)) return fail(res, 403, "Sin acceso");
    return send(res, 200, { docs: await st.docs.list(col) });
  }
  if ((m = /^\/api\/db\/([a-z]+)\/(.+)$/.exec(p)) && (M === "PUT" || M === "DELETE")) {
    const col = m[1], id = decodeURIComponent(m[2]); if (!COLS[col]) return fail(res, 404, "Colección desconocida");
    if (!DOC_ID.test(id)) return fail(res, 400, "Identificador no válido");
    if (!COLS[col].write(U, id)) return fail(res, 403, "Solo lectura: no tienes permiso para modificar esto.");
    if (M === "PUT") { const b = await readBody(req); await st.docs.put(col, id, b.data, U.id); } else await st.docs.remove(col, id);
    await touch(col); return send(res, 200, { ok: true });
  }
  if (p === "/api/profiles" && M === "GET") {
    const ids = String(url.searchParams.get("ids") || "").split(",").map(s => s.replace(/^u/, "")).filter(s => /^\d+$/.test(s)).slice(0, 30);
    const out = {}; for (const id of ids) { const u = await st.users.byId(id); if (u) out["u" + id] = { id: "u" + id, name: u.name }; }
    return send(res, 200, out);
  }
  /* --- Zoho Books (solo lectura): facturas para el control de facturación --- */
  if (p === "/api/books/invoices" && M === "POST") {
    if (lvl(U, "contabilidad.facturas") < 1) return fail(res, 403, "Sin acceso al control de facturas.");
    const b = await readBody(req, 5000); const qp = b.query_params || {};
    const mode = qp.invoice_number_contains != null ? "contains" : "startswith";
    const prefix = String((mode === "contains" ? qp.invoice_number_contains : qp.invoice_number_startswith) || ""); const page = Math.max(1, Math.min(50, +qp.page || 1));
    if (!/^[A-Z0-9.\-]{1,20}$/.test(prefix) || prefix.length < 3) return fail(res, 400, "Serie de facturas no válida.");
    try { return send(res, 200, { payload: await booksInvoices(prefix, page, mode) }); }
    catch (e) { return fail(res, e.status || 502, e.message || "Error al consultar Zoho Books"); }
  }
  if (p === "/api/zoho/coql" && M === "POST") {
    if (!canZoho(U)) return fail(res, 403, "Sin acceso a los datos de Zoho.");
    const b = await readBody(req, 20000); const q = String(b.select_query || "").trim();
    if (!/^select\s/i.test(q) || q.length > 6000 || q.includes(";")) return fail(res, 400, "Consulta no permitida.");
    const hit = Z.cache.get(q); if (hit && !b.refresh && Date.now() - hit.t < 60000) return send(res, 200, { payload: hit.v });
    try { const v = await zohoCoql(q); Z.cache.set(q, { t: Date.now(), v }); if (Z.cache.size > 300) Z.cache.delete(Z.cache.keys().next().value); return send(res, 200, { payload: v }); }
    catch (e) { return fail(res, e.status || 502, e.message || "Error al consultar Zoho"); }
  }

  /* --- administración --- */
  if (p.startsWith("/api/admin/")) {
    if (!U.is_admin) return fail(res, 403, "Solo el administrador puede hacer esto.");
    if (p === "/api/admin/users" && M === "GET") return send(res, 200, { users: (await st.users.all()).map(u => pubUser(hydrate(u))).sort((a, b) => (b.admin - a.admin) || a.name.localeCompare(b.name, "es")), catalog: CATALOG });
    if (p === "/api/admin/zoho-users" && M === "GET") {
      try { const list = await zohoActiveUsers(url.searchParams.get("refresh") === "1"); const taken = new Set((await st.users.all()).map(u => u.zoho_id)); return send(res, 200, { users: list.map(z => Object.assign({ registered: taken.has(z.id) }, z)) }); }
      catch (e) { return fail(res, 502, "No se ha podido leer la lista de usuarios de Zoho CRM: " + e.message); }
    }
    if (p === "/api/admin/audit" && M === "GET") return send(res, 200, { items: await st.audit.list(+url.searchParams.get("limit") || 200) });
    if (p === "/api/admin/users" && M === "POST") {
      const b = await readBody(req, 50000);
      const list = await zohoActiveUsers(true).catch(() => null); if (!list) return fail(res, 502, "No se ha podido comprobar el usuario en Zoho CRM.");
      const z = list.find(x => x.id === String(b.zohoId || "")); if (!z) return fail(res, 400, "Esa persona no es un usuario activo de Zoho CRM.");
      if (await st.users.byZoho(z.id) || await st.users.byEmail(z.email)) return fail(res, 409, "Este usuario ya existe en el software.");
      const prob = pwProblem(b.password); if (prob) return fail(res, 400, prob);
      const nu = hydrate(await st.users.insert({ email: z.email, name: z.name, zoho_id: z.id, zoho_role: z.role, zoho_profile: z.profile, pass_hash: await hashPw(b.password), is_admin: !!b.admin, active: true, perms: JSON.stringify(cleanPerms(b.perms)), must_change: b.mustChange !== false, zoho_ok_at: Date.now(), zoho_status: "active" }));
      await audit(U, "usuario_creado", nu.email + (nu.is_admin ? " (administrador)" : ""));
      return send(res, 200, { user: pubUser(nu) });
    }
    if ((m = /^\/api\/admin\/users\/(\d+)(\/zoho)?$/.exec(p))) {
      const t = hydrate(await st.users.byId(m[1])); if (!t) return fail(res, 404, "Usuario no encontrado");
      if (m[2] && M === "POST") { const s = await zohoStatusOf(t.zoho_id); await markZoho(t, s); return send(res, 200, { status: s, user: pubUser(hydrate(await st.users.byId(t.id))) }); }
      const admins = (await st.users.all()).filter(u => u.is_admin && u.active).length; const lastAdmin = t.is_admin && t.active && admins <= 1;
      if (M === "DELETE") {
        if (t.id === U.id) return fail(res, 400, "No puedes borrar tu propia cuenta.");
        if (lastAdmin) return fail(res, 400, "Tiene que quedar al menos un administrador.");
        await st.sessions.removeByUser(t.id); await st.users.remove(t.id); await audit(U, "usuario_borrado", t.email);
        return send(res, 200, { ok: true });
      }
      if (M === "PATCH") {
        const b = await readBody(req, 50000); const f = {}; let kick = false;
        if (b.perms !== undefined) f.perms = JSON.stringify(cleanPerms(b.perms));
        if (b.admin !== undefined) { if (!b.admin && t.id === U.id) return fail(res, 400, "No puedes quitarte a ti mismo el rol de administrador."); if (!b.admin && lastAdmin) return fail(res, 400, "Tiene que quedar al menos un administrador."); f.is_admin = !!b.admin; }
        if (b.active !== undefined) { if (!b.active && t.id === U.id) return fail(res, 400, "No puedes desactivar tu propia cuenta."); if (!b.active && lastAdmin) return fail(res, 400, "Tiene que quedar al menos un administrador activo."); f.active = !!b.active; if (!b.active) kick = true; }
        if (b.password !== undefined) { const prob = pwProblem(b.password); if (prob) return fail(res, 400, prob); f.pass_hash = await hashPw(b.password); f.must_change = b.mustChange !== false; if (t.id !== U.id) kick = true; }
        else if (b.mustChange !== undefined) f.must_change = !!b.mustChange;
        if (!Object.keys(f).length) return send(res, 200, { user: pubUser(t) });
        f.ver = (t.ver || 0) + 1; await st.users.update(t.id, f);
        if (kick) await st.sessions.removeByUser(t.id);
        const nt = hydrate(await st.users.byId(t.id));
        await audit(U, "usuario_modificado", nt.email + ": " + Object.keys(b).filter(k => k !== "password").concat(b.password !== undefined ? ["contraseña"] : []).join(", "));
        return send(res, 200, { user: pubUser(nt) });
      }
    }
  }
  return fail(res, 404, "No encontrado");
}

module.exports = (req, res) => {
  handle(req, res).catch(e => {
    if (!e.status) console.error(e);
    try { if (!res.headersSent) fail(res, e.status || 500, e.status ? e.message : "Error interno"); else res.end(); } catch (x) {}
  });
};
