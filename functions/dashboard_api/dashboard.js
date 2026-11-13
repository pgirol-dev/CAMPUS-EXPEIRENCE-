/* Dashboard de registros Campus Experience 2027 (antes en claude.ai).
   Lee de Zoho CRM (solo lectura) las inscripciones CON PAGO de cada sede y calcula las cifras
   con el mismo motor que usaba el dashboard de claude.ai (ce_engine.js).
   El resultado se guarda en el Data Store (CEDocs, col «dash») para servirlo rápido a todos. */
"use strict";
const CE = require("./ce_engine.js");

const STG = "('Unpaid','Cancelled','Refund','Trash','Reservation Payment Completed')";
const LAYOUT = "695370000036704653"; // ISL - Real Madrid
const FIELDS = "id, Created_Time, Stage, Tipo_Modalidad, Gender, Nationality, Weeks, utm_source, utm_medium, utm_campaign, utm_content, Total, Paid, Balance_Due1, Posicion_participante, Forma_de_pago, A_o_de_nacimiento, Codigo_descuento, Deal_Name, Talla_equipacion, referrername, GCLID, ga_gclid, FBClid, Ad_Campaign_Name, Colectivos, Numero_socio, Numero_empleado_RM_FRM, Numero_carnet_madridista";
/* clave del dashboard → valor de Ubicacion en Zoho */
const SEDES = [["madrid", "Madrid"], ["andorra", "Andorra"], ["valencia", "Valencia"], ["malaga", "Malaga"], ["alicante", "Alicante"], ["almeria", "Almeria"], ["torrevieja", "Torrevieja"]];

module.exports = function makeDashboard(zohoCoql) {
  async function coql(q, lim) {
    let out = [], off = 0;
    for (let g = 0; g < 50; g++) {
      const j = await zohoCoql(q + " limit " + off + ", " + lim);
      const rows = (j && j.data) || [];
      out = out.concat(rows);
      if (!(j && j.info && j.info.more_records) || rows.length < lim) break;
      off += lim;
    }
    return out;
  }
  async function sede(ub) {
    const rows = await coql("select " + FIELDS + " from Deals where (((Layout = '" + LAYOUT + "' and Ubicacion = '" + ub + "') and Ano_Campus = 2027) and Stage not in " + STG + ") order by Created_Time asc", 2000);
    const seen = {}, rs = [];
    rows.forEach(r => { if (!seen[r.id]) { seen[r.id] = 1; rs.push(r); } });
    if (!rs.length) return { rs: [], ex: [] };
    const L = await coql("select Producto, Importe, Parent_Id, Noches_extra, Semana1 from Campus_y_servicios_extra where (((Parent_Id.Ano_Campus = 2027 and Parent_Id.Ubicacion = '" + ub + "') and Parent_Id.Stage not in " + STG + ") and Importe is not null) order by Created_Time asc", 2000);
    const sl = {}, ex = [];
    L.forEach(r => { const pid = r.Parent_Id && r.Parent_Id.id; if (sl[r.id] || !seen[pid]) return; sl[r.id] = 1; ex.push([r.Producto && r.Producto.name, r.Importe, pid, r.Noches_extra, r.Semana1]); });
    return { rs, ex };
  }
  /* prevN: registros de Madrid de la última versión buena (si baja más de un 10 %, no se acepta) */
  return async function build(prevN) {
    const res = await Promise.all(SEDES.map(s => sede(s[1])));
    const inp = {}; SEDES.forEach((s, i) => { inp[s[0]] = res[i]; });
    const D = CE.makeData(inp, null); // Atención al público ya no forma parte del dashboard
    const errs = CE.check(D, prevN ? Math.floor(prevN * 0.9) : 0);
    if (errs.length) throw Object.assign(new Error("Los datos no cuadran: " + errs.join(" · ")), { status: 502 });
    delete D._chk;
    return D;
  };
};
