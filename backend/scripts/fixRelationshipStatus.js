// scripts/fixRelationshipStatus.js
// Fix relationship status for existing female profiles

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

async function fixRelationshipStatus() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all female users
    const females = await User.find({ gender: 'female' });
    console.log(`📋 Found ${females.length} female profiles\n`);

    let updated = 0;
    let marriedCount = 0;
    let singleCount = 0;

    for (const user of females) {
      let newStatus = 'single';
      
      // For 27+ age: 22.5% chance of married
      if (user.age >= 27) {
        const randomChance = Math.random() * 100;
        if (randomChance < 22.5) {
          newStatus = 'married';
          marriedCount++;
        } else {
          singleCount++;
        }
      } else {
        singleCount++;
      }

      // Update only if status changed
      if (user.relationshipStatus !== newStatus) {
        user.relationshipStatus = newStatus;
        await user.save();
        updated++;
      }
    }

    console.log('\n✅ Update Complete!');
    console.log(`📊 Statistics:`);
    console.log(`   - Total females: ${females.length}`);
    console.log(`   - Updated: ${updated}`);
    console.log(`   - Single: ${singleCount} (${((singleCount/females.length)*100).toFixed(1)}%)`);
    console.log(`   - Married: ${marriedCount} (${((marriedCount/females.length)*100).toFixed(1)}%)`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixRelationshipStatus();
