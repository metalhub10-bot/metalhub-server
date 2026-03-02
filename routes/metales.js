const express = require('express');
const Metal = require('../models/Metal');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let data = await Metal.find().sort({ nombre: 1 }).lean();
    if (data.length === 0) {
      const nombres = ['Cobre', 'Aluminio', 'Hierro', 'Bronce', 'Acero', 'Plomo', 'Zinc', 'Inoxidable', 'Chatarra Mixta', 'Otro'];
      await Metal.insertMany(nombres.map((n) => ({ nombre: n })));
      data = await Metal.find().sort({ nombre: 1 }).lean();
    }
    const list = data.map((m) => ({ id: m._id.toString(), nombre: m.nombre }));
    return res.json({ success: true, data: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
