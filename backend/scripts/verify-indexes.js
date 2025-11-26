// scripts/verify-indexes.js
// Verify all indexes are properly configured

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function verifyIndexes() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Get all indexes
    console.log('📋 All User Collection Indexes:\n');
    const indexes = await usersCollection.indexes();
    
    indexes.forEach(idx => {
      const sparse = idx.sparse ? '✓ SPARSE' : '✗ NOT SPARSE';
      const unique = idx.unique ? '✓ UNIQUE' : '✗ NOT UNIQUE';
      console.log(`Index: ${idx.name}`);
      console.log(`  Key: ${JSON.stringify(idx.key)}`);
      console.log(`  ${unique} | ${sparse}`);
      console.log('');
    });

    // Count users with null phone
    const nullPhoneCount = await usersCollection.countDocuments({ phone: null });
    console.log(`📊 Users with phone: null = ${nullPhoneCount}`);

    // Count users with email
    const emailCount = await usersCollection.countDocuments({ email: { $exists: true } });
    console.log(`📊 Users with email = ${emailCount}`);

    console.log('\n✅ Index verification completed!');

  } catch (error) {
    console.error('❌ Error verifying indexes:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
    process.exit(0);
  }
}

verifyIndexes();
