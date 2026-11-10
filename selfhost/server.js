#!/usr/bin/env node
/* Software Operativo · Campus Experience — servidor propio
   Sin dependencias externas: Node.js 22.13 o superior (http, crypto y sqlite integrados).

   Doble control de acceso:
     1) La persona debe ser usuario ACTIVO del Zoho CRM de ISL (se comprueba al crear el usuario,
        al iniciar sesión y periódicamente durante la sesión).
     2) Dentro del software, el administrador decide qué apartados y subapartados ve o edita.
*/
"use strict";
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { DatabaseSync } = require("node:sqlite");

/* ---------- configuración (.env opcional) ---------- */
(function loadEnv() {
  const f = path.join(__dirname, ".env");
  if (!fs.existsSync(f)) return;
  for (const line of fs.readFileSync(f, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!m || line.trim().startsWith("#")) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (process.env[m[1]] === undefined) process.env[m[1]] = v;
  }
})();
const env = (k, d) => (process.env[k] === undefined || process.env[k] === "" ? d : process.env[k]);
const CFG = {
  port: +env("PORT", 3000),
  host: env("HOST", "0.0.0.0"),
  dataDir: path.resolve(__dirname, env("DATA_DIR", "./data")),
  appHtml: path.resolve(__dirname, env("APP_HTML", "./app/index.html")),
  cookieSecure: env("COOKIE_SECURE", "1") !== "0",
  trustProxy: env("TRUST_PROXY", "0") === "1",
  idleMin: +env("SESSION_IDLE_MIN", 480),          // sesión se cierra tras 8 h sin uso
  maxHours: +env("SESSION_MAX_HOURS", 72),          // y como máximo a las 72 h
  zohoRecheckMin: +env("ZOHO_RECHECK_MIN", 30),     // re-comprobación en Zoho durante la sesión
  zohoGraceHours: +env("ZOHO_GRACE_HOURS", 12),     // si Zoho no responde, vale la última comprobación de las últimas 12 h
  zoho: {
    clientId: env("ZOHO_CLIENT_ID", ""),
    clientSecret: env("ZOHO_CLIENT_SECRET", ""),
    refreshToken: env("ZOHO_REFRESH_TOKEN", ""),
    accountsUrl: env("ZOHO_ACCOUNTS_URL", "https://accounts.zoho.eu").replace(/\/$/, ""),
    apiUrl: env("ZOHO_API_URL", "https://www.zohoapis.eu").replace(/\/$/, ""),
    mockFile: env("ZOHO_MOCK_FILE", ""),            // SOLO pruebas: respuestas simuladas
  },
};
fs.mkdirSync(CFG.dataDir, { recursive: true });

/* ---------- catálogo de permisos ---------- */
const CATALOG = [
  { k: "registros", b: "Registros", l: "Registros", subs: [["madrid", "Madrid (semanas)"], ["campus", "Nacionales e institucionales"], ["todos", "Todos los registros"]] },
  { k: "horarios", b: "Operativa", l: "Horarios", subs: [["semanas", "Horarios de las semanas"], ["simulador", "Simulador"]] },
  { k: "equipos", b: "Operativa", l: "Equipos", subs: [["madrid", "Madrid (semanas)"], ["campus", "Nacionales e institucionales"]] },
  { k: "contabilidad", b: "Administración", l: "Contabilidad", subs: [["pagos", "Pagos"], ["devoluciones", "Devoluciones"], ["cancelaciones", "Cancelaciones"]] },
  { k: "atencion", b: "Atención al público", l: "Atención al público", subs: [["general", "Atención al público"]] },
  { k: "marketing", b: "Marketing", l: "Marketing", subs: [["general", "Marketing"]] },
  { k: "rrhh", b: "Recursos Humanos", l: "Recursos Humanos", subs: [["general", "Recursos Humanos"]] },
];
const PERM_KEYS = CATALOG.flatMap(a => a.subs.map(s => a.k + "." + s[0]));
const cleanPerms = p => {
  const out = {};
  if (p && typeof p === "object") for (const k of PERM_KEYS) { const v = +p[k]; if (v === 1 || v === 2) out[k] = v; }
  return out;
};
const lvl = (u, key) => (u.is_admin ? 2 : (u.permsObj[key] || 0));
const anyOf = (u, apartado, min = 1) => u.is_admin || PERM_KEYS.some(k => k.startsWith(apartado + ".") && (u.permsObj[k] || 0) >= min);

/* Qué permiso hace falta para leer y escribir cada colección de datos */
const COLS = {
  ops:   { read: u => anyOf(u, "registros"), write: u => anyOf(u, "registros", 2) },
  teams: { read: u => anyOf(u, "equipos") || anyOf(u, "horarios"), write: (u, id) => lvl(u, String(id).startsWith("c-") ? "equipos.campus" : "equipos.madrid") >= 2 },
  reqs:  { read: u => anyOf(u, "equipos"), write: (u, id) => lvl(u, String(id).startsWith("c-") ? "equipos.campus" : "equipos.madrid") >= 2 },
  hor:   { read: u => anyOf(u, "horarios"), write: u => lvl(u, "horarios.semanas") >= 2 },
  hweek: { read: u => anyOf(u, "horarios"), write: u => lvl(u, "horarios.semanas") >= 2 },
  happr: { read: u => anyOf(u, "horarios"), write: u => lvl(u, "horarios.semanas") >= 2 },
  hbus:  { read: u => anyOf(u, "horarios"), write: u => lvl(u, "horarios.semanas") >= 2 },
  hsim:  { read: u => lvl(u, "horarios.simulador") >= 1, write: u => lvl(u, "horarios.simulador") >= 2 },
};
const canZoho = u => ["registros", "equipos", "horarios", "contabilidad"].some(a => anyOf(u, a));

