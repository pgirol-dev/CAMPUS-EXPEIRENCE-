# Manual del almacén · Campus Experience

Documento vivo: aquí se escribe todo lo que se decide sobre el almacén y la logística (cómo se trabaja, cómo se organiza y qué hace el software operativo). Cada decisión nueva se añade al registro del final con su fecha.

- **Estado:** en definición. Las secciones marcadas como *Propuesta* están pendientes de confirmar por Pau.
- **Responsable del documento:** Pau Girol (Director Campus Experience).
- **Relacionado:** Directrices_Software_Operativo_Campus_Experience.md (software), Reglas_Horarios_Campus_Experience.md (sedes y horarios).

---

## 1. Para qué sirve el almacén

En el almacén se guarda todo el material de Campus Experience. Desde ahí se distribuye a las sedes.

Lo más importante es **saber qué material necesitamos según los inscritos**:
- ropa (equipaciones por tipo y talla);
- mochilas y jerseys;
- welcome packs y todo lo que llevan dentro (botellas, etc.).

## 2. Principios de trabajo (*Propuesta*, 23/11)

1. **Un artículo por cada talla y variante.** «Camiseta blanca» no es un artículo; «Camiseta blanca · talla M» sí.
2. **El stock no se escribe a mano.** Sale siempre de los movimientos: entradas, salidas a sede, devoluciones y recuentos. Cada movimiento guarda quién lo hizo y cuándo.
3. **Kits con escandallo.** El welcome pack y el pack de equipación tienen una lista de componentes. El software multiplica la lista por los inscritos para saber cuánto hace falta de cada componente.
4. **Tres estados del stock:**
   - **Disponible:** libre en el almacén.
   - **Reservado:** apartado para una semana o sede, todavía en el almacén.
   - **En sede:** ya enviado.
5. **Pedir antes de que cierren las inscripciones con una curva de tallas:** reparto de tallas de los inscritos de 2026 aplicado a los inscritos esperados, más un margen de seguridad. Según entran inscripciones, la curva real sustituye a la estimada.
6. **Ubicación con código.** Zonas físicas (recepción, almacenaje, montaje de kits, salida por sede) y código de hueco **zona-estantería-balda** (p. ej. A-02-3). Cada artículo sabe dónde está.
7. **Welcome packs montados con antelación** en la zona de montaje y guardados ya montados. El día de entrega solo se reparten.
8. **Recuentos cíclicos** en vez de un inventario gigante: lo importante (equipaciones y componentes del welcome pack) cada semana en temporada; el resto, cada mes.
9. **Logística inversa:** al cerrar cada semana o campus se registra lo que vuelve de la sede y lo perdido o roto.

## 3. Equipo (*Propuesta*, 23/11)

- **Madrid y nacionales se gestionan desde el mismo almacén y con el mismo equipo** (decisión de Pau, 23/11).

- **Responsable de logística:** lo ve todo y aprueba los pedidos.
- **Almacén:** recibir, ubicar y contar.
- **Preparación y envíos:** montar kits y mandar material a las sedes.

Las funciones pueden recaer en las mismas personas. Los permisos en el software van por apartado y los asigna Pau.

## 4. El bloque «Logística» en el software operativo (estructura aprobada por Pau, 23/11)

Bloque propio en la barra lateral, al nivel de Operativa y Administración, con el nombre **Logística**. **Buses se queda en Operativa.** Apartados en el orden en que se trabaja:

1. **Panel:** alertas de faltantes, próximos envíos a sede y recuentos pendientes.
2. **Necesidades:** se calcula solo desde el CRM (inscripciones activas), por semana, por campus y en total. Incluye ropa por tipo y talla, mochilas, jerseys, welcome packs y sus componentes, y extras del Form 3. Muestra necesidad, stock disponible y **lo que falta**, con la curva de tallas y el margen de seguridad.
3. **Inventario:** catálogo de artículos (talla, ubicación, stock en los tres estados), historial de movimientos y recuentos.
4. **Entradas:** pedidos a proveedor y recepción comprobada contra lo pedido.
5. **Preparación:** montaje de welcome packs y listas de preparación por semana y sede (qué coger y de qué ubicación).
6. **Envíos a sedes:** cada envío confirmado pasa de reservado a en sede. Stock por sede y devoluciones al cerrar.
7. **Configuración:** artículos, kits y sus componentes, ubicaciones, sedes y proveedores.
8. **Peticiones** (aprobado el 23/11): las sedes piden material o cualquier otra cosa cuando lo necesitan; almacén la recibe, responde (aceptada, parcial o rechazada, con comentario) y, si se acepta, la convierte en un envío. Apartado propio porque lo usa otra gente (personal de las sedes) con su propio permiso.

