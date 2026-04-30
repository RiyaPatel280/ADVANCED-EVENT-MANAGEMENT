import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "EventCategory", required: true }, // Assuming you have an Event model
  razorpayPaymentId: { type: String, required: true },
  amount: { type: Number, required: true }, // In paise
  currency: { type: String, default: "INR" },
  status: { type: String, enum: ["pending", "completed", "failed"], default: "completed" },
  organizer: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Payment", paymentSchema);