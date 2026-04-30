import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  filename: String,
  path: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to user
  uploadedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Image', imageSchema);