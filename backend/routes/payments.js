// backend/routes/payments.js
import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Log Razorpay initialization (without exposing secrets)
console.log('Razorpay initialized:', {
  key_id: process.env.RAZORPAY_KEY_ID ? `${process.env.RAZORPAY_KEY_ID.substring(0, 8)}...` : 'MISSING',
  key_secret: process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'MISSING'
});

/**
 * @route   POST /api/payments/create-order
 * @desc    Create Razorpay order for coin purchase
 * @access  Private
 */
router.post('/create-order', protect, async (req, res) => {
  try {
    const { amount, coins, originalAmount, couponCode, discountAmount } = req.body;

    // Get userId from req.user (auth middleware sets this)
    const userId = req.user.userId || req.user._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Validation - Allow subscription without coins
    const { type } = req.body;
    
    if (!amount) {
      return res.status(400).json({
        success: false,
        error: 'Amount is required'
      });
    }

    if (amount < 1) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be at least ₹1'
      });
    }

    // Coins required only for coin purchases, not subscriptions or boosts
    if (type !== 'lifetime_subscription' && type !== 'subscription' && type !== 'boost' && !coins) {
      return res.status(400).json({
        success: false,
        error: 'Coins are required for coin purchases'
      });
    }

    // Fetch user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Create Razorpay order
    // Receipt must be max 40 chars - use short format
    const receiptId = `rcpt_${Date.now().toString().slice(-10)}`;
    
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: receiptId,
      payment_capture: 1, // Auto capture
      notes: {
        userId: userId.toString(),
        coins: coins ? coins.toString() : '0',
        userName: user.name || 'User',
        couponCode: couponCode || '',
        originalAmount: originalAmount || amount,
        discountAmount: discountAmount || 0,
        type: type || 'coins'
      }
    };

    const order = await razorpay.orders.create(options);

    // Create transaction record in database
    const transaction = await Transaction.create({
      user: userId,
      orderId: order.receipt,
      razorpayOrderId: order.id,
      amount: amount,
      originalAmount: originalAmount || amount,
      currency: order.currency,
      coins: coins || 0,
      status: 'created',
      couponCode: couponCode || null,
      discountAmount: discountAmount || 0,
      metadata: {
        orderCreatedAt: new Date(),
        userEmail: user.email,
        userName: user.name,
        couponApplied: !!couponCode,
        type: type || 'coins'
      }
    });

    res.json({
      success: true,
      orderId: order.id,
      order_id: order.id, // Keep for backward compatibility
      amount: order.amount,
      currency: order.currency,
      transactionId: transaction._id
    });

  } catch (error) {
    console.error('Create order error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create order'
    });
  }
});

/**
 * @route   POST /api/payments/verify
 * @desc    Verify Razorpay payment and credit coins
 * @access  Private
 */
router.post('/verify', protect, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // Validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing payment details'
      });
    }

    // Find transaction
    const transaction = await Transaction.findOne({ razorpayOrderId: razorpay_order_id });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    // Check if already processed
    if (transaction.status === 'paid') {
      return res.json({
        success: true,
        message: 'Payment already processed',
        coins: transaction.coins,
        alreadyProcessed: true
      });
    }

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'yyy')
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      // Mark transaction as failed
      transaction.status = 'failed';
      transaction.failureReason = 'Invalid signature';
      await transaction.save();
      
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature'
      });
    }

    // Signature is valid - Credit coins to user
    const userId = req.user.userId || req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify transaction belongs to this user
    if (transaction.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized transaction access'
      });
    }

    // Update user coins
    user.coins = (user.coins || 0) + transaction.coins;
    await user.save();

    // Mark transaction as paid
    transaction.status = 'paid';
    transaction.paymentId = razorpay_payment_id;
    transaction.razorpayPaymentId = razorpay_payment_id;
    transaction.razorpaySignature = razorpay_signature;
    await transaction.save();

    res.json({
      success: true,
      message: 'Payment verified successfully',
      coins: transaction.coins,
      totalCoins: user.coins,
      transactionId: transaction._id
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Payment verification failed'
    });
  }
});

/**
 * @route   POST /api/payments/webhook
 * @desc    Handle Razorpay webhook events
 * @access  Public (but verified via signature)
 * @note    Raw body parser is configured in server.js for this route
 */
