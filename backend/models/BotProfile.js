// backend/models/BotProfile.js
import mongoose from "mongoose";
import { customAlphabet } from "nanoid";

const nano = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 8);

const BotProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
  referralCode: { type: String, required: true, unique: true, index: true },
  influencer: { type: Boolean, default: false },
  headline: { type: String, default: "" },
  ctaUrl: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

BotProfileSchema.statics.createOrUpdateFor = async function (userId, data = {}) {
  let doc = await this.findOne({ user: userId });
  if (!doc) {
    const code = data.referralCode || nano();
    doc = await this.create({ user: userId, referralCode: code, ...data });
  } else {
    Object.assign(doc, data);
    await doc.save();
  }
  return doc;
};

export default mongoose.models.BotProfile || mongoose.model("BotProfile", BotProfileSchema);