/* ---------- base de datos ---------- */
const db = new DatabaseSync(path.join(CFG.dataDir, "campus.db"));
db.exec(`
PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE COLLATE NOCASE, name TEXT NOT NULL,
  zoho_id TEXT NOT NULL UNIQUE, zoho_role TEXT, zoho_profile TEXT, pass_hash TEXT NOT NULL,
  is_admin INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1, perms TEXT NOT NULL DEFAULT '{}',
  must_change INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
  last_login TEXT, zoho_ok_at INTEGER, zoho_status TEXT);
CREATE TABLE IF NOT EXISTS sessions(
  token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL, last_seen INTEGER NOT NULL, zoho_checked_at INTEGER NOT NULL, ip TEXT, ua TEXT);
CREATE TABLE IF NOT EXISTS docs(
  col TEXT NOT NULL, id TEXT NOT NULL, data TEXT NOT NULL, updated_at TEXT NOT NULL, updated_by INTEGER,
  PRIMARY KEY(col,id));
CREATE TABLE IF NOT EXISTS audit(
  id INTEGER PRIMARY KEY AUTOINCREMENT, ts TEXT NOT NULL, user_id INTEGER, email TEXT, action TEXT NOT NULL, detail TEXT, ip TEXT);
`);
const Q = {
  userById: db.prepare("SELECT * FROM users WHERE id=?"),
  userByEmail: db.prepare("SELECT * FROM users WHERE email=? COLLATE NOCASE"),
  userByZoho: db.prepare("SELECT * FROM users WHERE zoho_id=?"),
  users: db.prepare("SELECT * FROM users ORDER BY is_admin DESC, name COLLATE NOCASE"),
  admins: db.prepare("SELECT COUNT(*) n FROM users WHERE is_admin=1 AND active=1"),
  sess: db.prepare("SELECT * FROM sessions WHERE token_hash=?"),
  sessIns: db.prepare("INSERT INTO sessions(token_hash,user_id,created_at,last_seen,zoho_checked_at,ip,ua) VALUES(?,?,?,?,?,?,?)"),
  sessTouch: db.prepare("UPDATE sessions SET last_seen=? WHERE token_hash=?"),
  sessZoho: db.prepare("UPDATE sessions SET zoho_checked_at=? WHERE token_hash=?"),
  sessDel: db.prepare("DELETE FROM sessions WHERE token_hash=?"),
  sessDelUser: db.prepare("DELETE FROM sessions WHERE user_id=?"),
  sessDelOthers: db.prepare("DELETE FROM sessions WHERE user_id=? AND token_hash<>?"),
  sessGc: db.prepare("DELETE FROM sessions WHERE last_seen<? OR created_at<?"),
  docsOf: db.prepare("SELECT id,data FROM docs WHERE col=?"),
  docPut: db.prepare("INSERT INTO docs(col,id,data,updated_at,updated_by) VALUES(?,?,?,?,?) ON CONFLICT(col,id) DO UPDATE SET data=excluded.data,updated_at=excluded.updated_at,updated_by=excluded.updated_by"),
  docDel: db.prepare("DELETE FROM docs WHERE col=? AND id=?"),
  audit: db.prepare("INSERT INTO audit(ts,user_id,email,action,detail,ip) VALUES(?,?,?,?,?,?)"),
  auditList: db.prepare("SELECT ts,email,action,detail FROM audit ORDER BY id DESC LIMIT ?"),
};
const nowISO = () => new Date().toISOString();
const audit = (u, action, detail, ip) => { try { Q.audit.run(nowISO(), u ? u.id : null, u ? u.email : null, action, detail ? String(detail).slice(0, 500) : null, ip || null); } catch (e) {} };
const hydrate = u => { if (!u) return null; let p = {}; try { p = JSON.parse(u.perms || "{}"); } catch (e) {} u.permsObj = cleanPerms(p); u.is_admin = !!u.is_admin; u.active = !!u.active; return u; };

