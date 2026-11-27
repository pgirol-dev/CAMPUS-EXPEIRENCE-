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

## Institucionales (desde el 24 nov)
- **Municipios abiertos:** Yepes y Argés (`INS` en `functions/dashboard_api/dashboard.js` y en `ce_engine.js`; `OPENI` en `template_natv.html`). Para abrir otro municipio, añadirlo en los tres sitios.
- **De dónde salen:** inscripciones con pago con `Ubicacion_Institucionales` = «Yepes» / «Argés» (no tienen `Ubicacion`). Productos «Campus Experience ONE Media Jornada <municipio>». Solo media jornada.
- **Equipación:** la incluida es la **Black** (1 por semana contratada), y el uniforme comprado aparte también cuenta como Black. La Black aparece en Equipaciones solo donde hay alguna.
- **Dónde salen:** vista «Institucionales» (resumen y tarjeta por municipio, que abre su panel completo como una sede nacional), tarjeta de la Portada, totales de la Portada, ritmo general (origen «Institucionales», con marca de apertura el 24 nov) y mapamundi.
- Datos: `ins_sedes` (objeto por municipio) y `storage.ins`.

## Equipaciones (rediseño del 27 nov)
- **Tipos por grupo:** Madrid muestra Minikits, Light blue y Portero; las sedes nacionales, Minikits y Portero; los institucionales, Black y Portero (nunca Light blue). Portero sale siempre, aunque esté a 0. El grupo lo fija `window.__KG` en `useSede`.
- **Cómo se cuentan** (`ce_engine.js`, solo jugadores con pago):
  - Incluidas, por cada semana contratada: ONE Media Jornada y ONE Jornada Completa = 1 minikit; ONE Interno = 2 minikits; MAX (interno o jornada completa) = 1 minikit + 1 light blue. Institucionales: 1 Black por semana.
  - Compradas aparte: «Uniforme Oficial Adidas» = minikit (Black en institucionales) y «Uniforme Portero Oficial Adidas» = portero, por su **Cantidad** (vacía = 1), en la **primera semana** del jugador.
  - Talla: la de la inscripción (`Talla_equipacion`); si no es válida, «Sin talla».
  - Mochilas y jerseys no son equipación: se indican aparte en el resumen (sin talla).
- **Diseño:** resumen en una fila (total con incluidas / compradas aparte y una tarjeta por tipo), semana a semana en gráfica de columnas (al pulsar una, su pedido por talla), desglose por talla y tabla semana × talla para copiar.
- Campo nuevo `compra` en `kits_week`, `kits_size` y `kits_matrix`: minikits/Black comprados (ya sumados en su tipo).
- El apartado de equipaciones por grupo en Nacionales e Institucionales (`grpShow`) está preparado pero sin activar.

## Storage (quitado el 27 nov)
- La vista «Storage» (equipaciones necesarias de todas las sedes) se ha quitado del dashboard: ni pestaña ni tarjeta en la Portada. Cada modalidad tendrá su propio apartado más adelante.
- El servidor sigue calculando `storage` (no se ve); un enlace antiguo a Storage lleva a la Portada.

## Mapamundi (Portada, desde el 20 nov)
- Apartado «02 · De dónde son los jugadores», debajo del ritmo de inscripción. Suma Madrid, sedes nacionales e institucionales.
- **País de residencia:** `Contact_Name.Mailing_Country` normalizado a un nombre en español (`paisOf` y `PAIS_AL` en `ce_engine.js`: «Estados Unidos de América» → «Estados Unidos», etc.). Sin país → «España» si la provincia es española; si no, `ND`. Sale en `dims` como `pais`; `check()` comprueba que suma el total.
- **Diseño:** mapa a todo el ancho en proyección Miller (la Equal Earth se veía deformada), color por tramos (1, 2–4, 5–9, 10–19, 20 o más); debajo, tarjeta marino con el número de países e internacionales y ranking de los 8 primeros (resalta el país en el mapa). **Sin banderas** (decisión de Pau).
- Contornos: `countries.geo.json` (johan/world.geo.json), simplificados e incrustados (`W_GEO`); Andorra, Singapur y Baréin como punto.

## Ingresos adicionales (Madrid, desde el 27 nov; antes «Extras»)
- Todo lo que no es una semana de campus, comprado en el form 1 (inscripción) o en el form 3 (después). Se leen todas las líneas de `Campus_y_servicios_extra` del pedido.
- **Se suma siempre el dinero ingresado** (campo `Importe`). El precio que se enseña es solo informativo (el más habitual de la línea).
- **Unidades = `Cantidad`** de la línea (vacía = 1).
- **Origen:** una línea creada más de 30 minutos después de la inscripción cuenta como form 3.
- Tres bloques (`addl()` en `ce_engine.js`):
  - **Extras:** Minikit («Uniforme Oficial Adidas»), Kit de portero («Uniforme Portero…»), Mochila Adidas ONE, Jersey Adidas.
  - **Campus Protection Plan:** Jornada Completa e Interno.
  - **Servicios adicionales:**
    - Transporte: **Bus externos** («Autobus No Interno», diario desde Zona Bernabéu), **Bus internos** («Autobus interno» / «MAX Autobus interno», desde Zona Bernabéu) y **Transfer aeropuerto** («Servicio de Transfer Aeropuerto» / «Transfer interno»). Importe y número de servicios de cada uno.
    - **Noches extra** (productos con «noche»): las que se cobran al inscribirse con dos semanas seguidas de ONE Interno (el jugador elige en el form si quiere las dos noches, sábado y domingo; si no las quiere **no es un error**) y las del form 3.
