# Reglas de creación de horarios · Campus Experience

Documento de Pau (29/10/2026), copiado tal cual para que no se pierda ninguna regla. Al final está el estado de implementación y las preguntas abiertas.

---

**Instrucciones generales para Claude**

**Objetivo.** Actualizar la lógica y la presentación del sistema de creación de horarios del CRM de Operativa y Planificación de Campus Experience conforme a todas las reglas funcionales recogidas en este documento.

**Regla de integridad.** Debes aplicar todas las instrucciones de este documento y conservar sus condiciones, capacidades, horarios, duraciones, prioridades, excepciones y dependencias. No debes omitir requisitos ni sustituirlos por criterios genéricos. Si detectas contradicciones, ambigüedades o datos que requieren confirmación, identifícalos expresamente y no los resuelvas unilateralmente.

**Implementación.** Revisa la implementación actual del CRM antes de realizar cambios. Integra estas reglas en la solución existente y evita alterar funcionalidades ajenas al alcance de esta actualización. Cuando una regla dependa de un ejemplo o archivo externo mencionado en las instrucciones, comprueba si está disponible en el contexto de trabajo; si no lo está, solicita el material necesario y no inventes sus datos.

## 1. Estructura y diseño de los horarios
- Las marcas horarias del lateral del horario deben aparecer cada 15 minutos.
- Todas las actividades y todos los horarios deben ajustarse a cuartos de hora: en punto, y cuarto, y media o menos cuarto. Deben evitarse horas como y veinte, menos cinco u otras que no respeten estos intervalos.
- Utiliza la gama de colores disponible en el CRM y aplica los siguientes criterios: los entrenamientos y los partidos deben tener un tono verdoso; la piscina, azul claro; las actividades, tonos rosas; y la preparación física, un tono verdoso diferente del utilizado para entrenamientos y partidos.
- En el apartado de ocupación, separa la información en cuatro categorías: COMEDORES, PISCINAS, ACTIVIDADES y CAMPOS. En cada categoría debe poder consultarse la ocupación de cada instalación correspondiente, sin mezclar todas las ocupaciones en una única vista.
- Añade una pestaña llamada «Buses» junto a las pestañas «Instalaciones» y «Ocupación». En ella deben mostrarse los desplazamientos y el trayecto de cada equipo en cada autobús. Debe incorporarse como referencia un ejemplo de buses de un horario de 2027.
- Los horarios deben respetar siempre la estructura de los grupos. Cada grupo estará compuesto normalmente por tres equipos con el mismo nombre. Los tres equipos de un mismo grupo deben tener exactamente el mismo horario. Por ello, debe ser posible visualizar los horarios agrupados, sin necesidad de mostrar una columna individual para cada equipo del grupo.
- Cuando el número total de equipos no permita formar todos los grupos de tres, se podrá crear algún grupo de cuatro equipos o de dos equipos.
- Todos los equipos internos deben tener una actividad «Wake Up» al comienzo de cada día. Esta actividad nunca puede comenzar antes de las 7:00 h.
- Todos los equipos externos deben tener al comienzo de cada día el «Check-In» correspondiente de Fleming y de la Sede.
- **Minimización de desplazamientos diarios:** como criterio general de planificación, se debe minimizar el número de desplazamientos que realiza cada grupo a lo largo del día, evitando cambios de sede o de instalación que no sean necesarios. La creación de horarios debe priorizar la agrupación de actividades en una misma ubicación, siempre que sea compatible con el resto de las reglas, las capacidades de las instalaciones y las necesidades operativas del Campus.
- **Permanencia de los equipos de media jornada en una misma sede:** los equipos de media jornada deben realizar toda la actividad de la mañana en la misma sede, evitando desplazamientos entre sedes durante ese periodo. Esta condición debe considerarse un criterio de planificación que debe respetarse al asignar entrenamientos, partidos, actividades, comidas y demás franjas horarias que correspondan.

## 2. Preparación física
- Solo tendrán sesiones de preparación física los equipos de MAX INTERNOS y MAX EXTERNO.
- Cada uno de estos equipos tendrá una sesión de preparación física de una hora de duración, de lunes a jueves.
- Si la sesión se realiza en Valdebebas, debe desarrollarse dentro de un campo. Todas las sesiones de preparación física que se programen en Valdebebas deben realizarse en el mismo campo y colocarse consecutivamente unas a continuación de otras. Preferiblemente, se programarán en horario de mañana.
- No puede haber más de un equipo realizando preparación física al mismo tiempo.
- Si la sesión de preparación física se realiza en Santa Ana o en UEM, debe desarrollarse fuera del campo.

