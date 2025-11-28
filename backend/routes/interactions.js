// routes/interactions.js
import express from "express";
import mongoose from "mongoose";
import auth from "../middleware/auth.js";
import Interaction from "../models/Interaction.js";
import Match from "../models/Match.js";
import User from "../models/User.js";
import { createNotification } from "./notifications.js";

const router = express.Router();

/**
 * POST /api/interactions
 * body: { to: <userId>, action: "like"|"dislike"|"superlike" }
 *
 * Records an interaction. If action is "like" or "superlike", checks for reverse like
 * and creates a Match document if both liked each other.
 */
router.post("/", auth, async (req, res) => {
  try {
    const fromId = req.user.userId;
    const { to, action } = req.body;

    if (!to || !action) return res.status(400).json({ ok: false, error: "to and action are required" });
    if (!["like", "dislike", "superlike"].includes(action)) {
      return res.status(400).json({ ok: false, error: "Invalid action" });
    }
    if (to === fromId) return res.status(400).json({ ok: false, error: "Cannot interact with yourself" });

    // ensure target exists
    const target = await User.findById(to).select("_id phone name photos");
    if (!target) return res.status(404).json({ ok: false, error: "Target user not found" });

    // Upsert interaction (insert or update action)
    const interaction = await Interaction.findOneAndUpdate(
      { from: fromId, to },
      { action, createdAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    
    console.log(`✅ Interaction saved: ${fromId} → ${action} → ${to}`);

    // If action is like/superlike -> check for reverse like and create notifications
    if (action === "like" || action === "superlike") {
      // Get sender info for notification
      const sender = await User.findById(fromId).select("name photos");
      
      // Create like notification for the recipient
      const notificationMessage = action === "superlike" 
        ? `${sender.name} super liked you! 💫`
        : `${sender.name} liked you! ❤️`;
      
      await createNotification({
        recipient: to,
        sender: fromId,
        type: action, // "like" or "superlike"
        message: notificationMessage,
        data: {
          senderName: sender.name,
          senderPhoto: sender.photos?.[0]?.url || null
        }
      }, req.app?.locals?.io);

      const reverse = await Interaction.findOne({ from: to, to: fromId, action: { $in: ["like", "superlike"] } });
      if (reverse) {
        // create match if not exists
        const usersKey = [String(fromId), String(to)].sort().join("_");
        let match = await Match.findOne({ usersKey });
        if (!match) {
          try {
            match = await Match.create({ users: [fromId, to] });
          } catch (e) {
            // possible duplicate key if race — try fetch existing
            match = await Match.findOne({ usersKey });
          }
        }

        // Create match notifications for both users
        const matchedUser = await User.findById(to).select("name photos");
        
        await createNotification({
          recipient: fromId,
          sender: to,
          type: "match",
          message: `It's a match with ${matchedUser.name}! 🎉`,
          data: { matchId: match._id }
        }, req.app?.locals?.io);

        await createNotification({
          recipient: to,
          sender: fromId,
          type: "match",
          message: `It's a match with ${sender.name}! 🎉`,
          data: { matchId: match._id }
        }, req.app?.locals?.io);

        // return match + minimal matched user info for immediate UI reveal
        const responseUser = {
          _id: matchedUser._id,
          name: matchedUser.name,
          age: matchedUser.age,
          photos: matchedUser.photos,
          location: matchedUser.location,
          phone: matchedUser.phone,
        };

        return res.json({ ok: true, match: true, matchId: match._id, user: responseUser });
      }
    }

    return res.json({ ok: true, match: false });
  } catch (err) {
    console.error("POST /api/interactions error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * GET /api/interactions/liked
 * Get list of users the current user has liked
 */
router.get("/liked", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20 } = req.query;

    const interactions = await Interaction.find({
      from: userId,
      action: { $in: ["like", "superlike"] }
    })
    .populate("to", "name age photos bio location")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const likedUsers = interactions.map(interaction => ({
      user: interaction.to,
      action: interaction.action,
      likedAt: interaction.createdAt
    }));

    res.json({ ok: true, likedUsers });
  } catch (err) {
    console.error("GET /api/interactions/liked error:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * GET /api/interactions/disliked
 * Get list of users the current user has disliked
 */
router.get("/disliked", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20 } = req.query;

    const interactions = await Interaction.find({
      from: userId,
      action: "dislike"
    })
    .populate("to", "name age photos bio location")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const dislikedUsers = interactions.map(interaction => ({
      user: interaction.to,
      dislikedAt: interaction.createdAt
    }));

    res.json({ ok: true, dislikedUsers });
  } catch (err) {
    console.error("GET /api/interactions/disliked error:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * DELETE /api/interactions/:userId
 * Remove interaction with a user (for undo functionality)
 */
router.delete("/:userId", auth, async (req, res) => {
  try {
    const fromId = req.user.userId;
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ ok: false, error: "User ID required" });
    }

    const interaction = await Interaction.findOneAndDelete({
      from: fromId,
      to: userId
    });

    if (!interaction) {
      return res.status(404).json({ ok: false, error: "Interaction not found" });
    }

    res.json({ ok: true, message: "Interaction removed successfully" });
  } catch (err) {
    console.error("DELETE /api/interactions/:userId error:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

export default router;
