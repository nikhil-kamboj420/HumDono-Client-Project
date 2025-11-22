// backend/scripts/createCoupon.js
// Script to create coupon codes for staff members

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Coupon from '../models/Coupon.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/humdono')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Sample coupons for staff members
const sampleCoupons = [
  {
    code: 'WELCOME50',
    name: 'Welcome Offer',
    description: 'Get 50% off on your first coin purchase!',
    discountType: 'percentage',
    discountValue: 50,
    maxDiscount: 500,
    minOrderAmount: 100,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    maxUsage: 1000,
    applicableFor: ['coins'],
    userRestrictions: {
      newUsersOnly: true,
      maxUsagePerUser: 1
    }
  },
  {
    code: 'INSTA10',
    name: 'Special Discount',
    description: 'Get 10% off on each coin & subscription purchase!',
    discountType: 'percentage',
    discountValue: 10,
    maxDiscount: 1000, // High limit so 10% always applies
    minOrderAmount: 0, // No minimum order
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year validity
    maxUsage: 10000, // High limit for total usage
    applicableFor: ['all'], // coins, boosts, subscription - sab pe kaam karega
    userRestrictions: {
      newUsersOnly: false, // Har user use kar sakta hai
      maxUsagePerUser: 1 // Sirf ek baar per user
    }
  },
  {
    code: 'BOOST20',
    name: 'Boost Discount',
    description: 'Save 20% on all boosts!',
    discountType: 'percentage',
    discountValue: 20,
    maxDiscount: 100,
    minOrderAmount: 0,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    maxUsage: 1000,
    applicableFor: ['boosts'],
    userRestrictions: {
      newUsersOnly: false,
      maxUsagePerUser: 5
    }
  },
  {
    code: 'PREMIUM100',
    name: 'Premium Discount',
    description: 'Flat ₹100 off on premium subscription!',
    discountType: 'fixed',
    discountValue: 100,
    minOrderAmount: 299,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    maxUsage: 200,
    applicableFor: ['subscription'],
    userRestrictions: {
      newUsersOnly: false,
      maxUsagePerUser: 1
    }
  }
];

async function createCoupons() {
  try {
    console.log('🎫 Creating sample coupons...\n');

    for (const couponData of sampleCoupons) {
      // Check if coupon already exists
      const existing = await Coupon.findOne({ code: couponData.code });
      
      if (existing) {
        console.log(`⚠️  Coupon ${couponData.code} already exists, skipping...`);
        continue;
      }

      const coupon = await Coupon.create(couponData);
      console.log(`✅ Created: ${coupon.code} - ${coupon.name}`);
      console.log(`   Discount: ${coupon.discountType === 'percentage' ? coupon.discountValue + '%' : '₹' + coupon.discountValue}`);
      console.log(`   Valid until: ${coupon.validUntil.toLocaleDateString()}`);
      console.log(`   Max usage: ${coupon.maxUsage} times\n`);
    }

    console.log('✅ All coupons created successfully!');
    console.log('\n📋 Staff members can share these codes on Instagram:');
    sampleCoupons.forEach(c => {
      console.log(`   - ${c.code}: ${c.description}`);
    });

  } catch (error) {
    console.error('❌ Error creating coupons:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
    process.exit(0);
  }
}

// Run the script
createCoupons();
