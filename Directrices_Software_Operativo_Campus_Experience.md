# Directrices · Software operativo Campus Experience

Documento vivo con las decisiones tomadas con Pau (director de Campus Experience) para el software operativo y para el dashboard de registros. Claude debe leerlo antes de crear o modificar cualquiera de los dos y mantenerlo al día cada vez que se tome una decisión nueva.

- Última actualización: 27/10/2026
- Software operativo: artifact «Operativa Campus Experience» → https://claude.ai/artifact/WGfoJZ9KMWvPQkm2J4Pg54
- Dashboard de registros: **dentro del software en Catalyst** → `/app/dashboard.html` (menú lateral «Dashboard»). El artefacto de claude.ai está retirado desde el 11/11. Detalle en `dashboard/README.md`.
- Especificación funcional de referencia: `Software_Operativo_Campus_Experience.docx` (esta misma carpeta)

---

## 1. Forma de trabajar

- **El dashboard de registros es parte del software y NO se puede perder al publicar.** Vive en archivos propios: `client/dashboard.html`, `client/dashboard-menu.js` (acceso del menú), `functions/dashboard_api/` (sus datos) y `dashboard/`. **`client/index.html` debe cargar `dashboard-menu.js`**: se genera siempre con `node build.js` (nunca a mano ni copiándolo de otra carpeta), y build.js ya añade esa línea.
- **Este documento, `index.html`, `functions/campus_api/index.js` y el resto: se trabaja siempre sobre la copia del repositorio, después de `git pull origin main`.** No copiar encima versiones guardadas en otra carpeta: borran lo que otros han subido (ha pasado el 11, el 12 y el 13/11 con el dashboard).
- **Publicar siempre con `./publicar.sh "qué ha cambiado"`** (nunca `catalyst deploy` a mano): trae lo último de GitHub y comprueba que el dashboard sigue incluido; si falta, no publica.

- Avanzar fase a fase. Antes de construir, analizar, validar los datos reales en Zoho y proponer; Pau decide y después se construye.
- Cuando Pau pida solo análisis, no tocar la herramienta.
- No inventar campos, valores ni relaciones de Zoho: comprobarlos siempre en la cuenta real.
- Explicar cada fase con poco texto y pedir decisiones concretas.
- Es una **herramienta de trabajo para el equipo**: priorizar lo práctico, con poco texto, pero sin perder lo decorativo.

## 2. Arquitectura y datos

- **Zoho CRM es la fuente de verdad de las inscripciones.** Las inscripciones entran por Zoho y los datos de inscripción se corrigen en Zoho.
- **El software lee de Zoho y no escribe en Zoho.** Si algo cambia en el CRM, el software se actualiza solo (cada 5 minutos, o al momento con el botón *Actualizar*).
- **Lo operativo vive en el software:** equipos, solicitudes especiales, seguimiento, y más adelante buses, horarios, rooming, incidencias y staff.
- **La información no sale del software.** No hay descargas ni exportación a Excel hasta que Pau diga lo contrario.
- **Acceso:** de momento solo lo usa Pau. Para el equipo (más de 30 personas) hará falta un desarrollo propio con servidor, API de Zoho y roles. El prototipo sirve para validar.
- **Datos sensibles** (salud, documentos): marcados como *sensible*; en el futuro con acceso restringido.

### 2.1 Qué inscripciones cuentan
- Aplicaciones (*Applications/Deals*) con Evento = **Campus Experience Madrid 2027** y fase **1st Payment** o **Paid**. Coincide con la vista de Zoho «2027_Registrations CE Madrid (Pau)».
- **El Campus F no existe.** Solo hay dos programas: **ONE** y **MAX**. Quitar F de todas partes.

### 2.2 Semanas y modalidades
- **Unidad de trabajo = inscripción semanal.** Cada aplicación lleva dentro una línea por semana contratada (subformulario *Campus y servicios extra*: Producto + Semana + fechas).
- La semana real sale de las líneas (campo *Semana*), **no** del campo *Weeks* de la aplicación, que está incompleto.
- Todas las inscripciones tienen semana asignada. Puede haber aplicaciones con varias semanas y con **varias modalidades** (cada semana lleva la suya).
- Nueve semanas: **Week 1 a Week 9**.
- Cinco apartados (programa + modalidad): **ONE – Jornada completa, ONE – Media jornada, ONE – Interno, MAX – Jornada completa, MAX – Interno**.
- Fechas: Jornada completa y Media jornada van de lunes a viernes; ONE Interno de domingo a viernes; MAX Interno de domingo a sábado. Todas comparten el número de semana.

### 2.3 Campos validados (dónde está la información real)
| Dato | Campo real |
|---|---|
| Nombre del niño | *Player* (Nombre/Apellidos persona = quien inscribe, no el niño) |
| Programa + modalidad | Producto de cada línea semanal |
| Semanas | *Semana* de cada línea |
| Año de nacimiento | *A_o_de_nacimiento* |
| Género | *Gender* de la aplicación (no el del módulo Player) |
| Posición | *Posicion_participante* |
| Idioma | *Idioma_comunicaciones* |
| Talla | *Talla_equipacion* |
| Consentimiento imagen | *Consentimientos_imagen_fotos_voz_RM* (Sí / No / sin dato) |
| Familia | *Account_Name* (Families) |
| Autorizados para recogida | Módulo *Personas Autorizadas* (nombre, DNI/pasaporte, email), vinculado a la aplicación |
| Equipaciones extra | Productos *Uniforme Oficial Adidas* y *Uniforme Portero Oficial Adidas* |

### 2.4 Campos pendientes (se conectarán cuando lleguen al CRM)
- **Extra bus, transfer y noches extra:** llegarán por formulario.
- **Dieta, alergias y problemas médicos:** llegarán por formulario.
- **Autorizados para recogida:** llegarán con el **Form 2**. Ya está conectado al módulo *Personas Autorizadas*; mientras no haya datos se muestra «Pendiente: llegará con el Form 2».
- Todos se muestran ya como columnas o campos «pendiente de formulario» (punto rosa). Al llegar, basta con conectar el campo en el **catálogo de campos** del software.

## 3. Diseño (obligatorio)

- Usar **siempre** los cánones del dashboard de registros: sus colores y tipografías. No inventar ni salirse de ese diseño.
- **Colores:**
  - Gris clarito **#e4e4e4**: fondos (color predominante).
  - Gris oscuro **#2f3e40**: textos y resaltes.
  - Azul marino **#0f2145**: tono oscuro alternativo al gris oscuro.
  - Rosa **#ea456c**: detalles, cifras grandes y avisos.
  - Lo importante es jugar con esas tonalidades.
- **Tipografías:**
  - Archivo itálica ancha (*wide*) para títulos y etiquetas.
  - Instrument Serif itálica para cifras grandes y textos destacados.
  - Helvetica / «RM Neue» para el texto corriente.
- **Muy visual**, con el gris como color predominante.
- **Inicio:** cajas con el título de cada apartado y su etiqueta de estado (*En uso* / *En preparación*), sin cifras ni descripciones. Se mantienen el titular «Campus Experience · Madrid 2027» y los detalles decorativos.
- Modo oscuro con la misma paleta adaptada.

## 4. Software operativo: apartados

### 4.1 Inicio
- Menú con cajas: **Registros**, **Horarios**, **Equipos**. Se irán añadiendo apartados (rooming, dietas, incidencias, staff, logística…).

### 4.2 Registros (cerrado)
- **Primera página:**
  - **Premium:** los jugadores con más de 2 semanas contratadas (3 o más) llevan una etiqueta rosa «Premium» junto al nombre, en la lista, en el buscador, en la ficha y en los niños de Equipos.
  - **Filtros por columna en la lista:** cada columna con datos tiene debajo del título un desplegable con sus valores y el número de inscritos de cada uno. Se pueden combinar varios filtros; el que está activo sale en rosa y *Quitar filtros* los limpia. En Nombre se filtra Premium / Sin Premium. Las columnas pendientes de formulario no tienen filtro hasta que se conecten.
  - Buscador de jugador por nombre o código. Muestra sus semanas y modalidades; al pulsar una semana se abre esa lista con el jugador resaltado.
  - Nueve cajas *Week 1…9*, cada una con fechas, total y una barra ONE/MAX.
- **Dentro de una semana:** caja *Toda la semana* y los 5 apartados, cada uno con su recuento.
- **Listado operativo:** una fila por niño y semana. Columnas fijas en este orden:
  - **Nombre** (columna fija añadida delante de la 1).
  1. Tipo + Modalidad
  2. Weeks (todas las del niño, con la actual resaltada)
  3. Año nacimiento
  4. Team
  5. Extra bus *(pendiente)*
  6. Bus *(fase de buses)*
  7. Género
  8. Posición participante
  9. Idioma comunicaciones
  10. Dieta *(pendiente)*
  11. Alergias alimentarias *(pendiente)*
  12. Problemas médicos *(pendiente)*
  13. Consentimiento imagen
  14. Talla equipación
  15. **Equipaciones**, desglosadas en *Incluidas*, *Extra* y *Total*
  16. Uds camisetas portero/a
- **Regla de equipaciones (igual que el dashboard):**
  - Incluidas por semana según la modalidad: ONE MJ/JC = 1 blanca; ONE Interno = 2 blancas; MAX JC/Interno = 1 blanca + 1 light blue.
  - Extra = productos *Uniforme Oficial Adidas* contratados.
  - Portero = productos *Uniforme Portero Oficial Adidas*, en la columna 16 (no suman al total).
  - Los extras se cuentan en la **primera semana** del niño; en las demás aparece «en W#».
- **Ficha completa** (al pulsar un niño), con secciones:
  - Participante.
  - Semanas contratadas, con Team y Bus por semana; la semana de origen va marcada.
  - Equipaciones.
  - Servicios (pendientes y petición de rooming).
  - Salud y dieta (pendiente, sensible).
  - Consentimientos.
  - **Familia y contacto**: debe verse.
  - **Autorizados para recogida**: deben verse; documento oculto con «Ver documento».
  - **Pago** (se queda: estado, total, pagado, pendiente, forma de pago, descuento y 3 plazos).
  - **Seguimiento del equipo**: se deja como está (llamada, WhatsApp, documentación, notas); se modificará con otros campos más adelante.
  - Otros.
- **Catálogo de campos único:** cada dato se define una vez y aparece en la ficha y en el listado. Conectar un campo nuevo es un único cambio.
- **Exportación a Excel:** aparcada. La información no debe salir del software.

### 4.3 Equipos (Teams) (en curso)
- El formato actual del tablero gusta («es justo como lo queremos»); se retoca sobre esa base.
- **Siempre segregado por semana y por modalidad** (los 5 apartados). Cada combinación semana + modalidad tiene su propio reparto, independiente del resto.
- **Grupos con nombre de jugador** (Mbappé, Courtois…) y **tres equipos por grupo**: Mbappé 1, Mbappé 2, Mbappé 3. El nombre del grupo es editable.
- **Nombres estandarizados (base de datos «Data Teams»):** los grupos se nombran con la lista oficial, en su orden, sin repetir nombre dentro de la misma semana y programa.
  - ONE: Mbappé, Diomande, Courtois, Rüdiger, Tchouaméni, Arda Güler, E. Militão, Huijsen, Rodrygo, Espí, Á. Carreras, Lunin, Asencio, Kroos, F. Mendy, Camavinga, Marcelo, Zidane, R. Carlos, Xabi Alonso, Di Stéfano, Casillas, Butragueño, Figo, Morientes, Hugo Sánchez, Hierro, Juanito, Santillana, Schuster, Buyo.
  - MAX: Vini Jr., Cucurella, Bellingham, Konaté, Bernardo Silva, Valverde, Trent, Endrick, Dumfries, Brahim, Puskás, David Beckham, Makelele, Seedorf, M. Salgado, Gento, I. Helguera, Prosinečki, Míchel.
  - La lista «Teams F» de esa pestaña no se usa (Campus F no existe).
