const express = require('express');
const Publicacion = require('../models/Publicacion');
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

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

function isValidExpoToken(token) {
  return typeof token === 'string' && token.startsWith('ExponentPushToken[');
}

async function sendExpoPushMessages(messages) {
  if (!messages || (Array.isArray(messages) && messages.length === 0)) return;

  const payload = Array.isArray(messages) ? messages : [messages];

  try {
    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      // eslint-disable-next-line no-console
      console.error('Error enviando push a Expo:', res.status, text);
    } else {
      const json = await res.json().catch(() => null);
      if (json && json.data) {
        // eslint-disable-next-line no-console
        console.log('Respuesta Expo push:', json.data);
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error de red al enviar push a Expo:', err);
  }
}

async function notifyNewPublication(pub) {
  try {
    // Buscar todos los usuarios con tokens registrados, excepto el creador de la publicación
    const users = await User.find({
      _id: { $ne: pub.usuarioId },
      expoPushTokens: { $exists: true, $not: { $size: 0 } },
    })
      .select('expoPushTokens')
      .lean();

    const tokens = [
      ...new Set(
        users
          .flatMap((u) => u.expoPushTokens || [])
          .filter((t) => isValidExpoToken(t))
      ),
    ];

    if (!tokens.length) return;

    const esCompra = pub.tipo === 'compro';
    const title = esCompra ? 'Nueva compra en MetalHub' : 'Nueva venta en MetalHub';

    let body = `${pub.metal} · ${pub.cantidad} ${pub.unidad}`;
    if (pub.precioAConvenir) {
      body += ' · Precio a convenir';
    } else if (pub.precio != null) {
      body += ` · $${Number(pub.precio).toLocaleString('es-AR')} por ${pub.unidad}`;
    }
    if (pub.urgente) {
      body = `⚡ Express · ${body}`;
    }

    const messages = tokens.map((token) => ({
      to: token,
      channelId: 'metalhub',
      sound: 'soundnotification.wav',
      title,
      body,
      data: {
        tipo: pub.tipo,
        metal: pub.metal,
        publicacionId: pub._id.toString(),
        urgente: !!pub.urgente,
      },
    }));

    await sendExpoPushMessages(messages);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error al notificar nueva publicación:', err);
  }
}

router.get('/', async (req, res) => {
  try {
    const { tipo, orden, busqueda, metal, ubicacion, pagina = 1, limite = 20 } = req.query;
    const filter = {};
    if (tipo && tipo !== 'todos') {
      if (tipo === 'compran') filter.tipo = 'compro';
      else if (tipo === 'venden') filter.tipo = 'vendo';
    }
    if (metal) filter.metal = new RegExp(metal, 'i');
    if (ubicacion) filter.ubicacion = new RegExp(ubicacion, 'i');
    if (busqueda) {
      const re = new RegExp(busqueda, 'i');
      filter.$or = [
        { metal: re },
        { descripcion: re },
        { ubicacion: re },
      ];
    }

    // Nunca mostrar publicaciones cerradas
    filter.cerrada = { $ne: true };

    // Express expira en 24hs, Mercado expira en 7 días
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    filter.$and = [
      {
        $or: [
          { urgente: true, createdAt: { $gte: oneDayAgo } },
          { urgente: { $ne: true }, createdAt: { $gte: sevenDaysAgo } },
        ],
      },
    ];
    const sort = {};
    if (orden === 'precio_asc') sort.precio = 1;
    else if (orden === 'precio_desc') sort.precio = -1;
    else if (orden === 'volumen') sort.cantidad = -1;
    else sort.createdAt = -1;
    const skip = (Math.max(1, parseInt(pagina, 10)) - 1) * Math.min(100, parseInt(limite, 10) || 20);
    const limit = Math.min(100, parseInt(limite, 10) || 20);
    const [items, total] = await Promise.all([
      Publicacion.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Publicacion.countDocuments(filter),
    ]);
    const userIds = [...new Set(items.map((i) => i.usuarioId.toString()))];
    const users = await User.find({ _id: { $in: userIds } }).lean();
    const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u]));
    const data = items.map((p) => {
      const u = userMap[p.usuarioId.toString()];
      const pub = { ...p, id: p._id.toString(), creadoEn: p.createdAt };
      delete pub._id;
      delete pub.__v;
      delete pub.createdAt;
      delete pub.updatedAt;
      pub.usuario = u
        ? {
            id: u._id.toString(),
            nombre: u.nombre,
            rating: u.rating ?? 0,
            ubicacion: u.ubicacion,
            verificado: u.verificado ?? false,
            whatsapp: u.whatsapp,
            avatarUrl: u.avatarUrl,
          }
        : null;
      return pub;
    });
    return res.json({ success: true, data, total });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/mias', requireAuth, async (req, res) => {
  try {
    const { pagina = 1, limite = 20 } = req.query;
    const skip = (Math.max(1, parseInt(pagina, 10)) - 1) * Math.min(100, parseInt(limite, 10) || 20);
    const limit = Math.min(100, parseInt(limite, 10) || 20);
    const [items, total] = await Promise.all([
      Publicacion.find({ usuarioId: req.userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Publicacion.countDocuments({ usuarioId: req.userId }),
    ]);
    const user = await User.findById(req.userId).lean();
    const data = items.map((p) => {
      const pub = { ...p, id: p._id.toString(), creadoEn: p.createdAt };
      delete pub._id;
      delete pub.__v;
      delete pub.createdAt;
      delete pub.updatedAt;
      pub.usuario = user
        ? {
            id: user._id.toString(),
            nombre: user.nombre,
            rating: user.rating ?? 0,
            ubicacion: user.ubicacion,
            verificado: user.verificado ?? false,
            whatsapp: user.whatsapp,
            avatarUrl: user.avatarUrl,
          }
        : null;
      return pub;
    });
    return res.json({ success: true, data, total });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const pub = await Publicacion.findById(req.params.id).lean();
    if (!pub) return res.status(404).json({ success: false, message: 'Publicación no encontrada' });
    const user = await User.findById(pub.usuarioId).lean();
    const data = { ...pub, id: pub._id.toString(), creadoEn: pub.createdAt };
    delete data._id;
    delete data.__v;
    delete data.createdAt;
    delete data.updatedAt;
    data.usuario = user
      ? {
          id: user._id.toString(),
          nombre: user.nombre,
          rating: user.rating ?? 0,
          ubicacion: user.ubicacion,
          verificado: user.verificado ?? false,
          whatsapp: user.whatsapp,
          avatarUrl: user.avatarUrl,
        }
      : null;

    let esPropia = false;
    const sessionId = req.headers['x-session-id'];
    if (sessionId) {
      const session = await Session.findOne({ sessionId }).lean();
      if (session && String(session.userId) === String(pub.usuarioId)) {
        esPropia = true;
      }
    }

    return res.json({ success: true, data, esPropia });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { tipo, metal, cantidad, unidad, precio, precioAConvenir, descripcion, entrega, ubicacion, urgente } = req.body || {};
    if (!tipo || !metal || cantidad == null || !unidad) {
      return res.status(400).json({ success: false, message: 'Faltan tipo, metal, cantidad o unidad' });
    }
    const doc = await Publicacion.create({
      tipo,
      metal,
      cantidad: Number(cantidad),
      unidad,
      precio: precio != null ? Number(precio) : undefined,
      precioAConvenir: !!precioAConvenir,
      descripcion,
      entrega,
      ubicacion,
      urgente: !!urgente,
      usuarioId: req.userId,
    });

    // Enviar notificación push global (no bloquea la respuesta al cliente)
    notifyNewPublication(doc).catch(() => {});

    return res.status(201).json({ success: true, message: 'Publicación creada', data: doc.toJSON() });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const pub = await Publicacion.findOne({ _id: req.params.id, usuarioId: req.userId });
    if (!pub) return res.status(404).json({ success: false, message: 'Publicación no encontrada' });
    const { tipo, metal, cantidad, unidad, precio, precioAConvenir, descripcion, entrega, ubicacion, urgente, cerrada } = req.body || {};
    if (tipo !== undefined) pub.tipo = tipo;
    if (metal !== undefined) pub.metal = metal;
    if (cantidad !== undefined) pub.cantidad = Number(cantidad);
    if (unidad !== undefined) pub.unidad = unidad;
    if (precio !== undefined) pub.precio = Number(precio);
    if (precioAConvenir !== undefined) pub.precioAConvenir = !!precioAConvenir;
    if (descripcion !== undefined) pub.descripcion = descripcion;
    if (entrega !== undefined) pub.entrega = entrega;
    if (ubicacion !== undefined) pub.ubicacion = ubicacion;
    if (urgente !== undefined) pub.urgente = !!urgente;
    if (cerrada !== undefined) pub.cerrada = !!cerrada;
    await pub.save();
    return res.json({ success: true, message: 'Publicación actualizada', data: pub.toJSON() });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await Publicacion.deleteOne({ _id: req.params.id, usuarioId: req.userId });
    if (result.deletedCount === 0) return res.status(404).json({ success: false, message: 'Publicación no encontrada' });
    return res.json({ success: true, message: 'Publicación eliminada' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