## 3. Campos
- En los campos de F11 caben seis equipos por turno de entrenamiento. Todos los campos de Valdebebas, Luis Aragonés, UEM y Villa son de F11.
- En los campos de F7 caben tres equipos por turno de entrenamiento. Uno de los campos de Santa Ana es de F7.
- Los campos de Valdebebas disponibles son: 5, 6, 8, 9 y 10.
- El orden de prioridad de los campos de Valdebebas es: campo 9, campo 8, campo 6, campo 5 y campo 10. Si se utilizan menos de cinco campos, la ocupación debe priorizarse siguiendo ese orden.
- Los campos de Santa Ana son: campo F11 y campo F7.
- La prioridad de los equipos para ocupar los campos de Valdebebas es la siguiente, en este orden: MAX JORNADA COMPLETA, ONE JORNADA COMPLETA, ONE MEDIA JORNADA, MAX INTERNO y MAX EXTERNO.
- Todos los equipos de todos los programas deben entrenar en Valdebebas al menos dos días por semana (pero basta con que sea un entrenamiento).
- Debe procurarse siempre la ocupación completa de los campos y evitar dejar franjas intermedias libres de más de 15 minutos.

## 4. Piscinas
- En UAM, la capacidad máxima por hora es de 130 participantes en la piscina interior y de 65 participantes en la piscina exterior.
- Cada equipo debe acudir íntegramente a una misma piscina. No se puede dividir a los participantes de un equipo entre la piscina interior y la exterior.
- En UEM, la capacidad máxima de la piscina es de 100 participantes.
- Los equipos externos de jornada completa, tanto MAX como ONE, deben acudir siempre a la piscina de UAM.
- Los equipos internos acudirán a la piscina de UAM cuando estén alojados en RESA y a la piscina de UEM cuando estén alojados allí.
- La actividad de piscina debe durar entre 45 y 60 minutos.
- Siempre deben añadirse 15 minutos de vestuarios antes y 15 minutos después del tiempo efectivo de piscina.

## 5. Entrenamientos y partidos
- Todos los entrenamientos y partidos tienen una duración de una hora.
- Todos los equipos internos y los equipos de jornada completa deben tener cada día dos sesiones de entrenamiento y una sesión de partidos.
- Los equipos de media jornada deben tener cada día una sesión de entrenamiento y una sesión de partidos.
- Debe intentarse evitar la programación de entrenamientos entre las 14:30 y las 15:45 h. Si fuera necesario programar un entrenamiento o un partido dentro de esa franja, debe marcarse en rojo para que la responsable pueda aprobarlo o rechazarlo.

## 6. Actividades
- Las franjas de actividades pueden durar «entre 1 h y 30 minutos», tal como se indica en el texto original. La formulación es ambigua y debe conservarse como requisito pendiente de aclaración: antes de imponer una interpretación concreta en la lógica de programación, debe confirmarse qué intervalo de duración se quiere expresar.
- Las actividades de 1 hora y 45 minutos se denominan «ACTIVIDADES EXPERIENCE» y requieren un espacio específico, que debe designarse como instalación para poder programarlas.
- Las actividades de 30 minutos se denominan «FUN» y no requieren un espacio ni una instalación para llevarse a cabo.
- Los juegos a desarrollar en el tiempo de actividades experience son: Gagaball, Dogeball, Master, Futtenis.

### 6.1. Espacios para actividades Experience en Valdebebas
- GAGABALL: campos 5, 6, 8 y 9.
- DOGEBALL: campos 5, 6, 8 y 9.
- MASTER: campos 5, 6, 8 y 9.
- FUTTENIS: campos 5, 6, 8 y 9.
- Parking Di Stéfano: se puede utilizar cuando se esté utilizando el campo 10.
- Kiosko 9: Uso habitual.
- Kiosko 7: se puede utilizar cuando se esté utilizando el campo 10 o el campo 8.
- Todos los equipos deben tener al menos una actividad Experience al día.
- En cada espacio de actividad de Valdebebas puede estar, como máximo, un grupo; un grupo está compuesto normalmente por tres equipos.
- No se puede utilizar un espacio de actividad Experience asociado a un campo de Valdebebas si ese campo no se está utilizando para entrenar ese mismo día o durante esa misma semana.
- Los equipos internos deben realizar el Tour BNB un día por semana, entre el martes y el jueves.
- El Tour BNB debe tener una duración de entre 1 hora y 45 minutos y 2 horas y 30 minutos.
- El día en que un equipo realice el Tour BNB, puede no tener una sesión de piscina ni horas de actividades. No obstante, siempre debe mantener las dos horas de entrenamiento, el partido y la sesión de preparación física que le correspondan.

