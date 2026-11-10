/* Acceso a los datos en Zoho Catalyst (Data Store + ZCQL).
   Todo lo que toca Catalyst está en este archivo: si Catalyst cambia su SDK, solo hay que tocar aquí.

   Tablas que hay que crear en Catalyst > Cloud Scale > Data Store (ver CATALYST.md):
     CEUsers    email, name, zoho_id, zoho_role, zoho_profile, pass_hash, is_admin, active, perms, must_change,
                last_login, zoho_ok_at, zoho_status, ver
     CESessions token_hash, user_id, created_at, last_seen, zoho_checked_at, ip, ua
     CEDocs     col, doc_id, part, parts, data, updated_at, updated_by
     CEAudit    ts, user_id, email, action, detail, ip
     CEMeta     k, v
*/
"use strict";
const catalyst = require("zcatalyst-sdk-node");

const PAGE = 300;
/* los valores que van dentro de ZCQL se validan antes: nunca llevan comillas */
const SAFE = /^[A-Za-z0-9_.:|@+\-]*$/;
const q = v => { const s = String(v); if (!SAFE.test(s)) throw new Error("Valor no permitido en consulta"); return "'" + s + "'"; };
const num = v => { const s = String(v); if (!/^\d{1,20}$/.test(s)) throw new Error("Identificador no válido"); return s; };
const rowsOf = (res, table) => {
  const arr = Array.isArray(res) ? res : (res && Array.isArray(res.content) ? res.content : []);
  return arr.map(r => (r && r[table]) ? r[table] : r);
};
const bool = v => v === true || v === "true" || v === 1 || v === "1";
const int = v => (v === null || v === undefined || v === "" ? null : Number(v));

module.exports = function makeStore(req) {
  const app = catalyst.initialize(req, { scope: "admin" });
  const zcql = (sql, table) => app.zcql().executeZCQLQuery(sql).then(r => rowsOf(r, table));
  const table = t => app.datastore().table(t);
  async function all(t, where, order) {
    const out = [];
    for (let o = 0; o < 100 * PAGE; o += PAGE) {
      const rows = await zcql("SELECT * FROM " + t + (where ? " WHERE " + where : "") + (order ? " ORDER BY " + order : "") + " LIMIT " + o + "," + PAGE, t);
      out.push(...rows); if (rows.length < PAGE) break;
    }
    return out;
  }
  const first = async (t, where) => (await zcql("SELECT * FROM " + t + " WHERE " + where + " LIMIT 0,1", t))[0] || null;

  const U = r => r && ({ id: String(r.ROWID), email: r.email, name: r.name, zoho_id: r.zoho_id, zoho_role: r.zoho_role, zoho_profile: r.zoho_profile, pass_hash: r.pass_hash,
    is_admin: bool(r.is_admin), active: bool(r.active), perms: r.perms || "{}", must_change: bool(r.must_change), last_login: r.last_login || null,
    zoho_ok_at: int(r.zoho_ok_at), zoho_status: r.zoho_status || "", ver: int(r.ver) || 0, created_at: r.CREATEDTIME || null });
  const S = r => r && ({ id: String(r.ROWID), token_hash: r.token_hash, user_id: String(r.user_id), created_at: int(r.created_at), last_seen: int(r.last_seen), zoho_checked_at: int(r.zoho_checked_at) });

  const users = {
    all: async () => (await all("CEUsers")).map(U),
    byId: async id => U(await first("CEUsers", "ROWID = " + num(id))),
    byEmail: async e => U(await first("CEUsers", "email = " + q(String(e).toLowerCase()))),
    byZoho: async z => U(await first("CEUsers", "zoho_id = " + q(z))),
    insert: async f => U(await table("CEUsers").insertRow(Object.assign({ ver: 1 }, f))),
    update: async (id, f) => { await table("CEUsers").updateRow(Object.assign({ ROWID: num(id) }, f)); },
    remove: async id => { await table("CEUsers").deleteRow(num(id)); },
  };
  const sessions = {
    get: async th => S(await first("CESessions", "token_hash = " + q(th))),
    insert: async f => { await table("CESessions").insertRow(f); },
    update: async (id, f) => { await table("CESessions").updateRow(Object.assign({ ROWID: num(id) }, f)); },
    remove: async id => { await table("CESessions").deleteRow(num(id)); },
    removeByUser: async (uid, exceptTh) => {
      const rows = await all("CESessions", "user_id = " + num(uid));
      for (const r of rows) if (r.token_hash !== exceptTh) await table("CESessions").deleteRow(num(r.ROWID));
    },
    gc: async (idleBefore, createdBefore) => {
      const rows = await zcql("SELECT ROWID FROM CESessions WHERE last_seen < " + num(idleBefore) + " OR created_at < " + num(createdBefore) + " LIMIT 0,200", "CESessions");
      for (const r of rows) await table("CESessions").deleteRow(num(r.ROWID));
    },
  };
  /* documentos guardados (horarios, equipos…): una columna de texto admite 10.000 caracteres, se trocean */
  const CHUNK = 9000;
  const docs = {
    list: async col => {
      const rows = await all("CEDocs", "col = " + q(col));
      const by = {};
      rows.forEach(r => { (by[r.doc_id] = by[r.doc_id] || []).push(r); });
      const out = {};
      Object.entries(by).forEach(([id, parts]) => {
        parts.sort((a, b) => Number(a.part) - Number(b.part));
        const n = Number(parts[0].parts || parts.length);
        if (parts.length < n) return; // escritura a medias: se ignora hasta que esté completa
        try { out[id] = JSON.parse(parts.slice(0, n).map(p => p.data || "").join("")); } catch (e) {}
      });
      return out;
    },
    put: async (col, id, data, by) => {
      const json = JSON.stringify(data === undefined ? null : data);
      const parts = []; for (let i = 0; i < json.length || i === 0; i += CHUNK) parts.push(json.slice(i, i + CHUNK));
      const old = await all("CEDocs", "col = " + q(col) + " AND doc_id = " + q(id));
      const now = new Date().toISOString();
      await table("CEDocs").insertRows(parts.map((d, i) => ({ col, doc_id: id, part: i, parts: parts.length, data: d, updated_at: now, updated_by: by || null })));
      for (const r of old) await table("CEDocs").deleteRow(num(r.ROWID));
    },
    remove: async (col, id) => {
      const old = await all("CEDocs", "col = " + q(col) + " AND doc_id = " + q(id));
      for (const r of old) await table("CEDocs").deleteRow(num(r.ROWID));
    },
  };
  const meta = {
    get: async k => { const r = await first("CEMeta", "k = " + q(k)); return r ? { id: String(r.ROWID), v: r.v } : null; },
    set: async (k, v) => { const r = await meta.get(k); if (r) await table("CEMeta").updateRow({ ROWID: num(r.id), v: String(v) }); else await table("CEMeta").insertRow({ k, v: String(v) }); },
  };
  const audit = {
    add: async f => { try { await table("CEAudit").insertRow(f); } catch (e) {} },
    list: async n => (await zcql("SELECT * FROM CEAudit ORDER BY CREATEDTIME DESC LIMIT 0," + Math.min(300, n | 0 || 100), "CEAudit")).map(r => ({ ts: r.ts, email: r.email, action: r.action, detail: r.detail })),
  };
  return { users, sessions, docs, meta, audit };
};
