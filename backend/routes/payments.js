// backend/routes/payments.js
import express from 'express';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();
const protect = auth;

/**
 * @route   POST /api/payments/create-order
 * @desc    Create order for coin purchase (DISABLED)
 * @access  Private
 */
router.post('/create-order', protect, async (req, res) => {
  return res.status(400).json({
    success: false,
    error: 'Online payments are currently disabled.'
  });
});

/**
 * @route   POST /api/payments/verify
 * @desc    Verify payment and credit coins (DISABLED)
 * @access  Private
 */
router.post('/verify', protect, async (req, res) => {
  return res.status(400).json({
    success: false,
    error: 'Online payments are currently disabled.'
  });
});

/**
 * @route   POST /api/payments/webhook
 * @desc    Handle webhook events (DISABLED)
 * @access  Public
 */
router.post('/webhook', async (req, res) => {
  // Just return 200 to acknowledge but do nothing
  return res.status(200).json({ received: true });
});

/**
 * @route   GET /api/payments/history
 * @desc    Get user transaction history
 * @access  Private
 */
router.get('/history', protect, async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    
    const transactions = await Transaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transaction history'
    });
  }
});

export default router;