- Debajo de las noches se informa de cuántos jugadores con pago tienen dos semanas seguidas de ONE Interno y cuántos han cogido noches (`extras_nexp`).
- Los productos del catálogo salen aunque no tengan ventas.
- El «Servicio de autobús» de la línea semanal no suma (solo cuenta lo cobrado); «Ciudad Real Madrid» como parada es un error de datos.

## Mapa de calor de España (Madrid, desde el 19 nov)
- Tarjeta en «Perfil del jugador» de la vista Madrid, entre «Edad / Nacionalidades» y «Género y posición». Solo jugadores con pago de Madrid (ONE y MAX); no sale en las sedes nacionales.
- **Provincia de residencia:** de la dirección postal del contacto (`Contact_Name.Mailing_Country`, `Mailing_Zip`, `Mailing_State`; los campos de facturación de la inscripción están vacíos). Primero las 2 primeras cifras del código postal; si no sirve, el texto de la provincia (`provOf` en `ce_engine.js`). País distinto de España → `EXT` (internacionales); sin país ni provincia reconocible → `ND`. Sale en `dims` como `prov`; `check()` comprueba que suma el total.
- **Diseño:** mapa por provincias (Canarias en recuadro, Ceuta y Melilla como punto) con color por tramos (0 gris, 1, 2, 3–5, 6–10, más de 10, del rosa claro al marino); a la derecha, tarjeta marino «Viven en España», ranking de las 8 primeras provincias (al pasar el ratón se resalta en el mapa) y la cifra de internacionales.
- Contornos: `spain-provinces.geojson` (codeforgermany/click_that_hood), simplificados e incrustados en `template_natv.html` (`ES_GEO`).
- Mapamundi en la Portada (ver abajo).

## Ritmo de inscripción (desde el 16 nov)
- **Selector Registros | Jugadores** en el ritmo de Madrid (y de cada sede nacional) y en el general de la Portada. Por defecto, **Registros**.
  - Registros = semanas contratadas de cada inscripción, en el día en que se hizo (vistas `rday`, `rweek`, `rhour` del motor; mismo criterio que «Jugadores por semana de campus»). Jugadores = inscripciones con pago (vistas `day`, `week`, `hour`).
  - `check()` comprueba que la suma de `rweek` es igual a la de `campwk`.
- **Ritmo general en la Portada** (debajo de las tarjetas): suma Madrid + sedes nacionales + institucionales, con columnas apiladas por origen (Madrid rosa, Nacionales marino, Institucionales gris). La leyenda muestra el total de cada origen y permite ocultarlo. Encima: hoy, últimos 7 días y tendencia frente a los 7 anteriores.
- **Aperturas de sede:** círculo rosa numerado con línea discontinua en el día de cada apertura (lista `TL_MARKS` en `template_natv.html`); el detalle sale al pasar el ratón. **Sin leyenda debajo del gráfico** (decisión de Pau: ensucia la tabla).

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
- Sedes: abiertas Andorra, Valencia, Málaga, Alicante (desde el 11 nov), Torrevieja y Almería (desde el 13 nov). Institucionales abiertos: Yepes y Argés (desde el 24 nov). Ya no queda ninguna «Próximamente» (la lista `OPEN` está en `template_natv.html`). Para abrir una sede, añadirla a `OPEN` y regenerar.

## Por qué está separado del resto del software
El software operativo se edita a menudo partiendo de copias propias (el artefacto «Operativa Campus Experience»). Dos veces (11 y 12 nov) una publicación borró el dashboard porque vivía dentro de `index.html` y de `campus_api`. Desde el 12 nov:
- los datos están en la función **`dashboard_api`** (comparte login y Data Store, pero tiene su propio código);
- el acceso del menú está en **`client/dashboard-menu.js`**;
- el permiso «Dashboard › Residencias» está en el catálogo de `campus_api` (`k: "dashboard"`); si una versión nueva lo quita, deja de poder darse desde Administración;
- `scripts/comprobar_dashboard.sh` comprueba que todo sigue ahí; lo ejecutan `publicar.sh` y el despliegue automático, y si falta algo **no se publica**.

`dashboard_api` necesita en Catalyst las mismas variables de Zoho que `campus_api` (`ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, `ZOHO_ACCOUNTS_URL`, `ZOHO_API_URL`; opcional `CE_LOGIN_URL`, `CE_DASH_TTL_MIN`).
