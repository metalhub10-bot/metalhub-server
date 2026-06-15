const mongoose = require('mongoose');

const IndustryCategorySchema =
new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'IndustryCategory', default: null },
    icon: String,
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true })

module.exports = mongoose.model('IndustryCategory', IndustryCategorySchema);