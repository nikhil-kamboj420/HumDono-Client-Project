// routes/boosts.js
import express from "express";
import auth from "../middleware/auth.js";
import Boost from "../models/Boost.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

const router = express.Router();

// Boost pricing configuration
const BOOST_PRICES = {
  visibility: { coins: 50, duration: 30 }, // 30 minutes visibility boost
  superlike: { coins: 10, duration: 0 }, // instant, adds 1 super like
  rewind: { coins: 5, duration: 0 } // instant, allows undo last swipe
};

/**
 * GET /api/boosts/available
 * Get available boost options and user's current boosts
 */
router.get("/available", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ ok: false, error: "User not found" });

    // Get active boosts
    const activeBoosts = await Boost.find({
      user: userId,
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    const boostOptions = Object.entries(BOOST_PRICES).map(([type, config]) => ({
      type,
      coinCost: config.coins,
      duration: config.duration,
      description: getBoostDescription(type)
    }));

    res.json({ 
      ok: true, 
      boostOptions,
      activeBoosts,
      userCoins: user.coins,
      superLikes: user.boosts?.superLikes || 0
    });
  } catch (err) {
    console.error("GET /api/boosts/available error:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * POST /api/boosts/purchase
 * Purchase a boost
 */
router.post("/purchase", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { boostType, couponCode, originalCost, finalCost, discountAmount } = req.body;

    if (!BOOST_PRICES[boostType]) {
      return res.status(400).json({ ok: false, error: "Invalid boost type" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ ok: false, error: "User not found" });

    const boostConfig = BOOST_PRICES[boostType];
    const actualCost = finalCost || boostConfig.coins;

    // Check if user has enough coins
    if (user.coins < actualCost) {
      return res.status(400).json({ 
        ok: false, 
        error: "Insufficient coins",
        required: actualCost,
        balance: user.coins 
      });
    }

    // Deduct coins
    user.coins -= actualCost;

    // Handle different boost types
    if (boostType === "visibility") {
      const expiresAt = new Date(Date.now() + boostConfig.duration * 60 * 1000);
      
      const boost = new Boost({
        user: userId,
        type: boostType,
        duration: boostConfig.duration,
        coinCost: actualCost,
        originalCost: originalCost || boostConfig.coins,
        discountAmount: discountAmount || 0,
        couponCode: couponCode || null,
        expiresAt
      });
      await boost.save();

      // Update user's boost tracking
      if (!user.boosts) user.boosts = {};
      user.boosts.visibility = expiresAt;
      
    } else if (boostType === "superlike") {
      // Add super like to user's account
      if (!user.boosts) user.boosts = {};
      user.boosts.superLikes = (user.boosts.superLikes || 0) + 1;
      
      const boost = new Boost({
        user: userId,
        type: boostType,
        duration: 0,
        coinCost: actualCost,
        originalCost: originalCost || boostConfig.coins,
        discountAmount: discountAmount || 0,
        couponCode: couponCode || null,
        expiresAt: new Date() // immediate
      });
      await boost.save();
    }

    await user.save();

    // Record transaction
    await Transaction.create({
      user: userId,
      amount: boostConfig.coins,
      coins: -boostConfig.coins, // Negative for debit
      orderId: `boost_${Date.now()}_${userId}`,
      status: "paid",
      currency: "COINS",
      metadata: { 
        boostType,
        description: `Purchased ${boostType} boost`
      }
    });

    res.json({ 
      ok: true, 
      message: `${boostType} boost activated successfully`,
      remainingCoins: user.coins,
      superLikes: user.boosts?.superLikes || 0
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
    superlike: "Get 1 Super Like to show special interest",
    rewind: "Undo your last swipe decision"
  };
  return descriptions[type] || "";
}

export default router;