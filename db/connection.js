const mongoose = require('mongoose');

// Cachear la conexión entre invocaciones serverless (Vercel)
let cached = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;

const connect = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = { connect };
