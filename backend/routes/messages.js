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

    // OPTIMIZATION: Fetch sender, receiver, and existing match in PARALLEL
    const [sender, receiver, existingMatch] = await Promise.all([
      User.findById(senderId),
      User.findById(receiverId),
      Match.findOne({ users: { $all: [senderId, receiverId] } }),
    ]);

    if (!sender)
      return res.status(404).json({ ok: false, error: "Sender not found" });
    if (!receiver)
      return res.status(404).json({ ok: false, error: "Receiver not found" });

    // Check gender and handle messaging rules
    const isMale = sender.gender?.toLowerCase() === "male";
    const isFemale = sender.gender?.toLowerCase() === "female";
    let needsSenderSave = false;
    const FREE_MESSAGES_FOR_MALES = 3;

    // FEMALES - COMPLETELY FREE, NO RESTRICTIONS
    if (isFemale) {
      // Females can message unlimited, completely free
      // No subscription, no coins, no limits
      sender.messagesSent = (sender.messagesSent || 0) + 1;
      needsSenderSave = true;
    }
    // MALES - First 3 messages free, then require subscription
    else if (isMale) {
      const messagesSent = sender.messagesSent || 0;
      
      // First 3 messages are FREE for males
      if (messagesSent < FREE_MESSAGES_FOR_MALES) {
        // Free message - just increment counter
        sender.messagesSent = messagesSent + 1;
        needsSenderSave = true;
      } else {
        // After 3 free messages, require subscription
        if (!sender.subscription?.isLifetime) {
          return res.status(403).json({
            ok: false,
            error: `You've used your ${FREE_MESSAGES_FOR_MALES} free messages. Subscribe to continue messaging!`,
            requiresSubscription: true,
            freeMessagesUsed: messagesSent,
            freeMessagesLimit: FREE_MESSAGES_FOR_MALES,
          });
        }
        
        // Has subscription - allow messaging
        sender.messagesSent = messagesSent + 1;
        needsSenderSave = true;
      }
    } else {
      // Not male or female - require match
      return res.status(403).json({
        ok: false,
        error: "Please match first to send messages.",
      });
    }

    // Use existing match or create new one
    let match = existingMatch;
    let isNewMatch = false;

    // If no match exists, create conversation (not a real match, just for messaging)
    if (!match) {
      match = new Match({
        users: [senderId, receiverId],
        createdAt: new Date(),
        lastMessageAt: new Date(),
        isFemaleInitiated: true, // Flag to indicate female started conversation
      });
      isNewMatch = true;
    }

    // Create message
    const message = new Message({
      match: match._id,
      sender: senderId,
      receiver: receiverId,
      content,
      messageType,
    });

    // OPTIMIZATION: Save all in PARALLEL
    const saveOperations = [message.save()];

    if (isNewMatch) {
      saveOperations.push(match.save());
    } else {
      saveOperations.push(
        Match.findByIdAndUpdate(match._id, { lastMessageAt: new Date() })
      );
    }

    if (needsSenderSave) {
      saveOperations.push(sender.save());
    }

    await Promise.all(saveOperations);

    // OPTIMIZATION: Create notification ASYNC (fire-and-forget) - don't block response
    Notification.create({
      recipient: receiverId,
      sender: senderId,
      type: "message",
      message:
        sender.name +
        ' sent you a message: "' +
        content.substring(0, 50) +
        (content.length > 50 ? "..." : "") +
        '"',
      read: false,
    })
      .then(() => {
        console.log("✅ Notification created for receiver:", receiverId);
      })
      .catch((notifError) => {
        console.error("⚠️ Failed to create notification:", notifError);
      });

    // Populate sender info
    await message.populate("sender", "name photos");

    res.json({
      ok: true,
      message,
      matchId: match._id,
      coinsRemaining: sender.coins, // Hidden from user, but used for redirect logic
      messagesSent: sender.messagesSent,
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

    // OPTIMIZATION: Fetch match and messages in PARALLEL
    const [match, messages] = await Promise.all([
      Match.findById(matchId).lean(),
      Message.find({ match: matchId })
        .populate("sender", "name photos")
        .populate("receiver", "name photos")
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit),
    ]);

    if (!match)
      return res.status(404).json({ ok: false, error: "Match not found" });

    const members = match.users.map(String);
    if (!members.includes(String(userId))) {
      return res.status(403).json({ ok: false, error: "Not authorized" });
    }

    // OPTIMIZATION: Mark messages as read ASYNC (fire-and-forget) - don't block response
    Message.updateMany(
      { match: matchId, receiver: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    ).catch((err) => console.error("Failed to mark messages as read:", err));

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

    // OPTIMIZATION: Fetch sender and match in PARALLEL instead of sequential
    const [sender, match] = await Promise.all([
      User.findById(userId),
      Match.findById(matchId),
    ]);

    if (!sender)
      return res.status(404).json({ ok: false, error: "User not found" });
    if (!match)
      return res.status(404).json({ ok: false, error: "Match not found" });

    const members = match.users.map(String);
    if (!members.includes(String(userId))) {
      return res.status(403).json({ ok: false, error: "Not authorized" });
    }

    // Find receiver (the other user in the match)
    const receiverId = members.find((id) => id !== String(userId));

    // Messaging rules based on gender
    const isMale = sender.gender?.toLowerCase() === "male";
    const isFemale = sender.gender?.toLowerCase() === "female";
    const hasLifetimeSubscription = sender.subscription?.isLifetime === true;
    const FREE_MESSAGES_FOR_MALES = 3;

    let needsSenderSave = false;

    // FEMALE USERS - COMPLETELY FREE, NO RESTRICTIONS AT ALL
    if (isFemale) {
      // Females can message unlimited and completely free
      // No subscription required, no coins required, no limits
      sender.messagesSent = (sender.messagesSent || 0) + 1;
      needsSenderSave = true;
    }
    // MALE USER LOGIC - First 3 messages free, then require subscription
    else if (isMale) {
      const messagesSent = sender.messagesSent || 0;
      
      // First 3 messages are FREE for males
      if (messagesSent < FREE_MESSAGES_FOR_MALES) {
        // Free message - just increment counter
        sender.messagesSent = messagesSent + 1;
        needsSenderSave = true;
      } else {
        // After 3 free messages, require subscription
        if (!hasLifetimeSubscription) {
          return res.status(403).json({
            ok: false,
            error: `You've used your ${FREE_MESSAGES_FOR_MALES} free messages. Subscribe to continue messaging!`,
            requiresSubscription: true,
            freeMessagesUsed: messagesSent,
            freeMessagesLimit: FREE_MESSAGES_FOR_MALES,
          });
        }
        
        // Has subscription - allow messaging
        sender.messagesSent = messagesSent + 1;
        needsSenderSave = true;
      }
    }
    // OTHER GENDERS - Require match
    else {
      return res.status(403).json({
        ok: false,
        error: "Messaging requires a valid match.",
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

    // OPTIMIZATION: Save message, update match, and save sender (if needed) in PARALLEL
    const saveOperations = [
      message.save(),
      Match.findByIdAndUpdate(matchId, { lastMessageAt: new Date() }),
    ];

    if (needsSenderSave) {
      saveOperations.push(sender.save());
    }

    await Promise.all(saveOperations);

    // OPTIMIZATION: Create notification ASYNC (fire-and-forget) - don't block response
    Notification.create({
      recipient: receiverId,
      sender: userId,
      type: "message",
      message:
        sender.name +
        ' sent you a message: "' +
        content.substring(0, 50) +
        (content.length > 50 ? "..." : "") +
        '"',
      read: false,
    })
      .then(() => {
        console.log("✅ Notification created for receiver:", receiverId);
      })
      .catch((notifError) => {
        console.error("⚠️ Failed to create notification:", notifError);
      });

    // Populate sender info for response
    await message.populate("sender", "name photos");

    res.json({
      ok: true,
      message,
      coinsRemaining: sender.coins, // Hidden from user, used for redirect logic
      messagesSent: sender.messagesSent,
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
        const lastMessage = await Message.findOne({ match: match._id }).sort({
          createdAt: -1,
        });

        const unreadCount = await Message.countDocuments({
          match: match._id,
          receiver: userId,
          isRead: false,
        });

        const otherUser = match.users.find(
          (user) => String(user._id) !== String(userId)
        );

        return {
          matchId: match._id,
          user: otherUser,
          lastMessage,
          unreadCount,
          lastMessageAt: match.lastMessageAt || match.createdAt,
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
