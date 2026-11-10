# Software Operativo · Campus Experience — instalación en servidor propio

Guía para el equipo de IT. La aplicación es la misma que la versión de claude.ai. Este servidor añade:

- **Inicio de sesión** con usuario y contraseña.
- **Doble control de acceso:**
  1. La persona debe ser un usuario **activo** del Zoho CRM de ISL. Se comprueba al crear la cuenta, al iniciar sesión y cada 30 minutos de uso.
  2. Después, el administrador decide qué apartados y subapartados puede **ver** o **editar**.
- **Panel de administración** («Usuarios y accesos») dentro del propio software.
- **Base de datos propia** (SQLite) para horarios, equipos, peticiones y seguimiento.
- **Conexión con Zoho CRM** desde el servidor, en solo lectura y mediante consultas COQL.

No necesita `npm install`: no tiene dependencias externas.

---

## 1. Requisitos

- **Node.js 22.13 o superior**, o Docker.
- Un **dominio o subdominio con HTTPS**, por ejemplo `operativa.islagency.com`. Las cookies de sesión solo funcionan por HTTPS.
- Acceso de administrador a **Zoho CRM**, para crear las credenciales de la API (punto 2).

## 2. Credenciales de Zoho CRM (Self Client)

El servidor consulta Zoho con una cuenta técnica de **solo lectura**.

1. Entrad en la consola de API de Zoho con una cuenta administradora del CRM:
   - `https://api-console.zoho.eu` si vuestro CRM es `crm.zoho.eu`;
   - `https://api-console.zoho.com` si es `crm.zoho.com`.
2. **Add Client → Self Client → Create**. Apuntad el **Client ID** y el **Client Secret**.
3. En la pestaña **Generate Code**:
   - **Scope:** `ZohoCRM.coql.READ,ZohoCRM.modules.READ,ZohoCRM.users.READ`
   - **Time duration:** 10 minutos.
   - Pulsad **Create** y copiad el código que aparece (*grant code*).
4. Cambiad ese código por un *refresh token*. Ejecutadlo antes de que pasen los 10 minutos:
   ```bash
   curl -X POST "https://accounts.zoho.eu/oauth/v2/token" \
     -d "grant_type=authorization_code" \
     -d "client_id=CLIENT_ID" \
     -d "client_secret=CLIENT_SECRET" \
     -d "code=GRANT_CODE"
   ```
   La respuesta trae `"refresh_token": "1000.xxxx..."`. Guardadlo: no caduca.
5. Si el CRM está en `.com`, cambiad `.eu` por `.com` en estas URL y en el `.env`.

## 3. Configuración

```bash
cp .env.example .env
```
Rellenad en `.env`:
- `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET` y `ZOHO_REFRESH_TOKEN` (del punto 2).
- `ZOHO_ACCOUNTS_URL` y `ZOHO_API_URL`, según el centro de datos (.eu o .com).
- `COOKIE_SECURE=1` y `TRUST_PROXY=1`, si va detrás de un proxy HTTPS (lo recomendado).

Comprobad la conexión:
```bash
node --experimental-sqlite server.js comprobar-zoho
```

## 4. Crear la cuenta del administrador

El administrador también tiene que ser usuario activo de Zoho CRM. Se crea desde la terminal con su email de Zoho, y el comando pide la contraseña:
```bash
node --experimental-sqlite server.js crear-admin pgirol@islagency.com
```
Desde ese momento, el resto de usuarios los da de alta el administrador en el propio software, en **Usuarios y accesos → Nuevo usuario**.

## 5. Arrancar

**Con Docker (recomendado):**
```bash
docker compose up -d --build
docker compose exec campus node --experimental-sqlite server.js crear-admin pgirol@islagency.com
```

**Sin Docker:**
```bash
node --experimental-sqlite --disable-warning=ExperimentalWarning server.js
```
En este caso hay que dejarlo como servicio, con systemd o pm2, para que arranque solo al reiniciar la máquina.

El servidor escucha en el puerto 3000. Publicadlo con HTTPS mediante un proxy:
- **Caddy:** ver `Caddyfile.example`. Pone el certificado automáticamente.
- **nginx:** `proxy_pass http://127.0.0.1:3000;`, con `proxy_buffering off;` para que los cambios en vivo funcionen. Pasad `X-Forwarded-For`.

## 6. Copias de seguridad

Todo lo que se guarda está en la carpeta de datos (`./data/campus.db`, en Docker el volumen `./data`): usuarios, accesos, horarios, equipos, peticiones, seguimiento y registro de actividad.

Haced una copia diaria:
```bash
sqlite3 data/campus.db ".backup 'copias/campus-$(date +%F).db'"
```
Las contraseñas están cifradas (scrypt con sal), pero el archivo contiene datos personales de inscritos. Guardad las copias en un sitio protegido.

## 7. Pasar los datos desde la versión de claude.ai

Cuando se haga el cambio definitivo, se exportan desde claude.ai los datos guardados (horarios, equipos, peticiones y seguimiento) a un JSON y se cargan así:
```bash
node --experimental-sqlite server.js importar export-claude.json
```

## 8. Mantenimiento

- **Restablecer la contraseña de alguien desde el servidor** (por ejemplo, si el administrador olvida la suya):
  ```bash
  node --experimental-sqlite server.js restablecer-contraseña email@islagency.com
  ```
- **Actualizar la aplicación:** sustituid `app/index.html` por la versión nueva. No hace falta reiniciar.
- **Salud del servidor:** `GET /salud` responde `{"ok":true}`.

## Seguridad: cómo funciona

- **Contraseñas:** cifradas con scrypt y sal. Nadie puede leerlas, tampoco el administrador. Mínimo 10 caracteres, con letras y números. En el primer acceso se obliga a cambiar la contraseña inicial.
- **Bloqueos:** 5 intentos fallidos por usuario, o 20 por IP, bloquean el acceso 15 minutos.
- **Sesión:**
  - cookie `HttpOnly`, `Secure` y `SameSite=Strict`;
  - se cierra tras 8 horas sin uso y como máximo a las 72 horas;
  - si se desactiva al usuario en el software o en Zoho, la sesión se cierra.
- **Permisos:** los comprueba el servidor en cada petición. Ocultar botones en pantalla es solo comodidad: aunque alguien manipule la página, el servidor rechaza lo que no le corresponde.
- **Zoho:**
  - el servidor solo acepta consultas `SELECT`, así que no puede modificar el CRM;
  - si Zoho no responde, se acepta la última comprobación correcta de las 12 horas anteriores; pasado ese tiempo, no se puede entrar.
- **Protecciones web:** contra CSRF (cabecera propia y comprobación de origen), CSP y cabeceras de seguridad.
- **Registro de actividad** visible para el administrador: accesos, intentos fallidos, bloqueos de Zoho y cambios de usuarios.

### Límite a tener en cuenta
Los apartados Registros, Equipos, Horarios y Contabilidad trabajan con las inscripciones de Zoho. Cualquier usuario con acceso a uno de ellos recibe esos datos en su navegador, aunque en pantalla solo vea lo suyo. Los permisos protegen por completo lo que se guarda en el software, es decir, quién puede ver o modificar horarios, equipos, simulador y seguimiento. Los datos de Zoho los filtra la interfaz, no el servidor.
