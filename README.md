# GuardIAn-Auth 🔐
 
Servicio backend de autenticación para **GuardIAn**, la aplicación móvil de seguridad forense que analiza audios para detectar estafas y fraudes.
 
Este módulo gestiona el **registro** e **inicio de sesión** de usuarios, permitiendo guardar un historial seguro de análisis o utilizar la app en modo invitado.
 
---
 
## 🧱 Stack tecnológico
 
- **Node.js** + **Express** — servidor y enrutamiento
- **PostgreSQL** — base de datos relacional (tabla `usuarios`)
- **bcryptjs** — hash y verificación segura de contraseñas
- **jsonwebtoken (JWT)** — autenticación basada en tokens
- **cors** — manejo de peticiones cross-origin
- **dotenv** — gestión de variables de entorno
---
 
## 📁 Estructura relevante
 
```
GuardIAn-Auth/
├── config/
│   └── db.js              # Conexión a PostgreSQL (pool)
├── controllers/
│   └── authController.js  # Lógica de registro y login
├── routes/
│   └── authRoutes.js      # Rutas /api/auth
├── .env                    # Variables de entorno (no versionar)
└── index.js                 # Punto de entrada del servidor
```
 
---
 
## ⚙️ Variables de entorno
 
Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
 
```env
PORT=3000
JWT_SECRET=tu_clave_secreta_segura
 
# Configuración de PostgreSQL (según tu config/db.js)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=guardian_db
```
 
---
 
## 🗄️ Modelo de base de datos
 
Tabla `usuarios` esperada en PostgreSQL:
 
```sql
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100),
  email VARCHAR(150) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  creado TIMESTAMP DEFAULT NOW()
);
```
 
---
 
## 🚀 Instalación y ejecución
 
```bash
# Instalar dependencias
npm install express cors dotenv bcryptjs jsonwebtoken pg
 
# Ejecutar en desarrollo
node index.js
```
 
El servidor quedará disponible en `http://localhost:3000` (o el puerto definido en `PORT`).
 
---
 
## 📡 Endpoints de la API
 
Base path: `/api/auth`
 
### `POST /api/auth/register`
Registra un nuevo usuario en la base de datos.
 
**Body (JSON):**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "contraseñaSegura123"
}
```
 
**Respuesta exitosa (201):**
```json
{
  "message": "Usuario registrado exitosamente.",
  "user": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "creado": "2026-07-08T12:00:00.000Z"
  }
}
```
 
**Errores posibles:**
| Código | Motivo |
|--------|--------|
| 400 | Falta `email` o `password` |
| 400 | El correo ya está registrado |
| 500 | Error interno del servidor |
 
---
 
### `POST /api/auth/login`
Autentica a un usuario existente y devuelve un token JWT.
 
**Body (JSON):**
```json
{
  "email": "juan@example.com",
  "password": "contraseñaSegura123"
}
```
 
**Respuesta exitosa (200):**
```json
{
  "message": "Inicio de sesión exitoso.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@example.com"
  }
}
```
 
**Errores posibles:**
| Código | Motivo |
|--------|--------|
| 400 | Falta `email` o `password` |
| 401 | Credenciales inválidas |
| 500 | Error interno del servidor |
 
El token JWT generado expira en **24 horas** e incluye `userId` y `email` en su payload.
 
---
 
## 🔒 Seguridad
 
- Las contraseñas nunca se almacenan en texto plano: se cifran con **bcrypt** (salt rounds: 10).
- La autenticación de rutas protegidas debe validarse mediante el token JWT enviado en el header:
```
  Authorization: Bearer <token>
```
- El secreto de firma (`JWT_SECRET`) debe mantenerse fuera del control de versiones.
---
 
## 🧭 Rol dentro de GuardIAn
 
Este servicio es la puerta de entrada de usuarios al ecosistema GuardIAn:
- Permite **registro/login** para guardar un historial seguro de análisis de audio.
- Los usuarios que no deseen crear cuenta pueden usar la app en **modo invitado**, sin pasar por este módulo.