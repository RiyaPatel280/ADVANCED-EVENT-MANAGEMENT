import Feedback from "../models/feedbackModel.js";
import userModel from "../models/userModel.js";
import EventCategory from "../models/EventCategory.js";

// Submit feedback
export const submitFeedback = async (req, res) => {
  try {
    const { eventId, rating } = req.body;
    const userId = req.user.id;

    if (!eventId || !rating) {
      return res.status(400).json({ success: false, message: "Event ID and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const existingFeedback = await Feedback.findOne({ eventId, userId });
    if (existingFeedback) {
      return res.status(400).json({ success: false, message: "You have already submitted feedback for this event" });
    }

    // Fetch the event to get the email
    const event = await EventCategory.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const addBy = event.email; // Use the email from the event

    const newFeedback = new Feedback({ 
      eventId, 
      userId, 
      rating,
      addBy
    });
    await newFeedback.save();

    res.status(201).json({ success: true, message: "Feedback submitted successfully", feedback: newFeedback });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ success: false, message: "An error occurred while submitting feedback" });
  }
};

// Rest of the code remains the same
// Get all feedback with populated event and user data
export const getAllFeedback = async (req, res) => {
  try {
    // Get the logged-in user's email and role from req.user
    const userEmail = req.user.email;
    const userRole = req.user.role; // Assuming role is available in req.user

    let feedback;

    // Check if user is admin
    if (userRole === 'admin') {
      // If admin, get all feedback
      feedback = await Feedback.find()
        .populate('eventId', 'title')  // Populate event title
        .populate('userId', 'name');   // Populate user name
    } else {
      // If not admin, get only feedback matching user's email
      feedback = await Feedback.find({ addBy: userEmail })
        .populate('eventId', 'title')  // Populate event title
        .populate('userId', 'name');   // Populate user name
    }

    res.status(200).json({ success: true, feedback });
  } catch (error) {
    console.error("Error fetching all feedback:", error);
    res.status(500).json({ success: false, message: "An error occurred while fetching feedback" });
  }
};

// Delete feedback
export const deleteFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }

    await Feedback.findByIdAndDelete(feedbackId);
    res.status(200).json({ success: true, message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({ success: false, message: "An error occurred while deleting feedback" });
  }
};