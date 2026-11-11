# Dashboard de registros · Campus Experience 2027

Versión del dashboard que antes vivía en claude.ai, ahora dentro del software operativo.

- **Página:** `client/dashboard.html` (se sirve en `/app/dashboard.html`). Usa el mismo login que el resto del software; la ven **todos los usuarios con sesión**.
- **Datos:** la función `campus_api` los sirve en `/server/campus_api/dashboard.js`:
  - lee de Zoho CRM (solo lectura) las inscripciones **con pago** de Madrid, Andorra, Valencia, Málaga, Alicante y Almería (Torrevieja sale a 0 hasta que exista como Ubicacion en Zoho);
  - calcula las cifras con `functions/campus_api/ce_engine.js` (el mismo motor que el dashboard de claude.ai);
  - guarda el resultado en el Data Store (`CEDocs`, col `dash`, y la marca `dash_ts` en `CEMeta`) y lo reutiliza durante 15 minutos (`CE_DASH_TTL_MIN`).
  - Si Zoho falla, se muestran los últimos datos guardados con un aviso. Si los registros de Madrid bajan más de un 10 % de golpe, no se aceptan los datos nuevos.
- **Botón «Actualizar»:** `POST /server/campus_api/api/dashboard/refresh` (como mucho una lectura de Zoho por minuto). Queda en el registro de actividad.
- Atención al público ya no forma parte del dashboard (está en el software operativo).

## Cambiar el diseño
Se edita `dashboard/template_natv.html` (o `cat_ui.js`, el botón) y se regenera la página:

```bash
cd dashboard && python3 mk_cat.py ../client/dashboard.html
```

Si cambia el cálculo, se cambia `functions/campus_api/ce_engine.js`.
