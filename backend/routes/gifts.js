// routes/gifts.js
import express from "express";
import auth from "../middleware/auth.js";
import Gift from "../models/Gift.js";
import User from "../models/User.js";
import Message from "../models/Message.js";
import Match from "../models/Match.js";
import Transaction from "../models/Transaction.js";

const router = express.Router();

/**
 * GET /api/gifts
 * Get all available gifts
 */
router.get("/", auth, async (req, res) => {
  try {
    const gifts = await Gift.find({ isActive: true }).sort({ coinValue: 1 });
    res.json({ success: true, ok: true, gifts });
  } catch (err) {
    console.error("GET /api/gifts error:", err);
    res.status(500).json({ success: false, ok: false, error: "Server error" });
  }
});

/**
 * POST /api/gifts/send
 * Send a gift to another user
 */
router.post("/send", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { giftId, receiverId, matchId, message = "" } = req.body;

    if (!giftId || !receiverId) {
      return res.status(400).json({ success: false, ok: false, error: "Gift ID and receiver ID required" });
    }

    // Get gift details
    const gift = await Gift.findById(giftId);
    if (!gift || !gift.isActive) {
      return res.status(404).json({ success: false, ok: false, error: "Gift not found" });
    }

    // Check user has enough coins
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, ok: false, error: "User not found" });

    if (user.coins < gift.coinValue) {
      return res.status(400).json({ 
        success: false,
        ok: false, 
        error: "Insufficient coins", 
        required: gift.coinValue,
        balance: user.coins 
      });
    }

    // Deduct coins
    user.coins -= gift.coinValue;
    await user.save();

    // Record transaction
    await Transaction.create({
      user: userId,
      orderId: `gift_${Date.now()}_${userId}`,
      amount: 0, // No money transaction, just coins
      coins: -gift.coinValue, // Negative for deduction
      currency: 'INR',
      status: 'paid',
      metadata: { 
        type: "gift_sent",
        giftId, 
        receiverId, 
        giftName: gift.name 
      }
    });

    // If matchId provided, send as message
    if (matchId) {
      const match = await Match.findById(matchId);
      if (match && match.users.map(String).includes(String(userId))) {
        const giftMessage = new Message({
          match: matchId,
          sender: userId,
          receiver: receiverId,
          content: message || `Sent you a ${gift.name}!`,
          messageType: "gift",
          gift: {
            type: gift.name,
            value: gift.coinValue,
            image: gift.image
          }
        });
        await giftMessage.save();
        
        match.lastMessageAt = new Date();
        await match.save();
      }
    }

    res.json({ 
      success: true,
      ok: true, 
      message: "Gift sent successfully",
      remainingCoins: user.coins 
    });
  } catch (err) {
    console.error("POST /api/gifts/send error:", err);
    console.error("Error details:", err.message, err.stack);
    res.status(500).json({ success: false, ok: false, error: err.message || "Server error" });
  }
});

export default router;