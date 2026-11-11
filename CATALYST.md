# Software Operativo · Campus Experience en Zoho Catalyst

Guía para el equipo técnico: cómo conectar este repositorio de GitHub con Zoho Catalyst (Web Client Hosting más una función para el servidor).

## Estructura del repositorio

```
catalyst.json                 configuración del proyecto Catalyst (obligatoria para desplegar desde GitHub)
client/                       → Web Client Hosting
  client-package.json
  index.html                  la aplicación (generada con build.js)
  login.html                  pantalla de acceso y primera instalación
  ce-shim.js                  puente entre la aplicación y la API
  favicon.svg
  dashboard.html              dashboard de registros (ver dashboard/README.md)
  cover.jpg                   imagen de portada del dashboard
functions/campus_api/         → función Advanced I/O (Node.js): login, permisos, datos y Zoho CRM
  catalyst-config.json
  package.json                dependencia: zcatalyst-sdk-node
  index.js                    API
  store.js                    acceso al Data Store (todo lo específico de Catalyst está aquí)
  dashboard.js, ce_engine.js  datos del dashboard de registros
dashboard/                    fuente del dashboard de registros y su README
index.html                    la aplicación original (también la versión de claude.ai)
build.js                      regenera client/ y selfhost/app/ a partir de index.html
selfhost/                     alternativa: servidor propio (Node + SQLite). No se usa en Catalyst.
```

**Al cambiar la aplicación:** se edita `index.html`, se ejecuta `node build.js` y se suben los cambios a GitHub.

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

### 1. Crear el proyecto y conectar GitHub
1. En Catalyst, cread un proyecto. Elegid el centro de datos de la UE si vuestro Zoho CRM está en `.eu`.
2. Conectad el repositorio `pgirol-dev/CAMPUS-EXPEIRENCE-`, rama `main`:
   - con **Catalyst Pipelines**, que es lo recomendado para cuentas nuevas y despliega en cada push;
   - o con la **integración Git de GitHub** (Deploy y Sync manuales).
3. **Dependencias de la función:** `functions/campus_api` usa `zcatalyst-sdk-node`.
   - **Integración Git de GitHub (opción elegida, 11/11):** la carpeta `functions/campus_api/node_modules` se sube al repositorio (el `.gitignore` la deja pasar). Se genera una vez en un ordenador con Node: `cd functions/campus_api && npm install --omit=dev`, y se vuelve a generar solo si cambia `package.json`.
   - Con Pipelines, añadid antes del despliegue el paso `cd functions/campus_api && npm install`.
   - Con la CLI: `npm install` en esa carpeta y `catalyst deploy`.
   - Tras cada `git push`: Catalyst → DevOps → Repositories → Git → **Sync**.
4. El `stack` de `catalyst-config.json` está como `node20`. Ajustadlo si vuestro proyecto ofrece otra versión de Node.

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
