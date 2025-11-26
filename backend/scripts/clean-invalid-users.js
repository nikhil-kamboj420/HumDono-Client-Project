// scripts/clean-invalid-users.js
// Clean up users with null email (invalid data)

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function cleanInvalidUsers() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Find users with null or missing email
    console.log('🔍 Finding users with null/missing email...');
    const invalidUsers = await usersCollection.find({
      $or: [
        { email: null },
        { email: { $exists: false } },
        { email: '' }
      ]
    }).toArray();

    console.log(`Found ${invalidUsers.length} invalid users:\n`);
    
    if (invalidUsers.length > 0) {
      invalidUsers.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user._id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Name: ${user.name || 'N/A'}`);
        console.log(`   Phone: ${user.phone || 'N/A'}`);
        console.log(`   Created: ${user.createdAt || 'N/A'}`);
        console.log('');
      });

      console.log('⚠️  WARNING: These users will be deleted!');
      console.log('🗑️  Deleting invalid users...\n');

      const result = await usersCollection.deleteMany({
        $or: [
          { email: null },
          { email: { $exists: false } },
          { email: '' }
        ]
      });

      console.log(`✅ Deleted ${result.deletedCount} invalid users`);
    } else {
      console.log('✅ No invalid users found!');
    }

    // Verify cleanup
    const remainingCount = await usersCollection.countDocuments();
    console.log(`\n📊 Total users remaining: ${remainingCount}`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
    process.exit(0);
  }
}

cleanInvalidUsers();
