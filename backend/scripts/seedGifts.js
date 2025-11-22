// scripts/seedGifts.js
import 'dotenv/config';
import mongoose from 'mongoose';
import Gift from '../models/Gift.js';

const defaultGifts = [
  {
    name: "Rose",
    image: "https://res.cloudinary.com/demo/image/upload/v1/gifts/rose.png",
    coinValue: 10,
    category: "flowers"
  },
  {
    name: "Bouquet",
    image: "https://res.cloudinary.com/demo/image/upload/v1/gifts/bouquet.png",
    coinValue: 25,
    category: "flowers"
  },
  {
    name: "Chocolate",
    image: "https://res.cloudinary.com/demo/image/upload/v1/gifts/chocolate.png",
    coinValue: 15,
    category: "sweets"
  },
  {
    name: "Coffee",
    image: "https://res.cloudinary.com/demo/image/upload/v1/gifts/coffee.png",
    coinValue: 20,
    category: "drinks"
  },
  {
    name: "Heart",
    image: "https://res.cloudinary.com/demo/image/upload/v1/gifts/heart.png",
    coinValue: 30,
    category: "romantic"
  },
  {
    name: "Diamond Ring",
    image: "https://res.cloudinary.com/demo/image/upload/v1/gifts/ring.png",
    coinValue: 100,
    category: "jewelry"
  },
  {
    name: "Teddy Bear",
    image: "https://res.cloudinary.com/demo/image/upload/v1/gifts/teddy.png",
    coinValue: 40,
    category: "cute"
  },
  {
    name: "Wine",
    image: "https://res.cloudinary.com/demo/image/upload/v1/gifts/wine.png",
    coinValue: 50,
    category: "drinks"
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