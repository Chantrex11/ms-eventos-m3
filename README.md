
# ms-eventos — Evaluación Módulo 3

Microservicio REST desarrollado con **Node.js, Express y MySQL** para gestionar eventos mediante una arquitectura en capas.

Proyecto de preparación para la evaluación del Módulo 3 de **Redes y Servicios Multimedia — Universidad Autónoma de Occidente**.

El microservicio permite crear, consultar, actualizar y eliminar eventos, aplicar filtros por tipo y controlar el acceso mediante tokens JWT emitidos por `ms-usuarios`.

## 1. Tecnologías utilizadas

- Node.js 22
- Express 5
- MySQL
- mysql2/promise
- jsonwebtoken
- Postman
- Git y GitHub

## 2. Arquitectura del proyecto

El microservicio sigue la separación:

**Rutas → Controlador → Servicio → Repositorio → Base de datos**

```text
ms-eventos/
├── db/
│   └── schema.sql
├── docs/
│   └── ms-eventos (usuarios).postman_collection.json
├── src/
│   ├── controllers/
│   │   └── eventos.controller.js
│   ├── middlewars/
│   │   └── auth.js
│   ├── models/
│   │   └── evento.js
│   ├── repositories/
│   │   └── eventos.repository.js
│   ├── routes/
│   │   └── eventos.routes.js
│   ├── services/
│   │   └── eventos.service.js
│   ├── utils/
│   │   └── http-error.js
│   ├── app.js
│   ├── db.js
│   └── index.js
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

### Responsabilidades

| Componente | Responsabilidad |
|---|---|
| `routes` | Define los endpoints y sus permisos. |
| `controllers` | Recibe solicitudes y construye respuestas HTTP. |
| `services` | Aplica reglas de negocio y validaciones. |
| `repositories` | Ejecuta consultas SQL parametrizadas. |
| `models` | Valida y estructura los datos del evento. |
| `middlewars/auth.js` | Verifica JWT y autoriza operaciones según el rol. |
| `utils/http-error.js` | Maneja errores mediante códigos HTTP. |
| `app.js` | Configura Express, las rutas, los registros HTTP y el manejo de errores. |
| `db.js` | Establece la conexión con MySQL. |
| `index.js` | Inicia el servidor. |

## 3. Instalación local

Cada integrante debe preparar el microservicio en su propio computador.

### Requisitos

- Node.js instalado.
- MySQL local funcionando, de acuerdo con la versión exigida en la evaluación.
- Microservicio `ms-usuarios` disponible para generar tokens JWT.
- Postman para probar los endpoints.
- Git para trabajar con el repositorio compartido.

### Clonar el repositorio

```bash
git clone https://github.com/Chantrex11/ms-eventos-m3.git
cd ms-eventos-m3/ms-eventos
```

### Instalar dependencias

```bash
npm ci
```

### Configurar variables de entorno

Crear un archivo `.env` dentro de `ms-eventos`, utilizando `.env.example` como referencia:

```env
PORT=3011
HOST=127.0.0.1

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=eventos_db
DB_USER=eventos_user
DB_PASSWORD=TU_CONTRASENA_LOCAL

