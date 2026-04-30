import mongoose from "mongoose";

const birthdayEventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  eventDate: { type: Date, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  location: { type: String, required: true },
  numberOfMembers: { type: Number, required: true },
  selectedServices: { type: [String], default: "None" },
  totalAmount: { type: Number, required: true },
  organizer: { type: String, required: true }, // Ensure organizer is always provided
  organizerEmail: { type: String, required: true }, // Keep required
  venue: { type: String, default: "None" },
}, { timestamps: true });

const BirthdayEvent = mongoose.model("BirthdayEvent", birthdayEventSchema);

export default BirthdayEvent;