/* ---------- contraseñas (scrypt, con sal) ---------- */
const SC = { N: 32768, r: 8, p: 1, len: 64, maxmem: 96 * 1024 * 1024 };
const hashPw = pw => new Promise((res, rej) => {
  const salt = crypto.randomBytes(16);
  crypto.scrypt(pw, salt, SC.len, { N: SC.N, r: SC.r, p: SC.p, maxmem: SC.maxmem }, (e, k) => e ? rej(e) : res(["scrypt", SC.N, SC.r, SC.p, salt.toString("base64"), k.toString("base64")].join("$")));
});
const checkPw = (pw, stored) => new Promise(res => {
  const parts = String(stored || "").split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return res(false);
  const [, N, r, p, salt, hash] = parts; const want = Buffer.from(hash, "base64");
  crypto.scrypt(pw, Buffer.from(salt, "base64"), want.length, { N: +N, r: +r, p: +p, maxmem: SC.maxmem }, (e, k) => res(!e && crypto.timingSafeEqual(k, want)));
});
let DUMMY_HASH = null; hashPw(crypto.randomBytes(12).toString("hex")).then(h => { DUMMY_HASH = h; });
const pwProblem = pw => {
  if (typeof pw !== "string" || pw.length < 10) return "La contraseña debe tener al menos 10 caracteres.";
  if (pw.length > 200) return "La contraseña es demasiado larga.";
  if (!/[A-Za-zÀ-ÿ]/.test(pw) || !/[0-9]/.test(pw)) return "La contraseña debe incluir letras y números.";
  return null;
};

/* ---------- Zoho CRM ---------- */
const Z = { token: null, exp: 0, cache: new Map(), users: null, usersAt: 0 };
let MOCK = null;
if (CFG.zoho.mockFile) { MOCK = JSON.parse(fs.readFileSync(path.resolve(__dirname, CFG.zoho.mockFile), "utf8")); console.warn("AVISO: Zoho en modo simulado (" + CFG.zoho.mockFile + "). No usar en producción."); }
const zohoConfigured = () => !!MOCK || !!(CFG.zoho.clientId && CFG.zoho.clientSecret && CFG.zoho.refreshToken);
async function zohoToken() {
  if (Z.token && Date.now() < Z.exp - 60000) return Z.token;
  const body = new URLSearchParams({ grant_type: "refresh_token", client_id: CFG.zoho.clientId, client_secret: CFG.zoho.clientSecret, refresh_token: CFG.zoho.refreshToken });
  const r = await fetch(CFG.zoho.accountsUrl + "/oauth/v2/token", { method: "POST", body, signal: AbortSignal.timeout(15000) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) throw Object.assign(new Error("No se pudo obtener el token de Zoho: " + (j.error || r.status)), { zoho: true });
  Z.token = j.access_token; Z.exp = Date.now() + (j.expires_in || 3600) * 1000; return Z.token;
}
async function zohoFetch(pathname, init = {}) {
  const t = await zohoToken();
  const r = await fetch(CFG.zoho.apiUrl + pathname, Object.assign({}, init, { headers: Object.assign({ Authorization: "Zoho-oauthtoken " + t }, init.headers || {}), signal: AbortSignal.timeout(30000) }));
  if (r.status === 204) return { status: 204, json: null };
  const json = await r.json().catch(() => null);
  return { status: r.status, json };
}
/* consulta COQL (solo lectura) */
async function zohoCoql(q) {
  if (MOCK) return mockCoql(q);
  const { status, json } = await zohoFetch("/crm/v6/coql", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ select_query: q }) });
  if (status === 204) return { data: [], info: { count: 0, more_records: false } };
  if (status >= 400) throw Object.assign(new Error((json && (json.message || json.code)) || "Error de Zoho " + status), { status: 502, zoho: true });
  return json;
}
function mockCoql(q) {
  const m = /limit (\d+), (\d+)/i.exec(q); const o = m ? +m[1] : 0, n = m ? +m[2] : 100;
  const src = q.includes("Personas_Autorizadas") ? (MOCK.auth || []) : q.includes("Campus_y_servicios") ? (MOCK.weeks || []) : (MOCK.deals || []);
  return { data: src.slice(o, o + n), info: { count: Math.min(n, Math.max(0, src.length - o)), more_records: o + n < src.length } };
}
/* lista de usuarios activos y confirmados del CRM */
async function zohoActiveUsers(force) {
  if (!force && Z.users && Date.now() - Z.usersAt < 5 * 60000) return Z.users;
  let list = [];
  if (MOCK) list = MOCK.users || [];
  else {
    for (let page = 1; page <= 20; page++) {
      const { status, json } = await zohoFetch("/crm/v6/users?type=ActiveConfirmedUsers&per_page=200&page=" + page);
      if (status === 204 || !json) break;
      if (status >= 400) throw Object.assign(new Error("Zoho no devolvió los usuarios (" + status + ")"), { status: 502, zoho: true });
      list.push(...(json.users || []));
      if (!json.info || !json.info.more_records) break;
    }
  }
  Z.users = list.filter(u => u.status === "active" && u.confirm !== false && u.email).map(u => ({ id: String(u.id), name: u.full_name || [u.first_name, u.last_name].filter(Boolean).join(" ") || u.email, email: u.email, role: u.role && u.role.name || "", profile: u.profile && u.profile.name || "" }));
  Z.usersAt = Date.now(); return Z.users;
}
/* ¿sigue este usuario activo en Zoho?  -> "active" | "inactive" | "unknown" (Zoho no responde) */
async function zohoStatusOf(zohoId) {
  try {
    if (MOCK) { const u = (MOCK.users || []).find(x => String(x.id) === String(zohoId)); return u && u.status === "active" && u.confirm !== false ? "active" : "inactive"; }
    const { status, json } = await zohoFetch("/crm/v6/users/" + encodeURIComponent(zohoId));
    if (status === 204 || status === 404) return "inactive";
    if (status >= 500 || !json) return "unknown";
    if (status >= 400) return json && json.code === "INVALID_DATA" ? "inactive" : "unknown";
    const u = (json.users || [])[0];
    return u && u.status === "active" && u.confirm !== false ? "active" : "inactive";
  } catch (e) { return "unknown"; }
}
const markZoho = (u, st) => { if (st === "active") db.prepare("UPDATE users SET zoho_ok_at=?, zoho_status='active' WHERE id=?").run(Date.now(), u.id); else if (st === "inactive") db.prepare("UPDATE users SET zoho_status='inactive' WHERE id=?").run(u.id); };
/* aplica la política: activo -> sí; inactivo -> no; sin respuesta -> sí solo si hubo una comprobación buena reciente */
async function zohoGate(u) {
  const st = await zohoStatusOf(u.zoho_id); markZoho(u, st);
  if (st === "active") return { ok: true };
  if (st === "inactive") return { ok: false, msg: "Tu usuario de Zoho CRM no está activo. Habla con el administrador." };
  const fresh = u.zoho_ok_at && Date.now() - u.zoho_ok_at < CFG.zohoGraceHours * 3600000;
  return fresh ? { ok: true, degraded: true } : { ok: false, msg: "No se ha podido comprobar tu usuario en Zoho CRM. Inténtalo en unos minutos." };
}

