const express = require('express');
const User = require('../models/User');
const Publicacion = require('../models/Publicacion');

const router = express.Router();

async function requireAuth(req, res, next) {
  const sessionId = req.headers['x-session-id'];
  if (!sessionId) {
    return res.status(401).json({ success: false, message: 'Sesión requerida' });
  }
  const Session = require('../models/Session');
  const session = await Session.findOne({ sessionId }).lean();
  if (!session) {
    return res.status(401).json({ success: false, message: 'Sesión inválida' });
  }
  req.userId = session.userId;
  next();
}

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    const count = await Publicacion.countDocuments({ usuarioId: req.userId });
    const u = {
      id: user._id.toString(),
      email: user.email,
      nombre: user.nombre,
      avatarUrl: user.avatarUrl,
      rol: user.rol,
      bio: user.bio,
      ubicacion: user.ubicacion,
      rating: user.rating ?? 0,
      operaciones: user.operaciones ?? 0,
      anunciosActivos: count,
      miembroDesde: user.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear(),
    };
    return res.json({ success: true, user: u });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/me', requireAuth, async (req, res) => {
  try {
    const { nombre, bio, ubicacion, avatarUrl } = req.body || {};
    const update = {};
    if (nombre !== undefined) update.nombre = nombre;
    if (bio !== undefined) update.bio = bio;
    if (ubicacion !== undefined) update.ubicacion = ubicacion;
    if (avatarUrl !== undefined) update.avatarUrl = avatarUrl;
    const user = await User.findByIdAndUpdate(req.userId, update, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    return res.json({ success: true, message: 'Perfil actualizado', user: user.toJSON() });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