- **Máximo por equipo:** 16 en ONE y 14 en MAX.
- **Crear equipos automáticamente**, por este orden de criterios:
  1. **Edad.**
  2. **Género:** nunca dejar chicas solas (chicos solos no se dan, siempre hay muchos más). Se hacen **equipos de chicas siempre que sea posible**, permitiendo en ellos un **gap de 2 años** (p. ej. 2013-2015). Si no hay chicas suficientes, van todas juntas en el mismo equipo mixto.
  3. **Solicitudes especiales:** se juntan a quien lo ha pedido (hermanos y solicitudes manuales) si la edad y el tamaño lo permiten, sin dejar a ninguna chica sola.
- **Regla de edad para detectar errores:** pueden convivir dos años seguidos (2014-2015). Un 2013 con un 2015 es un error y el que no encaja se marca. En los equipos solo de chicas se admite el gap de 2 años.
- **Todo lo que sea un error marca al jugador en rojo** (fila roja con franja), como que no está en un equipo correcto: fuera de su año, solicitud sin atender (no marcada como *Hecha*) o chica sola. Arriba aparecen los recuentos de cada tipo de error.
- **Como mucho dos años de nacimiento seguidos** dentro de un equipo (2014-2015); en equipos de chicas, gap de 2 años. Si no se cumple, el niño que no le corresponde sale en rojo.
- Columna **Sin equipo** para los nuevos registros o pendientes. Las bajas en Zoho desaparecen solas de su equipo.
- **Selección múltiple:** seleccionar varios niños arrastrando con el ratón (o con clic) y asignarlos de golpe a un equipo desde la barra inferior. Para uno solo, desplegable *Mover…*.
- **Entrada a Equipos:** el mismo menú que en Registros, con las 9 cajas *Week 1…9* (fechas, inscritos y equipos creados). Al entrar en una semana aparecen las **cajas de modalidades** (nombre y recuento) para pasar de una a otra con el ratón, y una ruta *Semanas › Week N · modalidad* para volver. Sin números ni etiquetas de pasos.
- **Check verde de completo:** en las cajas de semana y en las de modalidad aparece un ✓ verde (y borde verde) cuando todos los jugadores tienen equipo y no queda ninguna solicitud por atender. La semana solo sale completa si lo están todas sus modalidades con inscritos.
- **Página limpia y con poco texto:** sin leyenda de iconos ni textos explicativos; los avisos de errores van **dentro del apartado de Solicitudes especiales**; los equipos vacíos solo muestran «Vacío».
- **Botones:** *Crear equipos automáticamente* (aplica los criterios de reparto) y *Modificar manualmente* (activa la edición: mover niños, seleccionar arrastrando, renombrar o quitar grupos). *Añadir grupo* se ha quitado: los grupos de cada modalidad vendrán de una base de datos que facilitará Pau.
- **Todo agrupado a la izquierda**, recogido; nada repartido a lo ancho con datos en cada punta.
- **Cada niño en formato lista, en columnas alineadas:** nombre (con el icono **POR** justo después si es portero, sin alinear) | fecha de nacimiento | chico/chica | SOL | *Mover…* (este último solo en modo manual). Si está fuera de su año, la fecha sale en rosa.
- **Caja «Sin equipo»** compacta (no ocupa todo el ancho).
- **Solicitudes:** botón *Hecha* (buen contraste: marino con texto blanco).
- **Tarjeta de equipo:** nombre, recuento n/máx con barra de llenado, y etiquetas de nacidos, chicos, chicas y porteros.
- **Solicitudes especiales** (panel encima del tablero):
  - Hermanos detectados automáticamente (misma familia en la misma semana y modalidad).
  - Solicitudes de Zoho (rooming, «quiere ir con…», «viaja acompañado»), cuando lleguen.
  - Solicitudes añadidas a mano (niño + con quién + texto).
  - Indica si están **juntos** o **separados** y permite **Marcar hecha** o **Reabrir**.
- **Tabla de la semana:** todos los equipos de la semana agrupados por modalidad, con Team, Programa y modalidad, Jugadores, Nacidos, Chicos/chicas, Porteros y Estado. Al pulsar un equipo se abre en el tablero.
- **Aparcado:**
  - Staff (coach y head con sus teléfonos): se añadirá en la fase de staff, también como columnas de la tabla.
  - Equipos *Mixtos*: no se contemplan de momento.

### 4.4 Horarios (en uso, rediseñado el 29/10)
- **Organización (decisión de Pau, 29/10):**
  - Se entra por **semanas**.
  - Dentro de la semana, el horario es **general**: cada día muestra **todos los grupos de todas las modalidades** (ONE MJ, ONE JC, MAX JC, internos), agrupados por modalidad.
  - Ya no hay un horario por modalidad separado.
  - **Campus nacionales (11/11):** cada uno tiene su horario aparte, con sus instalaciones, hecho a mano y replicando días. Detalle en el registro de decisiones.
- **Cajas de modalidad (arriba):** al pulsarlas se despliegan las **sedes que puede usar esa modalidad**.
  - Se pueden activar varias.
  - Cada una tiene franja: todo el día / solo mañana / solo tarde (mañana = antes de las 14:00).
  - Ejemplo: los internos van a Valdebebas solo por la tarde.
- **Prioridad:**
  - Campos: **siempre se llena primero Valdebebas**. Si no cabe, pasa a la siguiente sede activa. Si no cabe en ninguna, la sesión sale en rojo como «No cabe».
  - Comedor, piscina y preparación física: primero la sede del horario tipo si está activa, después el orden de prioridad.
- **Apartado Instalaciones (por semana):**
  - **Campos de fútbol por sede:** número disponible esa semana (+/−), con nombre de cada campo y grupos que caben por campo (2 por defecto = 6 equipos).
  - **Comedor:** turnos con hora de inicio, hora de fin y personas que caben. Sin turnos, el comedor no limita.
  - **Piscina:** grupos que caben a la vez (0 = sin límite).
  - **Espacio de preparación física.**
  - Se pueden añadir sedes nuevas (p. ej. Universidad Europea), copiar de la semana anterior o aplicar a todas las semanas.
  - Sedes por defecto: Valdebebas (Campos 5, 6, 8, 9, 10 + comedor), Santa Ana (F7, F11), L.A. (F11), UAM (comedor y piscina) y RESA (comedor). Los nombres se pueden cambiar.
- **Vistas de la semana:**
  - *Horario* (general del día).
  - *Ocupación:* cada campo, comedor o turno y piscina, con los grupos que lo usan. Rosa «Completo» si está al límite; rojo «Sobrepasa» si se pasa.
  - *Instalaciones.*
- **Botones:**
  - **Crear horario automáticamente:** solo el día o toda la semana. Parte del horario tipo (lunes de la W4) y reparte las instalaciones según sedes, franjas, prioridad y capacidad.
  - **Modificar manualmente:** barra *Asignar instalación* para pulsar sesiones, o editar bloque (actividad, instalación, horas, aplicar a todos los grupos de la modalidad).
  - **Borrar todo:** el día o la semana entera, para empezar de cero, siempre con confirmación.
- **Errores en rojo:**
  - No cabe.
  - Instalación completa por encima de su capacidad (grupos o personas del turno).
  - Sede no activa para la modalidad.
  - Fuera de franja.
  - Sesiones que se pisan.
  - Sin instalación.
- **Check verde** en el día y la semana cuando todos los grupos tienen horario y no hay avisos. Los días muestran Por hacer / A medias / Hecho / N avisos.
- **La unidad es el grupo:** 3 equipos por grupo (Mbappé 1, 2 y 3), que hacen siempre el mismo horario. Los grupos salen de Equipos.
- **Días por modalidad:** MJ y JC de lunes a viernes; ONE Interno de domingo a viernes; MAX Interno de domingo a sábado.
- **Fuente:** Excel «Horarios W4 (cambiar buses)». Solo contiene el lunes.
- **Horario tipo:** se copia el lunes de la W4 tal cual, por modalidad y grupo. Sirve de base para **todos los días** (también domingo y sábado de internos); el equipo le da forma a mano.
  - Al grupo 1 de una modalidad le corresponde el horario del primer grupo de esa modalidad en el Excel, al 2 el segundo, etc. (si hay más grupos que en el Excel, se vuelve a empezar).
  - Los huecos grises sin texto del Excel se cargan como bloques «Actividades».
- **Reglas operativas de horarios (29/10):**
  - Documento completo y estado de implementación en **Reglas_Horarios_Campus_Experience.md** (carpeta CLAUDE). Es la referencia obligatoria para todo lo de horarios.
  - **Fase 1 hecha:**
    - Escala cada 15 minutos y colores (verde fútbol, verde claro prep, azul claro piscina, rosa actividades).
    - Ocupación en 4 categorías (Comedores / Piscinas / Actividades / Campos).
    - Pestaña Buses con coste Juliá.
    - Instalaciones con días y franjas, y residencia de internos por semana.
    - Grupos de 2 o 4 equipos.
    - Comprobación de reglas con avisos en rojo y Aprobar / Rechazar en las excepciones.
  - **Fase 2 pendiente:** generador automático completo, a la espera de las 17 preguntas.
- **Normas del horario (pendiente):**
  - Pau dará las directrices: timings, qué modalidad va a qué sede y a qué hora, comidas, rotaciones…
  - Se convertirán en reglas del sistema dentro del propio software, para que el automático las aplique siempre, sin depender de Claude, y se anotarán aquí.
  - Primera regla ya incluida: franja por sede y modalidad.

### 4.5 Pagos (en uso)
- Apartado nuevo en el menú y en Inicio. **Solo informa del estado de pago**, nada más.
- **Fuente (Zoho, aplicación):**
  - *Stage*.
  - Para cada plazo: *First/Second/Third Instalment Amount*, *Status* (Paid / Unpaid / Expired) y *Due Date*.
- **Estados:**
  - **Pagado total:** Stage = Paid, o todos los plazos con importe pagados.
  - **Fase 1:** 1er plazo pagado y el 2º todavía en fecha.
  - **Fase 2:** 1º y 2º pagados y el 3º todavía en fecha.
  - **Impago:** el siguiente plazo sin pagar ha pasado su fecha de vencimiento (o Zoho lo marca *Expired*).
- **Pantalla:**
  - Cajas con recuento: *Pendientes* (fase 1 + fase 2 + impago, seleccionada por defecto), *Impago*, *Fase 1*, *Fase 2*, *Pagado total* y *Todos*.
  - Lista con nombre (y Premium), estado, plazos 1º/2º/3º (verde pagado, rojo vencido) y el siguiente plazo con importe y fecha («vencido hace N días»).
  - Impagos arriba en rojo.
  - Buscador; al pulsar un jugador se abre su ficha.
- **Datos a 28/10/2026:**
  - 69 en Paid y 96 en 1st Payment.
  - Ningún 2º plazo pagado todavía; los 2º plazos vencen entre el 7 y el 26/11/2026.

### 4.6 Siguientes fases según la especificación
- **Buses (§7):** cuando exista el campo *Extra bus* en el CRM. Bus asignado por semana, independiente de *Extra bus*.
- **Informes (§9):** como vistas filtradas dentro del software (alergias, dietas, transfer, buses, noches extra, no consentimiento), no como descargas, mientras se mantenga que la información no sale.
- **Staff, rooming, incidencias, logística, contabilidad, apps para familias y trabajadores:** más adelante.

## 5. Dashboard de registros (reglas acordadas)

- **Conceptos:** **jugador** = cada persona física inscrita (con pago). **Registro** = cada semana contratada. Un jugador con 3 semanas cuenta como 1 jugador y 3 registros.
- **Dónde vive:** en el software (Catalyst), página `/app/dashboard.html`, función `dashboard_api`. Sedes nacionales abiertas: Andorra, Valencia, Málaga, Alicante, Torrevieja y Almería.

- Fuente: Zoho CRM, módulo *Applications/Deals*, Ano_Campus = 2027 (Campus Experience Madrid 2027).
- **Se excluyen las pruebas:**
  - *utm_source* que empieza por «qa_».
  - *utm_campaign* = qa_ce_original_campaign, test2027 o ce27_qa_promo.
  - Código de descuento que contiene «TEST» o igual a SOCIALMEDIATEST.
