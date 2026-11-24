# Software Operativo · ISL (Campus Experience)

Herramienta del equipo operativo de Campus Experience (Real Madrid, ISL Agency) para dejar de trabajar con Excel. Desde el 24/11 es la **capa de empresa ISL**: cada departamento (Campus Experience, LaLiga Select, FF Madrid…) es una pata de esta interfaz.

## Capa ISL
- **Acceso ISL** (`login.html`): email @islagency.com y contraseña (las mismas de siempre). Ya **no** consulta Zoho. Foto del césped a pantalla completa.
- **Inicio ISL** (`inicio.html`): saludo y una tarjeta por departamento con su foto y su marca. Cada persona ve solo sus departamentos. Los superadministradores ven todos (LaLiga Select y FF Madrid, «Próximamente»).
- **Entrar en Campus Experience:** se comprueba que la persona tiene el departamento y que está activa en Zoho CRM (y de nuevo cada 30 min). Si no, vuelve al inicio con el aviso. Dentro de Campus nada cambia; en la barra lateral hay un botón para volver al Inicio ISL.
- Diseño de referencia: `design/isl/propuesta_capa_isl.html`.

## Estructura del software
- **Inicio:** se elige la temporada (Campus Experience 2027) en una tarjeta con participantes, semanas en Madrid, nacionales e institucionales.
- **Registros**
- **Operativa:** Horarios (con simulador que guarda y «Pasar al horario real», historial, papelera y aceptar avisos), Equipos e Incidencias.
- **Administración:** Contabilidad (pagos, devoluciones, cancelaciones y agentes), Facturas y Cuentas (antes Ingresos: cobros y devoluciones de Zoho Books por día y banco, cuadre diario y extracto en PDF de los días cuadrados).
- **Operativa › Buses:** servicio de bus y transfer contratados por semana (Madrid), con la comprobación del pago del bus.
- **Atención al público:** Base de datos (listas para las llamadas comerciales: BBDD 2026, Unpaids, Prerreservas y Form abandonado; con hermanos, duplicados y sedes en Unpaids), Limpieza (inscripciones completadas y pendientes, cuatro estados de documentación con lo que falta, aviso médico, filtros y orden) y Estadísticas. Enlaces al CRM y a Zoho Desk desde cada historial.
- **Logística:** Panel, Necesidades (kits por tipo y talla, medias, welcome pack y staff según los inscritos, con un welcome pack por semana inscrita, margen y previsión con el objetivo de registros), Inventario (stock por movimientos: almacén, serigrafía y sedes; inventario inicial de los Excel), Entradas (pedidos a proveedor con precios, pago y recepción), Preparación (lista por semana y campus), Envíos a sedes (envíos, stock y mínimos de cada sede, reposición y devoluciones), Peticiones de las sedes y Configuración. Manual: `Manual_Almacen_Campus_Experience.md` (carpeta CLAUDE).
- **Marketing** y **Recursos Humanos:** próximamente.
- **Dashboard** de registros Campus Experience 2027 (solo en Catalyst): `client/dashboard.html`, en el menú lateral. Incluye los **institucionales** (Yepes y Argés), el **ritmo de inscripción general** y el **mapamundi** en la Portada (Registros | Jugadores) y, en la vista Madrid, el **mapa de calor de España** y **Residencias** (UAM/UEM); el permiso para editarla se da en Administración › Usuarios (Dashboard › Residencias).
- **Sistema › Usuarios y accesos:** solo en las versiones con login.

## Dónde funciona
| Versión | Carpeta | Guía |
|---|---|---|
| **Zoho Catalyst** (versión en uso: Web Client Hosting y función) | `catalyst.json`, `client/`, `functions/`, `dashboard/` | `CATALYST.md` |
| Servidor propio (Node y SQLite) | `selfhost/` | `selfhost/INSTALACION.md` |
| claude.ai (artefacto) | `index.html` | — |

Las tres usan la misma aplicación, `index.html`. Después de cambiarla, ejecuta `node build.js`: regenera `client/` y `selfhost/app/`. No edites `client/index.html` a mano: se sobrescribe.

## Cómo se publica
Cada cambio que llega a `main` se despliega solo en Catalyst (GitHub Actions, `.github/workflows/catalyst-deploy.yml`) en cuanto el secreto `CATALYST_TOKEN` está configurado. Mientras tanto, o si hace falta, se publica a mano con `catalyst deploy`. Detalles en `CATALYST.md`.

Las versiones con login tienen doble control para entrar en Campus Experience:
1. La persona debe tener el departamento Campus Experience y ser usuario activo del Zoho CRM de ISL (se comprueba al entrar en Campus, no en el acceso ISL).
2. Después, el administrador decide qué apartados puede ver o editar.

## Documentación
- `CATALYST.md`: cómo funciona y cómo se publica en Zoho Catalyst.
- `dashboard/README.md`: el dashboard de registros.
- `CLAUDE.md`: reglas de trabajo para seguir desarrollando (también para Claude).
- `Directrices_Software_Operativo_Campus_Experience.md`: decisiones y criterios.
- `Reglas_Horarios_Campus_Experience.md`: reglas para crear los horarios.
