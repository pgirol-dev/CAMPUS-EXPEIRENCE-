# Software Operativo · Campus Experience

Herramienta del equipo operativo de Campus Experience (Real Madrid, ISL Agency) para dejar de trabajar con Excel.

## Estructura del software
- **Inicio:** se elige la temporada (Campus Experience 2027).
- **Registros**
- **Operativa:** Horarios y Equipos.
- **Administración:** Contabilidad (pagos, devoluciones y cancelaciones).
- **Atención al público**, **Marketing** y **Recursos Humanos:** próximamente.
- **Sistema › Usuarios y accesos:** solo en las versiones con login.

## Dónde funciona
| Versión | Carpeta | Guía |
|---|---|---|
| **Zoho Catalyst** (Web Client Hosting y función) | `catalyst.json`, `client/`, `functions/` | `CATALYST.md` |
| Servidor propio (Node y SQLite) | `selfhost/` | `selfhost/INSTALACION.md` |
| claude.ai (artefacto) | `index.html` | — |

Las tres usan la misma aplicación, `index.html`. Después de cambiarla, ejecuta `node build.js`: regenera `client/` y `selfhost/app/`.

Las versiones con login tienen doble control de acceso:
1. La persona debe ser usuario activo del Zoho CRM de ISL.
2. Después, el administrador decide qué apartados puede ver o editar.

## Documentación
- `Directrices_Software_Operativo_Campus_Experience.md`: decisiones y criterios.
- `Reglas_Horarios_Campus_Experience.md`: reglas para crear los horarios.