- **Se excluye Stage = Trash** de todas las métricas (solo se muestra su recuento).
- **Formularios rellenados** = no prueba y no Trash.
- **Han pagado** = Paid, 1st Payment o Reservation Payment Completed. **No han pagado** = Unpaid.
- **Carrito abandonado** = Unpaid y sin modalidad. Va aparte, fuera de las métricas por modalidad, género, etc.
- Lo que está bajo «Solo registros pagados» se calcula solo con los que han pagado al menos una vez.
- **Importes:**
  - Facturación confirmada = suma de *Total* de los pagados.
  - Cobrado = suma de *Paid*.
  - Pendiente = Total − Paid.
- **Moneda:** el CRM dice USD pero son **euros** (mostrar «€»).
- **Modalidad por inscripción:** sale de las líneas semanales (producto de cada semana). Si una aplicación tiene más de una modalidad cuenta como «Varias»; sin líneas, se usa *Tipo_Modalidad*.
- **Semanas por inscripción:** de las líneas semanales; si no hay, del campo *Weeks*.
- **Facturación por modalidad:** el importe de programa (Total − extras) se reparte entre sus líneas semanales en proporción a su importe.
- **Extras por categoría:**
  - Equipaciones (productos «Uniforme…»).
  - Campus Protection Plan.
  - Noches extra.
  - Buses y transfers.
- **Equipaciones por semana y talla:**
  - Incluidas por modalidad: ONE MJ/JC = 1 blanca; ONE Interno = 2 blancas; MAX = 1 blanca + 1 light blue.
  - Las extra y las de portero se cuentan en la primera semana del niño.
- **Canal de origen:** a partir de *utm_source* / *utm_medium* (Email/newsletter, Meta Ads, Instagram/Facebook, Google Ads, Google orgánico, TikTok, ChatGPT, YouTube, LinkedIn, X, Directo/sin dato).
- **Actualización:** sola cada 15 minutos y con el botón «Actualizar»; si Zoho falla, se muestran los últimos datos guardados.
- **Diseño del dashboard:** es la referencia de diseño del software (ver apartado 3). **No se rompe su línea estética:** cualquier apartado nuevo usa sus mismos componentes (encabezados destacados en marino con título en Archivo 900 cursiva, cifra grande rosa en Instrument Serif cursiva y subtítulo en cursiva).
- **Ritmo de inscripción:** selector Registros | Jugadores (por defecto Registros) en Madrid y en el ritmo general de la Portada, que suma Madrid, nacionales e institucionales apilados por origen. Las aperturas de sede se marcan con un número en el gráfico, sin leyenda debajo.
- **Mapa de calor de España (Madrid):** jugadores con pago de Madrid por provincia de residencia (dirección postal del contacto: código postal y, si no sirve, provincia). Los que viven fuera de España se indican como internacionales. Va entre Nacionalidades y Género. Color por tramos del rosa al marino.
- **Mapamundi (Portada):** debajo del ritmo; país de residencia de todas las sedes; proyección Miller; ranking sin banderas.
- **Extras:** Equipación incluye uniformes, mochila y jersey; Transporte, autobuses y transfers. Desglose con una tarjeta por producto.
- **Residencias (Madrid):** UAM y UEM, semanas 2 a 8. Cuentan los jugadores con pago de MAX Interno y ONE Interno (sin noches extra). Por semana: bloqueo editable por residencia, residencia abierta o cerrada, y cada modalidad asignada a una residencia o dividida entre las dos. Plazas contratadas editables por residencia y total combinado arriba. Rojo por debajo del bloqueo, ámbar desde el 80 %, verde con ✓ al cubrirlo.
- **Permiso de residencias:** editan los administradores y quien tenga **Dashboard › Residencias: Editar** en *Administración › Usuarios*. Esa entrada del catálogo de permisos (`k: "dashboard"` en `campus_api`) **no se quita** al publicar versiones nuevas del software.

## 6. Registro de decisiones

- 26/10: Software externo alimentado desde Zoho; Zoho es fuente de verdad; el software no escribe en Zoho.
- 26/10: Diseño con los cánones del dashboard: gris predominante, gris oscuro para resaltes, rosa para detalles y marino como alternativo.
- 26/10: Equipos: MAX máx. 14, ONE máx. 16; por edad; máx. 1 año de diferencia con alarma; grupos con nombre de jugador y 3 equipos.
- 26/10: Campus F eliminado.
- 27/10: Fases ordenadas según la especificación funcional; primero validar datos y campos reales.
- 27/10: Registros: columna Nombre añadida; equipaciones desglosadas en incluidas, extra y total; bus, salud y dieta como campos pendientes de formulario.
- 27/10: Buscador de jugador en la primera página de Registros.
- 27/10: Ficha: pago se queda; seguimiento se queda como está; familia, contacto y autorizados deben verse; autorizados llegarán con el Form 2.
- 27/10: No exportar a Excel de momento: la información no sale del software.
- 27/10: Equipos segregados por semana y modalidad; tabla general de la semana sin staff; selección múltiple arrastrando; sin mixtos.
- 27/10: Solicitudes especiales marcadas en el tablero y marcables como hechas; género (chico/chica) visible en cada niño.
- 27/10: Horarios: un horario por modalidad y por día, con inicio y fin propios; el grupo es la unidad; control de recursos con aviso de solapes; internos con tarde y noche.
- 27/10: Check verde en semanas y modalidades cuando todo está asignado y sin solicitudes pendientes.
- 27/10: Equipos empieza con el menú de semanas y dentro las modalidades; avisos dentro de Solicitudes especiales; sin leyenda; menos texto.
- 27/10: Criterios del botón automático: edad → género (equipos de chicas con gap de 2 años, nunca chicas solas) → solicitudes. Cualquier error (edad, solicitud sin atender, chica sola) marca al jugador en rojo. Icono POR justo después del nombre.
- 27/10: Equipos: modalidades en cajas; botones «Crear equipos automáticamente» y «Modificar manualmente»; sin «Añadir grupo»; filas alineadas en columnas; botón «Hecha».
- 27/10: Equipos: quitar los números de pasos; niños en lista seguida (nombre, fecha, género, solicitud); todo agrupado a la izquierda; reparto por edad y después por género, sin chicas ni chicos solos.
- 27/10: Horarios: se copia el lunes de la W4 como horario tipo para todos los días; el equipo lo ajusta a mano. En cada campo caben 2 grupos (6 equipos). Cada grupo tiene 3 equipos.
- 27/10: Equipos: los nombres de grupo salen de la base de datos «Data Teams» (listas ONE y MAX) para que queden estandarizados.
- 28/10: Horarios: activar instalaciones disponibles por modalidad y asignar la instalación de cada sesión. Pau dará después los condicionantes.
- 28/10: Horarios más intuitivo:
  - Barra con *Cargar horario tipo*, *Editar horario*, *Borrar horario* e *Instalaciones disponibles*.
  - *Borrar horario* deja el horario «por hacer», solo el día o toda la semana de la modalidad, siempre con confirmación.
  - Al editar aparece la barra *Asignar instalación*: se elige una instalación y se pulsan las sesiones.
  - El panel de instalaciones solo sirve para activarlas y fijar cuántos grupos caben.
  - Días y grupos sin horario salen como «Por hacer».
- 28/10: Registros: etiqueta VIP junto al nombre para quien tenga más de 2 semanas contratadas.
- 28/10: La etiqueta VIP pasa a llamarse «Premium» (jugadores con más de 2 semanas contratadas).
- 28/10: La etiqueta Premium también aparece en Equipos, junto al nombre de cada niño.
- 28/10: Registros: filtros por columna; letras blancas en la etiqueta Premium.
- 28/10: Nuevo apartado Pagos: estado de pago por jugador (pagado total, fase 1, fase 2, impago) con los pendientes seleccionados por defecto.
- 29/10: Horarios rediseñado:
  - Horario general por semana y día con todos los grupos.
  - Sedes por modalidad desde las cajas (varias, con franja; Valdebebas siempre primero).
  - Apartado Instalaciones por semana (campos, turnos de comedor con aforo, piscina).
  - Botones Crear automáticamente / Modificar manualmente / Borrar todo.
- 29/10: Reglas operativas de horarios recibidas (Reglas_Horarios_Campus_Experience.md). Fase 1 implementada; fase 2 (generador) pendiente de aclaraciones. Equipos admite grupos de 2 o 4.
- 03/11: Respuestas de Pau a las 17 preguntas de horarios (en Reglas_Horarios_Campus_Experience.md).
- 03/11: Generador automático con todas las reglas (fase 2), el mismo para real y simulador.
- 03/11: Resumen de inscritos compacto (abreviaturas, participantes y equipos, sin sedes) y días más pequeños.
- 03/11: Nueva pestaña SIMULADOR: semana, nº de equipos por modalidad, instalaciones como en real, «Generar horario», vistas Horario / Ocupación / Necesidades / Buses / Instalaciones. Datos ficticios, independientes de los reales.
- 03/11: Horarios: sin fines de semana de momento (no se generan ni cuentan para completar la semana). Reglas pendientes de Pau.
- 03/11: Clausura de ONE y MAX internos el viernes al terminar los entrenamientos, a la misma hora. ONE INT acaba con check-out de 20:00 a 20:30. MAX INT sigue con cena, velada y Curfew (check-out el sábado de 10:00 a 11:00).
- 03/11: Simulador: 16 plazas por equipo ONE y 14 por equipo MAX (confirmado). Coste de buses aceptado por ahora; revisión a fondo más adelante.
- 04/11: Simulador: el nº de equipos se conserva al cambiar de pestaña de «Ver» (antes se perdía lo escrito al pasar a otra casilla o pestaña).
- 04/11: Simulador: botón «Descargar horario» a la derecha de «Generar horario». Abre una ventana para elegir PDF (una página por día y modalidad) o Excel (una hoja por día) y luego «Descargar». Es la única excepción a «la información no sale del software»: solo datos ficticios del simulador. Cada descarga pide confirmación de Claude.
- 04/11: Instalaciones (real y simulador, mismo sistema). Estructura INSTALACIÓN PRINCIPAL → ESPACIOS → FRANJAS.
  - Instalaciones principales predefinidas: VBB, S.A., L.A., UAM, RESA, UEM, BNB, VILLA. No se crean sedes nuevas.
  - Cruz para quitar un espacio arriba a la derecha de cada recuadro, junto al tipo.
  - «Añadir espacio» (antes «Añadir instalación») dentro de cada instalación.
  - Espacio Experience en VBB: solo los predefinidos, solo los de los campos añadidos esa semana y sin repetir.
  - «Quitar instalación» quita la instalación de la semana con sus espacios y franjas.
  - Desplegable «Añadir instalación» con las principales que falten esa semana. Se añade con sus espacios por defecto.
- 04/11: Registros: estructura de la portada.
  1. Caja principal «REGISTROS» (la más destacada, azul marino), con todos los campus.
     - Muestra participantes, semanas contratadas, ONE, MAX, Nacional e Institucional.
     - Al pulsarla se abre directamente la lista general: una fila por participante, mismo formato y filtros que las weeks.
  2. Madrid: cajas Week 1 a Week 9, sin cambios.
  3. Nacionales: una caja por campus, con diseño neutro propio (Valencia y Málaga). Se abre su lista.
  4. Institucionales: otro diseño neutro; aparecerán cuando Pau los pida añadir.
  - Los campus se leen de Zoho por el nombre del evento (Campus Experience Valencia 2027, Málaga 2027…). Equipos, Horarios y Pagos siguen solo con Madrid.
