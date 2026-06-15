const SubscriptionSchema =
new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubscriptionPlan',
        required: true
    },

    status: {
        type: String,
        enum: [
            'pending',
            'active',
            'expired',
            'cancelled',
            'past_due'
        ],
        default: 'pending'
    },

    startedAt: Date,

    expiresAt: Date,

    paymentProvider: String,

    paymentId: String,

    autoRenew: {
        type: Boolean,
        default: true
    }

}, { timestamps: true })