### 6.2. Veladas Internos
- Tienen una duración de entre 1h y 15´ o 1h y 45´.
- Se llevarán a cabo siempre después de la cena.
- Solo se incluyen en los equipos de internos.
- Se desarrollan en la residencia donde se esté residiendo esa semana.
- No hace falta añadir las veladas a los espacios de actividades.
- Deben realizarlas todos los equipos internos del mismo programa a la vez.

## 7. Nomenclatura
- Valdebebas = VBB.
- Residencia UAM = RESA.
- Residencia XIOR UEM = UEM.
- Campo Santa Ana F11 = S.A. - F11.
- Campo Santa Ana F7 = S.A. - F7.
- Campo Luis Aragonés = L.A.
- Bernabéu = BNB.
- Campos Villaviciosa de Odón = VILLA.

## 8. Comedores
- RESA: solo acudirán los equipos internos durante las semanas en las que estén alojados allí. Ocupación máxima: 120 personas.
- UEM: solo acudirán los equipos internos durante las semanas en las que estén alojados allí. Ocupación máxima: 250 personas.
- UAM: acudirán todos los equipos de jornada completa hasta completar la disponibilidad. Ocupación máxima: 300 personas.
- Valdebebas: pueden acudir equipos de jornada completa, pero únicamente cuando no haya espacio disponible en UAM.
- Debe intentarse que cada grupo —de tres o cuatro equipos con el mismo nombre, por ejemplo, Mbappé 1, Mbappé 2 y Mbappé 3— entre al comedor con intervalos de 15 minutos. Como máximo, podrán coincidir dos grupos en una misma franja de entrada.

## 9. Horarios y límites de jornada
- Check-In de Fleming: 7:30 h los lunes y 8:15 h el resto de la semana.
- Check-In de la Sede: 8:00 h los lunes y 8:30 h el resto de la semana.
- Check-Out de media jornada en la Sede: 13:15 h.
- Check-Out de media jornada en Fleming: 13:30 h.
- Check-Out de ONE jornada completa en la Sede: 18:00 h.
- Check-Out de ONE jornada completa en Fleming: 18:15 h.
- Check-Out de MAX jornada completa en la Sede: 19:00 h.
- Check-Out de MAX jornada completa en Fleming: 19:15 h.
- Los equipos internos deben tener el «Curfew Time» con una hora de inicio comprendida entre las 22:30 y las 23:30 h.
- Los equipos internos pueden desayunar a partir de las 7:30 h.
- Los entrenamientos —es decir, el uso de los campos— deben comenzar siempre a las 9:15 h los lunes y a las 9:00 h el resto de la semana.
- Los equipos de ONE jornada completa deben terminar los entrenamientos, como máximo, a las 17:45 h.
- Los equipos de MAX jornada completa deben terminar los entrenamientos, como máximo, a las 18:45 h.
- Los equipos de ONE media jornada deben terminar los entrenamientos preferiblemente a las 13:00 h. Si fuera necesario, se puede autorizar una excepción para terminar a las 13:15 h; en ese caso, el horario debe marcarse en rojo para que la responsable lo apruebe.
- Los equipos internos pueden entrenar hasta las 19:30 h.

## 10. Tiempos de trayectos y desplazamientos
Debe asignarse un intervalo de 15 minutos entre actividades en los siguientes casos:
- Entre la llegada del autobús y el comienzo del entrenamiento en cualquier campo, y viceversa.
- Entre el comedor de RESA o UAM y la piscina de UAM, y viceversa.
- Entre cualquier entrenamiento en Valdebebas y el comedor de Valdebebas, y viceversa.
- Entre la piscina de UEM y la piscina de UEM o el comedor de UEM, y viceversa. Esta relación se mantiene tal como aparece en las indicaciones originales; debe confirmarse si la primera referencia a la piscina de UEM es correcta.