**Datos que ya lee el software** y que usará Necesidades: talla, sexo y posición de la inscripción; extras del Form 3 sumados por cantidad (equipación blanca pack + extra, light blue, portero, mochila, jersey); semanas y modalidad de cada inscrito.

## 5. Reglas de cálculo de necesidades (decisiones de Pau, 23/11)

- **Cada modalidad tiene su welcome pack.** En principio es igual todas las semanas, pero se puede quitar o cambiar algo en una semana concreta.
- **La talla de la inscripción vale para todas las prendas.**
- **La equipación de portero va solo a quien la compra como extra** (Form 3).
- **Curva de tallas:** el equipo la calcula extrapolando el porcentaje de tallas al objetivo de inscritos (así se hizo en 2027 con las sudaderas: 12 % 128, 25 % 140, 22 % 152, 21 % 164, 12 % S, 5 % M, 2 % L, 1 % XL).

### Tipos de kit, kits por modalidad y welcome packs (confirmado por Pau, 23/11)

- **Tres tipos de kit de jugador:** minikit (blanco), light blue y black (negro).
- **Kits por modalidad:**
  - ONE externos: 1 minikit.
  - MAX externos: 1 minikit + 1 light blue.
  - ONE internos: 2 minikits.
  - MAX internos: 1 minikit + 1 light blue.
  - Nacionales: 1 minikit.
  - Institucional: 1 kit, que puede ser minikit o black (se elige por campus o grupo).
- **Welcome pack por modalidad** (cada modalidad tiene el suyo; en principio igual todas las semanas, pero editable por semana):
  - ONE (externos e internos): botella, mochila ONE, gorra.
  - MAX (externos e internos): botella, mochila MAX, gorra, portabotas.
  - Institucional: botella, gymsack, gorra (sin mochila).
  - Nacionales: va por separado aunque de momento lleva lo mismo que ONE externo (por si cambia en el futuro).
- **Medias con cada kit; lanyards y pulseras, uno por participante.**
- **Margen de seguridad:** 5 % por defecto, editable (el Excel antiguo usaba 20 % en welcome packs).
- **Objetivo de la temporada:** 8.000 registros (un registro no es lo mismo que un jugador).

### Kits de staff

- Por función y color: azul royal (monitores, supports, field coordinator), azul navy (coach), burdeos (heads y directores). Externos 1 camiseta + 1 pantalón; internos 2 camisetas + 1 pantalón.
- **Head coach: solo una equipación oficial y es de vuelta.** La devuelve al final de la semana, así que no consume stock (sale y vuelve).
- **Número de staff por función y semana: se pone a mano.** El software propone un valor por defecto con la proporción de Horarios (1 coach por equipo, 1 head y 1 support por grupo) y se puede cambiar. Más adelante saldrá del CRM, cuando el staff esté asignado a personas y cuadrantes.

### Otros

- **Mini almacenes en sede** con stock mínimo (por defecto 20 por talla, 100 lanyards por color…), editable por sede. Cuando baja del mínimo, propone reponer.
- **Serigrafía (Guerrero, Toledo):** es un estado. El material sale «en serigrafía» y al volver pasa de «sin serigrafía» a «serigrafiado».
- **Inventario inicial:** los dos Excel (CONTROL DE ROPA y CONTROL DE MATERIALES). Lo que está con «?» se carga a 0 marcado «Sin contar» hasta el primer recuento.
- **Sedes:** Almacén, VBB, UAM, UEM, Villa, Fleming, Luis A. y Santa Ana, más las de los nacionales. Se pueden añadir y quitar sedes. «Residencia» no es una sede: las residencias son UAM o UEM.
- **Proveedores:** Adidas, FutbolEmotion, Guerrero (serigrafía), China (Curry). Cada pedido lleva quién lo gestiona, fecha, cantidad, estado y ubicación de la mercancía.
- **Peticiones:** las hace el responsable de sede. Cuando esté activo Recursos Humanos y los cuadrantes, el software sabrá quién es el responsable de cada sede.

## 5 bis. Estado en el software (23/11)

