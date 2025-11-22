import express from "express";
import auth from "../middleware/auth.js";
import Match from "../models/Match.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

const router = express.Router();

/**
 * Cost config (tweak to your app)
 * You can later move this to env/config
 */
const CHAT_COST = 5; // coins required to open chat if no subscription

/**
 * POST /api/matches/:matchId/open-chat
 * - Checks that the match exists and the requesting user is part of it.
 * - If user has active subscription -> allow.
 * - Else if user.coins >= CHAT_COST -> debit and allow.
 * - Else -> respond 402 with required info.
 */
router.post("/:matchId/open-chat", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { matchId } = req.params;
    if (!matchId) return res.status(400).json({ ok: false, error: "matchId required" });

    const match = await Match.findById(matchId).lean();
    if (!match) return res.status(404).json({ ok: false, error: "Match not found" });

    // ensure user is part of the match
    const members = (match.users || []).map(String);
    if (!members.includes(String(userId))) {
      return res.status(403).json({ ok: false, error: "Not a participant in this match" });
    }

    // load user (fresh)
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ ok: false, error: "User not found" });

    // Subscription check (simple)
    if (user.subscription && user.subscription.active && user.subscription.expiresAt && new Date(user.subscription.expiresAt) > new Date()) {
      // allowed
      return res.json({ ok: true, chatOpen: true, from: "subscription" });
    }

    // Coins check
    if ((user.coins || 0) >= CHAT_COST) {
      user.coins = (user.coins || 0) - CHAT_COST;
      await user.save();

      // record transaction
      await Transaction.create({
        user: user._id,
        type: "debit",
        amount: CHAT_COST,
        reason: "open_chat",
        meta: { matchId },
      });

      return res.json({ ok: true, chatOpen: true, from: "coins", cost: CHAT_COST, balance: user.coins });
    }

    // Not enough coins -> respond with needed amount
    const needed = Math.max(0, CHAT_COST - (user.coins || 0));
    return res.status(402).json({ ok: false, error: "Insufficient coins", needed, balance: user.coins || 0, required: CHAT_COST });
  } catch (err) {
    console.error("POST /api/matches/:matchId/open-chat error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

export default router;
