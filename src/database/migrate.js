const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function migrate() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  console.log('Ejecutando migracion de base de datos...');
  try {
    await pool.query(schema);
    console.log('Migracion completada correctamente.');
  } catch (err) {
    console.error('Error al ejecutar la migracion:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();
