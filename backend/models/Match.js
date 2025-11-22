// models/Match.js
import mongoose from "mongoose";

/**
 * Match schema
 * Stores a mutual match between two users.
 * We store usersSorted string (userA_userB) for a unique constraint.
 */
const MatchSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
  usersKey: { type: String, required: true, unique: true }, // deterministic key for uniqueness
  createdAt: { type: Date, default: Date.now },
  lastMessageAt: { type: Date },
});

// create usersKey before save
MatchSchema.pre("validate", function (next) {
  if (!this.users || this.users.length !== 2) return next(new Error("Matches must have exactly 2 users"));
  // sort ids to create deterministic key
  const sorted = this.users.map(String).sort();
  this.usersKey = sorted.join("_");
  next();
});

export default mongoose.models.Match || mongoose.model("Match", MatchSchema);
