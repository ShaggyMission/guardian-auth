# guardian-auth

API de autenticación y persistencia para Guardian. Node.js + Express + PostgreSQL + Clerk.

No hace análisis de IA — eso lo hace tu API FastAPI (`guardian-ai`). Este backend:

1. Verifica el JWT de Clerk.
2. Crea/recupera el usuario en PostgreSQL.
3. Reenvía el audio a Guardian AI.
4. Guarda el resultado **solo si el usuario está logueado**. Si es invitado, responde y no guarda nada.

## 1. Instalación

```bash
cd guardian-auth
npm install
cp .env.example .env
```

Edita `.env` con tus datos reales (ver sección Clerk más abajo).

## 2. Base de datos

Crea la base de datos vacía:

```bash
createdb guardian_db
```

Ejecuta la migración (aplica `src/database/schema.sql`):

```bash
npm run db:migrate
```

Esto crea las tablas `usuarios`, `analisis`, `tecnicas`, `frases` con sus relaciones y triggers.

## 3. Cómo integrar Clerk (paso a paso)

### a) En el Dashboard de Clerk
1. Crea una aplicación en https://dashboard.clerk.com
2. Ve a **API Keys** y copia:
   - `CLERK_SECRET_KEY` (empieza con `sk_...`) → va en el `.env` de este backend, **nunca en el frontend**.
   - `CLERK_PUBLISHABLE_KEY` (empieza con `pk_...`) → va en la app Expo.

### b) En Expo (React Native)
Instala el SDK:

```bash
npx expo install @clerk/clerk-expo expo-secure-store
```

Envuelve tu app con `ClerkProvider` usando la `pk_...` publishable key. Cuando el usuario inicia sesión, Clerk te da un token de sesión. Cada vez que llames a este backend, agrega el header:

```
Authorization: Bearer <token_de_clerk>
```

Ejemplo con `useAuth()` de `@clerk/clerk-expo`:

```js
const { getToken } = useAuth();
const token = await getToken();

fetch('http://TU_BACKEND/api/analisis', {
  method: 'POST',
  headers: token ? { Authorization: `Bearer ${token}` } : {},
  body: formData, // incluye el audio
});
```

Si el usuario eligió **"Continuar como invitado"**, simplemente **no mandes el header Authorization**. El backend detecta la ausencia de token y trata la petición como invitado automáticamente (no necesitas mandar `guest: true` a mano, el propio middleware `optionalAuth` lo resuelve).

### c) En este backend (ya implementado)
- `src/middlewares/auth.js` verifica el token contra Clerk usando `CLERK_SECRET_KEY`.
- `requireAuth`: bloquea si no hay token válido (rutas de perfil e historial).
- `optionalAuth`: permite invitado o usuario (ruta de análisis).
- `src/models/userModel.js` → `findOrCreateFromClerk`: crea el usuario en PostgreSQL la primera vez que se ve su `clerk_id`.

No necesitas crear usuarios manualmente: el primer request autenticado los crea solo.

## 4. Levantar el servidor

```bash
npm run dev
```

Prueba: `GET http://localhost:4000/health` → `{ ok: true }`

## 5. Endpoints

| Método | Ruta                     | Auth requerida | Descripción                                   |
|--------|--------------------------|-----------------|------------------------------------------------|
| GET    | /health                  | No              | Healthcheck                                    |
| POST   | /api/analisis            | Opcional        | Sube audio, lo analiza; guarda solo si hay login|
| GET    | /api/analisis/historial  | Sí              | Lista los análisis del usuario logueado         |
| GET    | /api/analisis/:id        | Sí              | Detalle de un análisis (técnicas + frases)      |
| GET    | /api/usuarios/perfil     | Sí              | Perfil del usuario (lo crea si no existe)       |

## 6. Variables de entorno (`.env`)

Ver `.env.example`. Las más importantes:

- `DATABASE_URL`: cadena de conexión de PostgreSQL.
- `CLERK_SECRET_KEY` / `CLERK_PUBLISHABLE_KEY`: credenciales de Clerk.
- `GUARDIAN_AI_URL`: URL donde corre tu API FastAPI (ej. `http://localhost:8000`).

## 7. Estructura

```
guardian-auth/
  src/
    config/       # env.js, db.js
    database/     # schema.sql, migrate.js
    middlewares/  # auth.js (Clerk), errorHandler.js
    models/       # userModel.js, analysisModel.js
    services/     # userService.js, analysisService.js, guardianAiService.js
    controllers/   # userController.js, analysisController.js
    routes/       # userRoutes.js, analysisRoutes.js
    server.js
```

## 8. Notas / próximos cambios sugeridos

- En producción, restringe `cors()` al dominio real de tu app (ahora está abierto para desarrollo).
- Considera cachear el `clerkClient.users.getUser()` (hoy se llama en cada request); Clerk permite leer datos básicos directamente del payload del JWT si configuras "session claims" personalizados, ahorrando esa llamada extra.
- Agrega rate limiting (`express-rate-limit`) al endpoint `/api/analisis` para evitar abuso desde invitados.