- 04/11: Registros: etiqueta de campus junto al nombre (Madrid en azul marino; Valencia, Málaga y demás nacionales en gris con borde; institucionales con otro formato). Solo en la lista general «Todos los registros» y en el buscador de la portada; las listas de cada week no la llevan.
- 04/11: Horarios (real y simulador, mismo sistema):
  - Piscinas: el generador evita los turnos antes de las 10:30 siempre que la planificación lo permita (preferencia, no prohibición).
  - Avisos: cada aviso rojo se puede pulsar y abre una ventana con cruz (X) arriba a la derecha. Muestra grupo, hora e instalación, y explica qué pasa, por qué y cómo solucionarlo.
  - Colores: Actividades Experience en amarillo pastel medio y FUN en amarillo pastel claro (fuera de la paleta, por decisión de Pau). También en el PDF y el Excel del simulador.
  - Instalaciones: todo espacio o instalación nuevo se añade disponible todos los días. Un día deshabilitado se ve gris con una X. Las franjas funcionan igual que antes.
- 04/11: Pagos incluye todos los campus: Madrid, nacionales (Valencia, Málaga, Andorra…) e institucionales cuando se activen. Cada nombre lleva la etiqueta de su campus; en los institucionales será el nombre del pueblo. El buscador de Pagos encuentra también por campus («valencia») y sin tener en cuenta las tildes.
- Para añadir un campus nuevo hace falta el nombre exacto del evento en Zoho y saber si es nacional o institucional (y el pueblo). Aparece automáticamente en Registros, en el total general y en Pagos.
- 04/11: Equipos de los campus nacionales e institucionales.
  - Portada: debajo de las Weeks de Madrid, una caja por campus con su diseño (nacionales e institucionales).
  - No hay semanas: al pulsar un campus se ven sus modalidades (solo las que tienen inscritos) y sus equipos.
  - Un equipo por nombre de jugador, sin «1, 2, 3», con un máximo de 18 jugadores.
  - Mismos criterios que Madrid: edad, sexo, hermanos y solicitudes especiales.
  - Nombres: lista «NAC» con la primera plantilla del Real Madrid 2026/27 (26 jugadores, fuente: realmadrid.com). Se asignan solos de más a menos relevancia: Mbappé, Vini Jr., Bellingham, Courtois, Valverde, Diomande, Cucurella, Trent, Arda Güler, Tchouaméni, Camavinga, E. Militão, Bernardo Silva, Endrick, Huijsen, Brahim, Konaté, Rüdiger, Dumfries, F. Mendy, Á. Carreras, Lunin, Asencio, Rodrygo, Espí, Thiago (orden ajustado por Pau el 04/11). No se repiten dentro del mismo campus; a partir del 27.º equipo saldría «Equipo 27».

- 10/11: **Control de facturas** en Administración (Contabilidad › Facturas).
  - Lee las facturas de Zoho Books (solo lectura, organización ISL Agency RMF) y las compara con lo pagado en Zoho CRM (campo *Paid*).
  - Cada pago genera una factura. La referencia termina en el id de la inscripción en el CRM; así se emparejan.
  - Las reservas antiguas de 50 € no llevan id: se asignan por email, solo si falta ese importe.
  - Estados: correcta, sin factura, no cuadra, cobro sin factura y sin pagos. Las facturas sin inscripción activa salen aparte, plegadas, para revisar si necesitan rectificativa.
  - Permiso propio: «Contabilidad › Control de facturas».
- 11/11: **Series de factura de los nacionales.** Madrid factura con la serie C-2027; cada campus nacional tiene su propia serie (Valencia: VAL27.01, VAL27.02…).
  - El control lee la serie C-2027 y todas las que contienen «27.», así entran solas las series de Málaga, Andorra, Almería y Alicante en cuanto emitan la primera factura, sin depender de su nombre exacto.
  - Arriba se ven las series encontradas.
  - El aviso de Alejandro Santamaría (Valencia) era falso: su pago de 123 € está en la factura VAL27.01.
- 11/11: **Horarios de los campus nacionales** (decisión de Pau).
  - Van separados de Madrid, porque cada campus tiene sus propias instalaciones. Madrid no cambia.
  - En la portada de Horarios, debajo de las Weeks de Madrid, sale «Nacionales» con una caja por campus (Valencia, Málaga, Andorra, Almería, Alicante). También en la barra lateral.
  - Fechas: las del campus en el CRM. Grupos: los equipos de ese campus en Equipos. Modalidades: solo las que tienen inscritos.
  - **Se hacen a mano.** No hay botón «Crear horario automáticamente». Se hace un día y se replica con «Replicar el lunes a…» (un día concreto o «Todos»). Ese botón también está en el panel de edición, donde «Copiar este día a» tiene ahora la opción «Todos» (también en Madrid).
  - **Instalaciones propias por campus**: se empieza vacío. Se añade cada instalación con su nombre (por ejemplo, la ciudad deportiva) y dentro sus espacios: campos, comedor, piscina, espacios de actividades… con capacidad, días y franjas. Cada instalación nueva queda activa para todas las modalidades del campus.
  - Avisos: solo los de instalaciones (sin instalación, capacidad superada, solapes, días y franjas no disponibles). No se aplican las reglas de Madrid (Fleming, Valdebebas, UAM, buses, check-ins…) hasta que Pau diga qué reglas valen para los nacionales.
  - Sin Buses ni Simulador en los nacionales.
  - Permiso propio: «Horarios › Nacionales» (sin acceso, ver o editar). El servidor lo comprueba al guardar.
  - Se guardan con prefijo de campus (`c-val-…`), separados de las semanas de Madrid.

- 11/11: **El software ya funciona en Zoho Catalyst** (proyecto «Campus-Experience-OS», centro de datos UE).
  - Dirección (entorno Development): https://campus-experience-os-20121257243.development.catalystserverless.eu/app/
  - Pau entra como administrador. La clave de primera instalación ya está borrada.
  - Publicación: la integración directa con GitHub no está disponible para cuentas nuevas de Catalyst. De momento se publica desde el Mac con `catalyst deploy` en la carpeta CLAUDE. Pendiente: montar Catalyst Pipelines para que se publique solo en cada `git push`.
  - Data Store: las 5 tablas creadas y cerradas; solo las usa el servidor.
  - Credenciales de Zoho de solo lectura (Self Client) puestas en la función. Pau decide no renovarlas.
  - Los datos guardados en la versión de claude.ai eran pruebas: no se traspasan. El equipo empieza de cero en Catalyst (11/11). La versión de claude.ai queda para desarrollar y probar.
  - La web tiene su propia página 404 (Catalyst no permite que sea la misma que la principal).
  - Corrección (11/11): el servidor consultaba Zoho con la API v6, que devuelve los campos de búsqueda (jugador, evento, producto, tutor) sin nombre. Por eso faltaban datos en Registros. Ahora usa la v8, igual que el conector de claude.ai.

- 11/11: **Ingresos** (Administración › Ingresos), para cuadrar cada día lo cobrado con lo que manda la plataforma de pago.
  - Fuente: las facturas de Zoho Books de Campus Experience (serie C-2027 y series de los nacionales). Cada cobro tiene su factura.
  - **Día de la plataforma:** de las 23:00 del día anterior a las 22:59, hora de España. Un cobro a las 23:01 cuenta en el día siguiente. La hora sale de la referencia de la factura (aaaammddhhmm en UTC); si no la trae, se usa la hora en que Books creó la factura y se marca con «≈».
  - El importe que manda la plataforma es **bruto** (decisión de Pau).
  - Por día: número de cobros, total, campo «Banco» para escribir lo recibido (muestra la diferencia o «Cuadra») y botón «Marcar cuadrado».
  - Al abrir un día: hora, jugador y familia, campus, qué pago es (reserva, 1er, 2º, 3er pago o pago completo), factura con enlace a Books e importe.
  - Cuadrar guarda quién, cuándo, el total y las facturas de ese momento. Si después cambia, el día pasa a «Revisar» y dice qué ha cambiado.
  - Cajas: por cuadrar, revisar, cuadrados, todos y total cobrado. Agrupado por meses, con total del mes. Filtro por campus y buscador.
  - Lo cuadra **Olivia**. Permiso propio: «Contabilidad › Ingresos» (ver, o editar para poder cuadrar).
  - Pendiente: devoluciones (refunds), que restarán en su día.

- 12/11: **Caída por el límite gratuito de Catalyst.** El software dejó de funcionar porque se agotó la cuota gratuita mensual de lecturas del Data Store. Cada petición leía la sesión y el usuario, y cada pestaña abierta preguntaba por cambios cada 15 segundos.
  - Solución: añadir un método de pago en Catalyst (pago por uso).
  - Optimización: el servidor guarda en memoria la sesión y el usuario (2 minutos) y los avisos de cambios (20 segundos), y solo actualiza «última actividad» cada 10 minutos. La app pregunta por cambios cada 30 segundos y nunca con la pestaña en segundo plano. Las lecturas bajan a una fracción de las anteriores.

- 12/11: **Incidencias** (Operativa › Incidencias).
  - Se crea desde el jugador (buscador por nombre o código, o «+ Nueva incidencia»): tipo (Salud, Salida, Queja, Cambios, Otros), semana si tiene varias, «Grave / urgente» y explicación. Se guardan quién y cuándo.
  - Tablero de tres columnas: Por responder, Por validar y Cerradas. Filtros en una línea por semana (W1–W9), campus nacionales e institucionales, y por modalidad, con número de pendientes (rojo si hay urgentes).
  - Responder: «¿Has contactado con la familia?» Sí/No; si es Sí, cómo (Teléfono, WhatsApp, Email, En persona, Otros); después el texto. Pasa a «Por validar».
  - Quien la creó la valida: Solucionada (se cierra) o No solucionada con comentario (vuelve a Reabierta). Una cerrada se puede reabrir siempre.
  - Historial completo; cada texto se puede corregir solo durante 10 minutos.
  - Avisos (barra lateral y «Te tocan») solo para incidencias en las que estás implicado. Sin avisos fuera del software.
  - Urgente sin respuesta 2 h o normal sin respuesta 24 h: se marca en rojo. En las de Salida se muestran los autorizados para recoger.
  - Permiso «Incidencias»: ver, o editar para crear y responder. Quien tiene acceso ve todos los datos, también los de salud.
- 12/11: **Ficha del jugador (Registros)**. Solo cambia lo que se ve en el software; el CRM no se toca y los campos ocultos se siguen leyendo para otros apartados.
  - Participante: sin documento ni «ha participado antes».
  - Equipaciones: «Portero» en vez de «Portero/a extra».
  - Servicios: Bus ida, Bus vuelta, Noches extra, Transfer (pendiente) y un único campo «Solicitud de ir con alguien»; sin «viaja solo».
  - Salud y dieta: tipo de dieta, alergias o intolerancias y condiciones médicas del CRM.
  - Familia: sin «persona que inscribe» (coincide con el tutor); «Segunda persona de contacto» pendiente del formulario 2.
  - Pago: con «Totalidad del importe», el 2º y 3er plazo salen vacíos (el CRM los rellena igualmente).
  - Documentación: sección nueva, pendiente del formulario 2. Incidencias al final, con su estado.