JWT_SECRET=TU_CLAVE_JWT_COMPARTIDA
```

**Importante:**

- No subir el archivo `.env` a GitHub.
- Utilizar las credenciales de MySQL configuradas en el computador.
- La cuenta de MySQL debe tener permisos sobre `eventos_db`.
- La variable `JWT_SECRET` debe coincidir con la de `ms-usuarios`.

## 4. Base de datos

El microservicio utiliza la base de datos **eventos_db** y la tabla **eventos**.

### Estructura

| Campo | Tipo | Restricción |
|---|---|---|
| `id` | INT | Clave primaria, autoincremental |
| `codigo` | VARCHAR(30) | Obligatorio y único |
| `nombre` | VARCHAR(100) | Obligatorio |
| `fecha` | DATE | Obligatoria |
| `asistentes_esperados` | INT | Entero mayor que cero |
| `tipo` | VARCHAR(20) | `conferencia`, `taller` o `feria` |

### Registros iniciales

El archivo `db/schema.sql` incluye tres registros:

| Código | Nombre | Fecha | Asistentes | Tipo |
|---|---|---|---:|---|
| EVT-001 | Conferencia de Tecnologia | 2026-12-10 | 120 | conferencia |
| EVT-002 | Taller de Programacion | 2026-12-15 | 35 | taller |
| EVT-003 | Feria de Innovacion | 2026-12-20 | 200 | feria |

### Importar el esquema

Ingresar al cliente MySQL y ejecutar:

```sql
SOURCE ruta/completa/ms-eventos/db/schema.sql;
```

El archivo crea la base de datos si no existe, crea la tabla y agrega los tres registros iniciales.

Se recomienda ejecutarlo sobre una base nueva, ya que repetir las inserciones puede generar errores por los códigos duplicados.

## 5. Ejecutar ms-eventos

Desde la carpeta `ms-eventos`:

```bash
npm run dev
```

Para iniciar sin el modo de observación:

```bash
npm start
```

El microservicio se ejecuta en:

```text
http://127.0.0.1:3011
```

### Verificar el servicio

**Solicitud:**

```http
GET http://127.0.0.1:3011/health
```

**Respuesta esperada — 200 OK:**

```json
{
  "servicio": "ms-eventos",
  "estado": "ok"
}
```

La ruta `/health` no requiere token JWT.

## 6. Contrato REST

Todas las rutas de `/eventos` requieren autenticación JWT.

| Método | Endpoint | Descripción | HTTP exitoso |
|---|---|---|---|
| GET | `/eventos` | Listar eventos | 200 |
| GET | `/eventos?tipo=taller` | Filtrar eventos por tipo | 200 |
| GET | `/eventos/:id` | Consultar evento por ID | 200 |
| POST | `/eventos` | Crear evento | 201 |
| PUT | `/eventos/:id` | Actualizar evento | 200 |
| DELETE | `/eventos/:id` | Eliminar evento | 204 |

### GET /eventos

Lista todos los eventos registrados.

```http
GET /eventos
Authorization: Bearer <token>
```

**Respuesta:** HTTP `200 OK` con un arreglo JSON.

### GET /eventos?tipo=taller

Filtra los eventos por el campo `tipo`.

```http
GET /eventos?tipo=taller
Authorization: Bearer <token>
```

**Respuesta:** HTTP `200 OK` con los eventos cuyo tipo sea `taller`.

### GET /eventos/:id

Consulta un evento específico.

```http
GET /eventos/2
Authorization: Bearer <token>
```

Respuestas posibles:

- `200`: evento encontrado.
- `400`: ID inválido.
- `404`: evento inexistente.

### POST /eventos

Crea un nuevo evento. Requiere rol `administrador`.

```http
POST /eventos
Authorization: Bearer <token>
Content-Type: application/json
```

**Ejemplo de cuerpo JSON:**

```json
{
  "codigo": "EVT-004",
  "nombre": "Encuentro de Innovacion",
  "fecha": "2026-12-22",
  "asistentes_esperados": 80,
  "tipo": "conferencia"
}
```

**Respuesta exitosa:** HTTP `201 Created`.

El servidor devuelve el evento creado con su ID y establece el encabezado `Location`.

Si el código ya existe, responde `409 Conflict`.

### PUT /eventos/:id

Actualiza un evento existente. Requiere rol `administrador`.

```http
PUT /eventos/4
Authorization: Bearer <token>
Content-Type: application/json
```

**Ejemplo de cuerpo JSON:**

```json
{
  "codigo": "EVT-004",
  "nombre": "Encuentro de Innovacion Actualizado",
  "fecha": "2026-12-22",
  "asistentes_esperados": 100,
  "tipo": "conferencia"
}
```

**Respuesta exitosa:** HTTP `200 OK`.

El cuerpo debe incluir todos los campos obligatorios del evento.

Respuestas posibles:

- `200`: actualización exitosa.
- `400`: datos inválidos.
- `404`: evento inexistente.
- `409`: código asignado a otro evento.

### DELETE /eventos/:id

Elimina un evento. Requiere rol `administrador`.

```http
DELETE /eventos/4
Authorization: Bearer <token>
```

**Respuesta exitosa:** HTTP `204 No Content`.

No devuelve cuerpo JSON.

Si el evento no existe, responde `404 Not Found`.

## 7. Validaciones y reglas de negocio

El modelo y la capa de servicio implementan las siguientes reglas:

- `codigo`: texto obligatorio, máximo 30 caracteres y valor único.
- `nombre`: texto obligatorio, máximo 100 caracteres.
- `fecha`: fecha real en formato `AAAA-MM-DD`.
- `asistentes_esperados`: entero entre 1 y 2147483647.
- `tipo`: únicamente `conferencia`, `taller` o `feria`.
- `id`: entero positivo.
- No se permiten eventos con códigos duplicados.

### Regla de código único

La tabla `eventos` tiene una restricción `UNIQUE` sobre `codigo`.

Cuando MySQL detecta un código duplicado, la capa de servicio devuelve:

```http
409 Conflict
```

**Ejemplo de respuesta:**

```json
{
  "error": "El código del evento ya está registrado"
}
```

Las operaciones utilizan consultas SQL parametrizadas para evitar concatenar directamente datos del usuario.

## 8. Seguridad JWT

El microservicio `ms-usuarios` genera los tokens JWT utilizados para acceder a `ms-eventos`.

### Servicios locales

| Servicio | Dirección |
|---|---|
| `ms-usuarios` | `http://127.0.0.1:3001` |
| `ms-eventos` | `http://127.0.0.1:3011` |

