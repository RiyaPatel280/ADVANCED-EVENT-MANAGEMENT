import mongoose from "mongoose";

const birthdayPaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  eventDate: { type: Date, required: true }, // Unique identifier for birthday events
  razorpayPaymentId: { type: String, required: true },
  amount: { type: Number, required: true }, // In paise
  currency: { type: String, default: "INR" },
  status: { type: String, enum: ["pending", "completed", "failed"], default: "completed" },
  venue: { type: String }, // Optional venue field
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("BirthdayPayment", birthdayPaymentSchema);