import express from 'express';
// import Razorpay from 'razorpay';
// import crypto from 'crypto';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();
const protect = auth;

// Initialize Razorpay
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });


/**
 * @route POST /api/payments/scanner-confirm
 * @desc Scanner Payment (lifetime plan Rs.699)
 * @access Private
 */
router.post("/scanner-confirm", protect, async(req,res)=>{
  try {
    const userId = req.user.userId || req.user._id;
    const { amount, basePrice, discount, coupon } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, error: "Amount required" });
    }

    await User.findByIdAndUpdate(userId, {
      isPremium: true,
      premiumType: "lifetime",
      requiresFirstSubscription: false,
      hasCompletedFirstSubscription: true,
      firstSubscriptionDate: new Date(),
      coins: 100,
      subscription: {
        active: true,
        plan: "lifetime",
        isLifetime: true,
        features: {
          unlimitedLikes: true,
          unlimitedMessages: true,
          prioritySupport: true,
          profileBoost: true,
          seeWhoLikedYou: true,
          rewindFeature: true
        }
      }
    });

    await Transaction.create({
      user: userId,
      amount,
      orderId: "SCANNER_" + Date.now(),
      status: "paid",
      paymentMethod: "scanner_qr",
      currency: "INR",
      coins: 100,
      metadata: {
        plan: "LIFETIME",
        basePrice,
        discount,
        coupon,
        via: "SCANNER_PAYMENT"
      }
    });

    return res.json({ success: true, message: "Scanner payment confirmed & premium activated" });

  } catch (err) {
    console.error("SCANNER ERROR >>>", err);   // ADD THIS
    return res.status(500).json({ success: false, error: "Server error" });
  }
});


/**
 * @route POST /api/payments/create-order
 * @desc Create Razorpay order (lifetime plan Rs.699)
 * @access Private
 */
// router.post('/create-order', protect, async (req, res) => {
//   try {
//     const amount = 699;

//     const order = await razorpay.orders.create({
//       amount: amount * 100,
//       currency: 'INR',
//       receipt: 'receipt_' + Date.now(),
//     });

//     return res.json({
//       success: true,
//       orderId: order.id,
//       amount,
//       key: process.env.RAZORPAY_KEY_ID,
//     });
//   } catch (error) {
//     console.error('Create order error:', error);
//     return res.status(500).json({
//       success: false,
//       error: 'Failed to create Razorpay order',
//     });
//   }
// });

/**
 * @route POST /api/payments/verify
 * @desc Verify Razorpay signature + activate premium
 * @access Private
 */
// router.post('/verify', protect, async (req, res) => {
//   try {

//     const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

//     if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
//       return res.status(400).json({
//         success: false,
//         error: "Invalid Razorpay response"
//       });
//     }

//     // Verify signature
//     const body = razorpay_order_id + "|" + razorpay_payment_id;

//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(body)
//       .digest("hex");

//     if (expectedSignature !== razorpay_signature) {
//       return res.status(400).json({
//         success: false,
//         error: "Payment signature mismatch"
//       });
//     }

//     const userId = req.user?.userId || req.user?._id;

//     // Mark user as premium
//     await User.findByIdAndUpdate(userId, {
//       isPremium: true,
//       premiumType: "lifetime",

//       requiresFirstSubscription: false,
//       hasCompletedFirstSubscription: true,
//       firstSubscriptionDate: new Date(),

//       subscription: {
//         active: true,
//         plan: "lifetime",
//         isLifetime: true,

//         features: {
//           unlimitedLikes: true,
//           unlimitedMessages: true,
//           prioritySupport: true,
//           profileBoost: true,
//           seeWhoLikedYou: true,
//           rewindFeature: true
//         }
//       }
//     });

//     // Save transaction 
//     await Transaction.create({
//       user: userId,
//       orderId: razorpay_order_id,
//       paymentId: razorpay_payment_id,
//       signature: razorpay_signature,

//       razorpayOrderId: razorpay_order_id,
//       razorpayPaymentId: razorpay_payment_id,
//       razorpaySignature: razorpay_signature,

//       amount: 699,
//       currency: "INR",

//       coins: 100,                 

//       status: "paid",

//       paymentMethod: "razorpay",
//       metadata: {
//         plan: "LIFETIME"
//       }
//     });

//     return res.json({
//       success: true,
//       message: "Payment verified & premium activated"
//     });

//   } catch (err) {
//     console.error("VERIFY ERROR:", err);
//     return res.status(500).json({
//       success: false,
//       error: "Internal server error during verification"
//     });
//   }
// });

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

/**
 * @route   GET /api/payments/transactions
 * @desc    Alias for transaction history (backward compatibility)
 * @access  Private
 */
router.get('/transactions', protect, async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;

    const transactions = await Transaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, transactions });
  } catch (error) {
    console.error('Get transactions alias error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
  }
});


/**
 * @route POST /api/payments/upi/confirm
 * @desc Confirm UPI payment manually + activate subscription
 * @access Private
 */
router.post('/upi/confirm', protect, async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const { transactionId, amount } = req.body;

    if (!transactionId || !amount) {
      return res.status(400).json({
        success: false,
        error: "Transaction ID & amount required"
      });
    }

    // Mark user as premium
    await User.findByIdAndUpdate(userId, {
      isPremium: true,
      premiumType: "lifetime",
      requiresFirstSubscription: false,
      hasCompletedFirstSubscription: true,
      firstSubscriptionDate: new Date(),
      subscription: {
        active: true,
        plan: "lifetime",
        isLifetime: true,
        features: {
          unlimitedLikes: true,
          unlimitedMessages: true,
          prioritySupport: true,
          profileBoost: true,
          seeWhoLikedYou: true,
          rewindFeature: true
        }
      }
    });

    // Save transaction
    await Transaction.create({
      user: userId,
      paymentId: transactionId,
      amount,
      currency: "INR",
      status: "paid",
      paymentMethod: "upi_intent",
      coins: 100,
      metadata: {
        plan: "LIFETIME",
        via: "UPI_INTENT"
      }
    });

    return res.json({
      success: true,
      message: "UPI payment confirmed & premium activated"
    });

  } catch (err) {
    console.error("UPI CONFIRM ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "Server error in UPI confirmation"
    });
  }
});

export default router;
