const express = require('express');
const User = require('../models/User');
const Session = require('../models/Session');

const router = express.Router();

async function requireAuth(req, res, next) {
  const sessionId = req.headers['x-session-id'];
  if (!sessionId) {
    return res.status(401).json({ success: false, message: 'Sesión requerida' });
  }
  const session = await Session.findOne({ sessionId }).lean();
  if (!session) {
    return res.status(401).json({ success: false, message: 'Sesión inválida' });
  }
  req.userId = session.userId;
  next();
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('suscripcionActiva plan vencimientoSuscripcion').lean();
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    const data = {
      activa: user.suscripcionActiva ?? false,
      plan: user.plan ?? null,
      vencimiento: user.vencimientoSuscripcion ?? null,
    };
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
