// routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Otp from "../models/Otp.js";
import User from "../models/User.js";

const router = express.Router();

/* ---------- helpers ---------- */

// generate numeric OTP
function genOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// create and store refresh token (hashed) on user and set httpOnly cookie
async function createAndStoreRefreshToken(user, res, { device = "web" } = {}) {
  const plain = crypto.randomBytes(40).toString("hex"); // long random token
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

  // set cookie for path /api/auth so refresh endpoint can read it
  res.cookie("refreshToken", plain, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return plain;
}

// clear a refresh token cookie
function clearRefreshCookie(res) {
  res.clearCookie("refreshToken", { path: "/api/auth" });
}

// compute whether profile is "complete" (simple heuristic)
function isProfileComplete(user) {
  if (!user) return false;
  const hasName = Boolean(user.name && String(user.name).trim().length > 0);
  const hasPhoto = Array.isArray(user.photos) && user.photos.length > 0;
  return hasName && hasPhoto;
}

/* ---------- routes ---------- */

// SEND OTP
router.post("/send-otp", async (req, res) => {
  try {
    const rawPhone = req.body?.phone;
    const phone = rawPhone ? String(rawPhone).trim() : null;

    if (!phone) {
      return res.status(400).json({ ok: false, error: "Phone is required" });
    }

    const otp = genOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // remove older OTPs for this phone
    await Otp.deleteMany({ phone });

    await Otp.create({ phone, otpHash, expiresAt });

    // NOTE: remove demoOtp in production
    return res.json({
      ok: true,
      message: "OTP sent successfully",
      demoOtp: otp,
    });
  } catch (err) {
    console.error("Error in send-otp:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

// VERIFY OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const rawPhone = req.body?.phone;
    const rawOtp = req.body?.otp;
    const phone = rawPhone ? String(rawPhone).trim() : null;
    const otp = rawOtp ? String(rawOtp).trim() : null;

    if (!phone || !otp) {
      return res.status(400).json({ ok: false, error: "Phone and OTP are required" });
    }

    const otpDoc = await Otp.findOne({ phone }).sort({ createdAt: -1 });

    if (!otpDoc) return res.status(400).json({ ok: false, error: "OTP not requested" });

    if (otpDoc.expiresAt < new Date()) {
      await Otp.deleteMany({ phone });
      return res.status(400).json({ ok: false, error: "OTP expired" });
    }

    if (otpDoc.attempts >= 5) {
      return res.status(429).json({ ok: false, error: "Too many attempts" });
    }

    const valid = await bcrypt.compare(otp, otpDoc.otpHash);
    if (!valid) {
      otpDoc.attempts = (otpDoc.attempts || 0) + 1;
      await otpDoc.save();
      return res.status(400).json({ ok: false, error: "Incorrect OTP" });
    }

    // valid OTP -> create or return user
    let user = await User.findOne({ phone });
    let isNewUser = false;
    
    if (!user) {
      // Create new user with 0 coins (must subscribe first)
      user = await User.create({ 
        phone,
        coins: 0, // No free coins - must subscribe
        requiresFirstSubscription: true // Flag for first-time subscription requirement
      });
      isNewUser = true;
      console.log(`🎉 New user registered! Phone: ${phone}, Coins: 0 (requires subscription)`);
    }

    // create access token (shorter lifetime)
    const accessToken = jwt.sign(
      { userId: user._id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // access = 1 hour
    );

    // create & store refresh token (cookie + hashed in DB)
    await createAndStoreRefreshToken(user, res);

    // cleanup OTPs for this phone
    await Otp.deleteMany({ phone });

    return res.json({
      ok: true,
      token: accessToken,
      user,
      isNewUser, // Flag to show welcome message on frontend
      isProfileComplete: isProfileComplete(user),
    });
  } catch (err) {
    console.error("Error in verify-otp:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

// GET /me  => returns current user; expects Authorization: Bearer <token>
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ ok: false, error: "No token" });

    const parts = String(authHeader).split(" ");
    if (parts.length !== 2) return res.status(401).json({ ok: false, error: "Invalid token format" });

    const token = parts[1];

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.userId).select("-refreshTokens");
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

// REFRESH: exchange httpOnly refresh cookie for new access token (rotates refresh)
router.post("/refresh", async (req, res) => {
  try {
    const plain = req.cookies?.refreshToken;
    if (!plain) return res.status(401).json({ ok: false, error: "No refresh token" });

    // find user with matching hashed token (and not expired)
    const users = await User.find({ "refreshTokens.expiresAt": { $gt: new Date() } });
    for (const user of users) {
      for (const rt of user.refreshTokens) {
        const ok = await bcrypt.compare(plain, rt.tokenHash);
        if (ok) {
          // rotate: remove old token entry
          user.refreshTokens = user.refreshTokens.filter(
            (x) => x._id.toString() !== rt._id.toString()
          );
          await user.save();

          // create new access token
          const accessToken = jwt.sign(
            { userId: user._id, phone: user.phone },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
          );

          // create & store a new refresh token (sets cookie)
          await createAndStoreRefreshToken(user, res);

          return res.json({
            ok: true,
            token: accessToken,
            user,
            isProfileComplete: isProfileComplete(user),
          });
        }
      }
    }

    // no match
    clearRefreshCookie(res);
    return res.status(401).json({ ok: false, error: "Invalid refresh token" });
  } catch (err) {
    console.error("Error in /refresh:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

// LOGOUT: remove matching refresh token and clear cookie
router.post("/logout", async (req, res) => {
  try {
    const plain = req.cookies?.refreshToken;
    if (plain) {
      // find user with matching token
      const users = await User.find({ "refreshTokens.expiresAt": { $gt: new Date() } });
      for (const user of users) {
        for (let i = 0; i < user.refreshTokens.length; i++) {
          const rt = user.refreshTokens[i];
          const ok = await bcrypt.compare(plain, rt.tokenHash);
          if (ok) {
            user.refreshTokens.splice(i, 1); // remove it
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
