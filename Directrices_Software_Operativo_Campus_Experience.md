# Directrices · Software operativo Campus Experience

Documento vivo con las decisiones tomadas con Pau (director de Campus Experience) para el software operativo y para el dashboard de registros. Claude debe leerlo antes de crear o modificar cualquiera de los dos y mantenerlo al día cada vez que se tome una decisión nueva.

- Última actualización: 27/10/2026
- Software operativo: artifact «Operativa Campus Experience» → https://claude.ai/artifact/WGfoJZ9KMWvPQkm2J4Pg54
- Dashboard de registros: artifact «Campus Experience 2027 · Dashboard de registros» → https://claude.ai/artifact/EQ3ML11Bgm2A5yX5K5DMKi
- Especificación funcional de referencia: `Software_Operativo_Campus_Experience.docx` (esta misma carpeta)
- Instrucciones de actualización del dashboard: `instrucciones_actualizacion_dashboard.md` (esta misma carpeta)

---

## 1. Forma de trabajar

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
- **Actualización:** tarea programada (ver `instrucciones_actualizacion_dashboard.md`); si algo falla, no se publica a medias.
- **Diseño del dashboard:** es la referencia de diseño del software (ver apartado 3).

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
