/* Dashboard de registros Campus Experience 2027 — función propia en Zoho Catalyst (Advanced I/O, Node.js)
   URL: /server/dashboard_api/...

   Es INDEPENDIENTE de campus_api a propósito: así, cuando se publica una versión nueva del software
   operativo (campus_api e index.html), el dashboard no se pierde.

   Comparte con el software operativo:
     - el login: lee la misma cookie de sesión y las tablas CESessions y CEUsers del Data Store;
     - las credenciales de Zoho CRM (solo lectura): mismas variables de entorno que campus_api,
       configuradas también en esta función.

   Rutas:
     GET  /dashboard.js               datos del dashboard como JavaScript (o redirige al acceso sin sesión)
     POST /api/dashboard/refresh      vuelve a leer Zoho ahora (botón «Actualizar»; cabecera X-CE)
*/
"use strict";
const crypto = require("crypto");

const env = (k, d) => (process.env[k] === undefined || process.env[k] === "" ? d : process.env[k]);
const CFG = {
  idleMin: +env("SESSION_IDLE_MIN", 480),
  maxHours: +env("SESSION_MAX_HOURS", 72),
  loginUrl: env("CE_LOGIN_URL", "/app/login.html"),
  origins: env("CE_ALLOWED_ORIGINS", "").split(",").map(s => s.trim()).filter(Boolean),
  ttl: +env("CE_DASH_TTL_MIN", 15) * 60000,
  zoho: {
    clientId: env("ZOHO_CLIENT_ID", ""), clientSecret: env("ZOHO_CLIENT_SECRET", ""), refreshToken: env("ZOHO_REFRESH_TOKEN", ""),
    accountsUrl: env("ZOHO_ACCOUNTS_URL", "https://accounts.zoho.eu").replace(/\/$/, ""),
    apiUrl: env("ZOHO_API_URL", "https://www.zohoapis.eu").replace(/\/$/, ""),
  },
};
const makeStore = require(env("CE_STORE_MODULE", "./store.js"));
const makeDashboard = require("./dashboard.js");

/* ---------- Zoho CRM (solo lectura) ---------- */
const Z = { token: null, exp: 0 };
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
async function zohoCoql(q) {
  if (MOCK) { const m = /limit (\d+), (\d+)/i.exec(q); const o = m ? +m[1] : 0, n = m ? +m[2] : 100; const src = q.includes("Campus_y_servicios") ? (MOCK.weeks || []) : (MOCK.deals || []); return { data: src.slice(o, o + n), info: { more_records: o + n < src.length } }; }
  const t = await zohoToken();
  const r = await fetch(CFG.zoho.apiUrl + "/crm/v8/coql", { method: "POST", headers: { Authorization: "Zoho-oauthtoken " + t, "Content-Type": "application/json" }, body: JSON.stringify({ select_query: q }), signal: AbortSignal.timeout(30000) });
  if (r.status === 204) return { data: [], info: { count: 0, more_records: false } };
  const json = await r.json().catch(() => null);
  if (r.status >= 400) throw Object.assign(new Error((json && (json.message || json.code)) || "Error de Zoho " + r.status), { status: 502 });
  return json;
}

/* ---------- datos del dashboard (caché compartida en el Data Store) ---------- */
const dashBuild = makeDashboard(q => zohoCoql(q));
const DASH = { data: null, t: 0, busy: null };
const dashN = d => { const r = d && (d.kpis || []).find(x => x.metric === "n"); return r ? +r.value : 0; };
async function dashGet(st, force) {
  /* otra instancia de la función puede haber actualizado: se mira la marca guardada */
  let saved = 0; try { const r = await st.meta.get("dash_ts"); saved = r ? +r.v || 0 : 0; } catch (e) {}
  if (saved > DASH.t) { try { const d = (await st.docs.list("dash")).data; if (d) { DASH.data = d; DASH.t = saved; } } catch (e) {} }
  const age = Date.now() - DASH.t;
  if (DASH.data && age < (force ? 60000 : CFG.ttl)) return { data: DASH.data };
  if (!DASH.busy) DASH.busy = (async () => {
    const D = await dashBuild(dashN(DASH.data));
    const now = Date.now();
    await st.docs.put("dash", "data", D, null); await st.meta.set("dash_ts", String(now));
    DASH.data = D; DASH.t = now; return D;
  })().finally(() => { DASH.busy = null; });
  try { return { data: await DASH.busy }; }
  catch (e) { if (DASH.data && !force) return { data: DASH.data, stale: e.message }; throw e; }
}

