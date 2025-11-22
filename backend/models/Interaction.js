// models/Interaction.js
import mongoose from "mongoose";

/**
 * Interaction schema
 * Stores user -> user actions (like/dislike/superlike)
 */
const InteractionSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  action: { type: String, enum: ["like", "dislike", "superlike"], required: true },
  createdAt: { type: Date, default: Date.now, index: true },
});

// prevent duplicate (from,to) pairs (store latest by upsert instead)
InteractionSchema.index({ from: 1, to: 1 }, { unique: true });

export default mongoose.models.Interaction || mongoose.model("Interaction", InteractionSchema);
