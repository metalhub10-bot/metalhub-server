const mongoose = require('mongoose');

const metalSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
});

metalSchema.set('toJSON', {
  transform: (_, obj) => {
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;
    return obj;
  }
});

module.exports = mongoose.model('Metal', metalSchema);
