# Software Operativo · Campus Experience en Zoho Catalyst

Guía para el equipo técnico: cómo funciona el software en Zoho Catalyst (Web Client Hosting más una función para el servidor) y cómo se publica desde este repositorio de GitHub.

**Proyecto en Catalyst:** Campus-Experience-OS (id `35863000000014061`, organización `20121257243`, centro de datos UE).
**Web (Development):** https://campus-experience-os-20121257243.development.catalystserverless.eu/app/
**Dashboard de registros:** `/app/dashboard.html` (también desde el menú lateral del software, «Dashboard»).

## Estructura del repositorio

```
catalyst.json                 configuración del proyecto Catalyst (obligatoria para desplegar)
.github/workflows/            despliegue automático en Catalyst en cada cambio de main (catalyst-deploy.yml)
client/                       → Web Client Hosting
  client-package.json
  index.html                  la aplicación (generada con build.js)
  login.html                  pantalla de acceso y primera instalación
  ce-shim.js                  puente entre la aplicación y la API
  favicon.svg
  dashboard.html              dashboard de registros (ver dashboard/README.md)
  dashboard-menu.js           acceso «Dashboard» en el menú (independiente de index.html)
  cover.jpg                   imagen de portada del dashboard
functions/campus_api/         → función Advanced I/O (Node.js): login, permisos, datos y Zoho CRM
  catalyst-config.json
  package.json                dependencia: zcatalyst-sdk-node
  index.js                    API
  store.js                    acceso al Data Store (todo lo específico de Catalyst está aquí)
functions/dashboard_api/      → función Advanced I/O aparte: datos del dashboard de registros (dashboard.js, ce_engine.js)
dashboard/                    fuente del dashboard de registros y su README
scripts/comprobar_dashboard.sh comprueba que el dashboard sigue incluido antes de publicar
publicar.sh                   publicar desde el Mac (commit, git pull, comprobación, catalyst deploy, push)
index.html                    la aplicación: AQUÍ se hacen los cambios (client/index.html se genera a partir de ella)
build.js                      regenera client/ y selfhost/app/ a partir de index.html
selfhost/                     alternativa: servidor propio (Node + SQLite). No se usa en Catalyst.
```

**Al cambiar la aplicación:** se edita `index.html` (nunca `client/index.html` directamente), se ejecuta `node build.js` y se suben los cambios a GitHub. El despliegue comprueba que `client/` está regenerado y, si no, se para.

**Al cambiar el dashboard:** se edita `dashboard/` y se regenera `client/dashboard.html` (ver `dashboard/README.md`). Los datos salen de `functions/dashboard_api/dashboard.js` y `ce_engine.js`.

## Publicar cambios en Catalyst

### Automático (GitHub Actions)
Cada cambio que llega a la rama `main` se despliega solo en Catalyst (Development) con `.github/workflows/catalyst-deploy.yml`:
1. instala la CLI de Catalyst y las dependencias de `campus_api`;
2. comprueba que `client/` coincide con `index.html`;
3. ejecuta `catalyst deploy` (web y función).

**Activarlo (una sola vez):**
1. En el ordenador, con la CLI de Catalyst ya iniciada: `catalyst token:generate`. Se abre una dirección con un código de verificación; al confirmarlo, la CLI muestra la clave.
2. En GitHub › repositorio › **Settings › Secrets and variables › Actions › New repository secret**: nombre `CATALYST_TOKEN`, valor la clave.
3. Comprobación: en **Actions › Desplegar en Catalyst › Run workflow**.

Mientras no exista el secreto, el flujo solo muestra un aviso. Si se revoca la clave (`catalyst token:revoke`), hay que generar otra y actualizar el secreto.

### Manual (desde el ordenador)
En la carpeta del proyecto:
```bash
git pull origin main
cd functions/campus_api && npm install --omit=dev && cd ../..
catalyst deploy
```

**Nota:** la consola actual de Catalyst ya no tiene «DevOps › Repositories › Git». GitHub está vinculado en Ajustes › Integraciones, pero el despliegue se hace con la CLI (manual o desde GitHub Actions).

## Cómo funciona

- **La web** (`client/`) se sirve como contenido estático. La aplicación carga primero `/server/campus_api/acl.js`:
  - si no hay sesión, redirige a `login.html`;
  - si la hay, recibe los permisos del usuario y arranca.
- **La función** `campus_api` (`/server/campus_api/...`) hace todo lo demás:
  - login con email y contraseña (scrypt con sal) y sesiones con cookie `HttpOnly`, `Secure` y `SameSite=Strict`;
  - **doble control:**
    1. el usuario debe estar **activo en Zoho CRM**; se comprueba al crearlo, al entrar y cada 30 minutos;
    2. después, los permisos por apartado y subapartado (sin acceso, ver o editar) que da el administrador;
  - consulta a Zoho CRM en **solo lectura**: solo acepta consultas COQL `SELECT`;
  - lee las facturas de Zoho Books (solo lectura) para el control de facturas de Administración;
  - guarda los datos del software en el **Data Store**.
