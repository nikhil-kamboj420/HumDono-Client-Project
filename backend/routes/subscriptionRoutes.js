import express from "express";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /api/subscription/activate-passkey
 * Activate lifetime premium using a pass key
 */
router.post("/activate-passkey", authMiddleware, async (req, res) => {
  try {
    const { passKey } = req.body;

    if (!passKey) {
      return res.status(400).json({ success: false, message: "Pass key required" });
    }

    if (!process.env.LIFETIME_PASS_KEY) {
      return res.status(500).json({ success: false, message: "Server config error" });
    }

    if (passKey.trim() !== process.env.LIFETIME_PASS_KEY) {
      return res.status(400).json({ success: false, message: "Invalid pass key" });
    }

    const userId = req.user.userId;

    // Check if subscription exists
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

    // Update User model
    await User.findByIdAndUpdate(userId, { isPremium: true });

    res.json({
      success: true,
      message: "Lifetime premium activated successfully",
      subscription,
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
