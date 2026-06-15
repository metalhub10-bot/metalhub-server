const User = require('../models/User');
const Publicacion = require('../models/Publicacion');
const PublicacionInteraccion = require('../models/PublicacionInteraccion');
const Session = require('../models/Session');


exports.addVista = async (req, res) => {
  try {
    const existe = await PublicacionInteraccion.findOne({
      publicacionId: req.params.id,
      usuarioId: req.userId,
      tipo: 'vista'
    });

    if (!existe) {
      await PublicacionInteraccion.create({
        publicacionId: req.params.id,
        usuarioId: req.userId,
        tipo: 'vista'
      });

      await Publicacion.findByIdAndUpdate(
        req.params.id,
        {
          $inc: { vistas: 1 }
        }
      );
    }

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.addContacto = async (req, res) => {
  try {
    const existe = await PublicacionInteraccion.findOne({
      publicacionId: req.params.id,
      usuarioId: req.userId,
      tipo: 'contacto'
    });

    if (!existe) {
      await PublicacionInteraccion.create({
        publicacionId: req.params.id,
        usuarioId: req.userId,
        tipo: 'contacto'
      });

      await Publicacion.findByIdAndUpdate(
        req.params.id,
        {
          $inc: { contactos: 1 }
        }
      );
    }

    return res.json({ success: true });

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};