### 10.1. Duración de los trayectos en autobús
- VBB–UAM y viceversa: 15 minutos.
- VBB–Fleming y viceversa: 15 minutos.
- VBB–S.A. y viceversa: 15 minutos.
- VBB–L.A. y viceversa: 15 minutos.
- VBB–BNB y viceversa: 15 minutos.
- UAM–BNB y viceversa: 30 minutos.
- UAM–S.A. y viceversa: 15 minutos.
- UAM–L.A. y viceversa: 15 minutos.
- UEM–VBB y viceversa: 45 minutos.
- UEM–BNB y viceversa: 45 minutos.
- UEM–VILLA y viceversa: 15 minutos.

## 11. Comidas
- Los equipos de media jornada solo tendrán un snack al día.
- Los equipos de jornada completa tendrán un snack de mañana, la comida y un snack de tarde.
- Los equipos internos tendrán desayuno, snack de mañana, comida, snack de tarde y cena.
- Las comidas y las cenas deben durar 30 minutos.
- Los snacks siempre duran 15 minutos.

## 12. Ceremonia de clausura
- La ceremonia de clausura se realizará siempre los viernes, en todos los programas.
- Tendrá una duración de 45 minutos y debe realizarse siempre al final de la jornada de los equipos.
- Todos los equipos de la misma jornada y del mismo programa deben realizar la ceremonia a la vez.
- La ceremonia se realiza en un campo. Por ello, debe reservarse el campo 9 exclusivamente para la ceremonia durante todo el día, desde las 11:30 hasta las 19:00 h.
- Para los equipos de media jornada, la ceremonia se programará de 12:15 a 13:00 h o de 12:30 a 13:15 h. La primera opción es la preferible.
- Para los equipos de ONE jornada completa, la ceremonia debe realizarse entre las 17:00 y las 18:00 h.
- Para los equipos de MAX jornada completa, la ceremonia debe realizarse entre las 18:00 y las 19:00 h.
- Para los equipos internos, la ceremonia se realizará en la residencia. Si durante esa semana están alojados en RESA, se realizará en el pabellón de UAM; si están alojados en UEM, se realizará en el campo de fútbol de UEM.

## 13. Buses
- Debe intentarse que el gasto total en autobuses sea el menor posible. Para ello, los trayectos deben agruparse todo lo posible en un mismo autobús.
- El coste de los autobuses varía en función del tamaño del vehículo, las horas durante las que está disponible y si se trata de un trayecto unitario. Debe utilizarse como referencia la tabla de precios de Excel de Juliá mencionada en las indicaciones.
- El tamaño del autobús debe elegirse teniendo también en cuenta el número de participantes y el ratio de cada equipo. Para calcular las plazas necesarias, hay que considerar que en el mismo autobús viajan, por cada grupo, un coach de cada equipo del grupo, un Head para todo el grupo y un support del grupo.
- Si un trayecto termina en UAM y el siguiente también comienza en UAM, ambos trayectos pueden solaparse y programarse consecutivamente.
- Si un trayecto termina en VBB y el siguiente comienza en UAM, los trayectos no pueden programarse consecutivamente con solapamiento: debe reservarse el tiempo necesario para que el autobús se desplace vacío desde el lugar donde termina un viaje hasta el lugar donde comienza el siguiente.
- La pestaña «Buses» debe mostrar los desplazamientos y el trayecto de cada equipo en cada autobús, y debe tomar como referencia el ejemplo de buses de un horario de 2027 mencionado en el apartado de estructura y diseño.

## 14. Instalaciones: selección por días y franjas horarias
- Debe ser posible seleccionar, dentro de cada semana, los días en los que se dispone de una instalación concreta.
- Por defecto, al seleccionar una instalación, esta debe quedar incluida para todos los días de la semana.
- La persona usuaria debe poder desactivar individualmente los días en los que no quiera utilizar esa instalación.
- También debe ser posible seleccionar una franja horaria específica de uso de una instalación para uno de los días de la semana.

## 15. Materiales y referencias mencionados que deben tenerse en cuenta
- Ejemplo de buses de un horario de 2027, citado como material de referencia para diseñar la pestaña «Buses».
- Tabla de precios de autobuses en un archivo Excel de Juliá, citada como referencia para calcular y optimizar los costes.
- Importante: las instrucciones originales mencionan estos materiales, pero no incluyen sus datos dentro del texto pegado. Antes de implementar la lógica que dependa de ellos, verifica si están disponibles en el contexto de trabajo. Si no lo están, solicita los archivos; no inventes ejemplos, tarifas ni condiciones.

