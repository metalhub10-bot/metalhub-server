const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nombre: { type: String, required: true },
  avatarUrl: String,
  rol: { type: String, enum: ['user','moderator', 'admin', 'superadmin'], default: 'user' },
  bio: String,
  ubicacion: String,
  rating: { type: Number, default: 0 },
  operaciones: { type: Number, default: 0 },
  verificado: { type: Boolean, default: false },
  whatsapp: String,
  subscription: {
    postPlan: {
      type: String,
      enum: ['free', 'basic', 'premium'],
      default: 'free'
    },
    industryPlan: {
      type: String,
      enum: ['none', 'industry']
    }
  },
  suscripcionActiva: { type: Boolean, default: false },
  plan: String,
  vencimientoSuscripcion: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  /**
   * Tokens de notificaciones push Expo asociados al usuario.
   * Se usa un array para soportar múltiples dispositivos por cuenta.
   */
  expoPushTokens: {
    type: [String],
    default: [],
  },
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

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