router.post('/webhook', async (req, res) => {
  try {
    console.log('🔔 ===== WEBHOOK ENDPOINT HIT =====');
    console.log('Headers:', req.headers);
    console.log('Body type:', typeof req.body);
    console.log('Body length:', req.body?.length);
    
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    console.log('Webhook signature present:', !!webhookSignature);
    console.log('Webhook secret configured:', !!webhookSecret);

    if (!webhookSecret) {
      console.error('❌ RAZORPAY_WEBHOOK_SECRET not configured');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    // Verify webhook signature
    const bodyString = req.body.toString();
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(bodyString)
      .digest('hex');

    console.log('Signature match:', webhookSignature === expectedSignature);

    if (webhookSignature !== expectedSignature) {
      console.error('❌ Invalid webhook signature');
      console.error('Expected:', expectedSignature);
      console.error('Received:', webhookSignature);
      return res.status(400).json({ error: 'Invalid signature' });
    }

    console.log('✅ Signature verified');

    // Parse webhook body
    const event = JSON.parse(bodyString);
    
    console.log('🔔 ===== WEBHOOK RECEIVED =====');
    console.log('Event Type:', event.event);
    console.log('Timestamp:', new Date().toISOString());
    console.log('==============================');

    // Handle payment.captured event
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;
      const paymentId = payment.id;

      // Find transaction
      const transaction = await Transaction.findOne({ razorpayOrderId: orderId });

      if (!transaction) {
        console.error('Transaction not found for order:', orderId);
        return res.status(404).json({ error: 'Transaction not found' });
      }

      // Check if already processed (idempotency)
      if (transaction.webhookProcessed && transaction.status === 'paid') {
        console.log('Webhook already processed for transaction:', transaction._id);
        return res.json({ status: 'already_processed' });
      }

      // Update transaction status
      transaction.status = 'paid';
      transaction.razorpayPaymentId = paymentId;
      transaction.paymentMethod = payment.method;
      transaction.webhookProcessed = true;
      transaction.metadata = {
        ...transaction.metadata,
        webhookProcessedAt: new Date(),
        paymentDetails: {
          method: payment.method,
          email: payment.email,
          contact: payment.contact,
          amount: payment.amount,
          status: payment.status
        }
      };
      await transaction.save();

      // Credit coins to user (if not already credited)
      const user = await User.findById(transaction.user);
      
      if (user) {
        // Double-check if coins were already credited
        const existingPaidTransaction = await Transaction.findOne({
          razorpayOrderId: orderId,
          status: 'paid',
          _id: { $ne: transaction._id }
        });

        if (!existingPaidTransaction) {
          user.coins = (user.coins || 0) + transaction.coins;
          await user.save();
          console.log(`Credited ${transaction.coins} coins to user ${user._id}`);
        } else {
          console.log('Coins already credited for this order');
        }
      }

      console.log('✅ Webhook processed successfully');
      console.log('Transaction ID:', transaction._id);
      console.log('Coins credited:', transaction.coins);
      console.log('==============================');
    }

    // Handle payment.failed event
    if (event.event === 'payment.failed') {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;

      const transaction = await Transaction.findOne({ razorpayOrderId: orderId });

      if (transaction && transaction.status !== 'paid') {
        transaction.status = 'failed';
        transaction.failureReason = payment.error_description || 'Payment failed';
        transaction.webhookProcessed = true;
        await transaction.save();
        console.log('Payment failed for transaction:', transaction._id);
      }
    }

    res.json({ status: 'ok' });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * @route   GET /api/payments/transactions
 * @desc    Get user's transaction history
 * @access  Private
 */
router.get('/transactions', protect, async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const transactions = await Transaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('-razorpaySignature -signature');

    res.json({
      success: true,
      transactions
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions'
    });
  }
});

/**
 * @route   GET /api/payments/webhook-status
 * @desc    Check if webhook is configured and working
 * @access  Private
 */
router.get('/webhook-status', protect, async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    // Check recent transactions with webhook processing
    const recentTransactions = await Transaction.find({
      webhookProcessed: true
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderId status webhookProcessed createdAt metadata');

    res.json({
      success: true,
      webhookConfigured: !!webhookSecret,
      webhookSecret: webhookSecret ? 'SET' : 'NOT SET',
      recentWebhookTransactions: recentTransactions,
      message: webhookSecret 
        ? 'Webhook is configured' 
        : 'Webhook secret not configured in .env'
    });

  } catch (error) {
    console.error('Webhook status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check webhook status'
    });
  }
});

/**
 * @route   GET /api/payments/transaction/:id
 * @desc    Get single transaction details
 * @access  Private
 */
router.get('/transaction/:id', protect, async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: userId
    }).select('-razorpaySignature -signature');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      transaction
    });

  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transaction'
    });
  }
});

/**
 * @route   POST /api/payments/verify-subscription
 * @desc    Verify lifetime subscription payment and activate
 * @access  Private
 */
router.post('/verify-subscription', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isLifetime, couponCode } = req.body;
    const userId = req.user.userId || req.user._id;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature'
      });
    }

    // Payment verified - Activate lifetime subscription
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update user subscription
    user.subscription = {
      active: true,
      plan: 'lifetime',
      isLifetime: true,
      expiresAt: null, // Never expires
      features: {
        unlimitedLikes: true,
        unlimitedMessages: true,
        prioritySupport: true,
        profileBoost: true,
        seeWhoLikedYou: true,
        rewindFeature: true
      }
    };

    // Add 200 coins silently (hidden from user)
    user.coins = (user.coins || 0) + 200;
    user.messagesSent = 0; // Reset message count

    await user.save();

    // Create transaction record
    await Transaction.create({
      user: userId,
      orderId: `sub_${Date.now()}`,
      amount: 1, // Lifetime subscription price
      coins: 200, // Hidden bonus coins
      status: 'paid',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      metadata: {
        type: 'subscription',
        isLifetime: true,
        couponCode: couponCode || null,
        description: 'Lifetime Subscription Purchase'
      }
    });

    res.json({
      success: true,
      message: 'Lifetime subscription activated',
      user: {
        subscription: user.subscription,
        coins: user.coins // Don't expose this to frontend
      }
    });

  } catch (error) {
    console.error('Subscription verification error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    res.status(500).json({
      success: false,
      error: error.message || 'Subscription verification failed'
    });
  }
});

export default router;
