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
