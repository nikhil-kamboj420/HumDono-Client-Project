// models/Subscription.js
import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  plan: {
    type: String,
    default: "lifetime",
    enum: ["lifetime"],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: null, // lifetime plan has no expiry
  },
});

export default mongoose.models.Subscription || mongoose.model("Subscription", SubscriptionSchema);
