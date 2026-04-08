require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connect } = require('./db/connection');

const app = express();
app.use(cors());
// Aceptar payloads JSON más grandes (por ejemplo avatar en base64)
app.use(express.json({ limit: '8mb' }));

// Garantizar conexión a MongoDB antes de cada request (patrón serverless)
app.use(async (req, res, next) => {
  try {
    await connect();
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error de conexión a la base de datos' });
  }
});

app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/publicaciones', require('./routes/publicaciones'));
app.use('/api/v1/metales', require('./routes/metales'));
app.use('/api/v1/suscripcion', require('./routes/suscripcion'));

app.get('/health', (req, res) => res.json({ ok: true }));
app.get('/version', (req, res) => res.json({ version: 'v2-connection-cache', timeout: 8000 }));

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log('Server on http://localhost:' + PORT));
}

module.exports = app;
