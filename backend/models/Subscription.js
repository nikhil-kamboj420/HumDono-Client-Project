// backend/models/Subscription.js
import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  planId: {
    type: String,
    required: true,
    enum: ['basic', 'premium', 'gold']
  },
  planName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  coinsIncluded: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number, // in days
    required: true
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'pending'],
    default: 'pending'
  },
  razorpaySubscriptionId: {
    type: String,
    index: true
  },
  razorpayPlanId: {
    type: String
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  features: {
    unlimitedLikes: { type: Boolean, default: false },
    unlimitedMessages: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false },
    profileBoost: { type: Boolean, default: false },
    seeWhoLikedYou: { type: Boolean, default: false },
    rewindFeature: { type: Boolean, default: false }
  },
  paymentHistory: [{
    date: { type: Date, default: Date.now },
    amount: Number,
    status: String,
    razorpayPaymentId: String
  }]
}, {
  timestamps: true
});

// Indexes for better performance
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 });
subscriptionSchema.index({ razorpaySubscriptionId: 1 });

// Check if subscription is active
subscriptionSchema.methods.isActive = function() {
  return this.status === 'active' && this.endDate > new Date();
};

// Get remaining days
subscriptionSchema.methods.getRemainingDays = function() {
  if (!this.isActive()) return 0;
  const now = new Date();
  const diffTime = this.endDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default mongoose.model('Subscription', subscriptionSchema);