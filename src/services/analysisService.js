const guardianAiService = require('./guardianAiService');
const analysisModel = require('../models/analysisModel');
const userService = require('./userService');

/**
 * procesarAnalisis
 * Logica central del flujo invitado/usuario (Fase 6):
 *
 * 1. Siempre se envia el audio a Guardian AI.
 * 2. Si es invitado (req.isGuest === true) -> se devuelve el resultado y NO se guarda nada.
 * 3. Si es usuario autenticado -> se busca/crea su fila en PostgreSQL y se guarda el analisis completo.
 */
async function procesarAnalisis({ file, isGuest, auth }) {
  const resultadoIA = await guardianAiService.analizarAudio({
    buffer: file.buffer,
    filename: file.originalname,
    mimetype: file.mimetype,
  });

  const {
    riesgo = null,
    resumen = null,
    recomendacion = null,
    tecnicas = [],
    frases = [],
  } = resultadoIA;

  if (isGuest) {
    return {
      guardado: false,
      riesgo,
      resumen,
      recomendacion,
      tecnicas,
      frases,
    };
  }

  const usuario = await userService.obtenerOCrearUsuario(auth);

  const analisisGuardado = await analysisModel.crearAnalisisCompleto({
    usuarioId: usuario.id,
    nombreAudio: file.originalname,
    riesgo,
    resumen,
    recomendacion,
    tecnicas,
    frases,
  });

  return { guardado: true, ...analisisGuardado };
}

module.exports = { procesarAnalisis };
