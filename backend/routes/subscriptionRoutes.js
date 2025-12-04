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
        coins: 100,
        'subscription.active': true,
        'subscription.isLifetime': true
      });

    } else if (passKey.trim() === process.env.PASSKEY_2999) {
      // 3200 coins package (no bonus)
      rewardType = 'coins';
      rewardAmount = 3200;
      customMessage = '💝 Awesome! You got 3200 coins!';
      
      await User.findByIdAndUpdate(userId, { 
        $inc: { coins: 3200 }
      });

    } else if (passKey.trim() === process.env.PASSKEY_999) {
      // 1301 coins (1150 + 151 bonus)
      rewardType = 'coins';
      rewardAmount = 1301;
      customMessage = '🎁 Yay! You got 1301 coins!';
      
      await User.findByIdAndUpdate(userId, { 
        $inc: { coins: 1301 }
      });

    } else if (passKey.trim() === process.env.PASSKEY_1999) {
      // 2401 coins (2200 + 201 bonus)
      rewardType = 'coins';
      rewardAmount = 2401;
      customMessage = '💎 Amazing! You got 2401 coins!';
      
      await User.findByIdAndUpdate(userId, { 
        $inc: { coins: 2401 }
      });

    } else if (passKey.trim() === process.env.PASSKEY_4999) {
      // 7001 coins (6000 + 1001 bonus)
      rewardType = 'coins';
      rewardAmount = 7001;
      customMessage = '👑 Woohoo! You got 7001 coins!';
      
      await User.findByIdAndUpdate(userId, { 
        $inc: { coins: 7001 }
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
