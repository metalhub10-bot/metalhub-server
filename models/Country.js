const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const CountrySchema = new mongoose.Schema({
	name: String,
}, { timestamps: true });

module.exports = mongoose.model('Country', CountrySchema);