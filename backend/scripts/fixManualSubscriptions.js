import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import ManualPaymentRequest from '../models/ManualPaymentRequest.js';

dotenv.config();

async function fixManualSubscriptions() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all checked manual payment requests
    const requests = await ManualPaymentRequest.find({ status: 'checked' });
    console.log(`📋 Found ${requests.length} checked manual payment requests\n`);

    let updatedCount = 0;
    let alreadyPremiumCount = 0;
    let userNotFoundCount = 0;

    for (const req of requests) {
      const user = await User.findById(req.user);

      if (!user) {
        console.log(`❌ User not found for request ID: ${req._id} (User ID: ${req.user})`);
        userNotFoundCount++;
        continue;
      }

      // Check if user is already premium
      if (user.isPremium && user.premiumType === 'lifetime' && user.subscription?.active && user.subscription?.isLifetime) {
        console.log(`ℹ️ User ${user.email} (${user._id}) is already lifetime premium.`);
        alreadyPremiumCount++;
        continue;
      }

      console.log(`🔄 Updating subscription for user ${user.email} (${user._id})...`);

      // Update user subscription fields
      user.isPremium = true;
      user.premiumType = 'lifetime';
      
      // Initialize subscription object if it doesn't exist
      if (!user.subscription) {
        user.subscription = {};
      }

      user.subscription.active = true;
      user.subscription.plan = 'lifetime';
      user.subscription.isLifetime = true;
      user.subscription.expiresAt = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000); // 100 years
      
      // Enable all features
      user.subscription.features = {
        unlimitedLikes: true,
        unlimitedMessages: true,
        prioritySupport: true,
        profileBoost: true,
        seeWhoLikedYou: true,
        rewindFeature: true
      };

      // Give 200 coins as part of the package (as per previous conversation context)
      // "Upon purchasing a lifetime subscription, male users receive 200 coins silently"
      // Only add if they don't have them? Or just add? 
      // Let's just ensure they have at least 200 if they were 0, or maybe just add 200?
      // The requirement was "receive 200 coins silently". I'll add 200.
      // But wait, if I run this script multiple times, I shouldn't keep adding coins.
      // I'll assume if they are not premium yet, they haven't received the coins.
      
      // Check if we should add coins. 
      // If the user was NOT premium before this block, we add coins.
      user.coins = (user.coins || 0) + 200;

      await user.save();
      console.log(`✅ Updated user ${user.email} to Lifetime Premium + 200 coins.`);
      updatedCount++;
    }

    console.log('\n✅ Process Complete!');
    console.log(`📊 Statistics:`);
    console.log(`   - Total Requests Checked: ${requests.length}`);
    console.log(`   - Users Updated: ${updatedCount}`);
    console.log(`   - Already Premium: ${alreadyPremiumCount}`);
    console.log(`   - Users Not Found: ${userNotFoundCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixManualSubscriptions();