/* ---------- utilidades HTTP ---------- */
const SEC_HEADERS = {
  "X-Content-Type-Options": "nosniff", "Referrer-Policy": "same-origin", "X-Frame-Options": "DENY",
  "Cross-Origin-Opener-Policy": "same-origin", "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
};
const send = (res, code, body, headers = {}) => {
  const isObj = body !== null && typeof body === "object" && !Buffer.isBuffer(body);
  const data = isObj ? JSON.stringify(body) : body;
  res.writeHead(code, Object.assign({}, SEC_HEADERS, { "Cache-Control": "no-store" }, isObj ? { "Content-Type": "application/json; charset=utf-8" } : {}, headers));
  res.end(data);
};
const fail = (res, code, msg) => send(res, code, { error: msg });
const ipOf = req => (CFG.trustProxy && req.headers["x-forwarded-for"] ? String(req.headers["x-forwarded-for"]).split(",")[0].trim() : req.socket.remoteAddress) || "";
const readBody = (req, max = 4 * 1024 * 1024) => new Promise((res, rej) => {
  let n = 0; const chunks = [];
  req.on("data", c => { n += c.length; if (n > max) { rej(Object.assign(new Error("Demasiado grande"), { status: 413 })); req.destroy(); } else chunks.push(c); });
  req.on("end", () => { if (!n) return res({}); try { res(JSON.parse(Buffer.concat(chunks).toString("utf8"))); } catch (e) { rej(Object.assign(new Error("JSON no válido"), { status: 400 })); } });
  req.on("error", rej);
});
const cookies = req => Object.fromEntries(String(req.headers.cookie || "").split(";").map(s => s.trim().split("=")).filter(p => p[0]).map(([k, ...v]) => [k, decodeURIComponent(v.join("="))]));
const COOKIE = CFG.cookieSecure ? "__Host-ce_sess" : "ce_sess";
const setCookie = (res, val, maxAge) => res.setHeader("Set-Cookie", COOKIE + "=" + val + "; Path=/; HttpOnly; SameSite=Strict" + (CFG.cookieSecure ? "; Secure" : "") + (maxAge != null ? "; Max-Age=" + maxAge : ""));
const sha = t => crypto.createHash("sha256").update(t).digest("hex");

/* ---------- sesiones ---------- */
async function sessionOf(req) {
  const tok = cookies(req)[COOKIE]; if (!tok || tok.length < 40) return null;
  const th = sha(tok); const s = Q.sess.get(th); if (!s) return null;
  const now = Date.now();
  if (now - s.last_seen > CFG.idleMin * 60000 || now - s.created_at > CFG.maxHours * 3600000) { Q.sessDel.run(th); return null; }
  const u = hydrate(Q.userById.get(s.user_id));
  if (!u || !u.active) { Q.sessDel.run(th); return null; }
  if (now - s.zoho_checked_at > CFG.zohoRecheckMin * 60000) {
    const g = await zohoGate(u);
    if (!g.ok) { Q.sessDelUser.run(u.id); audit(u, "sesion_cerrada_zoho", g.msg); return null; }
    Q.sessZoho.run(now, th);
  }
  if (now - s.last_seen > 60000) Q.sessTouch.run(now, th);
  return { u, th };
}
setInterval(() => { const n = Date.now(); Q.sessGc.run(n - CFG.idleMin * 60000, n - CFG.maxHours * 3600000); }, 10 * 60000).unref();

/* bloqueo tras intentos fallidos en 15 min */
const FAILS = new Map();
const failKey = k => { const a = (FAILS.get(k) || []).filter(t => Date.now() - t < 15 * 60000); FAILS.set(k, a); return a; };
/* por usuario: 5 fallos; por IP: 20 (en una oficina todos comparten IP) */
const locked = (...ks) => ks.some(k => failKey(k).length >= (k.startsWith("i:") ? 20 : 5));
const addFail = (...ks) => ks.forEach(k => failKey(k).push(Date.now()));

