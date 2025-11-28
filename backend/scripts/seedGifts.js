// scripts/seedGifts.js
import 'dotenv/config';
import mongoose from 'mongoose';
import Gift from '../models/Gift.js';

const defaultGifts = [
  {
    name: "Rose",
    emoji: "🌹",
    image: "https://res.cloudinary.com/demo/image/upload/v1/gifts/rose.png",
    coinValue: 10,
    category: "flowers"
  },
  {
    name: "Heart",
    emoji: "❤️",
    image: "https://res.cloudinary.com/demo/image/upload/v1/gifts/heart.png",
    coinValue: 30,
    category: "romantic"
  },
  {
    name: "Teddy Bear",
    emoji: "🧸",
    image: "https://res.cloudinary.com/demo/image/upload/v1/gifts/teddy.png",
    coinValue: 50,
    category: "cute"
  },
  {
    name: "Diamond Ring",
    emoji: "💍",
    image: "https://res.cloudinary.com/demo/image/upload/v1/gifts/ring.png",
    coinValue: 100,
    category: "jewelry"
  }
];

async function seedGifts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing gifts
    await Gift.deleteMany({});
    console.log('Cleared existing gifts');

    // Insert default gifts
    await Gift.insertMany(defaultGifts);
    console.log('Seeded default gifts');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding gifts:', error);
    process.exit(1);
  }
}

seedGifts();