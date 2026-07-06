const express = require('express');
const multer = require('multer');
const { requireAuth, optionalAuth } = require('../middlewares/auth');
const analysisController = require('../controllers/analysisController');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
});

// POST /api/analisis
// Acepta tanto invitados como usuarios logueados.
// Si viene Bearer token valido -> se guarda en PostgreSQL.
// Si NO viene token -> se responde el analisis sin guardar nada.
router.post('/', optionalAuth, upload.single('audio'), analysisController.analizar);

// GET /api/analisis/historial
// Solo usuarios autenticados.
router.get('/historial', requireAuth, analysisController.historial);

// GET /api/analisis/:id
// Solo usuarios autenticados (y solo ve sus propios analisis).
router.get('/:id', requireAuth, analysisController.detalle);

module.exports = router;