- 12/11: Los nombres largos se recortan y la etiqueta de la sede (y Premium) no desaparece nunca.
- 12/11: **Revisión de Contabilidad** (decisiones de Pau).
  - **Sedes.** Pagos, Facturas, Devoluciones y Cancelaciones se separan por sede: Madrid, Nacionales (con chips por campus), Institucionales y Todas. Por defecto se abre Madrid. Ingresos no se separa por sede.
  - **Andorra** factura en otra organización de Books: «ISL Agency», id 20112628138, serie AND27.nn. El software la lee junto a la de RMF (20110950454). Sus facturas casi nunca llevan la referencia de la inscripción, así que se asocian por el email de la familia (solo si ese email tiene una única inscripción).
  - **Devoluciones.**
    - Pendiente: la inscripción tiene «Refund amount» (campo `Refund`) en el CRM y todavía no tiene rectificativa. Se ignoran las inscripciones en «Refund» sin importe.
    - Se muestra el jugador, la sede, el estado (aviso en rojo si no está pagado, en fase de pago, cancelado o devuelto), el total, el importe a devolver y el motivo (pendiente de un campo nuevo en el CRM).
    - Al abrirla se ve de qué facturas devolver, empezando por la última. Ejemplo: 150 € con dos facturas de 100 € → 100 € de la última y 50 € de la anterior. Cada factura tiene su enlace a Books.
    - Hechas: Olivia crea en Books la rectificativa como nota de crédito desde la factura original. Si la suma coincide con el importe a devolver, la devolución es correcta; si no, sale en rojo con la diferencia. También sale en rojo una rectificativa que no se puede asociar a ninguna inscripción.
    - Las hechas se agrupan por la fecha de la rectificativa y se marcan como correctas, como en Ingresos. Si después cambian, el día pasa a «Volver a revisar». Permiso de edición: Contabilidad › Devoluciones.
    - Las rectificativas solo se leen desde el software operativo (Catalyst): el conector de Books de claude.ai no tiene notas de crédito.
    - Solo cuenta la campaña 2027: se leen las rectificativas desde la fecha de la primera factura de la campaña y, si no se pueden asociar a una inscripción, solo se muestran las que rectifican facturas de las series 2027 (C-2027, XXX27.nn, AND27). Las de 2026 no aparecen.
  - **Cancelaciones.** Todas las inscripciones en «Cancelled», con fecha, forma de pago, total, pagado, devuelto (según las rectificativas), saldo y enlaces a las facturas y rectificativas. Filtros: con saldo, devueltas y sin pagos.
  - **Ingresos.**
    - Pestañas por banco: Santander (Madrid y nacionales), Sabadell (institucionales) y LaCaixa (Andorra). Cada banco se cuadra por separado.
    - Se puede mover un cobro a otro día. Queda marcado como «Movido», con el historial completo (de qué día a qué día, quién y cuándo) y la opción de devolverlo a su día. Si el día ya estaba cuadrado, pasa a «Revisar». Pueden moverlo quienes tienen edición en Ingresos (Olivia y Pau).
  - **Credenciales.** El 12/11 se renovaron las credenciales de Zoho (Self Client) con el permiso `ZohoBooks.creditnotes.READ`. Variables nuevas del servidor: `ZOHO_REFRESH_TOKEN` (nuevo) y `ZOHO_BOOKS_ORG_AND=20112628138`.
  - Colecciones nuevas en el servidor: `ingmv` (cobros movidos) y `dev` (revisión de devoluciones).
- 12/11: **Total de equipaciones**: ahora suma también la equipación de portero extra (antes contaba solo incluidas + extra blancas). Afecta a la ficha, al listado de Registros y a la exportación. Los datos del CRM se leían bien; solo fallaba la suma.
- 12/11: **Borrar incidencias**: solo el administrador (Pau). En el panel de la incidencia, «Borrar incidencia» y confirmación; se borra para siempre. El servidor rechaza el borrado a cualquier otro usuario, aunque tenga edición en Incidencias.
- 13/11: **Caída de los datos de Zoho** (los registros y las facturas daban error 502; los datos guardados del equipo seguían bien). Causa probable: cada instancia de la función pedía su propio token de acceso a Zoho, varias a la vez, y Zoho bloquea temporalmente cuando se piden demasiados seguidos. Solución: una sola petición de token a la vez, el token se comparte entre instancias a través del Data Store (CEMeta, clave `zoho_at`) y, si Zoho lo rechaza, se espera 2 minutos antes de reintentar.
- 13/11: Cambios acordados con Pau (nuevo formato de trabajo: notas → resumen de actuación y dudas → cierre → cambios).
  - **Torrevieja** pasa a ser campus nacional (evento «Campus Experience Torrevieja 2027», cobra en Santander). Entra sola en Registros, Equipos, Horarios, Incidencias y Contabilidad. Si factura con serie propia (TOR27.nn), se reconoce.
  - **Ficha del jugador:** se quita la sección «Seguimiento del equipo». Lo que estuviera guardado no se borra; solo deja de verse.
  - **Incidencias:** una sola palabra, **URGENTE**, en mayúsculas en todas partes (etiqueta, botón al crear y contadores).
  - **Cancelaciones** (inscripciones en «Cancelled»). El estado depende de «Refund amount», que no se muestra, y de lo devuelto (rectificativas de Books):
    - Refund amount vacío → **Con saldo**, aunque no haya pagado nada, hasta que alguien escriba 0.
    - Refund amount 0 → **Cancelado**; lo pagado queda como **No reembolsado**.
    - Refund amount con importe → **Pendiente de devolución** (importe menos lo devuelto; las devoluciones parciales siguen pendientes). Cuando lo devuelto llega al importe → **Cancelado**, el pendiente pasa a 0 y lo pagado no devuelto queda como No reembolsado.
    - **Errores**, agrupados arriba y explicados: hay rectificativas con el Refund amount vacío o a 0, el Refund amount es mayor que lo pagado o es negativo, o se ha devuelto más que el Refund amount.
    - Columnas: Total, Pagado, Pendiente de devolución y Devuelto. «No reembolsado» se ve en pequeño junto al estado Cancelado. Arriba, los totales «Por devolver» y «No reembolsado».
  - **Fechas de los nacionales**: se muestran en cuanto el campus tiene alguna inscripción activa (sale de las semanas contratadas). Sin inscripciones, la caja va sin fecha (decisión de Pau).
- 13/11: La función **dashboard_api** (Dashboard de registros en Catalyst, creada por Pau el 12/11 en otro chat) usa las mismas credenciales de Zoho que campus_api. Se le aplica el mismo arreglo del token: lo comparte con campus_api a través de CEMeta (`zoho_at`), una sola petición a la vez y 2 minutos de espera si Zoho lo rechaza. `catalyst-debug.log` se añade a .gitignore.
- 13/11: Cancelaciones, rediseño de la lista: una sola cabecera (Jugador, Estado, Total, Pagado, Por devolver, Devuelto, Facturas) en lugar de repetir los títulos en cada fila; estado con un punto de color en vez de la etiqueta grande; importes en serif cursiva («Por devolver» en rosa); datos del jugador en una línea (código, fecha de cancelación y forma de pago). «Pendiente de devolución» se abrevia como «Por devolver» en la columna. En el móvil cada fila muestra sus propios títulos.
- 13/11: **Pagos › «Pagado sin factura»** (caso Essome Moukouri Jelani: Redsys rechazó el 2.º plazo, pero la función del CRM «redsysUpdateApplication_CRM» lo marcó como pagado y envió el email de confirmación; Books no creó factura). Nueva caja y aviso en rojo cuando lo pagado según el CRM supera lo facturado en Books: «Comprueba el cobro en Redsys; si fue rechazado, corrígelo en el CRM». Un cobro recién hecho puede salir unos minutos hasta que Books crea la factura. Los usuarios con permiso de Pagos también leen las facturas de Books (solo para este aviso).
- 13/11: **Pagos reorganizado** (sustituye las siete cajas anteriores, incluida «Pagado sin factura»).
  - Orden: buscador → sede (Todas, Madrid, Nacionales, Institucionales; «Todas» va primero en todo Contabilidad) → dos apartados que se pueden pulsar, **Pago fraccionado** y **Pagado por completo**, y la caja **Pendiente de cobro** (solo el importe).
  - **Pago fraccionado**: pestañas **Fase 1** (1er plazo pagado) y **Fase 2** (1.º y 2.º pagados), cada una con el número de inscripciones, cuántas en rojo y lo que falta por cobrar. Máximo 3 plazos: el 3.º deja el campus pagado.
  - **Pagado por completo**: pago único → una casilla «1», «Pago único» y el importe; fraccionado → una casilla por pago, «1.º pago · 2.º pago · 3.º pago · Total». Los **extras** se pagan al contado después, por la misma plataforma, y generan factura en Books con la referencia de la inscripción: salen como «+» y «Extra X €» (facturas de la inscripción más allá de los plazos).
  - **En rojo, dentro de su sitio y con el motivo**: impago (plazo vencido, con fecha y días) y errores con Books (sin factura, pagado sin factura, facturado de más, factura sin cobrar, sin pagos). Los rojos salen primero.
  - **Cobrado hoy sin factura** (decisión de Pau, opción B): aviso en gris oscuro, arriba del todo, «Cobrado hoy: la factura aún no ha llegado a Books»; si al día siguiente sigue sin factura, pasa a rojo. El CRM solo guarda el día del cobro (First/Second/Third_Instalment_Paid_At).
  - **Buscador**: encuentra cualquier inscripción, dice dónde está (fraccionado y fase, o pagado por completo) y si tiene aviso; al pulsarla lleva a su sitio y la marca en rosa.
  - **Facturas**: se mantiene; la caja «Sin pagos» desaparece y esos casos pasan a «Con error» con su motivo.
  - Descartado por Pau: botón «Gestionar» para impagos y marca de «vence en 7 días».

## Lista de equipos · Nacionales e Institucionales (oficial, 04/11/2026)
Se asignan automáticamente en este orden, un equipo por nombre y sin repetir dentro de un mismo campus:
1. Mbappé · 2. Vini Jr. · 3. Bellingham · 4. Courtois · 5. Valverde · 6. Diomande · 7. Cucurella · 8. Trent · 9. Arda Güler · 10. Tchouaméni · 11. Camavinga · 12. E. Militão · 13. Bernardo Silva · 14. Endrick · 15. Huijsen · 16. Brahim · 17. Konaté · 18. Rüdiger · 19. Dumfries · 20. F. Mendy · 21. Á. Carreras · 22. Lunin · 23. Asencio · 24. Rodrygo · 25. Espí · 26. Thiago
- 04/11: Horarios, 3.er documento de reglas (detalle en Reglas_Horarios):
  - Ocupación completa en amarillo; turnos de 1 h separados.
  - Prohibido el campo de 14:30 a 15:30.
  - Turnos de campo en horas fijas para llenar campos a 6 equipos, empezando por VBB.
  - Aviso de aprobación con 3 h seguidas de campo; botones Aprobar/Denegar en la ventana del aviso, también en el simulador.
  - Sin FUN seguidas y rotación semanal de Experience (máximo 1 repetición).
  - VBB no exclusiva; comida y piscina en UAM agrupadas cuando se puede.
  - Pendiente: confirmar qué manda entre Experience extra en huecos y máximo 1 repetición.
- 05/11: El apartado «Pagos» pasa a llamarse «Contabilidad». Dentro hay dos pestañas: «Pagos» (igual que estaba) y «Devoluciones» (en preparación; Pau definirá su contenido).
- 05/11: Contabilidad tiene tres pestañas: Pagos, Devoluciones y Cancelaciones (las dos últimas en preparación; Pau definirá su contenido).
- 05/11: Incidencia en Pagos. Al cobrarse la 2.ª cuota, Zoho pone la fase «2nd Payment», y el software solo leía «1st Payment» y «Paid», así que el jugador desaparecía de todo el software (caso de Daniel Tomas).
  - Solución: el software lee todas las fases menos las que no son inscripciones activas: Unpaid, Trash, Erased, Closed Lost, Cancelled, Refund y Reservation Payment Completed.
  - Cualquier fase nueva de pago aparecerá sola.
  - Pendiente de Pau: qué hacer con «Reservation Payment Completed» (53 reservas de 50 € en Madrid 2027).
