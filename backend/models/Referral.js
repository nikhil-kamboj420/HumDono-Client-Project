// models/Referral.js
import mongoose from "mongoose";

/**
 * Referral schema for affiliate/referral system
 */
const ReferralSchema = new mongoose.Schema({
  referrer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  referred: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  referralCode: { type: String, required: true, index: true },
  status: { 
    type: String, 
    enum: ["pending", "completed", "rewarded"], 
    default: "pending" 
  },
  rewardAmount: { type: Number, default: 0 }, // coins earned
  completedAt: { type: Date }, // when referred user completed required action
  rewardedAt: { type: Date }, // when referrer got the reward
  createdAt: { type: Date, default: Date.now },
});

// Prevent duplicate referrals
ReferralSchema.index({ referrer: 1, referred: 1 }, { unique: true });

export default mongoose.models.Referral || mongoose.model("Referral", ReferralSchema);