- **Cambios en vivo:** como las funciones no mantienen conexiones abiertas, la aplicación pregunta cada 15 segundos si alguien ha cambiado algo (`/api/changes`). Si el administrador cambia los permisos de un usuario, su página se recarga sola.

## Puesta en marcha

### 1. Crear el proyecto y publicar el código
1. En Catalyst, cread un proyecto. Elegid el centro de datos de la UE si vuestro Zoho CRM está en `.eu`.
2. Publicad el repositorio con la CLI (`catalyst deploy`) o activad el despliegue automático (ver «Publicar cambios en Catalyst»).
3. **Dependencias de la función:** `functions/campus_api` usa `zcatalyst-sdk-node`. La carpeta `functions/campus_api/node_modules` está en el repositorio (el `.gitignore` la deja pasar) y el despliegue automático la reinstala con `npm ci --omit=dev`.
4. El `stack` de `catalyst-config.json` está como `node20`.

### 2. Crear las tablas en el Data Store
En Cloud Scale → Data Store creáis estas 5 tablas, con estas columnas y tipos.
- **Permisos de las tablas:** quitad todos los permisos de las tablas a los usuarios de la app (App User). Solo la función accede a ellas, con permisos de administrador.
- **Columnas:** todas deben admitir valores vacíos, salvo las marcadas con *.

**CEUsers**
| columna | tipo |
|---|---|
| email* | Var Char (255) |
| name* | Var Char (255) |
| zoho_id* | Var Char (64) |
| zoho_role | Var Char (255) |
| zoho_profile | Var Char (255) |
| pass_hash* | Var Char (255) |
| is_admin | Boolean |
| active | Boolean |
| perms | Text |
| must_change | Boolean |
| last_login | Var Char (40) |
| zoho_ok_at | BigInt |
| zoho_status | Var Char (20) |
| ver | Int |

**CESessions**
| columna | tipo |
|---|---|
| token_hash* | Var Char (64) |
| user_id* | BigInt |
| created_at | BigInt |
| last_seen | BigInt |
| zoho_checked_at | BigInt |
| ip | Var Char (64) |
| ua | Var Char (255) |

**CEDocs**: horarios, equipos, peticiones y seguimiento. Un documento grande se guarda en trozos de 9.000 caracteres, porque una columna Text admite 10.000.
| columna | tipo |
|---|---|
| col* | Var Char (20) |
| doc_id* | Var Char (200) |
| part | Int |
| parts | Int |
| data | Text |
| updated_at | Var Char (40) |
| updated_by | BigInt |

**CEAudit**: registro de actividad.
| columna | tipo |
|---|---|
| ts | Var Char (40) |
| user_id | BigInt |
| email | Var Char (255) |
| action | Var Char (60) |
| detail | Text |
| ip | Var Char (64) |

**CEMeta**: intentos fallidos de acceso y avisos de cambios.
| columna | tipo |
|---|---|
| k* | Var Char (200) |
| v | Text |

### 3. Credenciales de Zoho CRM (solo lectura)
Cread un **Self Client** en la consola de API de Zoho, con el mismo centro de datos que vuestro CRM.
- **Scopes:** `ZohoCRM.coql.READ,ZohoCRM.modules.READ,ZohoCRM.users.READ,ZohoBooks.invoices.READ`
- Cambiad el código generado por un *refresh token*:
  ```bash
  curl -X POST "https://accounts.zoho.eu/oauth/v2/token" \
    -d "grant_type=authorization_code" -d "client_id=…" -d "client_secret=…" -d "code=…"
  ```

### 4. Variables de entorno de la función `campus_api`
Se configuran en la consola (Serverless → Functions → campus_api → Configuración → Variables de entorno). **No las subáis a GitHub.**

| variable | valor |
|---|---|
| `ZOHO_CLIENT_ID` | del Self Client |
| `ZOHO_CLIENT_SECRET` | del Self Client |
| `ZOHO_REFRESH_TOKEN` | el refresh token |
| `ZOHO_ACCOUNTS_URL` | `https://accounts.zoho.eu` (o `.com`) |
| `ZOHO_API_URL` | `https://www.zohoapis.eu` (o `.com`) |
| `ZOHO_BOOKS_ORG` | id de la organización de Zoho Books (por defecto `20110950454`, ISL Agency RMF) |
| `ZOHO_BOOKS_URL` | `https://www.zohoapis.eu/books/v3` (por defecto) |
| `CE_SETUP_KEY` | una clave larga inventada, para crear el primer administrador. **Borradla después.** |
| `CE_LOGIN_URL` | ruta de la pantalla de acceso; por defecto `/app/login.html`. Si el hosting sirve la web en la raíz del dominio, `/login.html` |
| `CE_ALLOWED_ORIGINS` | opcional: dominio de la web, por ejemplo `https://operativa.islagency.com` |
| `SESSION_IDLE_MIN`, `SESSION_MAX_HOURS`, `ZOHO_RECHECK_MIN`, `ZOHO_GRACE_HOURS` | opcionales: 480, 72, 30 y 12 por defecto |
| `CE_DASH_TTL_MIN` | opcional: minutos que se reutilizan los datos del dashboard antes de volver a leer Zoho (15 por defecto) |