/* ---------- aviso de cambios en vivo (SSE) ---------- */
const CLIENTS = new Set();
function broadcast(col, byUser) {
  for (const c of CLIENTS) {
    const u = hydrate(Q.userById.get(c.uid));
    if (!u || !u.active || !COLS[col] || !COLS[col].read(u)) continue;
    c.res.write("event: change\ndata: " + JSON.stringify({ col, by: byUser }) + "\n\n");
  }
}
function pushUser(uid, type) { for (const c of CLIENTS) if (c.uid === uid) c.res.write("event: " + type + "\ndata: {}\n\n"); }
setInterval(() => { for (const c of CLIENTS) c.res.write(": ping\n\n"); }, 25000).unref();

/* ---------- respuesta pública de usuario ---------- */
const pubUser = u => ({ id: u.id, email: u.email, name: u.name, zohoRole: u.zoho_role || "", zohoProfile: u.zoho_profile || "", admin: u.is_admin, active: u.active, perms: u.permsObj, mustChange: !!u.must_change, lastLogin: u.last_login, createdAt: u.created_at, zohoStatus: u.zoho_status || "", zohoOkAt: u.zoho_ok_at ? new Date(u.zoho_ok_at).toISOString() : null });
const aclFor = u => ({ id: "u" + u.id, name: u.name, email: u.email, admin: u.is_admin, perms: u.is_admin ? Object.fromEntries(PERM_KEYS.map(k => [k, 2])) : u.permsObj, mustChange: !!u.must_change, catalog: CATALOG });

/* ---------- páginas ---------- */
const PUB = path.join(__dirname, "public");
const STATIC = { "/login": ["login.html", "text/html; charset=utf-8"], "/ce-shim.js": ["ce-shim.js", "text/javascript; charset=utf-8"], "/favicon.svg": ["favicon.svg", "image/svg+xml"] };
function appPage(u) {
  const app = fs.readFileSync(CFG.appHtml, "utf8");
  return '<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
    + '<style>body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n'
    + '<script>window.CE_ACL=' + JSON.stringify(aclFor(u)).replace(/</g, "\\u003c") + ';</script><script src="/ce-shim.js"></script><link rel="icon" href="/favicon.svg">\n</head>\n<body>\n'
    + app + "\n</body>\n</html>\n";
}

