/**
 * Crea un usuario de prueba para poder ingresar a la app.
 * Uso: desde la raíz del server → node scripts/seed-user.js
 * Requiere MONGO_URI en .env
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const TEST_USER = {
  email: 'demo@metalhub.app',
  password: 'demo123',
  nombre: 'Usuario Demo',
  whatsapp: '+54 9 11 1234-5678',
};

async function run() {
  if (!process.env.MONGO_URI) {
    console.error('Falta MONGO_URI en .env');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  const exists = await User.findOne({ email: TEST_USER.email });
  if (exists) {
    console.log('El usuario de prueba ya existe. Credenciales:');
    printCreds();
    await mongoose.disconnect();
    process.exit(0);
    return;
  }
  await User.create(TEST_USER);
  console.log('Usuario de prueba creado.');
  printCreds();
  await mongoose.disconnect();
  process.exit(0);
}

function printCreds() {
  console.log('');
  console.log('  Email:    ' + TEST_USER.email);
  console.log('  Password: ' + TEST_USER.password);
  console.log('');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
