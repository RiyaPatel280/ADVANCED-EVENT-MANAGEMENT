import mongoose from 'mongoose';

const aboutSchema = new mongoose.Schema({
  title: { type: String, required: true },
  intro: { type: String, required: true },
  whyChooseUs: [{ type: String }],
  mission: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('About', aboutSchema);