## 16. Verificación antes de dar el trabajo por terminado
Una vez implementados los cambios, comprueba de forma sistemática que la solución respeta todas las reglas anteriores. Como mínimo, verifica lo siguiente:
- La escala temporal aparece cada 15 minutos y todas las horas programadas respetan los cuartos de hora.
- Los colores distinguen correctamente entrenamientos/partidos, piscina, actividades y preparación física.
- La ocupación está separada en comedores, piscinas, actividades y campos.
- Existe la pestaña «Buses» y permite consultar los trayectos y asignaciones de los equipos.
- Los equipos de cada grupo mantienen el mismo horario y se admiten grupos de dos o cuatro cuando corresponda.
- Se cumplen las reglas de preparación física, capacidad de campos, prioridades de uso y mínimo de dos días de entrenamiento en Valdebebas.
- Se respetan las capacidades de las piscinas, la asignación de cada equipo a una única piscina y los tiempos de vestuarios.
- Se cumplen las cantidades diarias de entrenamientos, partidos, actividades Experience, FUN, Tour BNB y comidas que correspondan a cada modalidad.
- Se aplican los horarios de Check-In, Check-Out, Wake Up, desayuno, Curfew Time y los límites de finalización de entrenamientos.
- Se incluyen los tiempos de desplazamiento entre actividades y entre ubicaciones, así como los tiempos en vacío necesarios para los autobuses.
- Se aplican las capacidades y las reglas de escalonamiento de entrada de los comedores.
- La ceremonia de clausura se programa los viernes, con las duraciones, ubicaciones y ventanas horarias indicadas.
- La selección de instalaciones permite elegir días concretos y franjas horarias, manteniendo todos los días seleccionados por defecto.
- Las excepciones que requieren aprobación aparecen marcadas en rojo y no se dan por aprobadas automáticamente.
- Las ambigüedades y dependencias externas se documentan y se solicitan aclaraciones cuando sean necesarias, sin eliminar ni reinterpretar unilateralmente las instrucciones originales.

## 17. Instrucción final
Implementa las mejoras solicitadas en el CRM respetando todas las reglas de este documento. Antes de modificar el código o la configuración, revisa cómo está construido actualmente el sistema y determina dónde deben integrarse los cambios. No elimines funcionalidades existentes que no estén incluidas en el encargo. Si alguna instrucción no puede aplicarse por una limitación técnica, por falta de datos o por una contradicción con otra regla, explica el motivo concreto, identifica el punto afectado y solicita la aclaración necesaria. No des el trabajo por finalizado hasta haber comprobado cada requisito y comunicado cualquier punto pendiente.

## 18. Puntos del texto original que requieren confirmación, sin eliminar el requisito
- En el apartado «Actividades», el texto original indica que las franjas pueden durar «entre 1 h y 30 minutos», mientras que después especifica actividades Experience de 1h y de 45 minutos y FUN de 30 minutos. Se ha mantenido la referencia y se solicita confirmar su interpretación antes de fijar una regla distinta.
- En «Tiempos de trayectos y desplazamientos», el texto original dice «De la piscina de UEM a la piscina de UEM o al comedor de UEM». Se ha conservado la referencia y se solicita confirmar si el primer destino/origen debía ser otro.
- El texto original menciona un ejemplo de buses de un horario de 2027 y una tabla de precios de Excel de Juliá. Estos materiales deben comprobarse o solicitarse si no están disponibles.
- Las reglas de horarios de entrenamientos, clausura y otras actividades deben aplicarse conjuntamente. Si se produce una incompatibilidad real entre requisitos, debe señalarse y consultarse, no resolverse eliminando o priorizando silenciosamente una regla.

---

# Estado de implementación (29/10/2026)

## Materiales
- **Ejemplo de buses 2027:** disponible en «Horarios W4 (cambiar buses) .xlsx», pestaña BUSES (bus, plazas, hora, trayecto, grupo, disposición). Usado como modelo de la pestaña Buses.
- **Tarifas Juliá verano 2026:** «Buses Juliá 2026 - Tarifas Juliá 2026.pdf» (carpeta CLAUDE).

| Plazas | 12 h | 8 h | 6 h | 4 h | Trayecto DR.FL–VBB–UAM | Trayecto DR.FL–VILLA |
|---|---|---|---|---|---|---|
| 72 | 834,00 € | 566,50 € | 418,00 € | 291,50 € | 149,60 € | 158,40 € |
| 60 | 705,00 € | 511,50 € | 385,00 € | 270,00 € | 137,50 € | 148,50 € |
| 54 | 645,00 € | 484,00 € | 368,50 € | 255,00 € | 129,80 € | 141,90 € |

