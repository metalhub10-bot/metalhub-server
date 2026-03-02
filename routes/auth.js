const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
const Session = require('../models/Session');

const router = express.Router();

function resJson(res, success, data = null, message = null) {
  const body = { success };
  if (data) body.data = data;
  if (message) body.message = message;
  if (!success) body.error = message;
  return res.status(success ? 200 : 400).json(body);
}

router.post('/register', async (req, res) => {
  try {
    const { email, password, nombre } = req.body || {};
    if (!email || !password || !nombre) {
      return resJson(res, false, null, 'Faltan email, password o nombre');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return resJson(res, false, null, 'Email no válido');
    }
    const exists = await User.findOne({ email });
    if (exists) return resJson(res, false, null, 'El email ya está registrado');
    const user = await User.create({ email, password, nombre });
    const userObj = user.toJSON();
    return res.json({ success: true, message: 'Usuario creado', user: userObj });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return resJson(res, false, null, 'Faltan email o password');
    }
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return resJson(res, false, null, 'Credenciales incorrectas');
    }
    const sessionId = crypto.randomBytes(24).toString('hex');
    await Session.create({ sessionId, userId: user._id });
    const userObj = user.toJSON();
    return res.json({ success: true, message: 'Sesión iniciada', user: userObj, sessionId });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    if (sessionId) await Session.deleteOne({ sessionId });
    return res.json({ success: true, message: 'Sesión cerrada' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
