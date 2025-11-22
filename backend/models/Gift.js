// models/Gift.js
import mongoose from "mongoose";

/**
 * Gift schema - defines available gifts in the app
 */
const GiftSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true }, // URL to gift image
  coinValue: { type: Number, required: true }, // cost in coins
  category: { type: String, default: "general" }, // flowers, jewelry, etc.
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Gift || mongoose.model("Gift", GiftSchema);