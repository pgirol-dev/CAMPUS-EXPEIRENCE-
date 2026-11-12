# Reglas de trabajo · Software Operativo Campus Experience

Este repositorio es el **software operativo de Campus Experience** y se publica en **Zoho Catalyst** (proyecto Campus-Experience-OS, org 20121257243, centro de datos UE). Todo se documenta y se piensa para Catalyst.

## Antes de cambiar nada
- **El dashboard de registros forma parte del software y no se toca al cambiar la aplicación.** Vive en `client/dashboard.html`, `client/dashboard-menu.js`, `functions/dashboard_api/` y `dashboard/`. Si `scripts/comprobar_dashboard.sh` falla, no publiques: falta algo de eso.
- **Primero `git pull origin main`.** Trabajar sobre una copia antigua borra lo que otros han subido (el 11 nov el apartado de Ingresos se subió sobre una copia sin el dashboard y lo quitó del menú y del servidor). El despliegue automático se para si falta el dashboard.
- Lee `README.md`, `CATALYST.md` y, si tocas el dashboard, `dashboard/README.md`.
- El software operativo está en uso: **no se modifica sin confirmación expresa** de Pau Girol (director del proyecto). Los cambios van en una rama y por pull request.
- Zoho CRM y Zoho Books: **solo lectura**. Nunca escribir en Zoho desde el software.
- No subir claves ni tokens al repositorio. Las credenciales están en las variables de entorno de `campus_api` en Catalyst y el token de despliegue en el secreto `CATALYST_TOKEN` de GitHub.

## Dónde se cambia cada cosa
| qué | dónde | después |
|---|---|---|
| La aplicación (menú, Registros, Operativa, Administración…) | `index.html` (raíz) | `node build.js` → regenera `client/` y `selfhost/app/`. **Nunca editar `client/index.html` a mano.** `build.js` reescribe `client/favicon.svg` con otros metadatos: no subas ese cambio (`git checkout client/favicon.svg`). |
| El dashboard de registros (diseño) | `dashboard/template_natv.html`, `dashboard/cat_ui.js` | `cd dashboard && python3 mk_cat.py ../client/dashboard.html` |
| El dashboard (cálculo de cifras) | `functions/dashboard_api/ce_engine.js` | — |
| El dashboard (qué sedes se leen de Zoho) | `SEDES` en `functions/dashboard_api/dashboard.js` | — |
| El servidor (login, permisos, API) | `functions/campus_api/index.js`, `store.js` | — |
| El acceso «Dashboard» del menú | `client/dashboard-menu.js` (lo enlaza `build.js`; **no** va en `index.html`) | — |
| El servidor del dashboard | `functions/dashboard_api/` (función aparte; **no** va en `campus_api`) | — |

## Publicar
- `./publicar.sh "qué ha cambiado"` (desde el Mac): guarda los cambios, trae lo último de GitHub, comprueba el dashboard (`scripts/comprobar_dashboard.sh`) y solo entonces publica y sube a GitHub.
- Al unir a `main`, GitHub Actions despliega solo en Catalyst (Development) con `.github/workflows/catalyst-deploy.yml`, si existe el secreto `CATALYST_TOKEN`.
- Manual: `git pull origin main`, `cd functions/campus_api && npm install --omit=dev && cd ../..`, `catalyst deploy`.
- Pasar a Production: desde la consola de Catalyst («Deploy to Production»), cuando Pau lo decida.

## Mantener la documentación al día (obligatorio en cada cambio)
Cada pull request que cambie el comportamiento actualiza también, en el mismo cambio:
- `README.md` (estructura y apartados del software);
- `CATALYST.md` (rutas de la API, tablas, variables de entorno, despliegue);
- `dashboard/README.md` si toca el dashboard (sedes, reglas de los datos, archivos);
- este `CLAUDE.md` si cambia la forma de trabajar.

## Comprobar antes de proponer el cambio
- `node -e "require('./functions/campus_api/index.js')"` no da error.
- `node build.js` no deja diferencias en `client/` aparte de las esperadas.
- Si tocas el dashboard: abrir `client/dashboard.html` con datos de prueba y revisar Portada, Madrid, Nacionales y Storage sin errores en consola.

## Idioma
Todo (interfaz, mensajes de error, commits y documentación) en español.
