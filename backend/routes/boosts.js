// routes/boosts.js
import express from "express";
import auth from "../middleware/auth.js";
import Boost from "../models/Boost.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

const router = express.Router();

// Boost pricing configuration (in Rupees for direct purchase)
const BOOST_PRICES = {
  visibility: { price: 20, duration: 30 }, // ₹20 for 30 minutes visibility boost
  superlike: { price: 50, duration: 0 }, // ₹50 for 5 super likes pack
  spotlight: { price: 99, duration: 60 }, // ₹99 for 1 hour spotlight
};

/**
 * GET /api/boosts/available
 * Get available boost options and user's current boosts
 */
router.get("/available", auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ ok: false, error: "User not found" });

    // Check if male user has lifetime subscription
    const isMale = user.gender?.toLowerCase() === "male";
    const hasLifetimeSubscription = user.subscription?.isLifetime === true;

    if (isMale && !hasLifetimeSubscription) {
      return res.status(403).json({
        ok: false,
        error: "Subscription required",
        requiresSubscription: true,
      });
    }

    // Get active boosts
    const activeBoosts = await Boost.find({
      user: userId,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    const boostOptions = Object.entries(BOOST_PRICES).map(([type, config]) => ({
      type,
      price: config.price,
      duration: config.duration,
      description: getBoostDescription(type),
    }));

    res.json({
      ok: true,
      boostOptions,
      activeBoosts,
      userCoins: user.coins,
      superLikes: user.boosts?.superLikes || 0,
      hasSubscription: hasLifetimeSubscription,
    });
  } catch (err) {
    console.error("GET /api/boosts/available error:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * POST /api/boosts/purchase
 * Purchase a boost with Razorpay (direct payment in Rupees)
 */
router.post("/purchase", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      boostType,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = req.body;

    if (!BOOST_PRICES[boostType]) {
      return res.status(400).json({ ok: false, error: "Invalid boost type" });
    }

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ ok: false, error: "User not found" });

    // Check if male user has lifetime subscription
    const isMale = user.gender?.toLowerCase() === "male";
    const hasLifetimeSubscription = user.subscription?.isLifetime === true;

    if (isMale && !hasLifetimeSubscription) {
      return res.status(403).json({
        ok: false,
        error: "Subscription required",
        requiresSubscription: true,
      });
    }

    const boostConfig = BOOST_PRICES[boostType];

    // Handle different boost types
    if (boostType === "visibility" || boostType === "spotlight") {
      const expiresAt = new Date(Date.now() + boostConfig.duration * 60 * 1000);

      const boost = new Boost({
        user: userId,
        type: boostType,
        duration: boostConfig.duration,
        price: boostConfig.price,
        expiresAt,
      });
      await boost.save();

      // Update user's boost tracking
      if (!user.boosts) user.boosts = {};
      user.boosts[boostType] = expiresAt;
    } else if (boostType === "superlike") {
      // Add 5 super likes to user's account
      if (!user.boosts) user.boosts = {};
      user.boosts.superLikes = (user.boosts.superLikes || 0) + 5;

      const boost = new Boost({
        user: userId,
        type: boostType,
        duration: 0,
        price: boostConfig.price,
        expiresAt: new Date(), // immediate
      });
      await boost.save();
    }

    await user.save();

    // Record transaction
    await Transaction.create({
      user: userId,
      amount: boostConfig.price,
      orderId: `boost_${Date.now()}_${userId}`,
      razorpayPaymentId: razorpay_payment_id || null,
      razorpayOrderId: razorpay_order_id || null,
      status: "paid",
      currency: "INR",
      metadata: {
        boostType,
        description: `Purchased ${boostType} boost`,
      },
    });

    res.json({
      ok: true,
      message: `${boostType} boost activated successfully`,
      superLikes: user.boosts?.superLikes || 0,
    });
  } catch (err) {
    console.error("POST /api/boosts/purchase error:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * GET /api/boosts/history
 * Get user's boost purchase history
 */
router.get("/history", auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const boosts = await Boost.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ ok: true, boosts });
  } catch (err) {
    console.error("GET /api/boosts/history error:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

function getBoostDescription(type) {
  const descriptions = {
    visibility: "Increase your profile visibility for 30 minutes",
    superlike: "Get 5 Super Likes to show special interest",
    spotlight: "Be featured at the top for 1 hour",
  };
  return descriptions[type] || "";
}

export default router;