### Inicio de sesión

```http
POST http://127.0.0.1:3001/usuarios/login
Content-Type: application/json
```

**Ejemplo:**

```json
{
  "email": "USUARIO_CONFIGURADO",
  "password": "CONTRASENA_LOCAL"
}
```

Se debe utilizar un usuario existente en la base de datos local de `ms-usuarios`.

El token recibido se envía en las solicitudes protegidas:

```http
Authorization: Bearer <token>
```

El middleware `src/middlewars/auth.js` verifica el JWT y comprueba el rol del usuario.

### Permisos

| Operación | Administrador | Otros roles autenticados |
|---|---|---|
| GET `/eventos` | Permitido | Permitido |
| GET `/eventos/:id` | Permitido | Permitido |
| POST `/eventos` | Permitido | Denegado |
| PUT `/eventos/:id` | Permitido | Denegado |
| DELETE `/eventos/:id` | Permitido | Denegado |

El rol autorizado para crear, actualizar y eliminar es `administrador`.

- Token ausente o inválido: `401 Unauthorized`.
- Token válido sin permisos suficientes: `403 Forbidden`.

## 9. Códigos HTTP

| Código | Significado | Ejemplo |
|---|---|---|
| 200 | Operación exitosa | GET y PUT |
| 201 | Recurso creado | POST válido |
| 204 | Recurso eliminado | DELETE válido |
| 400 | Solicitud inválida | Datos incorrectos |
| 401 | No autenticado | Token ausente |
| 403 | Acceso prohibido | Usuario sin permisos |
| 404 | Recurso inexistente | ID no encontrado |
| 409 | Conflicto | Código duplicado |
| 500 | Error interno | Fallo inesperado |

Los errores son gestionados mediante `HttpError` y el middleware centralizado de Express.

## 10. Registro de peticiones HTTP

El archivo `src/app.js` incluye un middleware que registra las solicitudes cuando finaliza cada respuesta.

La terminal muestra:

- Método HTTP.
- Ruta solicitada.
- Código HTTP devuelto.
- IDs consultados, creados, actualizados o eliminados cuando corresponde.

**Ejemplo ilustrativo:**

