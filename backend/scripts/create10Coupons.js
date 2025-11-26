// scripts/create10Coupons.js
// Create 10 random coupon codes with 10% discount

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Coupon from '../models/Coupon.js';

dotenv.config();

const COUPON_CODES = [
  'LOVE10',
  'HUMDONO10',
  'MATCH10',
  'DATING10',
  'ROMANCE10',
  'COUPLE10',
  'HEART10',
  'CONNECT10',
  'MEET10',
  'SPARK10'
];

async function create10Coupons() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Set expiry date to 1 year from now
    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 1);

    const coupons = [];

    for (const code of COUPON_CODES) {
      // Check if coupon already exists
      const existing = await Coupon.findOne({ code });
      
      if (existing) {
        console.log(`⚠️  Coupon ${code} already exists, skipping...`);
        continue;
      }

      const coupon = await Coupon.create({
        code: code,
        name: `${code} - 10% Off`,
        description: '10% discount on all purchases',
        discountType: 'percentage',
        discountValue: 10,
        maxDiscount: 100, // Maximum ₹100 discount
        minOrderAmount: 0, // No minimum order
        maxUsage: null, // Unlimited usage
        validFrom: new Date(),
        validUntil: validUntil,
        isActive: true,
        applicableFor: ['all'], // Works on coins, subscription, everything
        userRestrictions: {
          newUsersOnly: false,
          maxUsagePerUser: 999, // Each user can use 999 times (practically unlimited)
          excludedUsers: []
        }
      });

      coupons.push(coupon);
      console.log(`✅ Created coupon: ${code}`);
    }

    console.log(`\n🎉 Successfully created ${coupons.length} coupons!\n`);
    
    // Display all coupons
    console.log('📋 COUPON CODES LIST:');
    console.log('═'.repeat(60));
    
    const allCoupons = await Coupon.find({ code: { $in: COUPON_CODES } });
    
    allCoupons.forEach((coupon, index) => {
      console.log(`${index + 1}. ${coupon.code}`);
      console.log(`   Discount: ${coupon.discountValue}%`);
      console.log(`   Max Discount: ₹${coupon.maxDiscount}`);
      console.log(`   Valid Until: ${coupon.validUntil.toLocaleDateString()}`);
      console.log(`   Usage: Unlimited`);
      console.log(`   Applicable: All purchases`);
      console.log('');
    });
    
    console.log('═'.repeat(60));
    console.log('\n✅ All coupons are ready to use!');
    console.log('💡 Users can apply these codes on Subscription, Wallet, or Boost pages\n');

  } catch (error) {
    console.error('❌ Error creating coupons:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  }
}

create10Coupons();
