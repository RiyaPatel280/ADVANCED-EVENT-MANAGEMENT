import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  eventId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "EventCategory",
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  addBy: {
    type: String,
    required: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;