- **Construido (fase 1, rama `logistica`):** Panel, Necesidades, Inventario (con el inventario de los dos Excel listo para cargar con un botón) y Configuración.
- **Próximamente:** Peticiones, Entradas, Preparación y Envíos a sedes (con stock mínimo y reposición de los mini almacenes).
- **Cómo se calcula la previsión:** necesidad actual × (objetivo ÷ registros actuales), con las tallas repartidas por la curva de los inscritos 2026 del CRM (13 % 128, 24 % 140, 26 % 152, 17 % 164, 11 % S, 7 % M, 2 % L, 0,5 % XL) hasta que 2027 tenga 500 inscritos con talla.
- **Mochila extra** (corregido por Pau, 23/11): es la que dice el producto. Hoy solo se vende como extra la mochila ONE, también a jugadores MAX, y se cuenta como mochila ONE. Cuando salga a la venta la MAX («Mochila Oficial Adidas MAX»), se sumará a la MAX. No hay más casos: en el CRM solo existe el producto «Mochila Oficial Adidas ONE».
- **Talla de medias** (confirmado por Pau, 23/11): 128 → 31-33, 140 → 34-36, 152 y 164 → 37-39, S y M → 40-42, L y XL → 43-45. Se cambia en Configuración › Medias.
- **Un kit y un welcome pack por cada semana inscrita** (confirmado por Pau, 23/11): un jugador que viene 3 semanas recibe 3. **Todos los extras de equipación** (equipación, portero, mochila, jersey) **se entregan en la primera semana** del participante. Cuentan los extras comprados en el **Form 1 de inscripción** y en el **Form 3**.

## 6. Decisiones pendientes

Ninguna abierta de la fase 1. Siguiente: fase 2 (Peticiones y Envíos a sedes).

## 7. Registro de decisiones

- **23/11:** Pau abre el desarrollo del almacén. El almacén guarda todo el material y sirve para distribuirlo a las sedes; lo más importante es calcular las necesidades de ropa, mochilas y welcome packs (con todo su contenido) según los inscritos.
- **23/11:** Pau pide una sección nueva en el software llamada **Logistics** y una propuesta de organización de departamentos y apartados hecha como especialista en logística (apartados 2, 3 y 4, pendientes de confirmar).
- **23/11:** Se crea este manual en la carpeta CLAUDE. Todo lo que se decida sobre almacén y sistema de trabajo se apunta aquí.
- **23/11:** Pau aprueba la estructura de apartados; el bloque se llama **Logística**; Buses se queda en Operativa. Pide que las sedes puedan hacer peticiones de material o de cualquier cosa y que almacén las reciba y responda (apartado Peticiones). Welcome pack distinto por modalidad, editable por semana. Talla única de la inscripción para todas las prendas. Portero solo a quien lo compra. Madrid y nacionales desde el mismo almacén y equipo. Curva de tallas: porcentaje de tallas aplicado al objetivo de inscritos. Envía los Excel CONTROL DE ROPA y CONTROL DE MATERIALES como inventario actual.
- **23/11:** Pau corrige y cierra las dudas: tres tipos de kit (minikit, light blue, black); nacionales 1 minikit; institucional 1 kit a elegir entre minikit y black; welcome pack de institucional sin mochila; nacionales con welcome pack propio (igual que ONE externo por ahora); head coach con equipación oficial de vuelta; margen 5 % editable; objetivo 8.000 registros; staff a mano por semana con valor propuesto; serigrafía como estado; «?» a 0 sin contar; sedes editables, sin «Residencia», con Santa Ana; peticiones del responsable de sede.
- **23/11:** Construida la fase 1 de Logística en la demo: Panel, Necesidades, Inventario y Configuración.
- **23/11:** Pau confirma: un welcome pack (y su kit) por cada semana inscrita; la talla 164 lleva medias 37-39.
- **23/11:** Pau confirma que todos los extras de equipación se entregan la primera semana y que también cuentan los extras comprados en el Form 1 de inscripción. Se corrige la lectura de «Mochila Oficial Adidas ONE» (antes no se contaba).
- **23/11:** Pau corrige: la mochila extra que se vende es la ONE (también a jugadores MAX); la MAX no está a la venta todavía y, cuando lo esté, se sumará a la MAX.
- **23/11:** Pau confirma la lógica de mochilas: la mochila incluida va en cada welcome pack, uno por semana (ONE y nacionales: ONE; MAX: MAX; institucional: gymsack). Un jugador ONE de 3 semanas cuenta 3 mochilas ONE. Las mochilas extra (hoy solo la ONE, pronto también la MAX) las puede comprar cualquier participante y se suman en la primera semana de su inscripción.