```text
GET /eventos → 200 | IDs consultados: 1, 2, 3
GET /eventos?tipo=taller → 200 | IDs consultados: 2
POST /eventos → 201 | ID creado: 4
PUT /eventos/4 → 200 | ID actualizado: 4
DELETE /eventos/4 → 204 | ID eliminado: 4
GET /eventos → 401
POST /eventos → 403
```

Esto permite comprobar las operaciones CRUD, las validaciones y los controles de acceso.

## 11. Pruebas con Postman

La colección se encuentra en:

```text
ms-eventos/docs/ms-eventos (usuarios).postman_collection.json
```

Incluye solicitudes de:

- Inicio de sesión.
- Consultas GET.
- Filtro por tipo.
- Creación POST.
- Actualización PUT.
- Eliminación DELETE.
- Validación de datos.
- Rechazo de códigos duplicados.
- Autenticación y permisos.

### Importar la colección

1. Abrir Postman.
2. Seleccionar **Import**.
3. Elegir el archivo JSON de `docs`.
4. Crear un Environment llamado `M3-Eventos`.
5. Configurar las variables necesarias.

### Variables de Postman

| Variable | Uso |
|---|---|
| `baseUrl` | `http://127.0.0.1:3011` |
| `loginUrl` | `http://127.0.0.1:3001/usuarios/login` |
| `tokenAdmin` | JWT de administrador |
| `tokenAdmisiones` | JWT de admisiones |
| `eventoId` | ID del evento temporal |
| `codigoPrueba` | Código único de prueba |

Las contraseñas y los tokens deben conservarse únicamente en el entorno local, nunca en el repositorio público.

### Ejecución de las pruebas

El orden recomendado es:

1. Login de administrador.
2. Login de admisiones.
3. Consultas GET.
4. Validaciones negativas.
5. Crear evento temporal.
6. Actualizar evento temporal.
7. Eliminar evento temporal.

La colección utiliza variables dinámicas para evitar modificar los tres registros iniciales.

Durante la preparación se obtuvo:

**18 pruebas aprobadas, 0 fallidas y 0 errores.**

Cada integrante debe ejecutar sus propias pruebas y guardar evidencia del resultado en su computador.

## 12. Preparación de máquinas virtuales

La preparación local y la preparación de infraestructura son actividades separadas.

### svrBog1 — 172.16.2.42

Servidor destinado a:

- DNS Bind9.
- Zona `m3examen.com`.
- MySQL.
- Reglas de firewall para permitir MySQL únicamente desde `svrBog2`.

### svrBog2 — 172.16.2.43

Servidor preparado con:

- Node.js 22.
- Apache.
- Módulos `proxy` y `proxy_http`.
- Cliente MySQL.
- Usuario `nodeapps`.
- Microservicio `ms-usuarios` funcionando.

### Restricciones antes del examen

No realizar todavía estas acciones:

- Desplegar `ms-eventos` en `svrBog2`.
- Crear `eventos_db` en `svrBog1`.
- Crear un nuevo VirtualHost de Apache para `ms-eventos`.
- Registrar `ms-eventos` como servicio systemd.
- Incorporar relaciones o campos de integración del microservicio proveedor.

Estas tareas corresponden a la evaluación supervisada, según las instrucciones que entregue la docente.

## 13. Repositorio GitHub

Repositorio público:

https://github.com/Chantrex11/ms-eventos-m3

Contiene:

- `ms-eventos`.
- `ms-usuarios`.
- Esquema SQL.
- Código fuente en capas.
- Colección Postman.
- Configuración de ejemplo.
- Documentación.

Ambos integrantes colaboran mediante commits en el mismo repositorio.

## 14. Consideraciones de seguridad

- No subir archivos `.env`.
- No publicar claves JWT ni contraseñas.
- Evitar almacenar credenciales reales en colecciones Postman.
- Utilizar consultas SQL parametrizadas.
- Validar los datos antes de acceder a la base.
- Aplicar autorización por roles desde el backend.
- Mantener separadas las bases de datos de los microservicios.
