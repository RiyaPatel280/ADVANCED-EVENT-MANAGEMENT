import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "EventCategory" },
  organizer: { type: String, required: true },
  eventName: { type: String, required: true }, // Added eventName if not already present
  venue: { type: String }, // Optional
  city: { type: String, required: true }, // New field for city
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Registration", registrationSchema);