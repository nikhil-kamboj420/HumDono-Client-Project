// scripts/ensure-email-index.js
// Ensure email has proper unique index

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function ensureEmailIndex() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Check if email_1 index exists
    const indexes = await usersCollection.indexes();
    const emailIndex = indexes.find(idx => idx.name === 'email_1');

    if (emailIndex) {
      console.log('✅ Email index already exists:');
      console.log(`  Name: ${emailIndex.name}`);
      console.log(`  Key: ${JSON.stringify(emailIndex.key)}`);
      console.log(`  Unique: ${emailIndex.unique ? 'Yes' : 'No'}`);
    } else {
      console.log('🔨 Creating email index...');
      await usersCollection.createIndex(
        { email: 1 },
        { unique: true, name: 'email_1' }
      );
      console.log('✅ Email index created successfully!');
    }

    console.log('\n📋 All indexes:');
    const allIndexes = await usersCollection.indexes();
    allIndexes.forEach(idx => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
    process.exit(0);
  }
}

ensureEmailIndex();
