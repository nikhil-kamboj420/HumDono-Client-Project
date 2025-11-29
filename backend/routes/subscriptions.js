// backend/routes/subscriptions.js
import express from "express";
import auth from "../middleware/auth.js";
import User from "../models/User.js";
import Subscription from "../models/Subscription.js";

const router = express.Router();

// Define subscription plans (static for now)
const SUBSCRIPTION_PLANS = {
  "plan_weekly": {
    id: "plan_weekly",
    name: "Weekly Plan",
    price: 199,
    duration: 7, // days
    coinsIncluded: 100,
    features: {
      unlimitedMessages: true,
      prioritySupport: false,
      profileBoost: false,
    },
  },
  "plan_monthly": {
    id: "plan_monthly",
    name: "Monthly Plan",
    price: 499,
    duration: 30, // days
    coinsIncluded: 500,
    features: {
      unlimitedMessages: true,
      prioritySupport: true,
      profileBoost: true,
    },
  },
  "plan_lifetime": {
    id: "plan_lifetime",
    name: "Lifetime Access",
    price: 999,
    duration: 36500, // ~100 years
    coinsIncluded: 2000,
    features: {
      unlimitedMessages: true,
      prioritySupport: true,
      profileBoost: true,
      seeWhoLikedYou: true,
      rewindFeature: true,
    },
  },
};

/**
 * GET /api/subscriptions/plans
 * Get available subscription plans
 */
router.get("/plans", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Return plans array
    const plans = Object.values(SUBSCRIPTION_PLANS);
    res.json({
      success: true,
      plans,
    });
  } catch (error) {
    console.error("GET /api/subscriptions/plans error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

/**
 * POST /api/subscriptions/create
 * Create subscription order (DISABLED)
 */
router.post("/create", auth, async (req, res) => {
  return res.status(400).json({
    success: false,
    error: "Online payments are currently disabled.",
  });
});

/**
 * POST /api/subscriptions/verify
 * Verify subscription payment and activate (DISABLED)
 */
router.post("/verify", auth, async (req, res) => {
  return res.status(400).json({
    success: false,
    error: "Online payments are currently disabled.",
  });
});

/**
 * GET /api/subscriptions/current
 * Get current user subscription
 */
router.get("/current", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Find active subscription
    const subscription = await Subscription.findOne({
      user: userId,
      status: "active",
      endDate: { $gt: new Date() },
    }).sort({ endDate: -1 });

    if (!subscription) {
      return res.json({
        success: true,
        isSubscribed: false,
      });
    }

    res.json({
      success: true,
      isSubscribed: true,
      subscription: {
        planName: subscription.planName,
        expiresAt: subscription.endDate,
        features: subscription.features,
      },
    });
  } catch (error) {
    console.error("GET /api/subscriptions/current error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

/**
 * POST /api/subscriptions/cancel
 * Cancel current subscription
 */
router.post("/cancel", auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const subscription = await Subscription.findOne({
      user: userId,
      status: "active",
    });

    if (!subscription) {
      return res
        .status(404)
        .json({ success: false, error: "No active subscription found" });
    }

    // Mark as cancelled (but keep active until end date technically, or expire immediately depending on logic)
    // For now, let's just set status to cancelled
    subscription.status = "cancelled";
    await subscription.save();

    res.json({
      success: true,
      message: "Subscription cancelled successfully",
    });
  } catch (error) {
    console.error("POST /api/subscriptions/cancel error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to cancel subscription" });
  }
});

export default router;
