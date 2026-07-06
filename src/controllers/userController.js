const userService = require('../services/userService');

async function obtenerPerfil(req, res, next) {
  try {
    const usuario = await userService.obtenerOCrearUsuario(req.auth);
    res.json({ usuario });
  } catch (err) {
    next(err);
  }
}

module.exports = { obtenerPerfil };
