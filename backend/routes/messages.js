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

    // Check if sender is female
    const isFemale = sender.gender?.toLowerCase() === 'female';
    if (!isFemale) {
      return res.status(403).json({ 
        ok: false, 
        error: "Only female users can send direct messages. Please match first." 
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
        message: `${sender.name} sent you a message: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
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
      isFreeForFemale: true
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
 * Females can message anyone without match - auto-creates match
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

    // Check if this is the first message in the conversation
    const existingMessages = await Message.countDocuments({ match: matchId });
    const isFirstMessage = existingMessages === 0;

    // Coins/Subscription Logic for sending messages
    const MESSAGE_COST = 10; // Cost per message in coins
    const hasActiveSubscription = sender.subscription?.active && 
      sender.subscription?.expiresAt && 
      new Date(sender.subscription.expiresAt) > new Date();

    // Females get free messaging - no coins required
    const isFemale = sender.gender?.toLowerCase() === 'female';
    
    let coinsDeducted = 0;

    // If not first message, not female, and user doesn't have subscription, check coins
    if (!isFirstMessage && !isFemale && !hasActiveSubscription) {
      if (sender.coins < MESSAGE_COST) {
        return res.status(402).json({ 
          ok: false, 
          error: "Insufficient coins to send message",
          coinsRequired: MESSAGE_COST,
          currentCoins: sender.coins,
          needSubscription: true
        });
      }

      // Deduct coins for sending message (males only)
      sender.coins -= MESSAGE_COST;
      coinsDeducted = MESSAGE_COST;
      await sender.save();
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
        message: `${sender.name} sent you a message: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
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
      coinsDeducted,
      remainingCoins: sender.coins,
      isFreeForFemale: isFemale
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