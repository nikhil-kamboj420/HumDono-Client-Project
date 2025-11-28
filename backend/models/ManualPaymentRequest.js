import mongoose from "mongoose";

const ManualPaymentRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    transactionId: { type: String, required: true },
    status: { type: String, enum: ["pending", "checked"], default: "pending" },
  },
  { timestamps: true }
);

// Prevent duplicate submissions of same UTR for the same user
ManualPaymentRequestSchema.index(
  { user: 1, transactionId: 1 },
  { unique: true }
);

export default mongoose.models.ManualPaymentRequest ||
  mongoose.model("ManualPaymentRequest", ManualPaymentRequestSchema);
