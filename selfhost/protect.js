/* Protección de los datos guardados (horarios, equipos y demás).
   - Historial: antes de sobrescribir un documento protegido, se guarda la versión anterior (las últimas 20 por documento).
   - Papelera: lo que se borra no desaparece; va a la papelera, de donde se recupera. Solo el administrador la vacía.
   - Copia de seguridad diaria: una sola copia, la más reciente. La nueva sustituye a la anterior SOLO cuando se ha
     completado bien; si falla, se conserva la anterior y se vuelve a intentar.
   Nunca se borra nada de forma automática.
   El mismo archivo lo usan Zoho Catalyst (functions/campus_api) y el servidor propio (selfhost). */
"use strict";
const PROTECT = new Set(["hor", "hweek", "hsim", "hsimd", "teams", "reqs", "hbus", "happr", "attc", "agliq"]);
const KEEP = 20;
const SKIP = new Set(["hist", "trash", "backup", "dash"]);
const madrid = () => { const p = {}; new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" }).formatToParts(new Date()).forEach(x => { p[x.type] = x.value; }); return { day: p.year + "-" + p.month + "-" + p.day, h: +p.hour }; };

/* A = { get(col,id), put(col,id,data,by), remove(col,id), list(col), metaGet(k), metaSet(k,v) } (todas async) */
module.exports = function makeProtect(A, cols) {
  const who = U => ({ by: U ? String(U.id) : null, byName: U ? (U.name || U.email || "") : "" });
  async function beforePut(col, id, data, U) {
    if (!PROTECT.has(col)) return;
    const prev = await A.get(col, id); if (prev == null) return;
    if (JSON.stringify(prev) === JSON.stringify(data)) return;
    const hk = col + "|" + id; const h = (await A.get("hist", hk)) || { col, id, v: [] };
    h.v = (h.v || []).concat([Object.assign({ at: new Date().toISOString(), data: prev }, who(U))]).slice(-KEEP);
    await A.put("hist", hk, h, U ? U.id : null);
  }
  async function beforeDelete(col, id, U) {
    if (!PROTECT.has(col)) return;
    const prev = await A.get(col, id); if (prev == null) return;
    await A.put("trash", col + "|" + id + "|" + Date.now(), Object.assign({ col, id, at: new Date().toISOString(), data: prev }, who(U)), U ? U.id : null);
  }
  const history = async (col, id) => { const h = await A.get("hist", col + "|" + id); return (h && h.v) ? h.v.slice().reverse() : []; };
  async function trashList() { const all = await A.list("trash"); return Object.entries(all).map(([key, v]) => Object.assign({ key }, v)).sort((a, b) => String(b.at).localeCompare(String(a.at))); }
  async function trashRestore(key, U) {
    const e = await A.get("trash", key); if (!e) return null;
    await beforePut(e.col, e.id, e.data, U); await A.put(e.col, e.id, e.data, U ? U.id : null); await A.remove("trash", key); return e;
  }
  async function trashEmpty(key) { if (key) return A.remove("trash", key); const all = await A.list("trash"); for (const k of Object.keys(all)) await A.remove("trash", k); }

  /* copia de seguridad: una al día, a partir de las 3:00 (hora de España), en dos ranuras A/B */
  async function backupInfo() { const r = await A.metaGet("backup"); try { return r ? JSON.parse(r) : {}; } catch (e) { return {}; } }
  async function backupIfDue(force) {
    const now = madrid(); const info = await backupInfo();
    if (!force) {
      if (info.day === now.day || now.h < 3) return info;
      if (info.running && Date.now() - info.running < 10 * 60000) return info;
      if (info.failAt && Date.now() - info.failAt < 15 * 60000) return info;
    }
    await A.metaSet("backup", JSON.stringify(Object.assign({}, info, { running: Date.now() })));
    try {
      const data = { at: new Date().toISOString(), cols: {} }; let n = 0;
      for (const c of cols()) { if (SKIP.has(c)) continue; data.cols[c] = await A.list(c); n += Object.keys(data.cols[c]).length; }
      const slot = info.slot === "A" ? "B" : "A";
      await A.put("backup", slot, data, null);
      const chk = await A.get("backup", slot); if (!chk || !chk.cols) throw new Error("La copia no se ha podido comprobar");
      const next = { day: now.day, at: data.at, slot, n, size: JSON.stringify(data).length };
      await A.metaSet("backup", JSON.stringify(next));
      if (info.slot && info.slot !== slot) { try { await A.remove("backup", info.slot); } catch (e) {} }
      return next;
    } catch (e) {
      const keep = Object.assign({}, info, { running: 0, failAt: Date.now(), err: String(e && e.message || e).slice(0, 200) });
      await A.metaSet("backup", JSON.stringify(keep)); return keep;
    }
  }
  async function backupData() { const info = await backupInfo(); return info.slot ? await A.get("backup", info.slot) : null; }
  async function backupRestore(which, U) {
    const b = await backupData(); if (!b || !b.cols) throw Object.assign(new Error("No hay copia de seguridad"), { status: 404 });
    let n = 0; const touched = [];
    for (const [c, docs] of Object.entries(b.cols)) {
      if (which && which.length && !which.includes(c)) continue;
      const cur = await A.list(c);
      for (const [id, v] of Object.entries(docs)) { if (JSON.stringify(cur[id]) === JSON.stringify(v)) continue; await beforePut(c, id, v, U); await A.put(c, id, v, U ? U.id : null); n++; }
      for (const id of Object.keys(cur)) if (!(id in docs)) { await beforeDelete(c, id, U); await A.remove(c, id); n++; }
      touched.push(c);
    }
    return { n, cols: touched, at: b.at };
  }
  return { PROTECT, beforePut, beforeDelete, history, trashList, trashRestore, trashEmpty, backupInfo, backupIfDue, backupData, backupRestore };
};
