// scripts/fix-phone-index.js
// Fix duplicate key error for phone field by dropping old index and creating sparse index

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function fixPhoneIndex() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Get all indexes
    console.log('\n📋 Current indexes:');
    const indexes = await usersCollection.indexes();
    indexes.forEach(idx => {
      console.log(`  - ${idx.name}:`, JSON.stringify(idx.key));
    });

    // Drop the old phone_1 index if it exists
    try {
      console.log('\n🗑️  Dropping old phone_1 index...');
      await usersCollection.dropIndex('phone_1');
      console.log('✅ Old phone_1 index dropped');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  phone_1 index does not exist (already dropped or never created)');
      } else {
        throw error;
      }
    }

    // Create new sparse unique index for phone
    console.log('\n🔨 Creating new sparse unique index for phone...');
    await usersCollection.createIndex(
      { phone: 1 },
      { unique: true, sparse: true, name: 'phone_1_sparse' }
    );
    console.log('✅ New sparse index created: phone_1_sparse');

    // Verify new indexes
    console.log('\n📋 Updated indexes:');
    const newIndexes = await usersCollection.indexes();
    newIndexes.forEach(idx => {
      console.log(`  - ${idx.name}:`, JSON.stringify(idx.key), idx.sparse ? '(sparse)' : '');
    });

    console.log('\n✅ Phone index fix completed successfully!');
    console.log('ℹ️  You can now register users without phone numbers.');

  } catch (error) {
    console.error('❌ Error fixing phone index:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
    process.exit(0);
  }
}

fixPhoneIndex();
