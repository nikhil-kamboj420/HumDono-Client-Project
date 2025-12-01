// routes/boosts.js
import express from "express";
import auth from "../middleware/auth.js";
import Boost from "../models/Boost.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

const router = express.Router();

// Boost pricing configuration (in Coins)
const BOOST_PRICES = {
  visibility: { coinCost: 100, duration: 30 }, // 100 coins for 30 minutes visibility boost
  superlike: { coinCost: 150, duration: 0 }, // 150 coins for 5 super likes pack (currently hidden)
  spotlight: { coinCost: 250, duration: 60 }, // 250 coins for 1 hour spotlight
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

    // Exclude superlike from available options for now
    const boostOptions = Object.entries(BOOST_PRICES)
      .filter(([type]) => type !== "superlike")
      .map(([type, config]) => ({
        type,
        coinCost: config.coinCost,
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
  return res.status(400).json({
    ok: false,
    error: "Online payments are currently disabled.",
  });
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

router.post("/activate", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type } = req.body;

    if (!type || !BOOST_PRICES[type]) {
      return res.status(400).json({ ok: false, error: "Invalid boost type" });
    }

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ ok: false, error: "User not found" });

    const isMale = user.gender?.toLowerCase() === "male";
    const hasLifetimeSubscription = user.subscription?.isLifetime === true;

    if (isMale && !hasLifetimeSubscription) {
      return res
        .status(403)
        .json({
          ok: false,
          error: "Subscription required",
          requiresSubscription: true,
        });
    }

    const { coinCost, duration } = BOOST_PRICES[type];

    if ((user.coins || 0) < coinCost) {
      return res
        .status(402)
        .json({
          ok: false,
          error: "Insufficient coins",
          coinsRequired: coinCost,
          currentCoins: user.coins || 0,
          requiresTopup: true,
        });
    }

    user.coins = (user.coins || 0) - coinCost;

    const expiresAt = new Date(Date.now() + duration * 60 * 1000);
    const boost = await Boost.create({
      user: userId,
      type,
      duration,
      coinCost,
      isActive: true,
      expiresAt,
    });

    await user.save();

    await Transaction.create({
      user: userId,
      orderId: `boost_${type}_${Date.now()}_${userId}`,
      amount: 0,
      coins: -coinCost,
      currency: "INR",
      status: "paid",
      metadata: { type: "boost", boostType: type, duration },
    });

    return res.json({ ok: true, boost, coinsRemaining: user.coins });
  } catch (err) {
    console.error("POST /api/boosts/activate error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
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
