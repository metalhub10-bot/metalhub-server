const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nombre: { type: String, required: true },
  avatarUrl: String,
  rol: String,
  bio: String,
  ubicacion: String,
  rating: { type: Number, default: 0 },
  operaciones: { type: Number, default: 0 },
  verificado: { type: Boolean, default: false },
  whatsapp: String,
  suscripcionActiva: { type: Boolean, default: false },
  plan: String,
  vencimientoSuscripcion: Date,
}, { timestamps: true });

userSchema.set('toJSON', {
  transform: (_, obj) => {
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;
    delete obj.password;
    return obj;
  }
});

module.exports = mongoose.model('User', userSchema);