/* ---------- utilidades HTTP ---------- */
const SEC = { "X-Content-Type-Options": "nosniff", "Referrer-Policy": "same-origin", "Cache-Control": "no-store" };
const send = (res, code, body, headers = {}) => {
  const isObj = body !== null && typeof body === "object";
  res.writeHead(code, Object.assign({}, SEC, isObj ? { "Content-Type": "application/json; charset=utf-8" } : {}, headers));
  res.end(isObj ? JSON.stringify(body) : body);
};
const fail = (res, code, msg) => send(res, code, { error: msg });
const JS = { "Content-Type": "text/javascript; charset=utf-8" };
const safeJs = v => JSON.stringify(v).replace(/</g, "\\u003c");
const ipOf = req => String(req.headers["x-forwarded-for"] || (req.socket && req.socket.remoteAddress) || "").split(",")[0].trim();
const cookies = req => Object.fromEntries(String(req.headers.cookie || "").split(";").map(s => s.trim().split("=")).filter(p => p[0]).map(([k, ...v]) => [k, decodeURIComponent(v.join("="))]));
const LOCAL = env("CE_LOCAL_TEST", "") === "1";
const COOKIE = LOCAL ? "ce_sess" : "__Host-ce_sess"; // la misma cookie que campus_api
const sha = t => crypto.createHash("sha256").update(t).digest("hex");
const bool = v => v === true || v === "true" || v === 1 || v === "1";

/* sesión del software operativo (campus_api la crea, la renueva y comprueba Zoho cada 30 min) */
async function sessionOf(req, st) {
  const tok = cookies(req)[COOKIE]; if (!tok || tok.length < 40) return null;
  const s = await st.sessions.get(sha(tok)); if (!s) return null;
  const now = Date.now();
  if (now - s.last_seen > CFG.idleMin * 60000 || now - s.created_at > CFG.maxHours * 3600000) return null;
  const u = await st.users.byId(s.user_id);
  if (!u || !bool(u.active) || u.zoho_status === "inactive") return null;
  if (now - s.last_seen > 60000) { try { await st.sessions.update(s.id, { last_seen: now }); } catch (e) {} }
  return { u, mustChange: bool(u.must_change) };
}

async function handle(req, res) {
  const st = makeStore(req);
  const url = new URL(req.url, "http://x");
  const p = url.pathname.replace(/^\/server\/dashboard_api/, "") || "/";
  const M = req.method;

  if (p === "/dashboard.js" && M === "GET") {
    const S = await sessionOf(req, st);
    if (!S) return send(res, 200, "location.replace(" + JSON.stringify(CFG.loginUrl) + ");document.documentElement.style.display=\"none\";", JS);
    if (S.mustChange) return send(res, 200, "location.replace(" + JSON.stringify(CFG.loginUrl + "?cambio=1") + ");document.documentElement.style.display=\"none\";", JS);
    if (!zohoConfigured()) return send(res, 200, "window.CE_DATA=null;window.CE_DATA_ERR=" + safeJs("Falta configurar Zoho CRM en las variables de entorno de la función dashboard_api.") + ";", JS);
    try {
      const r = await dashGet(st, false);
      return send(res, 200, "window.CE_DATA=" + safeJs(r.data) + ";" + (r.stale ? "window.CE_DATA_WARN=" + safeJs(r.stale) + ";" : ""), JS);
    } catch (e) {
      console.error(e);
      return send(res, 200, "window.CE_DATA=null;window.CE_DATA_ERR=" + safeJs(e.status ? e.message : "Error interno") + ";", JS);
    }
  }

  if (p === "/api/dashboard/refresh" && M === "POST") {
    if (req.headers["x-ce"] !== "1") return fail(res, 403, "Petición no permitida");
    const o = req.headers.origin; if (o && CFG.origins.length && !CFG.origins.includes(o)) return fail(res, 403, "Origen no permitido");
    const S = await sessionOf(req, st); if (!S) return fail(res, 401, "Sesión caducada. Vuelve a entrar.");
    if (!zohoConfigured()) return fail(res, 503, "Falta configurar Zoho CRM en las variables de entorno de la función dashboard_api.");
    try {
      const r = await dashGet(st, true);
      try { await st.audit.add({ ts: new Date().toISOString(), user_id: S.u.id, email: S.u.email, action: "dashboard_actualizado", detail: null, ip: ipOf(req) }); } catch (e) {}
      return send(res, 200, { ok: true, ts: r.data.ts });
    } catch (e) { if (!e.status) console.error(e); return fail(res, e.status || 502, e.status ? e.message : "Error al leer Zoho CRM"); }
  }

  return fail(res, 404, "No encontrado");
}

module.exports = (req, res) => {
  handle(req, res).catch(e => {
    if (!e.status) console.error(e);
    try { if (!res.headersSent) fail(res, e.status || 500, e.status ? e.message : "Error interno"); else res.end(); } catch (x) {}
  });
};
