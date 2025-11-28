// scripts/importGirlsData.js
// Import girls data from GirlsData.json as real users

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Indian cities for location
const INDIAN_CITIES = [
  { city: 'Delhi', state: 'Delhi' },
  { city: 'Mumbai', state: 'Maharashtra' },
  { city: 'Bangalore', state: 'Karnataka' },
  { city: 'Hyderabad', state: 'Telangana' },
  { city: 'Chennai', state: 'Tamil Nadu' },
  { city: 'Kolkata', state: 'West Bengal' },
  { city: 'Pune', state: 'Maharashtra' },
  { city: 'Jaipur', state: 'Rajasthan' },
  { city: 'Chandigarh', state: 'Chandigarh' },
  { city: 'Gurgaon', state: 'Haryana' }
];

// Interests pool
const INTERESTS = [
  'Music', 'Movies', 'Travel', 'Cooking', 'Reading', 'Sports',
  'Gaming', 'Photography', 'Dancing', 'Fitness', 'Art', 'Technology',
  'Fashion', 'Food', 'Nature', 'Yoga', 'Shopping', 'Painting'
];

// Relationship statuses - Only single and married allowed
// For 27+ age females: 20-25% married, rest single
const RELATIONSHIP_STATUSES_SINGLE = ['single'];
const RELATIONSHIP_STATUSES_MARRIED = ['married'];

// Education levels
const EDUCATION_LEVELS = [
  "Bachelor's Degree", "Master's Degree", "Diploma", "PhD", "High School"
];

// Professions
const PROFESSIONS = [
  'Software Engineer', 'Teacher', 'Doctor', 'Business Owner',
  'Artist', 'Marketing Manager', 'Designer', 'Consultant',
  'Student', 'Entrepreneur', 'Content Creator', 'HR Manager'
];

// Lifestyle preferences
const DRINKING = ['never', 'socially', 'regularly'];
const SMOKING = ['never', 'socially'];
const EATING = ['vegetarian', 'non-vegetarian', 'vegan'];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function importGirlsData() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Read GirlsData.json
    const dataPath = path.join(__dirname, '..', 'GirlsData.json');
    const girlsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    console.log(`📋 Found ${girlsData.length} profiles to import\n`);

    let imported = 0;
    let skipped = 0;

    for (const girl of girlsData) {
      try {
        // Generate unique email from name
        const emailName = girl.name.toLowerCase().replace(/\s+/g, '.');
        const email = `${emailName}@humdono.app`;

        // Check if user already exists
        const existing = await User.findOne({ email });
        if (existing) {
          console.log(`⚠️  ${girl.name} already exists, skipping...`);
          skipped++;
          continue;
        }

        // Generate random password (won't be used, but required)
        const password = await bcrypt.hash('HumDono@2025', 10);

        // Convert photo URLs to photos array
        const photos = girl.profile_photos_URL.map((url, index) => ({
          url: url,
          public_id: `imported_${Date.now()}_${index}`,
          isProfile: index === 0 // First photo is profile photo
        }));

        // Get random location
        const location = getRandomElement(INDIAN_CITIES);

        // Get random interests (3-5)
        const interests = getRandomElements(INTERESTS, Math.floor(Math.random() * 3) + 3);

        // Determine relationship status based on age
        // For 27+ age: 20-25% chance of married, rest single
        // For <27 age: Always single
        let relationshipStatus = 'single';
        if (girl.age >= 27) {
          const randomChance = Math.random() * 100; // 0-100
          if (randomChance < 22.5) { // 22.5% chance (between 20-25%)
            relationshipStatus = 'married';
          }
        }

        // Create user
        const user = await User.create({
          email: email,
          password: password,
          name: girl.name,
          age: girl.age,
          gender: 'female',
          bio: girl.about,
          interests: interests,
          languages: girl.languages || ['Hindi', 'English'],
          photos: photos,
          location: {
            city: location.city,
            state: location.state
          },
          relationshipStatus: relationshipStatus,
          education: getRandomElement(EDUCATION_LEVELS),
          profession: getRandomElement(PROFESSIONS),
          drinking: getRandomElement(DRINKING),
          smoking: getRandomElement(SMOKING),
          eating: getRandomElement(EATING),
          verification: {
            emailVerified: true,
            phoneVerified: true,
            photoVerified: true,
            idVerified: false
          },
          coins: 0,
          subscription: {
            active: false,
            plan: 'free'
          },
          lastActiveAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random within last 7 days
        });

        console.log(`✅ Imported: ${girl.name} (${location.city})`);
        imported++;

      } catch (error) {
        console.error(`❌ Error importing ${girl.name}:`, error.message);
      }
    }

    console.log('\n' + '═'.repeat(60));
    console.log(`🎉 Import Complete!`);
    console.log(`✅ Successfully imported: ${imported} profiles`);
    console.log(`⚠️  Skipped (already exist): ${skipped} profiles`);
    console.log(`📊 Total in database: ${imported + skipped} profiles`);
    console.log('═'.repeat(60));

    // Show sample profiles
    console.log('\n📋 Sample Imported Profiles:');
    const samples = await User.find({ email: { $regex: '@humdono.app$' } })
      .limit(5)
      .select('name age location.city interests');
    
    samples.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name}, ${user.age}`);
      console.log(`   Location: ${user.location.city}`);
      console.log(`   Interests: ${user.interests.slice(0, 3).join(', ')}`);
    });

    console.log('\n✅ All profiles are now live in the app!');
    console.log('💡 These profiles will appear in swipe cards for male users\n');

  } catch (error) {
    console.error('❌ Error importing data:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  }
}

importGirlsData();
