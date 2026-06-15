const mongoose = require('mongoose');

const publicacionInteraccionSchema = new mongoose.Schema({
  publicacionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Publicacion', required: true },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tipo: { type: String, enum: ['vista', 'contacto'], required: true }
}, {
  timestamps: true
});

publicacionInteraccionSchema.index(
  {
    publicacionId: 1,
    usuarioId: 1,
    tipo: 1
  },
  {
    unique: true
  }
);

module.exports = mongoose.model('PublicacionInteraccion', publicacionInteraccionSchema);