## Fase 1 · hecho (comprobación automática y presentación)
- Escala cada 15 minutos.
- Comprobación de cuartos de hora.
- Colores: verde (fútbol), verde claro (prep. física), azul claro (piscina), rosa (actividades), rosa suave (FUN).
- Ocupación en Comedores / Piscinas / Actividades / Campos.
- Pestaña Buses con trayectos derivados del horario:
  - Agrupación de trayectos iguales en un mismo bus.
  - Encadenado con viaje en vacío cuando hace falta.
  - Plazas = jugadores + 1 coach por equipo + head + support.
  - Coste Juliá: la opción más barata entre disposición y trayectos sueltos.
- Instalaciones con nomenclatura y capacidades del documento:
  - Campos en equipos: F11 = 6, F7 = 3.
  - Comedores en personas: RESA 120, UEM 250, UAM 300.
  - Piscinas: UAM interior 130, UAM exterior 65, UEM 100.
  - Espacios Experience: 1 grupo.
- Días disponibles por instalación (todos por defecto, desactivables) y franja horaria por día.
- Residencia de internos por semana: RESA o UEM.
- Grupos de 2 o 4 equipos en Equipos cuando no salen de 3.
- Avisos en rojo de todas las reglas comprobables. Las excepciones (entrenos entre 14:30 y 15:45, media jornada hasta las 13:15) en rojo con Aprobar / Rechazar; no se aprueban solas.
- Reglas semanales:
  - 2 días en VBB.
  - Tour BNB internos.
  - Veladas a la vez.

## Fase 2 · pendiente
- Nuevo «Crear horario automáticamente» que construya los horarios cumpliendo todas las reglas. Hoy parte del horario tipo de la W4 y solo reparte instalaciones por prioridad y capacidad.

## Respuestas de Pau (03/11/2026) — forman parte de las reglas
2. **Actividades:**
   - Hay dos tipos. **Actividades Experience** duran 1 h o 45' y es obligatoria una al día.
   - **Actividades FUN** duran 30'. No son obligatorias: sirven para rellenar tiempos muertos.
3. **15' libres a pie en UEM:**
   - Piscina UEM ↔ comedor UEM.
   - Comedor UEM ↔ campo UEM.
   - Campo UEM ↔ piscina UEM.
4. Las reglas se aplican conjuntamente; si chocan, se consulta.
5. **Preparación física:** como máximo un grupo a la vez (los 3 equipos de un grupo juntos).
6. **MAX EXTERNO = MAX Jornada Completa.** Prioridad de campos en VBB: MAX JC, ONE JC, ONE MJ, MAX INT, ONE INT.
7. **Lunes, media jornada:**
   - Puede acabar los entrenamientos a las 13:15, pero ni actividades ni entrenamientos empiezan antes de las 9:15.
   - Los espacios Experience están pegados a los campos: no hace falta tiempo de desplazamiento entre Experience y entrenamiento.
8. **Viernes, media jornada:** entrenamiento y partido pueden quedarse en 45' si hace falta, o la Experience en 30'.
9. **Lunes de MAX JC, ONE JC y ONE MJ:** Welcome Pack de 8:00 a 8:45 y Welcome Ceremony de 8:45 a 9:15.
10. **Espacios Experience:** son 16 espacios, uno por juego junto a cada uno de los campos 5, 6, 8 y 9.
11. **Espacio Experience y su campo:** el campo tiene que usarse **ese día**. Si un día no se usa, ese día no se pueden hacer actividades allí.
12. **Kioskos y Parking:**
    - Kiosko 9 y Kiosko 7: Dogeball y Futtenis.
    - Parking Di Stéfano: los 4 juegos.
13. **Experience de los internos fuera de VBB:** la hacen en la residencia, sin espacio concreto.
14. **Trayectos:**
    - Los trayectos que faltan no se usan.
    - RESA–UAM son 15' a pie, pero no debería darse nunca: los internos comen en RESA y las jornadas completas en UAM.
15. Los aforos cuentan solo participantes.
16. **Residencia:** RESA de la semana 2 a la 4; UEM de la 5 a la 8.
17. **Clausura pegada al final de la jornada:**
    - ONE JC de 17:15 a 18:00.
    - MAX JC de 18:15 a 19:00.
    - MJ de 12:15 a 13:00.

