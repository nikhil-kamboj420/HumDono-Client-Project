// models/User.js
import mongoose from "mongoose";

/**
 * Refresh Token sub-schema
 * Stores hashed refresh tokens for rotation-based authentication.
 */
const RefreshTokenSchema = new mongoose.Schema({
  tokenHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  device: { type: String, default: "web" },
});

/**
 * Photo sub-schema
 * Helps keep profile photos structured & allows a "profile photo" flag.
 */
const PhotoSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String, required: true },
  isProfile: { type: Boolean, default: false },
});

/**
 * Visibility settings sub-schema
 */
const VisibilitySchema = new mongoose.Schema({
  showAge: { type: Boolean, default: true },
  showSocialLinks: { type: Boolean, default: false }, // DO NOT reveal social links unless match or user opted public
  showDistance: { type: Boolean, default: true },
});

/**
 * Social links sub-schema
 */
const SocialLinksSchema = new mongoose.Schema({
  instagram: { type: String, default: "" },
  facebook: { type: String, default: "" },
  linkedin: { type: String, default: "" },
  youtube: { type: String, default: "" },
  tiktok: { type: String, default: "" },
});

/**
 * User schema
 */
const UserSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true, index: true },

  // profile fields
  name: { type: String, default: "" },
  age: { type: Number, default: null },
  dob: { type: Date },
  bio: { type: String, default: "" },
  interests: { type: [String], default: [] },

  // geo / preference fields (optional but future-ready)
  location: {
    city: { type: String, default: "" },
    lat: { type: Number },
    lng: { type: Number },
  },

  lookingFor: {
    gender: { type: String, default: "any" },
    minAge: { type: Number, default: 18 },
    maxAge: { type: Number, default: 60 },
  },

  // relationship & extras
  relationshipStatus: { type: String, default: "single" },
  gender: { type: String, default: "" },
  pronouns: { type: String, default: "" },
  languages: { type: [String], default: [] },
  education: { type: String, default: "" },
  occupation: { type: String, default: "" },

  // profile photos
  photos: { type: [PhotoSchema], default: [] },

  // visibility & social
  visibilitySettings: { type: VisibilitySchema, default: () => ({}) },
  socialLinks: { type: SocialLinksSchema, default: () => ({}) },

  // auth
  refreshTokens: { type: [RefreshTokenSchema], default: [] },
  role: { type: String, enum: ["user", "admin"], default: "user" },

  coins: { type: Number, default: 0 },
  
  // First subscription tracking
  requiresFirstSubscription: { type: Boolean, default: false },
  hasCompletedFirstSubscription: { type: Boolean, default: false },
  firstSubscriptionDate: { type: Date, default: null },
  
  // Referral system
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  
  // Premium features
  subscription: {
    active: { type: Boolean, default: false },
    plan: { type: String, enum: ["free", "basic", "premium", "gold"], default: "free" },
    expiresAt: { type: Date },
    razorpaySubscriptionId: { type: String, default: null },
    features: {
      unlimitedLikes: { type: Boolean, default: false },
      unlimitedMessages: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
      profileBoost: { type: Boolean, default: false },
      seeWhoLikedYou: { type: Boolean, default: false },
      rewindFeature: { type: Boolean, default: false }
    },
  },
  
  // Profile boost tracking
  boosts: {
    visibility: { type: Date }, // when visibility boost expires
    superLikes: { type: Number, default: 0 }, // remaining super likes
  },
  
  verification: {
    phoneVerified: { type: Boolean, default: true },
    photoVerified: { type: Boolean, default: false },
    idVerified: { type: Boolean, default: false },
  },

  lastActiveAt: { type: Date, default: Date.now },

  createdAt: { type: Date, default: Date.now },
});

/**
 * Instance helper to get masked phone
 * keeps masking server-side (never trust client)
 */
UserSchema.methods.getMaskedPhone = function () {
  if (!this.phone) return null;
  // keep country code + first 3-4 digits visible, mask the rest
  // examples:
  // +919876543210 -> +91987XXXXXX
  // 9717123456 -> 9717XXXXXX
  const p = String(this.phone);
  // show up to first 4 digits excluding plus
  const keep = p.startsWith("+") ? 4 + (p[0] === "+" ? 1 : 0) : 4;
  // simpler: show first 4 chars, mask rest with X up to 6 chars
  const visible = p.slice(0, 4);
  return visible + "XXXXXX";
};

export default mongoose.models.User || mongoose.model("User", UserSchema);