- 05/11: Horarios: nuevo sistema de trabajo (decisión de Pau).
  - Pau construye el horario a mano en el software. El software calcula la ocupación (campos, piscinas, comedores, espacios Experience y buses) y marca los errores de aforo y choques.
  - El botón «Crear automáticamente» se mantiene como borrador opcional; se irá desarrollando con normas.
  - «Editar horario» (también en el simulador y con el día vacío):
    1. Paleta de bloques con su duración: Entrenamiento 1 h, Partido 1 h, Prep. física 1 h, Experience 1 h o 45', FUN 30', Piscina 1 h 30 con vestuarios, Comida 30', Snack 15', Desayuno 30', Cena 30', Bus 15', Descanso 15' y Clausura 45'. Se pulsa en la columna del grupo a la hora de inicio, y existe la opción «En todos los grupos de la modalidad».
    2. Al colocar un bloque que necesita instalación, se elige entre las instalaciones de la semana con su sitio libre en ese momento («Campo 8 · 3 de 6 equipos libres»). El desplegable de editar también muestra el sitio libre.
    3. Arrastrar bloques para moverlos (también a otro grupo; la piscina se mueve con sus vestuarios) y estirar el borde de abajo para cambiar la duración, siempre en cuartos de hora.
    4. Copiar y pegar el día de un grupo en otro grupo, en todos los de su modalidad o en otro día. «Copiar este día a…» copia todos los grupos a otro día; entre el lunes y el resto se cambian los check-in de los externos.
    5. Errores en directo: el bloque se pone rojo si pasa el aforo, choca con otro o no tiene instalación. Al pulsarlo se ve con quién comparte la instalación.
    - Deshacer (botón o Ctrl/Cmd+Z).
  - Avisos: arriba solo los problemas de aforo o choque (rojo). El resto de reglas y las aprobaciones (Aprobar/Denegar) van en «Revisión de reglas», que se abre al pulsarla.
  - Pendiente: propuesta de catálogo de instalaciones más intuitivo (por validar con Pau).
