const { Pool } = require('pg');
const { databaseUrl, nodeEnv } = require('./env');

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err);
});

async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  if (nodeEnv === 'development') {
    console.log('SQL ejecutado', { text, duration, filas: result.rowCount });
  }
  return result;
}

module.exports = { pool, query };
