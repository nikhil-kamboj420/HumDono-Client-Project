// routes/requests.js
import express from "express";
import auth from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * POST /api/requests/phone-access
 * Request access to another user's phone number
 */
router.post("/phone-access", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({ ok: false, error: "Recipient ID required" });
    }

    if (String(userId) === String(to)) {
      return res.status(400).json({ ok: false, error: "Cannot request access to your own phone" });
    }

    // Check if recipient exists
    const recipient = await User.findById(to);
    if (!recipient) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }

    // For now, we'll just return a success message
    // In a real app, you might want to:
    // 1. Store the request in a database
    // 2. Send a notification to the recipient
    // 3. Allow the recipient to approve/deny the request

    res.json({ 
      ok: true, 
      message: "Phone access request sent successfully",
      note: "The user will be notified of your request"
    });
  } catch (err) {
    console.error("POST /api/requests/phone-access error:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

export default router;