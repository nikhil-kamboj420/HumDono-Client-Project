// routes/referrals.js
import express from "express";
import auth from "../middleware/auth.js";
import Referral from "../models/Referral.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

const router = express.Router();

// Referral reward configuration
const REFERRAL_REWARDS = {
  referrer: 100, // coins for referrer when someone signs up
  referred: 50   // coins for new user who used referral code
};

/**
 * GET /api/referrals/my-code
 * Get or generate user's referral code
 */
router.get("/my-code", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ ok: false, error: "User not found" });

    // Generate referral code if doesn't exist
    if (!user.referralCode) {
      user.referralCode = generateReferralCode(user.name || user.phone);
      await user.save();
    }

    // Get referral stats
    const totalReferrals = await Referral.countDocuments({ referrer: userId });
    const completedReferrals = await Referral.countDocuments({ 
      referrer: userId, 
      status: "completed" 
    });
    const totalEarnings = await Referral.aggregate([
      { $match: { referrer: userId, status: "rewarded" } },
      { $group: { _id: null, total: { $sum: "$rewardAmount" } } }
    ]);

    res.json({ 
      ok: true, 
      referralCode: user.referralCode,
      stats: {
        totalReferrals,
        completedReferrals,
        totalEarnings: totalEarnings[0]?.total || 0
      }
    });
  } catch (err) {
    console.error("GET /api/referrals/my-code error:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * POST /api/referrals/apply-code
 * Apply a referral code (for new users)
 */
router.post("/apply-code", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { referralCode } = req.body;

    if (!referralCode) {
      return res.status(400).json({ ok: false, error: "Referral code required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ ok: false, error: "User not found" });

    // Check if user already used a referral code
    if (user.referredBy) {
      return res.status(400).json({ ok: false, error: "You have already used a referral code" });
    }

    // Find referrer by code
    const referrer = await User.findOne({ referralCode });
    if (!referrer) {
      return res.status(404).json({ ok: false, error: "Invalid referral code" });
    }

    // Can't refer yourself
    if (String(referrer._id) === String(userId)) {
      return res.status(400).json({ ok: false, error: "Cannot use your own referral code" });
    }

    // Check if referral already exists
    const existingReferral = await Referral.findOne({ 
      referrer: referrer._id, 
      referred: userId 
    });
    if (existingReferral) {
      return res.status(400).json({ ok: false, error: "Referral already exists" });
    }

    // Create referral record
    const referral = new Referral({
      referrer: referrer._id,
      referred: userId,
      referralCode,
      status: "completed",
      rewardAmount: REFERRAL_REWARDS.referrer,
      completedAt: new Date()
    });
    await referral.save();

    // Update user's referredBy
    user.referredBy = referrer._id;
    user.coins = (user.coins || 0) + REFERRAL_REWARDS.referred;
    await user.save();

    // Reward referrer
    referrer.coins = (referrer.coins || 0) + REFERRAL_REWARDS.referrer;
    await referrer.save();

    // Record transactions
    await Transaction.create([
      {
        user: userId,
        type: "credit",
        amount: REFERRAL_REWARDS.referred,
        reason: "referral_bonus",
        meta: { referralCode, referrerId: referrer._id }
      },
      {
        user: referrer._id,
        type: "credit",
        amount: REFERRAL_REWARDS.referrer,
        reason: "referral_reward",
        meta: { referralCode, referredUserId: userId }
      }
    ]);

    // Mark referral as rewarded
    referral.status = "rewarded";
    referral.rewardedAt = new Date();
    await referral.save();

    res.json({ 
      ok: true, 
      message: `Referral code applied! You earned ${REFERRAL_REWARDS.referred} coins`,
      coinsEarned: REFERRAL_REWARDS.referred,
      totalCoins: user.coins
    });
  } catch (err) {
    console.error("POST /api/referrals/apply-code error:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * GET /api/referrals/my-referrals
 * Get list of users referred by current user
 */
router.get("/my-referrals", auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const referrals = await Referral.find({ referrer: userId })
      .populate("referred", "name photos createdAt")
      .sort({ createdAt: -1 });

    res.json({ ok: true, referrals });
  } catch (err) {
    console.error("GET /api/referrals/my-referrals error:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

function generateReferralCode(name) {
  const cleanName = (name || "USER").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${cleanName.substring(0, 4)}${randomSuffix}`;
}

export default router;