// models/Boost.js
import mongoose from "mongoose";

/**
 * Boost schema for profile popularity boosts
 */
const BoostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: { 
    type: String, 
    enum: ["visibility", "superlike", "rewind"], 
    required: true 
  },
  duration: { type: Number, required: true }, // in minutes
  coinCost: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Index for active boosts
BoostSchema.index({ user: 1, isActive: 1, expiresAt: 1 });

export default mongoose.models.Boost || mongoose.model("Boost", BoostSchema);