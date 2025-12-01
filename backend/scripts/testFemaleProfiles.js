// scripts/testFemaleProfiles.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

async function testFemaleProfiles() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const femaleProfiles = await User.find({ gender: /^female$/i })
      .select('name age gender')
      .limit(10)
      .lean();

    console.log('📋 Sample Female Profiles:');
    femaleProfiles.forEach((p, i) => 
      console.log(`${i + 1}. ${p.name}, Age: ${p.age}, Gender: ${p.gender}`)
    );

    const totalFemale = await User.countDocuments({ gender: /^female$/i });
    console.log(`\n✅ Total Female Profiles: ${totalFemale}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testFemaleProfiles();