- 06/11: Mejoras de Horarios y Simulador (las dos funcionan igual; el simulador nunca toca los datos reales).
  1. Copiar y pegar cajas con el teclado: se pulsa una caja, Ctrl/Cmd+C, y luego Ctrl/Cmd+V. Pega con todas sus propiedades justo después de la caja seleccionada, o donde se haya pulsado. Al repetir Ctrl/Cmd+V se encadena a continuación.
  2. Cajas nuevas en la paleta: Check-in 15', Check-out 15', Ceremonia 15' y Welcome Pack 30'.
  3. La fila de cabecera con modalidades y nombres de los equipos queda fija al bajar por el horario. La columna de horas queda fija al moverse en horizontal.
  4. Desayuno, Snack, Comida y Cena llevan el mismo naranja pastel de tono medio (#F5B37A), también en la descarga.
  5. Solo en «Editar horario», cada caja tiene una X arriba a la derecha que la borra; la piscina se borra con sus vestuarios. Fuera del modo de edición no hay X.
  6. Necesidades tiene una tabla nueva, «Horario de uso de cada instalación», por día. Muestra la instalación en negrita y debajo cada espacio. Los huecos de 30 min o menos cuentan como uso (09:00–10:00 + 10:30–11:30 = 09:00–11:30).
  7. Al pulsar una caja de bus se abre la ventana de editar con Origen y Destino. Los desplegables muestran Fleming y las sedes con algún espacio disponible ese día; también hay «Automático». El trayecto elegido manda en el horario y en Buses.
  8. Las cajas de bus muestran solo «BUS n». Si la caja combina otra actividad, como «Check-in Fleming · BUS 1», se mantiene esa actividad y se cambia solo la parte del bus.
  9. Pestaña Buses, gestión manual guardada por día (colección hbus; en el simulador va dentro de la simulación):
     - Por bus: Plazas y Disponible (desde–hasta).
     - Por cada grupo de un trayecto: cambiar de bus (o «Bus nuevo»), Editar origen/destino y × para quitar el trayecto.
     - Los trayectos quitados aparecen en «Trayectos sin bus» con «Volver a ponerlo».
     - «Volver al reparto automático» borra los cambios manuales del día.
  9.1. Los cambios manuales se revisan siempre y sus avisos van a «Revisión de reglas»:
     - bus con más pasajeros que plazas;
     - bus que no llega a tiempo de un trayecto a otro;
     - trayecto fuera de la disponibilidad del bus;
     - trayecto sin bus;
     - origen del bus distinto de donde está el grupo.
- 08/11: Contrastes del modo oscuro revisados en todas las pantallas (Inicio, Registros, Equipos, Contabilidad, Horarios y Simulador, con edición, avisos y ventanas). Todos los textos cumplen el contraste mínimo de lectura (WCAG AA: 4,5:1, o 3:1 en texto grande).
  - Rosa algo más claro en modo oscuro (#ff8aa5).
  - Texto oscuro sobre fondos rosa y verde en modo oscuro (etiquetas Impago, Premium, Chica, botones Guardar o Terminar edición, checks verdes).
  - La etiqueta «Fase 1» de Contabilidad pasa a azul claro con borde.
  - Textos secundarios más claros; las cajas vacías y los botones desactivados, menos apagados.
  - Corregido: la pestaña activa del menú perdía el fondo al pasar el ratón por encima.
  - El modo claro no se ha tocado: el rosa de marca (#ea456c) sobre gris (#e4e4e4) tiene poco contraste en textos pequeños (pendiente de Pau).
- 10/11: Nuevo apartado «Recursos Humanos» en el menú y en Inicio, junto a Registros, Horarios, Equipos y Contabilidad. De momento muestra «Coming soon»; Pau definirá su contenido.
- 10/11: Navegación con barra lateral izquierda, que sustituye a las pestañas de arriba.
  - Apartados agrupados en General (Inicio), Operativa (Registros, Horarios, Equipos) y Gestión (Contabilidad, Recursos Humanos).
  - Cada apartado se despliega con sus subapartados, para saltar sin volver atrás:
    - Registros: Resumen, Todos los registros, W1–W9 con nº de inscritos, Valencia y Málaga.
    - Horarios: Semanas, Simulador y W1–W9.
    - Equipos: Resumen, W1–W9 y campus nacionales.
    - Contabilidad: Pagos, Devoluciones y Cancelaciones.
  - Contadores: total de registros e impagos (en rosa).
  - Las semanas con equipos u horario completos tienen borde verde.
  - Se pliega con la flecha o con Ctrl/Cmd+B. Plegada muestra solo iconos, y al pasar el ratón salen los subapartados flotando. Recuerda si estaba plegada.
  - En móvil se abre con el botón de menú.
  - Arriba se ve siempre el apartado y la sección actual, con el estado de Zoho y Actualizar. El botón atrás del navegador funciona.
- 10/11: Versión para servidor propio (carpeta `selfhost/`). La versión de claude.ai se mantiene mientras tanto, con el mismo `index.html`.
  - Acceso con email y contraseña, con doble control:
    1. Usuario activo del Zoho CRM de ISL. Se comprueba al crearlo, al entrar y cada 30 min. Si se desactiva en Zoho, pierde el acceso.
    2. Accesos dentro del software, que da el administrador.
  - Permisos por apartado y subapartado, con tres niveles: Sin acceso, Ver, Editar.
    - Registros: Madrid, Nacionales e institucionales, Todos los registros.
    - Horarios: Semanas, Simulador.
    - Equipos: Madrid, Nacionales e institucionales.
    - Contabilidad: Pagos, Devoluciones, Cancelaciones.
    - Recursos Humanos.
  - El servidor aplica los permisos en cada petición. Con «Ver», la pantalla oculta los botones de modificar y muestra «Solo lectura».
  - Panel «Usuarios y accesos», solo para el administrador:
    - Para crear un usuario se elige a la persona de la lista de usuarios activos de Zoho y se le pone una contraseña inicial (botón para generarla). Se le obliga a cambiarla al entrar.
    - Se marcan sus accesos, con atajos «Nada», «Ver todo» y «Editar todo».
    - Se puede desactivar, borrar, poner una contraseña nueva y comprobar su estado en Zoho.
    - Pestaña «Actividad» con el registro de accesos y cambios.
  - Contraseñas cifradas (nadie puede verlas). Bloqueo tras 5 intentos fallidos. La sesión se cierra tras 8 h sin uso.
  - Los datos de Zoho los filtra la interfaz, no el servidor: quien tiene acceso a Registros, Equipos, Horarios o Contabilidad recibe las inscripciones en su navegador.
  - Instalación para IT en `selfhost/INSTALACION.md` (Node 22.13+ o Docker, HTTPS y credenciales Self Client de Zoho en solo lectura).
- 10/11: Nueva organización del software (decisión de Pau).
  - **Inicio** solo dice «Campus Experience» y pide elegir la temporada. Ahora mismo solo existe Campus Experience 2027; la 2028 se creará en verano.
  - Dentro de la temporada hay seis bloques:
    - **Registros**, igual que antes.
    - **Operativa**: Horarios y Equipos (se irán añadiendo más).
    - **Administración**: Contabilidad (Pagos, Devoluciones, Cancelaciones).
    - **Atención al público**, **Marketing** y **Recursos Humanos**: vacíos, en «Coming soon».
  - Barra lateral: Inicio, la temporada (con botón para cambiarla), los seis bloques y, solo para el administrador del servidor propio, «Sistema › Usuarios y accesos». Este apartado queda fuera de las temporadas porque los usuarios son los mismos para todas.
  - Arriba se ve el bloque y la pantalla actual (por ejemplo «Operativa › Horarios · Week 4»).
  - Permisos: Atención al público y Marketing entran en el catálogo. La matriz de accesos se agrupa por bloque. Por ahora los permisos valen para todas las temporadas.
- 10/11: El repositorio se organiza para Zoho Catalyst, a petición del director de tecnología. Se despliega desde GitHub.
  - `catalyst.json` en la raíz.
  - `client/` para Web Client Hosting: app, pantalla de acceso y primera instalación.
  - `functions/campus_api/` es una función Advanced I/O en Node.js que hace el login, los permisos, la lectura de Zoho CRM y el guardado de datos en el Data Store.
  - Decisión de Pau: las contraseñas las gestiona nuestro sistema (no Catalyst Authentication). El administrador pone la contraseña inicial y el usuario la cambia al entrar.
  - Doble control igual que antes: usuario activo de Zoho CRM más los accesos que da el administrador.
  - El primer administrador se crea desde la pantalla «Primera instalación», con una clave que configura el equipo técnico.
  - Los horarios y equipos se guardan troceados, porque una columna de texto del Data Store admite como máximo 10.000 caracteres.
  - Los cambios de otros usuarios llegan cada 15 segundos.
  - `build.js` genera `client/` y `selfhost/app/` a partir de `index.html`.
  - La guía para el equipo técnico está en `CATALYST.md`: tablas, variables, credenciales de Zoho y despliegue.
  - `selfhost/` se mantiene como alternativa.
- 13/11 (tarde): El acceso «Dashboard» volvió a desaparecer porque `client/index.html` se publicó sin la línea `<script src="dashboard-menu.js" defer>` (no se generó con `build.js`) y este documento se sobrescribió con una copia anterior. Se restaura, se añade **Torrevieja** al dashboard (abierta, Ubicacion = Torrevieja) y se refuerzan las reglas del apartado 1.
- 13/11: **Almería** abierta también en el dashboard (Ubicacion = Almeria; productos «… Almería»).
- 20/11: **Mapamundi** en la Portada (proyección Miller, sin banderas) y **extras** actualizados (mochila, jersey, transporte) con desglose por producto. El autobús pasa a contar como extra.
- 19/11: **Mapa de calor de España** en la vista Madrid (provincia de residencia). El mapa mundial de la Portada se descartó.
- 16/11: **Ritmo de inscripción general** en la Portada (debajo de las tarjetas) y selector Registros | Jugadores también en Madrid. Marcas de apertura en el gráfico, sin leyenda (decisión de Pau).
- 16/11: **Residencias** en el dashboard (vista Madrid): ocupación de la UAM y la UEM con bloqueos semanales, asignación de MAX/ONE Interno y totales contratados. Decisión de Pau: el permiso de edición se da desde Administración › Usuarios del software (Dashboard › Residencias), para Irene Martínez y quien se decida. Se mantiene la línea estética del dashboard.
- 16/11: **Horarios: datos protegidos y mejoras** (decisiones de Pau).
  - **Causa de los horarios perdidos:** desde el 13/11 no hubo ningún guardado de horarios reales en el servidor; se trabajaba en el **Simulador**, que solo guardaba equipos y configuración y dejaba los bloques en la pantalla. Lo hecho allí no se pudo recuperar.
  - **El simulador ahora guarda sus horarios** (colección `hsimd`, un documento por día y modalidad). Cambiar el número de equipos ya no borra la simulación.
  - **Pasar al horario real:** botón en el simulador. Copia la semana a Horarios: los grupos se emparejan por nombre o, si no coinciden, por orden con los equipos reales. También copia instalaciones y buses. Lo que hubiera en real queda en el historial. Irene trabaja en el simulador y luego pasa la semana a real.
  - **Franja de modo** siempre visible: «Simulador · Week X» (rosa) u «Horario real» (verde).
  - **Guardado a prueba de fallos** (Horarios, Simulador y Equipos): «Guardado ✓ hora»; si un guardado falla, aviso rojo fijo con «Reintentar», y el navegador avisa antes de cerrar con cambios sin guardar.
  - **Historial:** cada guardado conserva la versión anterior (20 últimas por día y modalidad) con quién y cuándo; desde «Historial y papelera» se restaura.
  - **Papelera:** borrar un día o una semana lo manda a la papelera (cualquiera con edición); se recupera desde ahí. Solo el administrador la vacía. Nada se borra solo.
  - **Copia de seguridad diaria:** desde las 3:00, una sola copia (la más reciente). La nueva solo sustituye a la anterior cuando se ha completado bien; si falla, se conserva la anterior y se reintenta. En «Sistema › Usuarios y accesos › Copia de seguridad»: hacer copia ahora, descargarla y recuperar Horarios, Simulador, Equipos o todo (lo actual queda en historial/papelera).
  - Protegidos: hor, hweek, hsim, hsimd, teams, reqs, hbus, happr. Servidor: `protect.js` (Catalyst y servidor propio).
  - **Buses:** plazas a elegir entre 28, 54, 60 y 72. El reparto automático sigue usando 54/60/72 (los de tarifa); el de 28 no tiene tarifa.
  - **Check-in y check-out:** en la instalación salen siempre tres sedes: «Fleming», «VBB» y «Residencia» (corregido el 16/11: eran tres, no dos; el 17/11: siempre «VBB», nunca «Valdebebas»).
  - **Orden de las columnas del horario:** media jornada, jornada completa e internos; dentro de cada una, primero ONE y luego MAX (ONE MJ · ONE JC · MAX JC · ONE INT · MAX INT). También en la fila de modalidades.
  - **Aceptar avisos:** cualquier aviso de conflicto se puede aceptar (personas con edición de Horarios). Queda en gris con quién y cuándo, deja de contar como error y se puede quitar. Si el conflicto cambia, vuelve a avisar.
- 16/11: **Cajas:** los títulos siempre caben en su caja. Si un nombre largo (p. ej. «Torrevieja») no cabe, la letra se reduce hasta que quepa; se aplica a todas las cajas (semanas, campus, contabilidad, portada) al pintarse y al cambiar el tamaño de la ventana.

- 17/11: **Horarios: colores, scroll y check-in/out** (decisiones de Pau).
  - **Colores:** piscina más azul; el bus tiene color propio (gris oscuro con texto blanco); comidas y snacks en un naranja más suave.
  - **Scroll:** un solo scroll en el horario; la barra de edición (paleta) ya no se monta encima de los bloques.
  - **Check-in y check-out:** como actividad solo existen «Check-in» y «Check-out»; la sede se elige después en Instalación: Fleming, VBB o Residencia.
  - **Avisos:** se quitan los avisos de hora del check-in/out. Solo se avisa si a un día de externos le falta el Check-in o el Check-out. Internos: Check-in el primer día y Check-out el último (ONE internos, el viernes).
  - **Horario automático:** genera bloques separados. Externos, lunes: Check-in Fleming 7:30, Bus a VBB 7:45, Check-in VBB 8:00, Welcome Pack 8:15–8:45, Welcome Ceremony 8:45–9:15. Resto de días: Check-in Fleming 8:00, Bus a VBB 8:15, Check-in VBB 8:30. Salida: Bus a Fleming y Check-out Fleming a la hora de siempre. El bus sale a la misma hora que antes.
  - **Welcome Pack** del lunes: termina a las 8:45 (de 8:15 a 8:45 tras el Check-in en VBB; sigue valiendo de 8:00 a 8:45 en los horarios antiguos).
- 18/11: **Contabilidad: Devoluciones y Cancelaciones más sencillas** (solo vista y organización; la lógica no cambia).
  - **Devoluciones:** tres cajas, en este orden: Todas · Pendientes (sin rectificativa) · Realizadas (con rectificativa). Desaparece la caja «Con error»: cada error sale dentro de su estado, primero y con la etiqueta roja «Error» (pendiente a la que le falta un dato, o realizada que no cuadra). Debajo, el dinero en grande: **Devuelto** (suma de las rectificativas) y **Pendiente de devolución** (lo que falta, incluida la diferencia de las realizadas a medias).
  - **Cancelaciones:** tres cajas: Todas · Pendientes (con saldo y pendientes de devolución, juntas con su etiqueta) · Canceladas (en verde, cerradas). Desaparecen la caja y la sección «Errores»: el error sale dentro de su estado («Con saldo · Error», «Cancelado · Error · pendiente de solucionar»), primero en su lista.
  - **Contador de cancelaciones:** Total cancelado (lo pagado) − Reembolsado (ya devuelto) = **Nos quedamos**; debajo, «Quedará en X al devolver lo pendiente».
  - «Todas» va siempre la primera. Todo respeta el filtro de sede.
- 18/11: **Zoho: campos borrados en el CRM.** Se borraron en Zoho CRM los campos «Bus_ida», «Bus_vuelta» y «Numero_Noches_Extra» de Deals y la lectura entera fallaba («Sin conexión con Zoho»). Ahora, si Zoho dice que un campo no existe, el software lo deja de pedir, vuelve a leer y avisa en Registros de qué campos faltan. El servidor (campus_api y servidor propio) pasa el nombre del campo en el error.
- 18/11: **Contabilidad: Facturas e Ingresos más sencillos** (solo vista; la lógica no cambia).
  - **Facturas:** tres cajas: Todos · Pendientes de cuadrar · Correctas. Se abre en **Correctas**. En Pendientes entran sin factura, no cuadra, sin cobrar, sin pagos y las facturas sin inscripción activa (antes en un desplegable aparte), cada una con su etiqueta. Mismo estilo que Pagos, Devoluciones y Cancelaciones.
  - **Ingresos:** dos cajas: Por cuadrar · Cuadrados (se quitan «Todos» y «Revisar»). Se abre en **Por cuadrar**. Si un día cuadrado cambia después, se queda en Cuadrados pero en rojo y salta arriba una **alarma** roja con un botón para ir a ese día.
  - **Total cuadrado** (en lugar de «Total cobrado»): solo suma los días marcados como cuadrados del banco elegido; los que han cambiado no cuentan hasta volver a cuadrarlos.
- 18/11: **Atención al público** (decisiones de Pau). Deja de ser «Pronto» y tiene tres apartados. Permisos nuevos: Atención al público › Base de datos, Limpieza y Estadísticas (sustituyen al antiguo «Atención al público»).
  - **Base de datos:** listas para las llamadas comerciales, todas con el mismo formato: fecha, jugador y tutor, teléfono, email, nacionalidad, idioma, modalidad, colectivo, ATT que gestiona, estado y contactos.
    - **Leads ESP / ENG:** pendientes de conectar; los leads aún no están en el CRM. Cuando estén, se cruzan por coincidencia.
    - **BBDD 2026 ESP / ENG:** inscripciones 2026 pagadas («2026 RMF CE Madrid…»), separadas por **nacionalidad** (española / otras). Se llaman «BBDD 2026» y el idioma va como diseño en la caja.
    - **Unpaids:** inscripciones 2027 en «Unpaid». **Duplicado** = mismo jugador y mismo producto (otra unpaid o una inscripción activa).
    - **Prerreservas:** «Reservation Payment Completed». Salen solas cuando el jugador o el email del tutor ya tiene inscripción 2027.
    - **Estado «Inscrito»** automático cuando el jugador o el email del tutor tiene inscripción 2027 activa.
    - **Historial de contactos** de cada persona (colección `attc`, un documento por persona; protegida con historial y papelera): fecha, estado, vía (teléfono, WhatsApp, email, en persona, otros), si les contactamos o nos contactaron, qué dijeron y quién lo hizo. Sin límite de rondas. Se edita con permiso de edición en Base de datos o Limpieza.
    - **Importar Excel** (solo administrador): sube el Excel «Master BBDD Call Center» (.xlsx); se leen las pestañas «BBDD …» y se cruzan por el **código** de la inscripción 2026. Se guarda en un solo documento (`attc/x-b26`); esos contactos salen con la marca «Excel» y no se corrigen. Los leads se importarán cuando estén en el CRM.
  - **Limpieza:** mismo diseño que Registros (Madrid por semanas, Nacionales, Institucionales); en Madrid no se agrupa por modalidad pero sale el dato. Dos cajas: **Pendientes** y **Completadas**. Completada = **pago al día** (en cualquier fase; no está atrasado) **y** casilla «Comprobación documentos» marcada en el CRM. Al pulsar un jugador se abre su historial de contactos, editable con permiso; también se ven los contactos de sus incidencias.
  - **Estadísticas:** resumen de cada lista (total, gestionados, pendientes, % avance, inscritos, % inscritos, estados por ronda y ATT), gestiones por fecha, contacto con las inscripciones 2027 (% contactadas, por vía, les contactamos / nos contactaron; incluye Limpieza, Incidencias y tickets) y **tickets de Zoho Desk** (solo lectura, desde el 01/09/2026). El token de Zoho necesita `Desk.tickets.READ,Desk.basic.READ`.
- 18/11: **Contabilidad › Agentes** (decisiones de Pau). Permiso nuevo: Contabilidad › Agentes.
  - Inscripciones con el campo **Agencia** del CRM: Soccer Camps (Soccer Camps International, Stephane), Soccer Travel (Ismain) y **Ertheo** (ACCOM CONSULTING SPAIN S.L.). Caja «Todas» y una por agencia.
  - **Comisión por semana** según programa y modalidad (Half day 5 %, Full day ONE 7 %; Residential y MAX por tramo de participantes de esa agencia: 1–30, 31–60, 61+; tablas distintas para Soccer Camps/Soccer Travel y Ertheo). El tramo es el del número de participante de la agencia por orden de inscripción, **sin efecto retroactivo**. Se calcula sobre el importe de cada semana en el CRM. **Los extras no llevan comisión** (íntegros para nosotros).
  - **Precio del software** = semanas con la comisión descontada + extras. Dos cajas: **Pendientes de revisión** (Oli cambia el Total en el CRM a mano) y **Comisión aplicada** (Total del CRM = precio del software). Si después vuelve a descuadrar, sale en rojo dentro de Comisión aplicada (colección `agent`).
  - **Total comisión aplicada − Liquidado = Pendiente de liquidar.** Las liquidaciones se apuntan a mano por agencia: cantidad, fecha, nota y quién (colección `agliq`, protegida).
  - **Descargar Excel** por agencia: niño, código, programa, semanas, precio, % y comisión aplicada, extras y lo que tiene que pagar; al final el desglose total, lo liquidado y lo pendiente.
  - **Tabla de comisiones:** botón fijo en la esquina inferior derecha.
- 18/11: **Botón «Atrás» en todo el software** (decisión de Pau). En la barra de arriba, a la izquierda de dónde estás; sale en todas las pantallas menos en Inicio.
  - Primero cierra lo que esté abierto encima (ficha, historial de contactos, incidencia, tabla de comisiones, editor o descarga de horarios, cambiar contraseña); con un panel abierto, el botón queda por encima del fondo oscuro.
  - Si no hay nada abierto, **sube un nivel**: Registros › semana › modalidad → semana → Registros → Temporada → Inicio; Horarios/Equipos › semana → Horarios/Equipos → Operativa; Base de datos › lista → Base de datos → Atención al público; Limpieza › semana → Limpieza; Contabilidad, Facturas, Ingresos → Administración; los bloques → Temporada.
  - Si hay algo escrito sin guardar, pregunta antes: «Tienes cambios sin guardar. ¿Salir igualmente?».
- 18/11 (tarde): **Correcciones de Atención al público y Agentes.**
  - **Confirmaciones dentro del software:** borrar un contacto o un pago, y salir con cambios sin guardar, piden confirmación en una ventana propia (el aviso del navegador no funciona dentro de claude.ai y por eso «Borrar» no hacía nada). En el formulario: Guardar, Cancelar y «Borrar contacto» (rojo, a la derecha). Solo quien tiene edición puede borrar.
  - **Historial del Excel:** volcado en la demo. En producción se carga con «Importar Excel» (administrador) una vez publicado. Las rondas del Excel cuentan como llamadas (teléfono, les contactamos).
  - **Limpieza:** una semana o sede con todas las inscripciones completadas sale en verde con un ✓.
  - **Estadísticas más visuales:** fichas de color con los datos clave (registros, gestionados, inscritos, llamadas), anillos de avance e inscritos, barras por estado y por ATT, **Llamadas** (total, hoy, 7 días, media, últimos 30 días, por ATT y por ronda), contacto con las inscripciones 2027 (anillo, vías, quién inició) y **Emails** (tickets de Zoho Desk por mes, estado, canal e idioma). Zoho Desk no tiene llamadas registradas: las llamadas salen de los contactos por teléfono.
  - **Agentes · pagos recibidos:** el bloque «Pagos recibidos» está siempre visible bajo los totales, con «+ Apuntar pago recibido». Con «Todas» se elige la agencia en el formulario.
- 18/11: **Volcado automático del Excel en el software real.** El historial de llamadas de las BBDD 2026 del «Master BBDD Call Center» (1.471 personas, 1.468 contactos) va con la función (`functions/campus_api/seed/attc_x-b26.json`) y se carga solo, una única vez, la primera vez que alguien abre Base de datos después de publicar (marca `seed_attc_xb26` en CEMeta). A partir de ahí se trabaja desde el software. «Importar Excel» sigue disponible para el administrador.
- 18/11: **Volcado de los Excel de Unpaids y Prerreservas** («LLAMADAS UNPAIDS», pestañas UNPAIDS OCT y NOV; «Pre reserva 2027»). Va con la función (`seed/attc_x-27.json`) y se carga solo una vez (marca `seed_attc_x27`).
  - Unpaids: se cruza por el «ID de registro» (zcrm_…). 296 inscripciones y 584 contactos; «TRASH» queda como estado «Trash». Todas esas inscripciones ya están en Trash en el CRM: la lista de Unpaids muestra las que siguen sin pagar y, al final, las que están en Trash y tienen llamadas, con la marca «En Trash».
  - Prerreservas: se cruza por el nombre de la application. 47 con contacto (el Excel no trae estado: «nc», «no da tono» o «ha colgado» = No contesta; una sede en la fecha = Otras sedes; el resto = En su tejado). No se encontraron en el CRM como prerreserva: Diego Vallejo Deras, Matías Fuentes Moscoso y Dominic Turculet (cancelada).
- 18/11: **Corregido el aviso de cambios entre usuarios.** Desde el 12/11, al guardar algo no se avisaba a los demás (la caché en memoria de «changes» no tenía el ROWID y `meta.set` fallaba con «Identificador no válido»); los cambios solo se veían al recargar. `store.js` ya lee el ROWID real al guardar.
- 20/11: **Feedback de ATTP (Carla) aplicado** (decisiones de Pau).
  - **Enlaces:** en el historial de cada persona (Base de datos y Limpieza), botón **«Abrir en el CRM»** (abre la application) y **«Abrir ticket en Desk»**: abre Zoho Desk en «nuevo ticket» del departamento de su sede (Campus Experience Madrid, Campus Nacionales o Campus Institucionales) y copia el email del tutor para pegarlo. El software no escribe en Desk.
  - **Unpaids:** solo las inscripciones en «Unpaid». Las que pasan a Trash o a otra fase salen de la lista; su historial se guarda y sigue contando en Estadísticas. **Duplicado** = el jugador tiene otra inscripción 2027 en cualquier fase y de cualquier producto (otra unpaid, 1st payment, paid…), por jugador del CRM o por nombre. Barra de **sedes** como en Contabilidad (abre en «Todas»), según el evento.
  - **Prerreservas:** desaparecen cuando el jugador, el email del tutor o el **nombre del jugador** ya tiene inscripción 2027 activa.
  - **Hermanos y familia:** al apuntar un contacto nuevo, el software propone las demás personas de la misma lista con el mismo teléfono, email o nombre de tutor («Apuntar también en…», marcadas por defecto) y guarda el mismo contacto en todas.
  - **Limpieza, documentación** en cuatro estados con los campos del CRM «Form 2» y «Comprobación documentos»: **No enviada** (Form 2 vacío), **Pendiente de revisión** (Form 2 marcado, sin nada apuntado), **Incompleta** (Form 2 marcado y documentación pendiente apuntada) y **Completa** (comprobación marcada). La documentación pendiente se marca en el software (colección `attc`, campo `docs`; el CRM no se toca): DNI del tutor, seguro médico, certificado de nacimiento, foto del participante, salida sin acompañante y autorización de medicación. Sin Form 2 o sin revisar: «Falta toda la documentación». En Completa: «No falta nada», pero se puede marcar salida sin acompañante o autorización de medicación; si hay algo marcado **va a Pendientes**. Se marca en el panel de Limpieza y en la ficha (sección Documentación), con permiso de edición en Base de datos o Limpieza.
  - **Completada** = pago al día + documentación Completa sin nada pendiente.
  - **Condiciones médicas:** aviso «Revisar condiciones médicas» (sin mostrar el contenido) en la fila y en el historial de quien tenga rellena la especificación de condiciones médicas.
  - **Filtros** de Limpieza: pago (al día / atrasado), documentación (cuatro estados y «Revisar condiciones médicas»). **Ordenar** por nombre, por apellido (todo lo que va después del primer nombre) o por fecha de relleno del formulario («Fecha rellenado CE Form», la más antigua primero).
  - **Estadísticas:** los nombres del Excel se unen con los del software y salen completos: Bea = **Beatriz de Miguel**, Katia = **Katia Ramajo**.
  - «Cambios pendientes» del documento de Carla: no se hace.
- 20/11: **Segundo volcado del «Master BBDD Call Center»** (pestañas BBDD extranjeros y BBDD españoles; 1.522 personas, 1.520 contactos, 52 contactos más que el día 18). Va con la función y sustituye al anterior: cada versión del volcado (campo `at`) se carga una sola vez y solo si es más nueva que la guardada (marca `seed_attc_xb26@<fecha>` en CEMeta). Lo apuntado en el software no se toca; si un contacto está en el Excel y en el software (mismo día y estado) sale una sola vez. **Desde este volcado ya no se apunta nada en el Excel.**
- 20/11: **Token de Zoho con Zoho Desk.** Pau generó un refresh token nuevo con los scopes de Desk y lo puso en `campus_api`. El token de acceso que se guarda en CEMeta (`zoho_at`, compartido por `campus_api` y `dashboard_api`) seguía siendo el del refresh token anterior, sin permiso de Desk. Ahora el token guardado lleva la huella del refresh token que lo generó y solo se reutiliza si coincide: al cambiar el refresh token en las variables de entorno se pide uno nuevo solo. **Las dos funciones deben tener el mismo `ZOHO_REFRESH_TOKEN`.**
- 20/11: **Form 2 y Form 3: lectura revisada con datos reales** (decisiones de Pau).
  - El Form 2 rellena documentos, dieta, alergias, condiciones médicas, consentimientos, autorizados para recogida (módulo Personas Autorizadas) y «Compartir grupo con». Fecha de nacimiento, sexo, posición y talla vienen de la inscripción.
  - **Compartir grupo:** el Form 2 lo guarda al principio de **Observaciones** como «Compartir grupo con: …». **Solo cuenta si el nombre coincide con un inscrito 2027** (se separan varios nombres por comas, «y», «and»; se quitan palabras como «with his brother», «su hermano»). Coincidencia clara (nombre y apellido, o el nombre de un hermano de la misma familia) = petición en la ficha y en Equipos. Parecido (una letra distinta, un solo apellido…) = sale marcado **«Confirmar»** para revisarlo a mano. «Sí», «No», «TBC» y nombres que no están inscritos se ignoran: no son peticiones.
  - **Form 3 = extras:** servicios de bus y material (equipación, jersey, mochila). Todo llega como productos de la inscripción y **se suma por «Cantidad»** (vacía = 1).
  - **Bus (corregido el mismo día):** el servicio contratado está en **cada línea de programa y semana**, campo «Servicio de autobús» (p. ej. «Zona Santiago Bernabéu», «Ciudad Real Madrid», «Residencia»); el transfer, en «Servicio transfer aeropuerto» (Sí/No) de esa semana. Se muestra así en todos lados: ficha (cada semana contratada y Servicios), Registros (columna «Servicio de bus» de esa semana) y Operativa › Buses. El producto de bus es el cobro y se comprueba: semanas con servicio de interno = cantidad de «Autobus interno»; de no interno = cantidad de «Autobus No Interno» («Residencia» no entra en la comprobación). Si no cuadra: aviso rojo «Bus sin cuadrar» con el motivo. Los campos antiguos Bus ida / Bus vuelta / Nº noches extra ya no existen.
  - **Noches extra:** por producto «Interno noche extra» (cantidad y fecha si la trae). Las 95 que aparecían en el CRM eran todas de pruebas en Trash/Refund/Unpaid.
  - **Equipaciones con totales separados** (ficha, Registros y CSV): blanca (pack + extra «Uniforme Oficial Adidas»), light blue (pack), portero, mochila y jersey. El material extra cuenta en la primera semana del jugador.
  - **Limpieza:** se ordena y se muestra por **fecha de inscripción** («Fecha rellenado CE Form» si viene; si no, la creación de la inscripción).
  - **Segovia institucional es de pruebas:** no se incluye en ningún sitio.
  - Se quitan de la ficha los campos que no pregunta ningún formulario (rooming, viaja solo, ha participado antes).
- 20/11: **Registros: el buscador de jugadores vuelve a funcionar.** El estilo del desplegable de Pagos (`.pres`, posición absoluta) se aplicaba también al de Registros y sacaba los resultados de la pantalla; ahora va solo dentro de `.psearch`.
- 20/11: **Operativa › Buses** (nueva; permiso Operativa › Buses › Madrid, lo asigna Pau). Mismo esquema que Registros: banda con participantes con bus, semanas con bus, total por servicio, transfer y «bus sin cuadrar»; Madrid de la Week 1 a la 9 (Nacionales e Institucionales no tienen bus) con participantes con bus y barra por servicio. Dentro de la semana, un bloque por servicio de bus y otro de Transfer aeropuerto, con participante y código, modalidad, año, tutor y teléfono y el estado del pago del bus; buscador; al pulsar se abre la ficha. Pendiente para más adelante: coordinar con la pestaña Buses de Horarios (recogida y regreso con el número real de pasajeros).
- 20/11: **Buses: filtro por servicio.** Botones «Todos los servicios», uno por cada valor del desplegable «Servicio de autobús» del CRM (Zona Santiago Bernabéu, Ciudad Real Madrid, Residencia) y «Transfer aeropuerto», con el número de semanas contratadas de cada uno. Filtra las cajas de las semanas y los bloques dentro de la semana. Si en el CRM aparece un servicio nuevo, se añade solo. A 20/11 hay 3 inscripciones activas con bus (todas Zona Santiago Bernabéu).
- 20/11: **Barra lateral: Horarios, Equipos y Contabilidad son plegables** dentro de su bloque. Al abrir Operativa solo se ven los apartados (Horarios, Equipos, Buses, Incidencias); las semanas y sedes de Horarios y Equipos se despliegan con su flecha o al entrar en ese apartado (solo se abre el apartado en el que estás). Igual con Contabilidad en Administración.
