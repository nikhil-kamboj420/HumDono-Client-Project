import express from "express";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /api/subscription/activate-passkey
 * Activate premium/coins using multiple pass keys
 */
router.post("/activate-passkey", authMiddleware, async (req, res) => {
  try {
    const { passKey } = req.body;

    if (!passKey) {
      return res.status(400).json({ success: false, message: "Pass key required" });
    }

    const userId = req.user.userId;
    let rewardType = '';
    let rewardAmount = 0;
    let customMessage = '';

    // Check which pass key was used
   if (passKey.trim() === process.env.PASSKEY_699) {
      // Lifetime Access
      rewardType = 'lifetime';
      customMessage = '🎉 Hurray! You unlocked Lifetime Access!';
      
      let subscription = await Subscription.findOne({ userId });
      if (subscription) {
        subscription.isActive = true;
        subscription.plan = "lifetime";
        subscription.expiresAt = null;
        await subscription.save();
      } else {
        subscription = new Subscription({
          userId,
          plan: "lifetime",
          isActive: true,
          startedAt: new Date(),
          expiresAt: null,
        });
        await subscription.save();
      }
      
      await User.findByIdAndUpdate(userId, { 
        isPremium: true,
        'subscription.active': true,
        'subscription.isLifetime': true
      });

    } else if (passKey.trim() === process.env.PASSKEY_999) {
      // 999 coins
      rewardType = 'coins';
      rewardAmount = 999;
      customMessage = '🎁 Yay! You got 999 coins!';
      
      await User.findByIdAndUpdate(userId, { 
        $inc: { coins: 999 }
      });

    } else if (passKey.trim() === process.env.PASSKEY_1999) {
      // 1999 coins
      rewardType = 'coins';
      rewardAmount = 1999;
      customMessage = '💎 Amazing! You got 1999 coins!';
      
      await User.findByIdAndUpdate(userId, { 
        $inc: { coins: 1999 }
      });

    } else if (passKey.trim() === process.env.PASSKEY_4999) {
      // 4999 coins
      rewardType = 'coins';
      rewardAmount = 4999;
      customMessage = '👑 Woohoo! You got 4999 coins!';
      
      await User.findByIdAndUpdate(userId, { 
        $inc: { coins: 4999 }
      });

    } else {
      return res.status(400).json({ success: false, message: "Invalid pass key" });
    }

    res.json({
      success: true,
      message: customMessage,
      rewardType,
      rewardAmount
    });
  } catch (error) {
    console.error("Error activating pass key:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * GET /api/subscription/me
 * Check current subscription status
 */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const subscription = await Subscription.findOne({ userId, isActive: true });
    const isPremium = !!subscription;

    res.json({
      success: true,
      isPremium,
      subscription: subscription || null,
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
