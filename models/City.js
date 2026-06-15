const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const CitySchema = new mongoose.Schema({
	name: String,
}, { timestamps: true });

module.exports = mongoose.model('City', CitySchema);