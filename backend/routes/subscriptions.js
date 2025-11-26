// backend/routes/subscriptions.js
import express from "express";
import auth from "../middleware/auth.js";
import User from "../models/User.js";
import Subscription from "../models/Subscription.js";
import Transaction from "../models/Transaction.js";
import Razorpay from "razorpay";

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Subscription plans configuration
const SUBSCRIPTION_PLANS = {
  basic: {
    name: "Basic Plan",
    price: 299,
    duration: 30, // days
    coinsIncluded: 200,
    features: {
      unlimitedLikes: true,
      unlimitedMessages: false,
      prioritySupport: false,
      profileBoost: false,
      seeWhoLikedYou: false,
      rewindFeature: false
    }
  },
  premium: {
    name: "Premium Plan",
    price: 699,
    duration: 30, // days
    coinsIncluded: 600,
    features: {
      unlimitedLikes: true,
      unlimitedMessages: true,
      prioritySupport: true,
      profileBoost: true,
      seeWhoLikedYou: true,
      rewindFeature: false
    }
  },
  gold: {
    name: "Gold Plan",
    price: 1299,
    duration: 30, // days
    coinsIncluded: 1200,
    features: {
      unlimitedLikes: true,
      unlimitedMessages: true,
      prioritySupport: true,
      profileBoost: true,
      seeWhoLikedYou: true,
      rewindFeature: true
    }
  }
};

/**
 * GET /api/subscriptions/plans
 * Get available subscription plans
 */
router.get("/plans", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Add current subscription info to response
    const plans = Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => ({
      id: key,
      ...plan,
      isCurrent: user.subscription?.plan === key && user.subscription?.active
    }));

    res.json({
      success: true,
      plans,
      currentSubscription: user.subscription
    });
  } catch (error) {
    console.error("GET /api/subscriptions/plans error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

/**
 * POST /api/subscriptions/create
 * Create subscription order
 */
router.post("/create", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { planId, couponCode, originalAmount, finalAmount, discountAmount } = req.body;

    if (!SUBSCRIPTION_PLANS[planId]) {
      return res.status(400).json({ success: false, error: "Invalid plan" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const plan = SUBSCRIPTION_PLANS[planId];
    const orderAmount = finalAmount || plan.price;

    // Create Razorpay order
    const orderOptions = {
      amount: orderAmount * 100, // Convert to paise
      currency: "INR",
      receipt: `sub_${Date.now()}_${userId}`,
      notes: {
        userId,
        planId,
        type: "subscription",
        couponCode: couponCode || '',
        originalAmount: originalAmount || plan.price,
        discountAmount: discountAmount || 0
      }
    };

    const razorpayOrder = await razorpay.orders.create(orderOptions);

    res.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      planDetails: {
        id: planId,
        ...plan
      }
    });
  } catch (error) {
    console.error("POST /api/subscriptions/create error:", error);
    res.status(500).json({ success: false, error: "Failed to create subscription order" });
  }
});

/**
 * POST /api/subscriptions/verify
 * Verify subscription payment and activate
 */
router.post("/verify", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

    // Verify payment signature
    const crypto = await import('crypto');
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: "Invalid payment signature" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan) {
      return res.status(400).json({ success: false, error: "Invalid plan" });
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + (plan.duration * 24 * 60 * 60 * 1000));

    // Create subscription record
    const subscription = new Subscription({
      user: userId,
      planId,
      planName: plan.name,
      price: plan.price,
      coinsIncluded: plan.coinsIncluded,
      duration: plan.duration,
      startDate,
      endDate,
      status: 'active',
      features: plan.features,
      paymentHistory: [{
        date: new Date(),
        amount: plan.price,
        status: 'paid',
        razorpayPaymentId: razorpay_payment_id
      }]
    });

    await subscription.save();

    // Update user subscription
    user.subscription = {
      active: true,
      plan: planId,
      expiresAt: endDate,
      features: plan.features
    };

    // Add coins to user account
    user.coins += plan.coinsIncluded;

    // Unlock features if this is first subscription
    if (user.requiresFirstSubscription) {
      user.requiresFirstSubscription = false;
      user.hasCompletedFirstSubscription = true;
      user.firstSubscriptionDate = new Date();

    }

    await user.save();

    // Record transaction
    await Transaction.create({
      user: userId,
      amount: plan.price,
      coins: plan.coinsIncluded,
      orderId: razorpay_order_id,
      status: "paid",
      currency: "INR",
      metadata: {
        type: "subscription",
        planId,
        planName: plan.name,
        description: `${plan.name} subscription activated`
      }
    });

    res.json({
      success: true,
      message: "Subscription activated successfully!",
      subscription: {
        plan: planId,
        expiresAt: endDate,
        coinsAdded: plan.coinsIncluded,
        features: plan.features
      },
      totalCoins: user.coins
    });
  } catch (error) {
    console.error("POST /api/subscriptions/verify error:", error);
    res.status(500).json({ success: false, error: "Failed to verify subscription" });
  }
});

/**
 * GET /api/subscriptions/current
 * Get current user subscription
 */
router.get("/current", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const subscription = await Subscription.findOne({ 
      user: userId, 
      status: 'active' 
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      subscription: user.subscription,
      details: subscription,
      isActive: subscription?.isActive() || false,
      remainingDays: subscription?.getRemainingDays() || 0
    });
  } catch (error) {
    console.error("GET /api/subscriptions/current error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

/**
 * POST /api/subscriptions/cancel
 * Cancel current subscription
 */
router.post("/cancel", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const subscription = await Subscription.findOne({ 
      user: userId, 
      status: 'active' 
    });

    if (!subscription) {
      return res.status(404).json({ success: false, error: "No active subscription found" });
    }

    // Update subscription status
    subscription.status = 'cancelled';
    subscription.autoRenew = false;
    await subscription.save();

    // Update user subscription (keep active until expiry)
    const user = await User.findById(userId);
    user.subscription.active = false;
    await user.save();

    res.json({
      success: true,
      message: "Subscription cancelled successfully",
      validUntil: subscription.endDate
    });
  } catch (error) {
    console.error("POST /api/subscriptions/cancel error:", error);
    res.status(500).json({ success: false, error: "Failed to cancel subscription" });
  }
});

export default router;