// backend/routes/admin.js
// Admin routes for managing coupons and other admin tasks

import express from "express";
import auth from "../middleware/auth.js";
import User from "../models/User.js";
import Coupon from "../models/Coupon.js";
import Gift from "../models/Gift.js";

const router = express.Router();

/**
 * POST /api/admin/create-sample-coupons
 * Create sample coupons (admin only)
 */
router.post("/create-sample-coupons", auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Check if user is admin (you can add admin role check here)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Sample coupons
    const sampleCoupons = [
      {
        code: "WELCOME50",
        name: "Welcome Offer",
        description: "Get 50% off on your first coin purchase!",
        discountType: "percentage",
        discountValue: 50,
        maxDiscount: 500,
        minOrderAmount: 100,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        maxUsage: 1000,
        applicableFor: ["coins"],
        userRestrictions: {
          newUsersOnly: true,
          maxUsagePerUser: 1,
        },
      },
      {
        code: "INSTA10",
        name: "Special Discount",
        description: "Get 10% off on each coin & subscription purchase!",
        discountType: "percentage",
        discountValue: 10,
        maxDiscount: 1000, // High limit so 10% always applies
        minOrderAmount: 0, // No minimum order
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year validity
        maxUsage: 10000, // High limit for total usage
        applicableFor: ["all"], // coins, boosts, subscription - sab pe kaam karega
        userRestrictions: {
          newUsersOnly: false, // Har user use kar sakta hai
          maxUsagePerUser: 1, // Sirf ek baar per user
        },
      },
      {
        code: "BOOST20",
        name: "Boost Discount",
        description: "Save 20% on all boosts!",
        discountType: "percentage",
        discountValue: 20,
        maxDiscount: 100,
        minOrderAmount: 0,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        maxUsage: 1000,
        applicableFor: ["boosts"],
        userRestrictions: {
          newUsersOnly: false,
          maxUsagePerUser: 5,
        },
      },
      {
        code: "PREMIUM100",
        name: "Premium Discount",
        description: "Flat ₹100 off on premium subscription!",
        discountType: "fixed",
        discountValue: 100,
        minOrderAmount: 299,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        maxUsage: 200,
        applicableFor: ["subscription"],
        userRestrictions: {
          newUsersOnly: false,
          maxUsagePerUser: 1,
        },
      },
    ];

    const created = [];
    const skipped = [];

    for (const couponData of sampleCoupons) {
      // Check if coupon already exists
      const existing = await Coupon.findOne({ code: couponData.code });

      if (existing) {
        skipped.push(couponData.code);
        continue;
      }

      const coupon = await Coupon.create(couponData);
      created.push({
        code: coupon.code,
        name: coupon.name,
        discount:
          coupon.discountType === "percentage"
            ? `${coupon.discountValue}%`
            : `₹${coupon.discountValue}`,
      });
    }

    res.json({
      success: true,
      message: `Created ${created.length} coupons, skipped ${skipped.length} existing`,
      created,
      skipped,
    });
  } catch (error) {
    console.error("POST /api/admin/create-sample-coupons error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error",
    });
  }
});

/**
 * PUT /api/admin/update-coupon/:code
 * Update existing coupon
 */
router.put("/update-coupon/:code", auth, async (req, res) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: "Coupon not found",
      });
    }

    if (name) coupon.name = name;
    if (description) coupon.description = description;

    await coupon.save();

    res.json({
      success: true,
      message: "Coupon updated successfully",
      coupon: {
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
      },
    });
  } catch (error) {
    console.error("PUT /api/admin/update-coupon error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

/**
 * GET /api/admin/coupons
 * Get all coupons (admin only)
 */
router.get("/coupons", auth, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    const couponList = coupons.map((c) => ({
      code: c.code,
      name: c.name,
      description: c.description,
      discountType: c.discountType,
      discountValue: c.discountValue,
      usedCount: c.usedCount,
      maxUsage: c.maxUsage,
      validUntil: c.validUntil,
      isActive: c.isActive,
    }));

    res.json({
      success: true,
      coupons: couponList,
      total: coupons.length,
    });
  } catch (error) {
    console.error("GET /api/admin/coupons error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

/**
 * POST /api/admin/seed-gifts
 * Seed default gifts (admin only)
 */
router.post("/seed-gifts", auth, async (req, res) => {
  try {
    const defaultGifts = [
      {
        name: "Rose",
        emoji: "🌹",
        image: "https://res.cloudinary.com/demo/image/upload/v1/gifts/rose.png",
        coinValue: 10,
        category: "flowers",
        isActive: true,
      },
      {
        name: "Heart",
        emoji: "❤️",
        image:
          "https://res.cloudinary.com/demo/image/upload/v1/gifts/heart.png",
        coinValue: 30,
        category: "romantic",
        isActive: true,
      },
      {
        name: "Teddy Bear",
        emoji: "🧸",
        image:
          "https://res.cloudinary.com/demo/image/upload/v1/gifts/teddy.png",
        coinValue: 50,
        category: "cute",
        isActive: true,
      },
      {
        name: "Diamond Ring",
        emoji: "💍",
        image: "https://res.cloudinary.com/demo/image/upload/v1/gifts/ring.png",
        coinValue: 100,
        category: "jewelry",
        isActive: true,
      },
      {
        name: "Chocolate",
        emoji: "🍫",
        image:
          "https://res.cloudinary.com/demo/image/upload/v1/gifts/chocolate.png",
        coinValue: 15,
        category: "sweet",
        isActive: true,
      },
      {
        name: "Bouquet",
        emoji: "💐",
        image:
          "https://res.cloudinary.com/demo/image/upload/v1/gifts/bouquet.png",
        coinValue: 25,
        category: "flowers",
        isActive: true,
      },
      {
        name: "Kiss",
        emoji: "💋",
        image: "https://res.cloudinary.com/demo/image/upload/v1/gifts/kiss.png",
        coinValue: 20,
        category: "romantic",
        isActive: true,
      },
      {
        name: "Star",
        emoji: "⭐",
        image: "https://res.cloudinary.com/demo/image/upload/v1/gifts/star.png",
        coinValue: 5,
        category: "general",
        isActive: true,
      },
    ];

    const created = [];
    const skipped = [];

    for (const giftData of defaultGifts) {
      // Check if gift already exists
      const existing = await Gift.findOne({ name: giftData.name });

      if (existing) {
        skipped.push(giftData.name);
        continue;
      }

      const gift = await Gift.create(giftData);
      created.push({
        name: gift.name,
        emoji: gift.emoji,
        coinValue: gift.coinValue,
      });
    }

    res.json({
      success: true,
      message: `Created ${created.length} gifts, skipped ${skipped.length} existing`,
      created,
      skipped,
    });
  } catch (error) {
    console.error("POST /api/admin/seed-gifts error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error",
    });
  }
});

/**
 * GET /api/admin/gifts
 * Get all gifts (admin only)
 */
router.get("/gifts", auth, async (req, res) => {
  try {
    const gifts = await Gift.find().sort({ coinValue: 1 });

    res.json({
      success: true,
      gifts,
      total: gifts.length,
    });
  } catch (error) {
    console.error("GET /api/admin/gifts error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

export default router;
