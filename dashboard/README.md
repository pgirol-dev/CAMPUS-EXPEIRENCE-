# Dashboard de registros · Campus Experience 2027

Versión del dashboard que antes vivía en claude.ai, ahora dentro del software operativo.

- **Acceso en el menú:** `client/dashboard-menu.js`, que `build.js` enlaza en `client/index.html`. No depende de `index.html`: aunque se publique una versión nueva de la aplicación, el acceso sigue.
- **Página:** `client/dashboard.html` (se sirve en `/app/dashboard.html`; en el menú lateral del software, «Dashboard»). Usa el mismo login que el resto del software; la ven **todos los usuarios con sesión**.
- **Datos:** los sirve una función propia, **`dashboard_api`** (independiente de `campus_api`), en `/server/dashboard_api/dashboard.js`:
  - lee de Zoho CRM (solo lectura) las inscripciones **con pago** de Madrid, Andorra, Valencia, Málaga, Alicante, Almería y Torrevieja;
  - calcula las cifras con `functions/dashboard_api/ce_engine.js` (el mismo motor que el dashboard de claude.ai);
  - guarda el resultado en el Data Store (`CEDocs`, col `dash`, y la marca `dash_ts` en `CEMeta`) y lo reutiliza durante 15 minutos (`CE_DASH_TTL_MIN`).
  - Si Zoho falla, se muestran los últimos datos guardados con un aviso. Si los registros de Madrid bajan más de un 10 % de golpe, no se aceptan los datos nuevos.
- **Botón «Actualizar»:** `POST /server/dashboard_api/api/dashboard/refresh` (como mucho una lectura de Zoho por minuto). Queda en el registro de actividad.
- Atención al público ya no forma parte del dashboard (está en el software operativo).

## Residencias (Madrid, desde el 16 nov)
Apartado «Residencias» en la vista Madrid: ocupación de la **UAM** y la **UEM** en las semanas 2 a 8 (las que tienen programa interno).
- **Quién cuenta:** jugadores **con pago** de MAX Interno y ONE Interno, por semana (`resid` en `ce_engine.js`: `[{week, max, one}]`). Las noches extra no entran.
- **Por semana y residencia:** bloqueo (plazas) editable y residencia abierta o cerrada esa semana. Cada modalidad se asigna a la UAM, a la UEM, se divide entre las dos (plazas a la UAM, resto a la UEM) o queda sin asignar.
- **Totales:** cada residencia tiene sus plazas contratadas (editables, independientes de la suma de bloqueos) y arriba va el total de las dos, con el mismo formato que las tarjetas destacadas del dashboard.
- **Colores:** por debajo del bloqueo en rojo; cerca (desde el 80 %) en ámbar; bloqueo cubierto o superado en verde con ✓. Fondo de la tarjeta: tono UAM (rosado) mientras no se cubre el bloqueo; gris azulado (tono UEM) cuando se cubre o se supera.
- **Quién edita:** los administradores y quien tenga el permiso **Dashboard › Residencias: Editar**, que se da en el software en *Administración › Usuarios* (permiso `dashboard.residencias` = 2 del catálogo de `campus_api`). El resto lo ve en solo lectura. Lo comprueba el servidor.
- **API:** `GET /server/dashboard_api/api/residencias` → `{cfg, canEdit}`; `PUT` con `{cfg}` (cabecera `X-CE: 1`). Se guarda en `CEDocs` col `resid`, id `cfg`, y cada cambio queda en el registro de actividad (`residencias_editadas`).
- **Línea estética:** todo lo nuevo usa los mismos componentes del dashboard (tarjeta destacada marino con título en Archivo 900 cursiva, cifra grande rosa en Instrument Serif cursiva, subtítulo en cursiva). No se introducen estilos nuevos que rompan esa línea.

## Cambiar el diseño
Se edita `dashboard/template_natv.html` (o `cat_ui.js`, el botón) y se regenera la página:

```bash
cd dashboard && python3 mk_cat.py ../client/dashboard.html
```

Si cambia el cálculo, se cambia `functions/dashboard_api/ce_engine.js`.

Después de cualquier cambio: subir a GitHub (`main`). Se despliega solo en Catalyst (ver «Publicar cambios en Catalyst» en `CATALYST.md`).

## Archivos
| archivo | qué es |
|---|---|
| `template_natv.html` | diseño del dashboard (HTML, CSS y JS de los paneles) |
| `cat_ui.js` | botón «Actualizar», marca de hora y avisos |
| `mk_cat.py` | genera `client/dashboard.html` (usa el CSS de la barra que hay en `mk_tpl.py`) |
| `mk_tpl.py` | generador de la versión antigua de claude.ai; aquí solo se usa por el CSS de la barra |

## Reglas de los datos (validadas)
- **Conceptos (desde el 13 nov):** **jugador** = persona física inscrita con pago (antes «inscripción», «participante» o «registro de jugador»); **registro** = cada semana contratada (antes «semana contratada»). Un jugador con 3 semanas son 1 jugador y 3 registros. En las sedes nacionales cada inscripción es una semana: 1 jugador = 1 registro.
- Solo inscripciones con pago: se excluyen Unpaid, Cancelled, Refund, Trash y Reservation Payment Completed. Layout ISL - Real Madrid y Ano_Campus = 2027.
- Modalidad y semanas: de las líneas del subformulario «Campus y servicios extra», no de los campos Weeks/Tipo_Modalidad.
- Sedes nacionales: cada inscripción es una semana; los productos llevan la ciudad al final («… Jornada Completa Andorra»).
- Sedes: abiertas Andorra, Valencia, Málaga, Alicante (desde el 11 nov), Torrevieja y Almería (desde el 13 nov). Ya no queda ninguna «Próximamente» (la lista `OPEN` está en `template_natv.html`). Para abrir una sede, añadirla a `OPEN` y regenerar.

## Por qué está separado del resto del software
El software operativo se edita a menudo partiendo de copias propias (el artefacto «Operativa Campus Experience»). Dos veces (11 y 12 nov) una publicación borró el dashboard porque vivía dentro de `index.html` y de `campus_api`. Desde el 12 nov:
- los datos están en la función **`dashboard_api`** (comparte login y Data Store, pero tiene su propio código);
- el acceso del menú está en **`client/dashboard-menu.js`**;
- el permiso «Dashboard › Residencias» está en el catálogo de `campus_api` (`k: "dashboard"`); si una versión nueva lo quita, deja de poder darse desde Administración;
- `scripts/comprobar_dashboard.sh` comprueba que todo sigue ahí; lo ejecutan `publicar.sh` y el despliegue automático, y si falta algo **no se publica**.

`dashboard_api` necesita en Catalyst las mismas variables de Zoho que `campus_api` (`ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, `ZOHO_ACCOUNTS_URL`, `ZOHO_API_URL`; opcional `CE_LOGIN_URL`, `CE_DASH_TTL_MIN`).
