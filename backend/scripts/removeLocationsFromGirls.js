// scripts/removeLocationsFromGirls.js
// Remove location data from imported girl profiles

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

async function removeLocations() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all imported girl profiles
    const girls = await User.find({ 
      email: { $regex: '@humdono.app$' },
      gender: 'female'
    });

    console.log(`📋 Found ${girls.length} girl profiles\n`);

    let updated = 0;

    for (const girl of girls) {
      // Remove location data
      girl.location = {
        city: '',
        state: '',
        lat: undefined,
        lng: undefined
      };

      await girl.save();
      console.log(`✅ Removed location from: ${girl.name}`);
      updated++;
    }

    console.log('\n' + '═'.repeat(60));
    console.log(`🎉 Location Removal Complete!`);
    console.log(`✅ Updated ${updated} profiles`);
    console.log(`📊 All girl profiles now have NO location data`);
    console.log('═'.repeat(60));

    // Verify
    const verified = await User.findOne({ 
      email: { $regex: '@humdono.app$' },
      gender: 'female'
    }).select('name location');

    console.log('\n📋 Sample Profile After Update:');
    console.log(`Name: ${verified.name}`);
    console.log(`Location: ${JSON.stringify(verified.location)}`);

    console.log('\n✅ All locations removed successfully!\n');

  } catch (error) {
    console.error('❌ Error removing locations:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  }
}

removeLocations();
