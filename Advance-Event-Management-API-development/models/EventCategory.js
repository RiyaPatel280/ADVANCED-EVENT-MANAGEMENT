import mongoose from "mongoose";

const eventCategorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date, required: true },
  venue: { type: String, required: true },
  city: { type: String, required: true }, // New field for city
  details: { type: String },
  price: { type: Number, required: true },
  image: { type: String },
  organizer: { type: String, required: true },
  email: { type: String, required: true },
  registrationLimit: { type: Number },
  customFields: {
    type: [{ label: String, value: String }],
    default: []
  },
  registrations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Registration" }],
}, { timestamps: true });

const EventCategory = mongoose.model("EventCategory", eventCategorySchema);
export default EventCategory;