/* ---------- rutas ---------- */
async function handle(req, res) {
  const url = new URL(req.url, "http://x"); const p = url.pathname; const M = req.method; const ip = ipOf(req);

  if (M === "GET" && STATIC[p]) {
    const [f, type] = STATIC[p];
    if (p === "/login") { const s = await sessionOf(req); if (s && !s.u.must_change) return send(res, 302, "", { Location: "/" }); }
    return send(res, 200, fs.readFileSync(path.join(PUB, f)), { "Content-Type": type });
  }
  if (M === "GET" && (p === "/" || p === "/index.html")) {
    const s = await sessionOf(req);
    if (!s) return send(res, 302, "", { Location: "/login" });
    if (s.u.must_change) return send(res, 302, "", { Location: "/login?cambio=1" });
    return send(res, 200, appPage(s.u), { "Content-Type": "text/html; charset=utf-8" });
  }
  if (M === "GET" && p === "/salud") return send(res, 200, { ok: true });
  if (!p.startsWith("/api/")) return fail(res, 404, "No encontrado");

  /* protección CSRF: toda petición que cambia algo debe llevar la cabecera X-CE y venir del mismo origen */
  if (M !== "GET") {
    if (req.headers["x-ce"] !== "1") return fail(res, 403, "Petición no permitida");
    const o = req.headers.origin; let oh = null; try { oh = o ? new URL(o).host : null; } catch (e) { oh = "invalid"; }
    if (o && oh !== req.headers.host) return fail(res, 403, "Origen no permitido");
  }

  /* --- sesión --- */
  if (p === "/api/login" && M === "POST") {
    const b = await readBody(req, 10000); const email = String(b.email || "").trim().toLowerCase(); const pw = String(b.password || "");
    if (locked("e:" + email, "i:" + ip)) return fail(res, 429, "Demasiados intentos. Espera 15 minutos y vuelve a probar.");
    const u = hydrate(Q.userByEmail.get(email));
    const ok = await checkPw(pw, u ? u.pass_hash : DUMMY_HASH);
    if (!u || !ok || !u.active) { addFail("e:" + email, "i:" + ip); audit(u, "login_fallido", email, ip); return fail(res, 401, "Usuario o contraseña incorrectos."); }
    if (!zohoConfigured()) return fail(res, 503, "El servidor no tiene configurada la conexión con Zoho CRM.");
    const g = await zohoGate(u);
    if (!g.ok) { audit(u, "login_denegado_zoho", g.msg, ip); return fail(res, 403, g.msg); }
    FAILS.delete("e:" + email);
    const tok = crypto.randomBytes(32).toString("base64url"); const now = Date.now();
    Q.sessIns.run(sha(tok), u.id, now, now, now, ip, String(req.headers["user-agent"] || "").slice(0, 200));
    db.prepare("UPDATE users SET last_login=? WHERE id=?").run(nowISO(), u.id);
    audit(u, "login", g.degraded ? "Zoho sin respuesta: se usa la última comprobación" : "", ip);
    setCookie(res, tok, CFG.maxHours * 3600);
    return send(res, 200, { ok: true, mustChange: !!u.must_change, name: u.name });
  }
  if (p === "/api/logout" && M === "POST") {
    const tok = cookies(req)[COOKIE]; if (tok) Q.sessDel.run(sha(tok));
    setCookie(res, "", 0); return send(res, 200, { ok: true });
  }

  const S = await sessionOf(req);
  if (!S) return fail(res, 401, "Sesión caducada. Vuelve a entrar.");
  const U = S.u;

  if (p === "/api/me" && M === "GET") return send(res, 200, aclFor(U));
  if (p === "/api/me/password" && M === "POST") {
    const b = await readBody(req, 10000);
    if (!(await checkPw(String(b.current || ""), U.pass_hash))) return fail(res, 400, "La contraseña actual no es correcta.");
    const prob = pwProblem(b.password); if (prob) return fail(res, 400, prob);
    if (b.password === b.current) return fail(res, 400, "La nueva contraseña debe ser distinta de la actual.");
    db.prepare("UPDATE users SET pass_hash=?, must_change=0, updated_at=? WHERE id=?").run(await hashPw(b.password), nowISO(), U.id);
    Q.sessDelOthers.run(U.id, S.th); audit(U, "cambio_contraseña", "", ip);
    return send(res, 200, { ok: true });
  }
  if (U.must_change) return fail(res, 403, "Tienes que cambiar tu contraseña antes de continuar.");

  /* --- datos guardados del software --- */
  let m;
  if (p === "/api/events" && M === "GET") {
    res.writeHead(200, Object.assign({}, SEC_HEADERS, { "Content-Type": "text/event-stream", "Cache-Control": "no-store", Connection: "keep-alive", "X-Accel-Buffering": "no" }));
    res.write("retry: 3000\n\n"); const c = { res, uid: U.id }; CLIENTS.add(c); req.on("close", () => CLIENTS.delete(c)); return;
  }
  if ((m = /^\/api\/db\/([a-z]+)$/.exec(p)) && M === "GET") {
    const col = m[1]; if (!COLS[col]) return fail(res, 404, "Colección desconocida");
    if (!COLS[col].read(U)) return fail(res, 403, "Sin acceso");
    const out = {}; for (const r of Q.docsOf.all(col)) { try { out[r.id] = JSON.parse(r.data); } catch (e) {} }
    return send(res, 200, { docs: out });
  }
  if ((m = /^\/api\/db\/([a-z]+)\/([A-Za-z0-9_.:|\-]{1,200})$/.exec(p)) && (M === "PUT" || M === "DELETE")) {
    const col = m[1], id = m[2]; if (!COLS[col]) return fail(res, 404, "Colección desconocida");
    if (!COLS[col].write(U, id)) return fail(res, 403, "Solo lectura: no tienes permiso para modificar esto.");
    if (M === "PUT") { const b = await readBody(req); Q.docPut.run(col, id, JSON.stringify(b.data === undefined ? null : b.data), nowISO(), U.id); }
    else Q.docDel.run(col, id);
    broadcast(col, "u" + U.id); return send(res, 200, { ok: true });
  }
  if (p === "/api/profiles" && M === "GET") {
    const ids = String(url.searchParams.get("ids") || "").split(",").filter(Boolean).slice(0, 50);
    const out = {}; for (const id of ids) { const u = Q.userById.get(+String(id).replace(/^u/, "")); if (u) out[id] = { id, name: u.name }; }
    return send(res, 200, out);
  }

  /* --- Zoho (solo lectura) --- */
  if (p === "/api/zoho/coql" && M === "POST") {
    if (!canZoho(U)) return fail(res, 403, "Sin acceso a los datos de Zoho.");
    const b = await readBody(req, 20000); const q = String(b.select_query || "").trim();
    if (!/^select\s/i.test(q) || q.length > 6000 || q.includes(";")) return fail(res, 400, "Consulta no permitida.");
    const hit = Z.cache.get(q);
    if (hit && !b.refresh && Date.now() - hit.t < 60000) return send(res, 200, { payload: hit.v });
    try { const v = await zohoCoql(q); Z.cache.set(q, { t: Date.now(), v }); if (Z.cache.size > 500) Z.cache.delete(Z.cache.keys().next().value); return send(res, 200, { payload: v }); }
    catch (e) { return fail(res, e.status || 502, e.message || "Error al consultar Zoho"); }
  }

  /* --- administración (solo administradores) --- */
  if (p.startsWith("/api/admin/")) {
    if (!U.is_admin) return fail(res, 403, "Solo el administrador puede hacer esto.");
    if (p === "/api/admin/users" && M === "GET") return send(res, 200, { users: Q.users.all().map(u => pubUser(hydrate(u))), catalog: CATALOG });
    if (p === "/api/admin/zoho-users" && M === "GET") {
      try { const list = await zohoActiveUsers(url.searchParams.get("refresh") === "1"); const taken = new Set(Q.users.all().map(u => u.zoho_id)); return send(res, 200, { users: list.map(z => Object.assign({ registered: taken.has(z.id) }, z)) }); }
      catch (e) { return fail(res, 502, "No se ha podido leer la lista de usuarios de Zoho CRM: " + e.message); }
    }
    if (p === "/api/admin/audit" && M === "GET") return send(res, 200, { items: Q.auditList.all(Math.min(500, +url.searchParams.get("limit") || 100)) });
    if (p === "/api/admin/users" && M === "POST") {
      const b = await readBody(req, 50000);
      const list = await zohoActiveUsers(true).catch(() => null);
      if (!list) return fail(res, 502, "No se ha podido comprobar el usuario en Zoho CRM.");
      const z = list.find(x => x.id === String(b.zohoId || ""));
      if (!z) return fail(res, 400, "Esa persona no es un usuario activo de Zoho CRM.");
      if (Q.userByZoho.get(z.id) || Q.userByEmail.get(z.email)) return fail(res, 409, "Este usuario ya existe en el software.");
      const prob = pwProblem(b.password); if (prob) return fail(res, 400, prob);
      const t = nowISO();
      db.prepare("INSERT INTO users(email,name,zoho_id,zoho_role,zoho_profile,pass_hash,is_admin,active,perms,must_change,created_at,updated_at,zoho_ok_at,zoho_status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
        .run(z.email.toLowerCase(), z.name, z.id, z.role, z.profile, await hashPw(b.password), b.admin ? 1 : 0, 1, JSON.stringify(cleanPerms(b.perms)), b.mustChange === false ? 0 : 1, t, t, Date.now(), "active");
      const nu = hydrate(Q.userByZoho.get(z.id)); audit(U, "usuario_creado", nu.email + (nu.is_admin ? " (administrador)" : ""), ip);
      return send(res, 200, { user: pubUser(nu) });
    }
    if ((m = /^\/api\/admin\/users\/(\d+)$/.exec(p))) {
      const t = hydrate(Q.userById.get(+m[1])); if (!t) return fail(res, 404, "Usuario no encontrado");
      const lastAdmin = t.is_admin && t.active && Q.admins.get().n <= 1;
      if (M === "DELETE") {
        if (t.id === U.id) return fail(res, 400, "No puedes borrar tu propia cuenta.");
        if (lastAdmin) return fail(res, 400, "Tiene que quedar al menos un administrador.");
        db.prepare("DELETE FROM users WHERE id=?").run(t.id); pushUser(t.id, "logout"); audit(U, "usuario_borrado", t.email, ip);
        return send(res, 200, { ok: true });
      }
      if (M === "PATCH") {
        const b = await readBody(req, 50000); const sets = [], vals = []; let kick = false, aclChanged = false;
        if (b.perms !== undefined) { sets.push("perms=?"); vals.push(JSON.stringify(cleanPerms(b.perms))); aclChanged = true; }
        if (b.admin !== undefined) {
          if (!b.admin && t.id === U.id) return fail(res, 400, "No puedes quitarte a ti mismo el rol de administrador.");
          if (!b.admin && lastAdmin) return fail(res, 400, "Tiene que quedar al menos un administrador.");
          sets.push("is_admin=?"); vals.push(b.admin ? 1 : 0); aclChanged = true;
        }
        if (b.active !== undefined) {
          if (!b.active && t.id === U.id) return fail(res, 400, "No puedes desactivar tu propia cuenta.");
          if (!b.active && lastAdmin) return fail(res, 400, "Tiene que quedar al menos un administrador activo.");
          sets.push("active=?"); vals.push(b.active ? 1 : 0); if (!b.active) kick = true;
        }
        if (b.password !== undefined) { const prob = pwProblem(b.password); if (prob) return fail(res, 400, prob); sets.push("pass_hash=?"); vals.push(await hashPw(b.password)); sets.push("must_change=?"); vals.push(b.mustChange === false ? 0 : 1); if (t.id !== U.id) kick = true; }
        else if (b.mustChange !== undefined) { sets.push("must_change=?"); vals.push(b.mustChange ? 1 : 0); }
        if (!sets.length) return send(res, 200, { user: pubUser(t) });
        sets.push("updated_at=?"); vals.push(nowISO()); vals.push(t.id);
        db.prepare("UPDATE users SET " + sets.join(",") + " WHERE id=?").run(...vals);
        if (kick) { Q.sessDelUser.run(t.id); pushUser(t.id, "logout"); } else if (aclChanged) pushUser(t.id, "acl");
        const nt = hydrate(Q.userById.get(t.id));
        audit(U, "usuario_modificado", nt.email + ": " + Object.keys(b).filter(k => k !== "password").concat(b.password !== undefined ? ["contraseña"] : []).join(", "), ip);
        return send(res, 200, { user: pubUser(nt) });
      }
    }
    if ((m = /^\/api\/admin\/users\/(\d+)\/zoho$/.exec(p)) && M === "POST") {
      const t = hydrate(Q.userById.get(+m[1])); if (!t) return fail(res, 404, "Usuario no encontrado");
      const st = await zohoStatusOf(t.zoho_id); markZoho(t, st); return send(res, 200, { status: st, user: pubUser(hydrate(Q.userById.get(t.id))) });
    }
  }
  return fail(res, 404, "No encontrado");
}

/* ---------- herramientas de línea de comandos ---------- */
async function cli(args) {
  const cmd = args[0];
  const ask = (q, hidden) => new Promise(res => {
    const rl = require("node:readline").createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) { rl._writeToOutput = s => { if (s.includes(q)) process.stdout.write(s); }; }
    rl.question(q, a => { rl.close(); if (hidden) process.stdout.write("\n"); res(a); });
  });
  if (cmd === "crear-admin") {
    const email = String(args[1] || "").trim().toLowerCase();
    if (!email) { console.log("Uso: node server.js crear-admin <email-de-zoho>"); process.exit(1); }
    if (!zohoConfigured()) { console.log("Falta configurar Zoho en .env (ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN)."); process.exit(1); }
    const list = await zohoActiveUsers(true);
    const z = list.find(x => x.email.toLowerCase() === email);
    if (!z) { console.log("ERROR: " + email + " no es un usuario activo de Zoho CRM."); process.exit(1); }
    if (Q.userByZoho.get(z.id) || Q.userByEmail.get(z.email)) { console.log("Ese usuario ya existe en el software."); process.exit(1); }
    const pw = process.env.ADMIN_PASSWORD || await ask("Contraseña para " + z.name + ": ", true);
    const prob = pwProblem(pw); if (prob) { console.log(prob); process.exit(1); }
    const t = nowISO();
    db.prepare("INSERT INTO users(email,name,zoho_id,zoho_role,zoho_profile,pass_hash,is_admin,active,perms,must_change,created_at,updated_at,zoho_ok_at,zoho_status) VALUES(?,?,?,?,?,?,1,1,'{}',0,?,?,?,'active')")
      .run(z.email.toLowerCase(), z.name, z.id, z.role, z.profile, await hashPw(pw), t, t, Date.now());
    audit(null, "admin_creado_cli", z.email);
    console.log("Administrador creado: " + z.name + " <" + z.email + ">"); process.exit(0);
  }
  if (cmd === "restablecer-contraseña" || cmd === "restablecer-contrasena") {
    const email = String(args[1] || "").trim().toLowerCase(); const u = Q.userByEmail.get(email);
    if (!u) { console.log("No existe ese usuario."); process.exit(1); }
    const pw = process.env.NEW_PASSWORD || await ask("Nueva contraseña para " + u.name + ": ", true);
    const prob = pwProblem(pw); if (prob) { console.log(prob); process.exit(1); }
    db.prepare("UPDATE users SET pass_hash=?, must_change=1, updated_at=? WHERE id=?").run(await hashPw(pw), nowISO(), u.id);
    Q.sessDelUser.run(u.id); audit(null, "contraseña_restablecida_cli", u.email);
    console.log("Contraseña cambiada. Tendrá que elegir una nueva al entrar."); process.exit(0);
  }
  if (cmd === "comprobar-zoho") {
    if (!zohoConfigured()) { console.log("Falta configurar Zoho en .env."); process.exit(1); }
    const list = await zohoActiveUsers(true); console.log("Conexión con Zoho correcta. Usuarios activos: " + list.length);
    const r = await zohoCoql("select id from Deals limit 0, 1"); console.log("COQL correcto (" + ((r.data || []).length) + " fila de prueba)."); process.exit(0);
  }
  if (cmd === "importar") {
    /* carga los datos guardados en la versión de claude.ai: JSON {coleccion: {id: datos}} */
    const f = args[1]; if (!f || !fs.existsSync(f)) { console.log("Uso: node server.js importar <archivo.json>"); process.exit(1); }
    const data = JSON.parse(fs.readFileSync(f, "utf8")); let n = 0; const t = nowISO();
    for (const [col, docs] of Object.entries(data)) {
      if (!COLS[col]) { console.log("Se ignora la colección desconocida: " + col); continue; }
      for (const [id, v] of Object.entries(docs || {})) { Q.docPut.run(col, id, JSON.stringify(v), t, null); n++; }
    }
    audit(null, "datos_importados", n + " documentos desde " + path.basename(f)); console.log("Importados " + n + " documentos."); process.exit(0);
  }
  console.log("Comandos: crear-admin <email> · restablecer-contraseña <email> · comprobar-zoho · importar <archivo.json>"); process.exit(1);
}

if (process.argv[2]) cli(process.argv.slice(2)).catch(e => { console.error("ERROR:", e.message); process.exit(1); });
else {
  if (!fs.existsSync(CFG.appHtml)) { console.error("No se encuentra la aplicación en " + CFG.appHtml); process.exit(1); }
  http.createServer((req, res) => {
    handle(req, res).catch(e => { if (!res.headersSent) fail(res, e.status || 500, e.status ? e.message : "Error interno"); if (!e.status) console.error(e); });
  }).listen(CFG.port, CFG.host, () => {
    console.log("Campus Experience · servidor en http://" + CFG.host + ":" + CFG.port);
    if (!zohoConfigured()) console.warn("AVISO: falta configurar Zoho CRM en .env; nadie podrá entrar hasta configurarlo.");
    if (!Q.admins.get().n) console.warn("AVISO: no hay administrador. Créalo con: node server.js crear-admin <email-de-zoho>");
  });
}
