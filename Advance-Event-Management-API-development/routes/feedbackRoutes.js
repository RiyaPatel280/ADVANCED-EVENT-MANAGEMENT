import express from "express";
import { 
  submitFeedback,
  getAllFeedback,
  deleteFeedback  // Added deleteFeedback
} from "../controllers/feedbackController.js";
import { verifyToken } from "../controllers/venueController.js";

const router = express.Router();

// Submit feedback
router.post("/submit-feedback", verifyToken, submitFeedback);
// Get all feedback
router.get("/all", verifyToken, getAllFeedback);
// Delete feedback
router.delete("/feedback/:feedbackId", verifyToken, deleteFeedback);

export default router;