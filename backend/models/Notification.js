// models/Notification.js
import mongoose from "mongoose";

/**
 * Notification Schema
 * Stores notifications for users (likes, matches, friend requests, etc.)
 */
const NotificationSchema = new mongoose.Schema({
  // Who receives this notification
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true, 
    index: true 
  },
  
  // Who triggered this notification
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  
  // Type of notification
  type: { 
    type: String, 
    required: true,
    enum: ["like", "superlike", "match", "friend_request", "message", "phone_access_request"]
  },
  
  // Notification message/content
  message: { 
    type: String, 
    required: true 
  },
  
  // Whether the notification has been read
  read: { 
    type: Boolean, 
    default: false 
  },
  
  // Additional data (optional)
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for efficient queries
NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, type: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);