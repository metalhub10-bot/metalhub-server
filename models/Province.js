const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const ProvinceSchema = new mongoose.Schema({
	name: String,
}, { timestamps: true });

module.exports = mongoose.model('Province', ProvinceSchema);