import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import feedRoutes from './routes/feed.js';
import interactionsRoutes from './routes/interactions.js';
import notificationsRoutes from './routes/notifications.js';
import matchesRoutes from './routes/matches.js';
import messagesRoutes from './routes/messages.js';
import giftsRoutes from './routes/gifts.js';
import friendsRoutes from './routes/friends.js';
import boostsRoutes from './routes/boosts.js';
import referralsRoutes from './routes/referrals.js';
import requestsRoutes from './routes/requests.js';
import paymentsRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();

/**
 * Basic security & middleware
 */
app.use(helmet());

// Special handling for Razorpay webhook - needs raw body
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Regular JSON parsing for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/**
 * Trust proxy when behind a reverse proxy (nginx, vercel, ngrok, etc.)
 * Needed for rate limiting and secure cookies to work properly.
 */
app.set('trust proxy', 1);

/**
 * CORS
 * Accept origins from env or fallback to localhost dev ports.
 * credentials: true is required for httpOnly refresh cookie to be sent.
 */
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map(s => s.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      // allow requests with no origin like mobile apps or curl
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGINS.indexOf(origin) !== -1) return cb(null, true);
      return cb(new Error('CORS not allowed'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);

/**
 * Basic rate limiting to protect auth endpoints (adjust to taste)
 * Keep a more permissive limiter for public routes and stricter where needed.
 */
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // global limit
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

/**
 * Database connect with better options and error handling
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('Please check:');
    console.error('1. MongoDB Atlas cluster is active (not paused)');
    console.error('2. IP address is whitelisted in Network Access');
    console.error('3. Database user credentials are correct');
    console.error('4. Internet connection is stable');
    // Don't exit, let app run and retry connection
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('📴 Mongoose disconnected from MongoDB');
});

// Connect to database
connectDB();

/**
 * Routes
 * Keep auth & users first so auth cookie path "/api/auth" works as expected.
 */
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

// mount new features:
app.use('/api/feed', feedRoutes);
app.use('/api/interactions', interactionsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/gifts', giftsRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/boosts', boostsRoutes);
app.use('/api/referrals', referralsRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/payments', paymentsRoutes);

// Import new routes
import subscriptionsRoutes from './routes/subscriptions.js';
import couponsRoutes from './routes/coupons.js';

// Mount new routes
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/admin', adminRoutes);

// Test endpoint to verify ngrok is working
app.get('/webhook-test', (req, res) => {
  console.log('🧪 Webhook test endpoint hit!');
  res.json({ 
    success: true, 
    message: 'Webhook endpoint is reachable!',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => res.send('HumDono API Running'));

/**
 * Simple error handler (returns JSON)
 */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (err instanceof Error && err.message === 'CORS not allowed') {
    return res.status(403).json({ ok: false, error: 'CORS not allowed' });
  }
  res.status(500).json({ ok: false, error: 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
