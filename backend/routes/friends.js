// routes/friends.js
import express from "express";
import auth from "../middleware/auth.js";
import Friend from "../models/Friend.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * GET /api/friends
 * Get user's friends list
 */
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const friends = await Friend.find({
      $or: [
        { requester: userId, status: "accepted" },
        { recipient: userId, status: "accepted" }
      ]
    })
    .populate("requester", "name photos lastActiveAt")
    .populate("recipient", "name photos lastActiveAt")
    .sort({ updatedAt: -1 });

    const friendsList = friends.map(friendship => {
      const friend = String(friendship.requester._id) === String(userId) 
        ? friendship.recipient 
        : friendship.requester;
      return {
        friendshipId: friendship._id,
        friend,
        since: friendship.updatedAt
      };
    });

    res.json({ ok: true, friends: friendsList });
  } catch (err) {
    console.error("GET /api/friends error:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * GET /api/friends/requests
 * Get pending friend requests (received)
 */
router.get("/requests", auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const requests = await Friend.find({
      recipient: userId,
      status: "pending"
    })
    .populate("requester", "name photos age bio")
    .sort({ createdAt: -1 });

    res.json({ ok: true, requests });
  } catch (err) {
    console.error("GET /api/friends/requests error:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * GET /api/friends/sent
 * Get sent friend requests
 */
router.get("/sent", auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const sentRequests = await Friend.find({
      requester: userId,
      status: "pending"
    })
    .populate("recipient", "name photos age bio")
    .sort({ createdAt: -1 });

    res.json({ ok: true, sentRequests });
  } catch (err) {
    console.error("GET /api/friends/sent error:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * POST /api/friends/request
 * Send a friend request
 */
router.post("/request", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { recipientId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ ok: false, error: "Recipient ID required" });
    }

    if (String(userId) === String(recipientId)) {
      return res.status(400).json({ ok: false, error: "Cannot send friend request to yourself" });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }

    // Check if friendship already exists
    const existingFriendship = await Friend.findOne({
      $or: [
        { requester: userId, recipient: recipientId },
        { requester: recipientId, recipient: userId }
      ]
    });

    if (existingFriendship) {
      return res.status(400).json({ 
        ok: false, 
        error: "Friend request already exists",
        status: existingFriendship.status 
      });
    }

    const friendRequest = new Friend({
      requester: userId,
      recipient: recipientId
    });

    await friendRequest.save();
    await friendRequest.populate("recipient", "name photos");

    res.json({ ok: true, request: friendRequest });
  } catch (err) {
    console.error("POST /api/friends/request error:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * PUT /api/friends/:requestId/respond
 * Accept or decline a friend request
 */
router.put("/:requestId/respond", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { requestId } = req.params;
    const { action } = req.body; // "accept" or "decline"

    if (!["accept", "decline"].includes(action)) {
      return res.status(400).json({ ok: false, error: "Invalid action" });
    }

    const friendRequest = await Friend.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ ok: false, error: "Friend request not found" });
    }

    // Verify user is the recipient
    if (String(friendRequest.recipient) !== String(userId)) {
      return res.status(403).json({ ok: false, error: "Not authorized" });
    }

    friendRequest.status = action === "accept" ? "accepted" : "declined";
    await friendRequest.save();

    await friendRequest.populate("requester", "name photos");

    res.json({ ok: true, request: friendRequest });
  } catch (err) {
    console.error("PUT /api/friends/:requestId/respond error:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * DELETE /api/friends/:friendshipId
 * Remove a friend
 */
router.delete("/:friendshipId", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { friendshipId } = req.params;

    const friendship = await Friend.findById(friendshipId);
    if (!friendship) {
      return res.status(404).json({ ok: false, error: "Friendship not found" });
    }

    // Verify user is part of the friendship
    const members = [String(friendship.requester), String(friendship.recipient)];
    if (!members.includes(String(userId))) {
      return res.status(403).json({ ok: false, error: "Not authorized" });
    }

    await Friend.findByIdAndDelete(friendshipId);

    res.json({ ok: true, message: "Friend removed successfully" });
  } catch (err) {
    console.error("DELETE /api/friends/:friendshipId error:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

export default router;