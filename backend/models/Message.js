// models/Message.js
import mongoose from "mongoose";

/**
 * Message schema for chat functionality
 */
const MessageSchema = new mongoose.Schema({
  match: { type: mongoose.Schema.Types.ObjectId, ref: "Match", required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  content: { type: String, required: true },
  messageType: { type: String, enum: ["text", "image", "gift"], default: "text" },
  
  // For gift messages
  gift: {
    type: { type: String }, // gift type
    value: { type: Number }, // coin value
    image: { type: String } // gift image URL
  },
  
  // Message status
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  
  createdAt: { type: Date, default: Date.now, index: true },
});

// Index for efficient message queries
MessageSchema.index({ match: 1, createdAt: -1 });

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);