**Importante:**
- **No activéis Catalyst Authentication** para esta web. El software tiene su propio acceso y la función tiene que poder recibir peticiones sin usuario de Catalyst.
- Si Catalyst cachea la web, comprobad que `/server/campus_api/acl.js` no se cachea. La función ya responde con `Cache-Control: no-store`.

### 5. Primer administrador
1. Abrid la web. Como todavía no hay usuarios, sale **Primera instalación**.
2. Introducid la clave `CE_SETUP_KEY`, el email de Zoho CRM del administrador (por ejemplo `pgirol@islagency.com`) y una contraseña.
3. Borrad la variable `CE_SETUP_KEY`.
4. A partir de ahí, el administrador da de alta al resto en **Sistema → Usuarios y accesos**.

### 6. Pasar a producción
Catalyst publica primero en el entorno de Development. Desde la consola desplegad a **Production** para que lo use el equipo y, si queréis, configurad un dominio propio.

## Dashboard de registros
- Página `/app/dashboard.html`; acceso desde el menú lateral («Dashboard», `client/dashboard-menu.js`). La ven **todos los usuarios con sesión**.
- Función propia **`dashboard_api`**, separada de `campus_api` para que una versión nueva del software no la borre. Usa la misma cookie de sesión y las tablas CESessions/CEUsers. **Variables de entorno:** las mismas de Zoho que `campus_api` (`ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, `ZOHO_ACCOUNTS_URL`, `ZOHO_API_URL`) y, opcionales, `CE_LOGIN_URL`, `CE_DASH_TTL_MIN`.
- `GET /server/dashboard_api/dashboard.js`: cifras agregadas de las inscripciones **con pago** (Zoho CRM, solo lectura). Se guardan en el Data Store (`CEDocs` col `dash`; marca `dash_ts` en `CEMeta`) y se reutilizan 15 minutos.
- `POST /server/dashboard_api/api/dashboard/refresh`: botón «Actualizar» (máximo una lectura de Zoho por minuto; queda en el registro de actividad).
- Detalle en `dashboard/README.md`.

## Seguridad: resumen
- **Contraseñas:** scrypt con sal; nadie puede verlas.
  - Mínimo 10 caracteres, con letras y números.
  - Cambio obligatorio en el primer acceso.
- **Bloqueos:** 5 intentos fallidos por usuario, o 20 por IP, bloquean el acceso 15 minutos.
- **Sesiones:** se cierran tras 8 horas sin uso y como máximo a las 72 horas. También se cierran al desactivar al usuario en el software o en Zoho.
- **Permisos:** los comprueba la función en cada petición.
- **CSRF:** las peticiones que modifican algo exigen la cabecera `X-CE`, y opcionalmente que vengan del origen permitido.
- **Zoho:** solo lectura. Si Zoho no responde, vale la última comprobación correcta de las 12 horas anteriores.
- **Límite conocido:** los datos de inscripciones de Zoho los filtra la interfaz. Un usuario con acceso a Registros, Equipos, Horarios o Contabilidad los recibe en su navegador. Lo que se guarda en el software sí está protegido por completo por los permisos.

## Qué está probado
Todo el recorrido se ha probado en local con una simulación del SDK de Catalyst y del Data Store:
- primera instalación, login y cambio obligatorio de contraseña;
- alta de usuarios desde Zoho y permisos de ver y editar;
- rechazo de escrituras sin permiso;
- documentos grandes troceados (25.000 caracteres en 3 trozos);
- avisos de cambios y recarga al cambiar permisos.

**Pendiente de comprobar en el proyecto real de Catalyst:**
- el formato exacto de las respuestas de ZCQL (`store.js` admite los dos formatos conocidos);
- la ruta en la que el hosting sirve la web (`/app/`);
- que la dependencia `zcatalyst-sdk-node` se instale en el despliegue.

Zoho indica que `zcatalyst-sdk-node` está en proceso de sustitución por el nuevo JavaScript SDK (`@zcatalyst/...`). Funciona hoy, y si hay que cambiarlo solo afecta a `store.js`.
