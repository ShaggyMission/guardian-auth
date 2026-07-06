const { pool } = require('../config/db');

async function crearAnalisisCompleto({
  usuarioId,
  nombreAudio,
  riesgo,
  resumen,
  recomendacion,
  tecnicas = [],
  frases = [],
}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const analisisResult = await client.query(
      `INSERT INTO analisis (usuario_id, nombre_audio, riesgo, resumen, recomendacion)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [usuarioId, nombreAudio, riesgo, resumen, recomendacion]
    );
    const analisis = analisisResult.rows[0];

    for (const tecnica of tecnicas) {
      await client.query(
        'INSERT INTO tecnicas (analisis_id, tecnica) VALUES ($1, $2)',
        [analisis.id, tecnica]
      );
    }

    for (const frase of frases) {
      await client.query(
        'INSERT INTO frases (analisis_id, frase) VALUES ($1, $2)',
        [analisis.id, frase]
      );
    }

    await client.query('COMMIT');

    return { ...analisis, tecnicas, frases };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function listarPorUsuario(usuarioId) {
  const result = await pool.query(
    `SELECT * FROM analisis WHERE usuario_id = $1 ORDER BY fecha DESC`,
    [usuarioId]
  );
  return result.rows;
}

async function obtenerAnalisisCompleto(analisisId, usuarioId) {
  const analisisResult = await pool.query(
    'SELECT * FROM analisis WHERE id = $1 AND usuario_id = $2',
    [analisisId, usuarioId]
  );
  const analisis = analisisResult.rows[0];
  if (!analisis) return null;

  const [tecnicasResult, frasesResult] = await Promise.all([
    pool.query('SELECT tecnica FROM tecnicas WHERE analisis_id = $1', [analisisId]),
    pool.query('SELECT frase FROM frases WHERE analisis_id = $1', [analisisId]),
  ]);

  return {
    ...analisis,
    tecnicas: tecnicasResult.rows.map((r) => r.tecnica),
    frases: frasesResult.rows.map((r) => r.frase),
  };
}

module.exports = { crearAnalisisCompleto, listarPorUsuario, obtenerAnalisisCompleto };
