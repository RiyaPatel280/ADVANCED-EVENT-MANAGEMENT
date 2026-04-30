// models/Team.js
import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  imageUrl: { type: String, trim: true }, // Optional image URL
}, { timestamps: true });

const Team = mongoose.model("Team", teamSchema);

export default Team;