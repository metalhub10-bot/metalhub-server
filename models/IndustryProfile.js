const mongoose = require('mongoose');

const IndustryProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    companyName: { type: String, required: true, trim: true },
    description: { type: String, maxlength: 1000 },
    website: String,
    whatsapp: String,
    email: String,
    logo: String,
    banner: String,
    slug: { type: String, unique: true, index: true, lowercase: true, trim: true },
    location: {
        country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },
        province: { type: mongoose.Schema.Types.ObjectId, ref: 'Province' },
        city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
        address: String
    },
    verified: { type: Boolean, default: false },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'IndustryCategory' }],
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    publicationCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model('IndustryProfile', IndustryProfileSchema);