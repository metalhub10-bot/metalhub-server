require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connect } = require('./db/connection');

connect();

const app = express();
app.use(cors());
// Aceptar payloads JSON más grandes (por ejemplo avatar en base64)
app.use(express.json({ limit: '8mb' }));

app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/publicaciones', require('./routes/publicaciones'));
app.use('/api/v1/metales', require('./routes/metales'));
app.use('/api/v1/suscripcion', require('./routes/suscripcion'));

app.get('/health', (req, res) => res.json({ ok: true }));

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log('Server on http://localhost:' + PORT));
}

module.exports = app;
