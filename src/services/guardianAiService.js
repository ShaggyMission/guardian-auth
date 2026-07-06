const axios = require('axios');
const FormData = require('form-data');
const { guardianAiUrl, guardianAiTimeoutMs } = require('../config/env');

/**
 * Envia el archivo de audio a la API de IA (FastAPI) y devuelve
 * el resultado del analisis (riesgo, resumen, recomendacion, tecnicas, frases).
 *
 * Se espera que Guardian AI responda algo como:
 * {
 *   "riesgo": 82,
 *   "resumen": "...",
 *   "recomendacion": "...",
 *   "tecnicas": ["Urgencia", "Suplantacion"],
 *   "frases": ["...", "..."]
 * }
 */
async function analizarAudio({ buffer, filename, mimetype }) {
  const form = new FormData();
  form.append('audio', buffer, { filename, contentType: mimetype });

  const response = await axios.post(`${guardianAiUrl}/analizar`, form, {
    headers: form.getHeaders(),
    timeout: guardianAiTimeoutMs,
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });

  return response.data;
}

module.exports = { analizarAudio };
