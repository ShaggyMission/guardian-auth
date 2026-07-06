const { query } = require('../config/db');

async function findByClerkId(clerkId) {
  const result = await query('SELECT * FROM usuarios WHERE clerk_id = $1', [clerkId]);
  return result.rows[0] || null;
}

async function create({ clerkId, nombre, email, foto }) {
  const result = await query(
    `INSERT INTO usuarios (clerk_id, nombre, email, foto)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [clerkId, nombre, email, foto]
  );
  return result.rows[0];
}

/**
 * findOrCreateFromClerk
 * Este es el punto clave de la Fase 4:
 * la primera vez que un usuario autenticado llega al backend,
 * se crea automaticamente su fila en PostgreSQL.
 */
async function findOrCreateFromClerk({ clerkId, nombre, email, foto }) {
  const existente = await findByClerkId(clerkId);
  if (existente) return existente;
  return create({ clerkId, nombre, email, foto });
}

module.exports = { findByClerkId, create, findOrCreateFromClerk };
