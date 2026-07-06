const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { port, nodeEnv } = require('./config/env');
const userRoutes = require('./routes/userRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(helmet());
app.use(cors()); // en produccion, restringe "origin" al dominio/app real
app.use(morgan(nodeEnv === 'development' ? 'dev' : 'combined'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true, servicio: 'guardian-auth' });
});

app.use('/api/usuarios', userRoutes);
app.use('/api/analisis', analysisRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`guardian-auth escuchando en el puerto ${port} (${nodeEnv})`);
});
