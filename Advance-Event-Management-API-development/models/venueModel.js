import mongoose from "mongoose";

const venueSchema = new mongoose.Schema({
  name: { type: String, required: true},
  price: { type: Number, required: true },
  services: { type: [String], required: true }, // Array of services provided at the venue
}, { timestamps: true });

const Venue = mongoose.model("Venue", venueSchema);

export default Venue;
