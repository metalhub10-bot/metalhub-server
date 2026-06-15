const Session = require('../models/Session');

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