## Actualización del 03/11/2026: apariencia y SIMULADOR
- **1.1 Resumen de inscritos más compacto:**
  - Programa y modalidad abreviados (ONE JC, ONE MJ, ONE INT, MAX JC, MAX INT).
  - Participantes y número de equipos, sin sedes.
  - Al pulsarlo se despliegan sus instalaciones.
- **1.2 Días de la semana más pequeños** en Horario y Ocupación.
- **2. Pestaña SIMULADOR:**
  - Se elige la semana y el nº de equipos por programa y modalidad, y se configuran las instalaciones igual que en los horarios reales.
  - Botón «GENERAR HORARIO».
  - Usa **el mismo generador** que los horarios reales.
  - Los datos son ficticios y no tocan inscritos, equipos ni horarios reales.
  - Resultados: Horario, Ocupación, Necesidades (campos, espacios, piscinas, comedores, buses y coste por día) y Buses.

# Estado de implementación (03/11/2026)
- **Generador automático (fase 2) hecho, el mismo para real y simulador:**
  - Orden de prioridad: MAX JC, ONE JC, ONE MJ, MAX INT, ONE INT.
  - Prueba variantes de horas, orden y sede, y reserva campos, espacios Experience, preparación física, comedores (aforo + máx. 2 grupos entrando a la vez) y piscinas.
  - Reserva por la mañana campos de VBB para la media jornada mientras las jornadas completas quepan.
  - Evita entrenar entre 14:30 y 15:45. Si no hay más remedio, lo marca para aprobar.
  - Rellena huecos con FUN.
  - Velada a la vez por programa.
  - Tour BNB un día de martes a jueves; día con 2 entrenamientos en VBB en semanas de RESA y UEM.
- **Prueba:**
  - Simulación W4 con 15 ONE JC, 12 MJ, 6 ONE INT, 6 MAX JC y 9 MAX INT: lunes a viernes completos y sin avisos.
  - Con el volumen real de la W4 (26 MJ, 26 JC, 9 MAX JC, 8 ONE INT, 13 MAX INT) no caben algunos grupos (sobre todo MJ el viernes, por la reserva del Campo 9) y salen entrenamientos de JC para aprobar. Es la señal para activar más campos o sedes.

# Puntos abiertos (03/11/2026)
1. **Domingo y sábado de los internos:** no hay reglas. El generador no los crea y salen «Por hacer». ¿Qué se hace esos días (llegada y salida)?
2. **Clausura de los internos el viernes:** la he puesto después de la cena, a la vez para todo el programa, y sin velada ese día para no pasar el Curfew de las 23:30. ¿Correcto?
3. **Plazas en el simulador:** estimadas en 16 por equipo ONE y 14 por equipo MAX. ¿Otro valor?
4. **Buses:** se agrupan trayectos iguales y se encadenan con viajes en vacío; el coste sale de las tarifas Juliá. Es una estimación: conviene compararla con una semana real.

## Respuestas de Pau a los puntos abiertos (03/11/2026, 13:40) — forman parte de las reglas
1. **Fines de semana:** de momento no se generan horarios de sábado ni domingo. Pau dará las reglas cuando haga falta. *Hecho:* los fines de semana ya no aparecen en Horarios ni cuentan para completar la semana.
2. **Clausura de ONE y MAX internos:** el viernes, al terminar los entrenamientos, a la misma hora para los dos programas.
   - ONE INTERNO hace check-out el viernes de 20:00 a 20:30; su horario del viernes acaba con ese check-out.
   - MAX INTERNO hace check-out el sábado entre las 10:00 y las 11:00; su viernes sigue hasta el Curfew.
   - *Hecho:* clausura de 45 min en la residencia (Pabellón UAM con RESA, Campo UEM con UEM), a la hora en que vuelve el último grupo. Las sesiones de campo de los internos acaban como tarde para volver a las 19:15.
     - ONE INT: si espera 1 h o más hace «Ducha + Maletas» antes de la clausura. Si no, la hace después, hasta el check-out de 20:00 a 20:30. Nada después.
     - MAX INT: Ducha + Laundry, Cena, Velada a la vez y Curfew.
     - El validador avisa si las clausuras no coinciden, si van antes de acabar los entrenamientos o si falta el check-out.
3. **Plazas en el simulador:** confirmadas, 16 por equipo ONE y 14 por equipo MAX.
4. **Buses:** costes aceptados por ahora; se revisarán a fondo más adelante.
- Pendiente: el check-out de MAX INT el sábado (10:00–11:00) se añadirá cuando se definan las reglas de fin de semana.

