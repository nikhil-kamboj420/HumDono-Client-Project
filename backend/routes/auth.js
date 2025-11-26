// routes/auth.js - EMAIL + PASSWORD + OTP AUTHENTICATION
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Otp from "../models/Otp.js";
import User from "../models/User.js";
import { sendOtpEmail } from "../utils/emailService.js";

const router = express.Router();

/* ---------- helpers ---------- */

// generate numeric OTP
function genOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// create and store refresh token (hashed) on user and set httpOnly cookie
async function createAndStoreRefreshToken(user, res, { device = "web" } = {}) {
  const plain = crypto.randomBytes(40).toString("hex");
  const hash = await bcrypt.hash(plain, 10);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  user.refreshTokens = user.refreshTokens || [];
  user.refreshTokens.push({
    tokenHash: hash,
    createdAt: new Date(),
    expiresAt,
    device,
  });
  await user.save();

  res.cookie("refreshToken", plain, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",  // Changed from /api/auth to / so cookie is available everywhere
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return plain;
}

// clear a refresh token cookie
function clearRefreshCookie(res) {
  res.clearCookie("refreshToken", { path: "/" });  // Match the cookie path
}

// compute whether profile is "complete"
function isProfileComplete(user) {
  if (!user) return false;
  const hasName = Boolean(user.name && String(user.name).trim().length > 0);
  const hasPhoto = Array.isArray(user.photos) && user.photos.length > 0;
  return hasName && hasPhoto;
}

// validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/* ---------- routes ---------- */

/**
 * POST /api/auth/register
 * Register new user with email + password
 * Does NOT create user yet - just validates and sends OTP
 */
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: "Email and password are required" });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ ok: false, error: "Invalid email format" });
    }

    if (password.length < 6) {
      return res.status(400).json({ ok: false, error: "Password must be at least 6 characters" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ ok: false, error: "Email already registered" });
    }

    // Generate and send OTP
    const otp = genOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Remove old OTPs for this email
    await Otp.deleteMany({ email: cleanEmail });

    // Store OTP
    await Otp.create({ email: cleanEmail, otpHash, expiresAt });

    // Send OTP email
    try {
      await sendOtpEmail(cleanEmail, otp);
    } catch (emailError) {
      console.error("Email send failed:", emailError.message);
    }

    // Return success message
    return res.json({
      ok: true,
      message: "Verification code sent to your email"
    });

    return res.json({
      ok: true,
      message: "Verification code sent to your email",
      ...(process.env.NODE_ENV !== 'production' && { demoOtp: otp })
    });
  } catch (err) {
    console.error("Error in /register:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * POST /api/auth/verify-registration
 * Verify OTP and create user account
 */
router.post("/verify-registration", async (req, res) => {
  try {
    const { email, password, otp } = req.body;

    if (!email || !password || !otp) {
      return res.status(400).json({ ok: false, error: "Email, password, and OTP are required" });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    // Find OTP
    const otpDoc = await Otp.findOne({ email: cleanEmail }).sort({ createdAt: -1 });

    if (!otpDoc) {
      return res.status(400).json({ ok: false, error: "OTP not found or expired" });
    }

    if (otpDoc.expiresAt < new Date()) {
      await Otp.deleteMany({ email: cleanEmail });
      return res.status(400).json({ ok: false, error: "OTP expired" });
    }

    if (otpDoc.attempts >= 5) {
      return res.status(429).json({ ok: false, error: "Too many attempts" });
    }

    // Verify OTP
    const valid = await bcrypt.compare(cleanOtp, otpDoc.otpHash);
    if (!valid) {
      otpDoc.attempts = (otpDoc.attempts || 0) + 1;
      await otpDoc.save();
      return res.status(400).json({ ok: false, error: "Incorrect OTP" });
    }

    // Check if user already exists (double-check)
    let user = await User.findOne({ email: cleanEmail });
    if (user) {
      return res.status(400).json({ ok: false, error: "Email already registered" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    user = await User.create({
      email: cleanEmail,
      password: passwordHash,
      coins: 0,
      requiresFirstSubscription: true,
      verification: {
        emailVerified: true,
        phoneVerified: false,
        photoVerified: false,
        idVerified: false
      }
    });



    // Generate tokens (7 days expiry for better UX)
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    await createAndStoreRefreshToken(user, res);

    // Cleanup OTPs
    await Otp.deleteMany({ email: cleanEmail });

    return res.json({
      ok: true,
      token: accessToken,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        coins: user.coins,
        requiresFirstSubscription: user.requiresFirstSubscription
      },
      isNewUser: true,
      isProfileComplete: isProfileComplete(user),
    });
  } catch (err) {
    console.error("Error in /verify-registration:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * POST /api/auth/login
 * Login with email + password
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, error: "Email and password are required" });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Find user
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({ ok: false, error: "Invalid email or password" });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ ok: false, error: "Invalid email or password" });
    }

    // Generate tokens (7 days expiry for better UX)
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    await createAndStoreRefreshToken(user, res);

    return res.json({
      ok: true,
      token: accessToken,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        coins: user.coins,
        subscription: user.subscription
      },
      isProfileComplete: isProfileComplete(user),
    });
  } catch (err) {
    console.error("Error in /login:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * GET /api/auth/me
 * Get current user
 */
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ ok: false, error: "No token" });

    const parts = String(authHeader).split(" ");
    if (parts.length !== 2) return res.status(401).json({ ok: false, error: "Invalid token format" });

    const token = parts[1];

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.userId).select("-refreshTokens -password");
      if (!user) return res.status(404).json({ ok: false, error: "User not found" });
      return res.json({ ok: true, user, isProfileComplete: isProfileComplete(user) });
    } catch (e) {
      return res.status(401).json({ ok: false, error: "Invalid token" });
    }
  } catch (err) {
    console.error("Error in /me:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post("/refresh", async (req, res) => {
  try {
    const plain = req.cookies?.refreshToken;
    if (!plain) return res.status(401).json({ ok: false, error: "No refresh token" });

    const users = await User.find({ "refreshTokens.expiresAt": { $gt: new Date() } });
    for (const user of users) {
      for (const rt of user.refreshTokens) {
        const ok = await bcrypt.compare(plain, rt.tokenHash);
        if (ok) {
          user.refreshTokens = user.refreshTokens.filter(
            (x) => x._id.toString() !== rt._id.toString()
          );
          await user.save();

          const accessToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
          );

          await createAndStoreRefreshToken(user, res);

          return res.json({
            ok: true,
            token: accessToken,
            user: {
              _id: user._id,
              email: user.email,
              name: user.name,
              coins: user.coins
            },
            isProfileComplete: isProfileComplete(user),
          });
        }
      }
    }

    clearRefreshCookie(res);
    return res.status(401).json({ ok: false, error: "Invalid refresh token" });
  } catch (err) {
    console.error("Error in /refresh:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post("/logout", async (req, res) => {
  try {
    const plain = req.cookies?.refreshToken;
    if (plain) {
      const users = await User.find({ "refreshTokens.expiresAt": { $gt: new Date() } });
      for (const user of users) {
        for (let i = 0; i < user.refreshTokens.length; i++) {
          const rt = user.refreshTokens[i];
          const ok = await bcrypt.compare(plain, rt.tokenHash);
          if (ok) {
            user.refreshTokens.splice(i, 1);
            await user.save();
            break;
          }
        }
      }
    }

    clearRefreshCookie(res);
    return res.json({ ok: true });
  } catch (err) {
    console.error("Error in logout:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

export default router;
