// backend/routes/coupons.js
import express from "express";
import auth from "../middleware/auth.js";
import User from "../models/User.js";
import Coupon from "../models/Coupon.js";

const router = express.Router();

/**
 * POST /api/coupons/validate
 * Validate coupon code and calculate discount
 */
router.post("/validate", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { code, orderAmount, orderType = 'coins' } = req.body;

    if (!code || !orderAmount) {
      return res.status(400).json({ 
        success: false, 
        error: "Coupon code and order amount are required" 
      });
    }

    // Find coupon
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    });

    if (!coupon) {
      return res.status(404).json({ 
        success: false, 
        error: "Invalid coupon code" 
      });
    }

    // Check if coupon is valid
    if (!coupon.isValid()) {
      let errorMsg = "Coupon has expired";
      if (coupon.maxUsage && coupon.usedCount >= coupon.maxUsage) {
        errorMsg = "Coupon usage limit exceeded";
      }
      return res.status(400).json({ 
        success: false, 
        error: errorMsg 
      });
    }

    // Check if applicable for order type
    if (!coupon.applicableFor.includes('all') && !coupon.applicableFor.includes(orderType)) {
      return res.status(400).json({ 
        success: false, 
        error: "Coupon not applicable for " + orderType + " purchases" 
      });
    }

    // Check user restrictions
    const user = await User.findById(userId);
    
    // New users only check
    if (coupon.userRestrictions.newUsersOnly) {
      const userAge = Date.now() - user.createdAt.getTime();
      const daysSinceJoined = userAge / (1000 * 60 * 60 * 24);
      if (daysSinceJoined > 7) { // More than 7 days old
        return res.status(400).json({ 
          success: false, 
          error: "This coupon is only for new users" 
        });
      }
    }

    // Check user usage limit
    const userUsageCount = coupon.usageHistory.filter(
      usage => usage.user.toString() === userId
    ).length;

    if (userUsageCount >= coupon.userRestrictions.maxUsagePerUser) {
      return res.status(400).json({ 
        success: false, 
        error: "Coupon has expired" 
      });
    }

    // Check excluded users
    if (coupon.userRestrictions.excludedUsers.includes(userId)) {
      return res.status(400).json({ 
        success: false, 
        error: "You are not eligible for this coupon" 
      });
    }

    // Calculate discount
    const discountAmount = coupon.calculateDiscount(orderAmount);
    const finalAmount = orderAmount - discountAmount;

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      },
      discount: {
        amount: discountAmount,
        percentage: ((discountAmount / orderAmount) * 100).toFixed(1)
      },
      orderSummary: {
        originalAmount: orderAmount,
        discountAmount,
        finalAmount,
        savings: discountAmount
      }
    });
  } catch (error) {
    console.error("POST /api/coupons/validate error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

/**
 * POST /api/coupons/apply
 * Apply coupon to an order (internal use during payment)
 */
router.post("/apply", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { code, orderAmount, orderId, orderType = 'coins' } = req.body;

    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    });

    if (!coupon || !coupon.isValid()) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid or expired coupon" 
      });
    }

    const discountAmount = coupon.calculateDiscount(orderAmount);
    
    // Update coupon usage
    coupon.usedCount += 1;
    coupon.usageHistory.push({
      user: userId,
      usedAt: new Date(),
      orderAmount,
      discountAmount,
      orderId
    });

    await coupon.save();

    res.json({
      success: true,
      discountAmount,
      finalAmount: orderAmount - discountAmount
    });
  } catch (error) {
    console.error("POST /api/coupons/apply error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

/**
 * GET /api/coupons/available
 * Get available coupons for user
 */
router.get("/available", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { orderType = 'coins' } = req.query;

    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() },
      $or: [
        { 'applicableFor': 'all' },
        { 'applicableFor': orderType }
      ],
      'userRestrictions.excludedUsers': { $ne: userId }
    }).select('code name description discountType discountValue maxDiscount minOrderAmount validUntil usageHistory userRestrictions');

    // Filter coupons based on user usage
    const availableCoupons = [];
    
    for (const coupon of coupons) {
      const userUsageCount = (coupon.usageHistory || []).filter(
        usage => usage.user.toString() === userId
      ).length;

      if (userUsageCount < coupon.userRestrictions.maxUsagePerUser) {
        availableCoupons.push({
          code: coupon.code,
          name: coupon.name,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          maxDiscount: coupon.maxDiscount,
          minOrderAmount: coupon.minOrderAmount,
          validUntil: coupon.validUntil,
          usageLeft: coupon.userRestrictions.maxUsagePerUser - userUsageCount
        });
      }
    }

    res.json({
      success: true,
      coupons: availableCoupons
    });
  } catch (error) {
    console.error("GET /api/coupons/available error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

/**
 * POST /api/coupons/create (Admin only)
 * Create new coupon
 */
router.post("/create", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Check if user is admin
    const user = await User.findById(userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, error: "Admin access required" });
    }

    const couponData = {
      ...req.body,
      createdBy: userId,
      code: req.body.code.toUpperCase()
    };

    const coupon = new Coupon(couponData);
    await coupon.save();

    res.json({
      success: true,
      message: "Coupon created successfully",
      coupon: {
        code: coupon.code,
        name: coupon.name,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        error: "Coupon code already exists" 
      });
    }
    console.error("POST /api/coupons/create error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

export default router;