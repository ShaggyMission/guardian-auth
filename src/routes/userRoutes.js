const express = require('express');
const { requireAuth } = require('../middlewares/auth');
const userController = require('../controllers/userController');

const router = express.Router();

// GET /api/usuarios/perfil
router.get('/perfil', requireAuth, userController.obtenerPerfil);

module.exports = router;
