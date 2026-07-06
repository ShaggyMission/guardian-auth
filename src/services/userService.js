const userModel = require('../models/userModel');

async function obtenerOCrearUsuario(auth) {
  return userModel.findOrCreateFromClerk({
    clerkId: auth.clerkId,
    nombre: auth.nombre,
    email: auth.email,
    foto: auth.foto,
  });
}

module.exports = { obtenerOCrearUsuario };
