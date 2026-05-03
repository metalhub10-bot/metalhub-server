const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
const Session = require('../models/Session');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

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
    const { email, password, nombre, avatarUrl, whatsapp } = req.body || {};

    const cleanEmail = email?.trim().toLowerCase();
    const cleanPassword = password?.trim();
    const cleanNombre = nombre?.trim();

    if (!cleanEmail || !cleanPassword || !cleanNombre) {
      return resJson(res, false, null, 'Faltan datos');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return resJson(res, false, null, 'Email no válido');
    }

    const exists = await User.findOne({ email: cleanEmail });

    if (exists) return resJson(res, false, null, 'El email ya está registrado');

    const user = await User.create({
      email: cleanEmail,
      password: cleanPassword,
      nombre: cleanNombre,
      ...(avatarUrl ? { avatarUrl } : {}),
      ...(whatsapp ? { whatsapp } : {}),
    });
    const userObj = user.toJSON();
    return res.json({ success: true, message: 'Usuario creado', user: userObj });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    const cleanEmail = email?.trim().toLowerCase();
    const cleanPassword = password?.trim();

    if (!cleanEmail || !cleanPassword) {
      return resJson(res, false, null, 'Faltan email o password');
    }

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return resJson(res, false, null, 'Credenciales incorrectas');
    }

    let isMatch = false;

    if (user.password && user.password.startsWith('$2b$')) {
      // ya hasheado
      isMatch = await bcrypt.compare(cleanPassword, user.password);
    } else {
      // texto plano (legacy)
      isMatch = user.password === cleanPassword;

      // migrar automáticamente
      if (isMatch) {
        user.password = cleanPassword;
        await user.save();
      }
    }

    if (!isMatch) {
      return resJson(res, false, null, 'Credenciales incorrectas');
    }

    const sessionId = crypto.randomBytes(24).toString('hex');

    await Session.create({ sessionId, userId: user._id });

    const userObj = user.toJSON();
    return res.json({ success: true, message: 'Sesión iniciada', user: userObj, sessionId });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({
      success:false,
      message: err.message
    });
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

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body || {};

    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanEmail) {
      return resJson(res, false, null, 'Email requerido');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return resJson(res, false, null, 'Email no válido');
    }

    const user = await User.findOne({ email: cleanEmail });

    // Siempre responder igual (seguridad)
    if (!user) {
      return res.json({
        success: true,
        message: 'Si el email existe, se enviaron instrucciones',
      });
    }

    // Generar token
    const rawToken = crypto.randomBytes(32).toString('hex');

    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    if (
      user.resetPasswordExpires &&
      user.resetPasswordExpires > Date.now()
    ) {
      return res.json({ success: true });
    }

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 20; // 20 min

    await user.save();

    // 🔴 ACA enviar email (por ahora log)
    const resetLink = `metalhub://reset-password?token=${rawToken}`;

    console.log(`metalhub://reset-password?token=${rawToken}`);
    await transporter.sendMail({
      from: '"MetalHub" <soportemetalhub@gmail.com>',
      to: cleanEmail,
      subject: "Recuperar contraseña",
      html: `
        <h2>Se ha solicitado restablecer contraseña para esta cuenta, en caso de que no lo hayas hecho, ignora este email</h2>
        <p>Presioná el botón:</p>
        <a href="${resetLink}">Cambiar contraseña</a>
      `,
    });

    return res.json({
      success: true,
      message: 'Si el email existe, se enviaron instrucciones',
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body || {};

    const cleanPassword = password?.trim();

    if (!token || !cleanPassword) {
      return resJson(res, false, null, 'Datos incompletos');
    }

    if (cleanPassword.length < 6) {
      return resJson(res, false, null, 'La contraseña debe tener al menos 6 caracteres');
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return resJson(res, false, null, 'Token inválido o expirado');
    }

    user.password = cleanPassword;

    // limpiar token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    await Session.deleteMany({ userId: user._id });

    return res.json({
      success: true,
      message: 'Contraseña actualizada',
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error al restablecer contraseña' });
  }
});

module.exports = router;
