// models/Friend.js
import mongoose from "mongoose";

/**
 * Friend schema for friend requests and friendships
 */
const FriendSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  status: { 
    type: String, 
    enum: ["pending", "accepted", "declined", "blocked"], 
    default: "pending" 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Prevent duplicate friend requests
FriendSchema.index({ requester: 1, recipient: 1 }, { unique: true });

// Update timestamp on save
FriendSchema.pre("save", function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Friend || mongoose.model("Friend", FriendSchema);