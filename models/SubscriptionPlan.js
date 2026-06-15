const SubscriptionPlanSchema =
new mongoose.Schema({

    name: String,

    type: {
        type: String,
        enum: ['publication', 'industry']
    },

    price: Number,

    billingCycle: {
        type: String,
        enum: ['monthly', 'yearly']
    },

    publicationLimit: Number,

    industryAccess: {
        type: Boolean,
        default: false
    },

    features: {
        type: [String],
        default: []
    },

    isActive: {
        type: Boolean,
        default: true
    }

})