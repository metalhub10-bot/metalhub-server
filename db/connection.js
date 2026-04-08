const mongoose = require('mongoose');

let cached = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;

const connect = async () => {
  // Reutilizar si ya hay conexión activa
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // Si la conexión se cayó, resetear para reconectar
  if (mongoose.connection.readyState !== 1 && mongoose.connection.readyState !== 2) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        maxPoolSize: 1,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      })
      .catch((err) => {
        // Resetear para que el próximo request pueda reintentar
        cached.promise = null;
        cached.conn = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = { connect };
