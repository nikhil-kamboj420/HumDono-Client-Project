// routes/notifications.js
import express from "express";
import auth from "../middleware/auth.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * GET /api/notifications
 * Get all notifications for the current user
 */
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20, type, unreadOnly = false } = req.query;

    const query = { recipient: userId };
    if (type) query.type = type;
    if (unreadOnly === 'true') query.read = false;

    const notifications = await Notification.find(query)
      .populate("sender", "name photos age")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      read: false
    });

    res.json({ 
      ok: true, 
      notifications,
      unreadCount,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error("GET /api/notifications error:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * GET /api/notifications/count
 * Get unread notification count
 */
router.get("/count", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const counts = await Notification.aggregate([
      { $match: { recipient: userId, read: false } },
      { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);

    const countsByType = {};
    counts.forEach(item => {
      countsByType[item._id] = item.count;
    });

    const totalUnread = await Notification.countDocuments({
      recipient: userId,
      read: false
    });

    res.json({ 
      ok: true, 
      totalUnread,
      byType: countsByType
    });
  } catch (err) {
    console.error("GET /api/notifications/count error:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * PUT /api/notifications/:id/read
 * Mark a notification as read
 */
router.put("/:id/read", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ ok: false, error: "Notification not found" });
    }

    res.json({ ok: true, notification });
  } catch (err) {
    console.error("PUT /api/notifications/:id/read error:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * PUT /api/notifications/mark-all-read
 * Mark all notifications as read for the current user
 */
router.put("/mark-all-read", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type } = req.body; // Optional: mark only specific type as read

    const query = { recipient: userId, read: false };
    if (type) query.type = type;

    const result = await Notification.updateMany(query, { read: true });

    res.json({ 
      ok: true, 
      message: "Notifications marked as read",
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error("PUT /api/notifications/mark-all-read error:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: userId
    });

    if (!notification) {
      return res.status(404).json({ ok: false, error: "Notification not found" });
    }

    res.json({ ok: true, message: "Notification deleted" });
  } catch (err) {
    console.error("DELETE /api/notifications/:id error:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * Helper function to create a notification
 * This will be used by other routes
 */
export const createNotification = async ({ recipient, sender, type, message, data = {} }) => {
  try {
    // Don't create notification if sender and recipient are the same
    if (String(sender) === String(recipient)) return null;

    // Check if user has notifications enabled for this type
    const user = await User.findById(recipient).select('notifications');
    if (user?.notifications && user.notifications[type] === false) {
      return null; // User has disabled this type of notification
    }

    const notification = await Notification.create({
      recipient,
      sender,
      type,
      message,
      data
    });

    return notification;
  } catch (err) {
    console.error("createNotification error:", err);
    return null;
  }
};

export default router;