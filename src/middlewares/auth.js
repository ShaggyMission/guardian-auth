const { verifyToken, createClerkClient } = require('@clerk/backend');
const { clerkSecretKey, clerkPublishableKey } = require('../config/env');

const clerkClient = createClerkClient({ secretKey: clerkSecretKey });

/**
 * requireAuth
 * Verifica el JWT de Clerk enviado en el header Authorization.
 * Si es valido, adjunta req.auth = { clerkId, email, nombre, foto }.
 * Si NO es valido, responde 401.
 *
 * Este middleware se usa en las rutas que EXIGEN estar logueado.
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : null;

    if (!token) {
      return res.status(401).json({ error: 'Falta el token de autenticacion.' });
    }

    const { payload } = await verifyToken(token, {
      secretKey: clerkSecretKey,
    });

    // payload.sub es el clerk_id del usuario
    const clerkUser = await clerkClient.users.getUser(payload.sub);

    req.auth = {
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses?.[0]?.emailAddress || null,
      nombre: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
      foto: clerkUser.imageUrl || null,
    };

    return next();
  } catch (err) {
    console.error('Error verificando token de Clerk:', err.message);
    return res.status(401).json({ error: 'Token invalido o expirado.' });
  }
}

/**
 * optionalAuth
 * Igual que requireAuth, pero NO bloquea si no hay token.
 * Esto permite el flujo de "invitado":
 *   - Si viene JWT valido  -> req.auth = { ... } y req.isGuest = false
 *   - Si NO viene JWT      -> req.auth = null      y req.isGuest = true
 *
 * Se usa en la ruta de analisis, que acepta tanto usuarios
 * registrados como invitados.
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : null;

  if (!token) {
    req.auth = null;
    req.isGuest = true;
    return next();
  }

  try {
    const { payload } = await verifyToken(token, { secretKey: clerkSecretKey });
    const clerkUser = await clerkClient.users.getUser(payload.sub);

    req.auth = {
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses?.[0]?.emailAddress || null,
      nombre: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
      foto: clerkUser.imageUrl || null,
    };
    req.isGuest = false;
    return next();
  } catch (err) {
    // Token invalido/expirado enviado: mejor rechazar en vez de tratarlo como invitado silencioso
    console.error('Token presente pero invalido:', err.message);
    return res.status(401).json({ error: 'Token invalido o expirado.' });
  }
}

module.exports = { requireAuth, optionalAuth, clerkClient };
