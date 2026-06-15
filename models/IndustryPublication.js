const mongoose = require('mongoose');

const IndustryPublicationSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'IndustryProfile', required: true },
    title: { type: String, required: true, maxlength: 120 },
    slug: { type: String, unique: true, index: true },
    description: { type: String, maxlength: 1500 },
    images: { type: [String], default: [] },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'IndustryCategory', required: true },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'IndustryCategory', default: null },
    offerType: { type: String, enum: [ 'sale', 'rental', 'service', 'purchase' ], default: 'service' },
    location: {
        country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },
        province: { type: mongoose.Schema.Types.ObjectId, ref: 'Province' },
        city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' }
    },
    locationSnapshot: { countryName: String, cityName: String, provinceName: String, addressName: String },
    views: { type: Number, default: 0 },
    favoritesCount: { type: Number, default: 0 },
    status: { type: String, enum: [ 'draft', 'pending', 'approved', 'rejected', 'paused' ], default: 'pending' },
    publishedAt: { type: Date, default: Date.now },
    expiresAt: Date,
    isActive: { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model('IndustryPublication', IndustryPublicationSchema);