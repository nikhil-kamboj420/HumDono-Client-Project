import express from "express";
import auth from "../middleware/auth.js";
import ManualPaymentRequest from "../models/ManualPaymentRequest.js";

const router = express.Router();

// Manual verification process (admin):
// 1) Open MongoDB Compass → manualpaymentrequests with status='pending'
// 2) Cross-check transactionId in UPI app/bank statement
// 3) If valid: set user.isPremium=true and user.premiumType='lifetime', mark request status='checked'

/**
 * POST /api/manual-payments/request
 * Submit manual UPI payment details for verification
 */
router.post("/request", auth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const { amount, transactionId } = req.body || {};

    // Validation
    if (
      amount == null ||
      transactionId == null ||
      String(transactionId).trim() === ""
    ) {
      return res
        .status(400)
        .json({ ok: false, error: "amount and transactionId are required" });
    }
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      return res
        .status(400)
        .json({ ok: false, error: "amount must be a positive number" });
    }

    // Canonicalize transactionId to reduce accidental duplicates
    const txId = String(transactionId).trim().toUpperCase();

    // Create request
    try {
      const reqDoc = await ManualPaymentRequest.create({
        user: userId,
        amount: amt,
        transactionId: txId,
        status: "pending",
      });

      return res.status(201).json({
        ok: true,
        message:
          "Payment details submitted. We will verify and activate your premium manually.",
        request: { id: reqDoc._id, status: reqDoc.status },
      });
    } catch (err) {
      // Handle duplicate key error (same user + transactionId)
      if (err?.code === 11000) {
        return res.status(400).json({
          ok: false,
          error: "This transaction has already been submitted.",
        });
      }
      throw err;
    }
  } catch (err) {
    console.error("POST /api/manual-payments/request error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

export default router;
