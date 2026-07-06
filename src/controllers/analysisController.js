const analysisService = require('../services/analysisService');
const analysisModel = require('../models/analysisModel');
const userService = require('../services/userService');

async function analizar(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Debes enviar un archivo de audio en el campo "audio".' });
    }

    const resultado = await analysisService.procesarAnalisis({
      file: req.file,
      isGuest: req.isGuest,
      auth: req.auth,
    });

    res.json(resultado);
  } catch (err) {
    next(err);
  }
}

async function historial(req, res, next) {
  try {
    const usuario = await userService.obtenerOCrearUsuario(req.auth);
    const lista = await analysisModel.listarPorUsuario(usuario.id);
    res.json({ analisis: lista });
  } catch (err) {
    next(err);
  }
}

async function detalle(req, res, next) {
  try {
    const usuario = await userService.obtenerOCrearUsuario(req.auth);
    const analisis = await analysisModel.obtenerAnalisisCompleto(req.params.id, usuario.id);
    if (!analisis) {
      return res.status(404).json({ error: 'Analisis no encontrado.' });
    }
    res.json({ analisis });
  } catch (err) {
    next(err);
  }
}

module.exports = { analizar, historial, detalle };
