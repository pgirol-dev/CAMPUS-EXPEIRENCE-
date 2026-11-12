/* Puente entre la aplicación y el servidor (servidor propio o Zoho Catalyst).
   La aplicación se escribió para claude.ai (window.claude.use(...)); aquí se ofrecen
   las mismas funciones contra el servidor: datos guardados, Zoho CRM, usuario y descargas.
   Configuración (opcional, antes de cargar este archivo):
     window.CE_API_BASE  prefijo de la API ("" en servidor propio, "/server/campus_api" en Catalyst)
     window.CE_LOGIN_URL página de acceso ("/login" o "login.html")
     window.CE_POLL      true = avisos de cambios por consulta periódica (Catalyst); false = en vivo (SSE) */
(function () {
  "use strict";
  const BASE = window.CE_API_BASE || "";
  const LOGIN = window.CE_LOGIN_URL || "/login";
  const H = { "Content-Type": "application/json", "X-CE": "1" };
  const toLogin = q => { if (window.CE_DEMO) return; location.href = LOGIN + (q || ""); };
  async function api(method, url, body) {
    const full = url.startsWith("/api/") ? BASE + url : url;
    const r = await fetch(full, { method, headers: H, credentials: "same-origin", body: body === undefined ? undefined : JSON.stringify(body) });
    if (r.status === 401) { toLogin(); throw new Error("Sesión caducada"); }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { const e = new Error(j.error || ("Error " + r.status)); e.status = r.status; throw e; }
    return j;
  }
  window.CE_API = api;

  /* --- datos guardados (misma forma que la base de datos de claude.ai) --- */
  const listeners = {}, cache = {};
  const snap = col => ({ docs: Object.entries(cache[col] || {}).map(([id, v]) => ({ id, data: () => (v == null ? v : JSON.parse(JSON.stringify(v))) })) });
  const fire = col => (listeners[col] || []).forEach(f => { try { f(snap(col)); } catch (e) { console.error(e); } });
  async function refresh(col) {
    try { const j = await api("GET", "/api/db/" + col); cache[col] = j.docs || {}; fire(col); }
    catch (e) { if (e.status === 403) { cache[col] = {}; fire(col); } }
  }
  /* avisos de cambios hechos por otras personas */
  let started = false;
  function watch() {
    if (started) return; started = true;
    if (!window.CE_POLL && window.EventSource) {
      const es = new EventSource(BASE + "/api/events");
      es.addEventListener("change", ev => { try { const d = JSON.parse(ev.data); if (listeners[d.col]) refresh(d.col); } catch (e) {} });
      es.addEventListener("acl", () => location.reload());
      es.addEventListener("logout", () => toLogin());
      return;
    }
    let since = Date.now(), myVer = null, busy = false;
    const tick = async () => {
      if (busy || document.hidden) return; busy = true;
      try {
        const j = await api("GET", "/api/changes?since=" + since);
        since = j.now || Date.now();
        if (myVer === null) myVer = j.me; else if (j.me !== myVer) { location.reload(); return; }
        Object.keys(j.cols || {}).forEach(col => { if (listeners[col]) refresh(col); });
      } catch (e) {} finally { busy = false; }
    };
    setInterval(tick, 30000); document.addEventListener("visibilitychange", () => { if (!document.hidden) tick(); }); tick();
  }
  const writeErr = e => { if (window.CE_SOLO_LECTURA) window.CE_SOLO_LECTURA(e.message); throw e; };
  const db = {
    collection(col) {
      return {
        onSnapshot(fn) { (listeners[col] = listeners[col] || []).push(fn); watch(); refresh(col); return () => { listeners[col] = (listeners[col] || []).filter(f => f !== fn); }; },
        doc(id) {
          const u = "/api/db/" + col + "/" + encodeURIComponent(id);
          return {
            async set(v) { await api("PUT", u, { data: v }).catch(writeErr); (cache[col] = cache[col] || {})[id] = JSON.parse(JSON.stringify(v)); fire(col); },
            async delete() { await api("DELETE", u).catch(writeErr); if (cache[col]) delete cache[col][id]; fire(col); },
          };
        },
      };
    },
  };

  /* --- Zoho CRM (consultas de solo lectura a través del servidor) --- */
  const mcp = {
    async callTool(server, tool, args, opt) {
      if (server === "Zoho Books" && tool === "list_invoices") return api("POST", "/api/books/invoices", { query_params: (args && args.query_params) || {} });
      if (server === "Zoho Books" && tool === "list_creditnotes") return api("POST", "/api/books/creditnotes", { query_params: (args && args.query_params) || {} });
      if (server !== "Zoho CRM") { const e = new Error("Conector no disponible en este servidor: " + server); e.code = "server_not_connected"; throw e; }
      const q = args && args.body && args.body.select_query;
      return api("POST", "/api/zoho/coql", { select_query: q, refresh: !!(opt && opt.cache && opt.cache.refresh) });
    },
  };

  /* --- usuario --- */
  const A = window.CE_ACL || {};
  const initials = n => String(n || "?").split(/\s+/).filter(Boolean).slice(0, 2).map(s => s[0].toUpperCase()).join("");
  const avatar = n => "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" rx="32" fill="#ea456c"/><text x="32" y="41" text-anchor="middle" font-family="Arial" font-weight="700" font-size="24" fill="#1a1f2a">' + initials(n) + "</text></svg>");
  const user = {
    async id() { return A.id || null; },
    async me() { return { id: A.id || null, name: A.name || "", email: A.email || null, avatarUrl: avatar(A.name), color: "#ea456c", isOwner: !!A.admin, canEdit: true }; },
    async profiles(ids) { try { return await api("GET", "/api/profiles?ids=" + encodeURIComponent(ids.join(","))); } catch (e) { return {}; } },
  };

  /* --- descargas --- */
  const downloads = {
    async save({ filename, data }) {
      const blob = data instanceof Blob ? data : new Blob([data]);
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
      return { status: "saved" };
    },
  };

  const caps = { db, mcp, user, downloads };
  const set = v => { try { window.claude = v; } catch (e) {} if (window.claude !== v) { try { Object.defineProperty(window, "claude", { value: v, configurable: true, writable: true }); } catch (e) {} } };
  set({ use: async name => caps[name] || null });
})();
