# Software Operativo · Campus Experience

Herramienta del equipo operativo de Campus Experience (Real Madrid, ISL Agency) para dejar de trabajar con Excel.

## Estructura
- **Inicio:** se elige la temporada (Campus Experience 2027).
- **Registros**
- **Operativa:** Horarios y Equipos.
- **Administración:** Contabilidad (pagos, devoluciones y cancelaciones).
- **Atención al público**, **Marketing** y **Recursos Humanos:** próximamente.
- **Sistema › Usuarios y accesos:** solo en la versión de servidor propio.

## Dos formas de usarlo
- **En claude.ai:** `index.html` publicado como artefacto. Usa el conector de Zoho CRM y la base de datos de Claude.
- **En servidor propio:** carpeta `selfhost/`. Tiene acceso con usuario y contraseña, doble control (usuario activo de Zoho CRM más los permisos que da el administrador) y base de datos propia. Ver `selfhost/INSTALACION.md`.

Las dos versiones usan la misma aplicación. Al actualizar, hay que copiar `index.html` también en `selfhost/app/index.html`.

## Documentación
- `Directrices_Software_Operativo_Campus_Experience.md`: decisiones y criterios.
- `Reglas_Horarios_Campus_Experience.md`: reglas para crear los horarios.
