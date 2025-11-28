// scripts/clearInteractions.js
// Clear all interactions from database

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Interaction from '../models/Interaction.js';

dotenv.config();

async function clearInteractions() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const count = await Interaction.countDocuments();
    console.log(`📋 Found ${count} interactions\n`);

    if (count === 0) {
      console.log('✅ No interactions to delete');
      process.exit(0);
    }

    console.log('🗑️  Deleting all interactions...');
    const result = await Interaction.deleteMany({});
    
    console.log(`\n✅ Deleted ${result.deletedCount} interactions`);
    console.log('🎉 Database cleared successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

clearInteractions();
