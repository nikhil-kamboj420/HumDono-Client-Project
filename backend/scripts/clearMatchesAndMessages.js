// scripts/clearMatchesAndMessages.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Match from '../models/Match.js';
import Message from '../models/Message.js';

dotenv.config();

async function clearMatchesAndMessages() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env file');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Count before deletion
    const matchCount = await Match.countDocuments();
    const messageCount = await Message.countDocuments();

    console.log(`\n📊 Current Data:`);
    console.log(`- Matches: ${matchCount}`);
    console.log(`- Messages: ${messageCount}`);

    // Delete all matches and messages
    await Match.deleteMany({});
    await Message.deleteMany({});

    console.log('\n🗑️  Successfully cleared:');
    console.log('✅ All Matches deleted');
    console.log('✅ All Messages deleted');

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    process.exit(1);
  }
}

clearMatchesAndMessages();
