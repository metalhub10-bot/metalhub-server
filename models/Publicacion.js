const mongoose = require('mongoose');

const publicacionSchema = new mongoose.Schema({
  tipo: { type: String, required: true, enum: ['vendo', 'compro'] },
  metal: { type: String, required: true },
  cantidad: { type: Number, required: true },
  unidad: { type: String, required: true, enum: ['kg', 'tn'] },
  precio: Number,
  precioAConvenir: { type: Boolean, default: false },
  descripcion: String,
  entrega: String,
  ubicacion: String,
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  urgente: { type: Boolean, default: false },
}, { timestamps: true });

publicacionSchema.set('toJSON', {
  transform: (_, obj) => {
    obj.id = obj._id.toString();
    obj.creadoEn = obj.createdAt;
    delete obj._id;
    delete obj.__v;
    delete obj.createdAt;
    delete obj.updatedAt;
    return obj;
  }
});

module.exports = mongoose.model('Publicacion', publicacionSchema);
