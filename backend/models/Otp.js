// models/Otp.js
import mongoose from "mongoose";

/**
 * OTP schema used for email verification.
 * We store:
 *  - email (string)
 *  - otpHash (bcrypt hash of OTP)
 *  - createdAt
 *  - expiresAt (TTL index)
 *  - attempts (track incorrect attempts)
 */

const OtpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true, lowercase: true, trim: true },
  otpHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  attempts: { type: Number, default: 0 },
});

// TTL index → Auto deletes expired OTP docs
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Otp || mongoose.model("Otp", OtpSchema);