## Cambios del 04/11/2026 (documento de Pau: simulador e instalaciones)
- Simulador: el nº de equipos se mantiene al cambiar de vista.
- Simulador: «Descargar horario» (PDF o Excel) del horario simulado generado.
- Instalaciones, iguales en horarios reales y simulador:
  - Estructura INSTALACIÓN PRINCIPAL → ESPACIOS → FRANJAS HORARIAS, con las 8 instalaciones principales predefinidas.
  - Botones «Añadir espacio» y «Quitar instalación», y desplegable «Añadir instalación» (solo las que falten).
  - Espacios Experience de VBB: solo los predefinidos, según los campos añadidos esa semana (relación campo ↔ espacio ya definida) y sin duplicados. Dogeball y Futtenis · Kiosko 9 no dependen de ningún campo, así que siempre se pueden elegir.

## Cambios del 04/11/2026 (2.º documento de Pau)
- Piscinas: intentar no programar turnos antes de las 10:30. El generador lo aplica como preferencia: solo los pone antes si no hay otra opción.
- Avisos con detalle en una ventana emergente (qué pasa, por qué y cómo solucionarlo).
- Colores: Experience en amarillo pastel medio y FUN en amarillo pastel claro.
- Disponibilidad por días: por defecto todos los días; los días deshabilitados se ven en gris con una X. Las franjas no cambian.

## Cambios del 04/11/2026 (3.er documento de Pau) — iguales en horarios reales y simulador
- **Ocupación completa:** se muestra en amarillo pastel medio (ya no en rosa). «Sobrepasa» sigue en rojo.
- **Turnos de 1 h:** dos entrenamientos seguidos en el mismo campo se ven como dos turnos separados, tanto en el horario del grupo como en la ocupación del campo.
- **14:30–15:30:** no se programan entrenamientos, partidos ni preparación física. Es una prohibición, sin aprobación posible. Desde las 15:30 está libre; se elimina la aprobación de 15:30 a 15:45 (respuesta de Pau).
- **Campos llenos (6 equipos por turno):**
  - El generador coloca los turnos de campo en horas fijas: por la mañana desde el inicio de campos y por la tarde desde las 15:30.
  - Busca que dos grupos compartan turno y premia completar turnos ya empezados, empezando por VBB.
  - Los equipos de un mismo grupo siempre tienen el mismo horario.
  - Si con horas fijas un grupo no cabe, se relaja.
  - Prueba con el simulador W4 (volumen medio): los turnos medio vacíos en VBB bajan de 50 a 34 y los completos suben de 78 a 86.
- **3 horas seguidas** de entrenamiento, partido o preparación física (15 min de margen cuentan como seguido): el generador lo evita. Si ocurre, sale un aviso que requiere aprobación.
- **Aprobaciones:** la ventana del aviso tiene los botones DENEGAR y APROBAR abajo. Funciona también en el simulador.
- **FUN y Experience:**
  - Nunca hay dos FUN seguidas.
  - Con 45 min o más libres se intenta una Experience distinta de las ya hechas.
  - Cada grupo debe hacer al menos una Experience al día.
  - Rotación semanal por Gagaball, Dogeball, Master y Futtenis, con como mucho una repetición en la semana. Si se pasa, sale un aviso de semana.
  - Las «Actividades Experience» de la residencia no cuentan en la rotación.
- **Prioridad de VBB:** no es exclusiva. Todas las modalidades entran en VBB si caben; el orden de prioridad solo decide cuando no hay sitio.
- **UAM, comida y piscina juntas:** recomendación aplicada. Cada trayecto en bus penaliza un poco el horario, así que se agrupan comida y piscina en UAM cuando se puede. La jornada completa ya lo hacía en una sola salida a UAM.

### Punto abierto (04/11)
- **Choque entre 8.1 y 8.3:** con 4 actividades Experience y 5 días, cada grupo hace como mínimo 5 Experience a la semana, es decir, ya una repetición. Añadir otra Experience en los huecos de más de 30 min (8.1) obligaría a repetir más de una vez (8.3).
  - Aplicado provisionalmente: manda 8.3. Solo se añade una Experience extra en un hueco si no supera el máximo semanal (por ejemplo, internos el día del Tour BNB). Si no, el hueco queda con una FUN y un Descanso.
  - Pendiente de que Pau confirme o añada más actividades Experience.
