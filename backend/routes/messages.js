// routes/messages.js
import express from "express";
import auth from "../middleware/auth.js";
import Message from "../models/Message.js";
import Match from "../models/Match.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

const router = express.Router();

/**
 * POST /api/messages/direct/:receiverId
 * Send direct message to any user (females only - creates conversation)
 */
router.post("/direct/:receiverId", auth, async (req, res) => {
  try {
    const senderId = req.user.userId;
    const { receiverId } = req.params;
    const { content, messageType = "text" } = req.body;

    if (!content && messageType === "text") {
      return res.status(400).json({ ok: false, error: "Content required" });
    }

    // Get sender details
    const sender = await User.findById(senderId);
    if (!sender) return res.status(404).json({ ok: false, error: "Sender not found" });

    // Check gender and handle coin deduction for males
    const isMale = sender.gender?.toLowerCase() === 'male';
    const isFemale = sender.gender?.toLowerCase() === 'female';
    
    // FEMALES - COMPLETELY FREE, NO RESTRICTIONS
    if (isFemale) {
      // Females can message unlimited, completely free
      // No subscription, no coins, no limits
    } 
    // MALES - Require subscription and coins
    else if (isMale) {
      // Male users need lifetime subscription
      if (!sender.subscription?.isLifetime) {
        return res.status(403).json({ 
          ok: false, 
          error: "Lifetime subscription required",
          requiresSubscription: true
        });
      }
      
      // Check coins (10 coins per message - hidden from user)
      if (sender.coins < 10) {
        return res.status(402).json({ 
          ok: false, 
          error: "Insufficient coins",
          requiresCoins: true
        });
      }
      
      // Deduct 10 coins silently
      sender.coins -= 10;
      sender.messagesSent = (sender.messagesSent || 0) + 1;
      await sender.save();
    } else {
      // Not male or female - require match
      return res.status(403).json({ 
        ok: false, 
        error: "Please match first to send messages." 
      });
    }

    // Get receiver details
    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ ok: false, error: "Receiver not found" });

    // Check if match/conversation already exists
    let match = await Match.findOne({
      users: { $all: [senderId, receiverId] }
    });

    // If no match exists, create conversation (not a real match, just for messaging)
    if (!match) {
      match = new Match({
        users: [senderId, receiverId],
        createdAt: new Date(),
        lastMessageAt: new Date(),
        isFemaleInitiated: true // Flag to indicate female started conversation
      });
      await match.save();
    }

    // Create message
    const message = new Message({
      match: match._id,
      sender: senderId,
      receiver: receiverId,
      content,
      messageType
    });

    await message.save();
    
    // Update match's lastMessageAt
    match.lastMessageAt = new Date();
    await match.save();

    // Create notification for receiver
    try {
      await Notification.create({
        recipient: receiverId,
        sender: senderId,
        type: 'message',
        message: sender.name + " sent you a message: \"" + content.substring(0, 50) + (content.length > 50 ? '...' : '') + "\"",
        read: false
      });
      console.log('✅ Notification created for receiver:', receiverId);
    } catch (notifError) {
      console.error('⚠️ Failed to create notification:', notifError);
      // Don't fail the message send if notification fails
    }

    // Populate sender info
    await message.populate("sender", "name photos");

    res.json({ 
      ok: true, 
      message,
      matchId: match._id,
      coinsRemaining: sender.coins, // Hidden from user, but used for redirect logic
      messagesSent: sender.messagesSent
    });
  } catch (err) {
    console.error("POST /api/messages/direct/:receiverId error:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * GET /api/messages/:matchId
 * Get all messages for a specific match
 */
router.get("/:matchId", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { matchId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is part of the match
    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ ok: false, error: "Match not found" });
    
    const members = match.users.map(String);
    if (!members.includes(String(userId))) {
      return res.status(403).json({ ok: false, error: "Not authorized" });
    }

    const messages = await Message.find({ match: matchId })
      .populate("sender", "name photos")
      .populate("receiver", "name photos")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Mark messages as read
    await Message.updateMany(
      { match: matchId, receiver: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ ok: true, messages: messages.reverse() });
  } catch (err) {
    console.error("GET /api/messages/:matchId error:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * POST /api/messages/:matchId
 * Send a message in a match (with coins/subscription logic)
 * Females can message unlimited and completely free
 */
router.post("/:matchId", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { matchId } = req.params;
    const { content, messageType = "text", gift } = req.body;

    if (!content && messageType === "text") {
      return res.status(400).json({ ok: false, error: "Content required" });
    }

    // Get sender user details first
    const sender = await User.findById(userId);
    if (!sender) return res.status(404).json({ ok: false, error: "User not found" });

    // Verify match exists and user is part of it
    let match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ ok: false, error: "Match not found" });
    
    const members = match.users.map(String);
    if (!members.includes(String(userId))) {
      return res.status(403).json({ ok: false, error: "Not authorized" });
    }

    // Find receiver (the other user in the match)
    const receiverId = members.find(id => id !== String(userId));

    // Coins/Subscription Logic for sending messages
    const MESSAGE_COST = 10; // Cost per message in coins (hidden from user)
    const isMale = sender.gender?.toLowerCase() === 'male';
    const isFemale = sender.gender?.toLowerCase() === 'female';
    const hasLifetimeSubscription = sender.subscription?.isLifetime === true;
    
    let coinsDeducted = 0;

    // FEMALE USERS - COMPLETELY FREE, NO RESTRICTIONS AT ALL
    if (isFemale) {
      // Females can message unlimited and completely free
      // No subscription required, no coins required, no limits
      // Just skip all checks
    } 
    // MALE USER LOGIC - Requires lifetime subscription + coins
    else if (isMale) {
      // Check lifetime subscription
      if (!hasLifetimeSubscription) {
        return res.status(403).json({ 
          ok: false, 
          error: "Lifetime subscription required",
          requiresSubscription: true
        });
      }
      
      // Check coins (hidden from user)
      if (sender.coins < MESSAGE_COST) {
        return res.status(402).json({ 
          ok: false, 
          error: "Insufficient coins",
          requiresCoins: true
        });
      }

      // Deduct coins silently
      sender.coins -= MESSAGE_COST;
      sender.messagesSent = (sender.messagesSent || 0) + 1;
      coinsDeducted = MESSAGE_COST;
      await sender.save();
    }
    // OTHER GENDERS - Require match
    else {
      return res.status(403).json({ 
        ok: false, 
        error: "Messaging requires a valid match." 
      });
    }

    const message = new Message({
      match: matchId,
      sender: userId,
      receiver: receiverId,
      content,
      messageType,
      gift: messageType === "gift" ? gift : undefined,
    });

    await message.save();
    
    // Update match's lastMessageAt
    match.lastMessageAt = new Date();
    await match.save();

    // Create notification for receiver
    try {
      await Notification.create({
        recipient: receiverId,
        sender: userId,
        type: 'message',
        message: sender.name + " sent you a message: \"" + content.substring(0, 50) + (content.length > 50 ? '...' : '') + "\"",
        read: false
      });
      console.log('✅ Notification created for receiver:', receiverId);
    } catch (notifError) {
      console.error('⚠️ Failed to create notification:', notifError);
      // Don't fail the message send if notification fails
    }

    // Populate sender info for response
    await message.populate("sender", "name photos");

    res.json({ 
      ok: true, 
      message,
      coinsRemaining: sender.coins, // Hidden from user, used for redirect logic
      messagesSent: sender.messagesSent
    });
  } catch (err) {
    console.error("POST /api/messages/:matchId error:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * GET /api/messages/conversations
 * Get all conversations (matches with messages) for the user
 */
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const matches = await Match.find({ users: userId })
      .populate("users", "name photos lastActiveAt")
      .sort({ lastMessageAt: -1 });

    const conversations = await Promise.all(
      matches.map(async (match) => {
        const lastMessage = await Message.findOne({ match: match._id })
          .sort({ createdAt: -1 });
        
        const unreadCount = await Message.countDocuments({
          match: match._id,
          receiver: userId,
          isRead: false
        });

        const otherUser = match.users.find(user => String(user._id) !== String(userId));

        return {
          matchId: match._id,
          user: otherUser,
          lastMessage,
          unreadCount,
          lastMessageAt: match.lastMessageAt || match.createdAt
        };
      })
    );

    res.json({ ok: true, conversations });
  } catch (err) {
    console.error("GET /api/messages error:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

export default router;