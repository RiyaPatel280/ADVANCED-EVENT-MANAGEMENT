import express from 'express';
import { getEventDetails, submitEventDetails } from '../controllers/eventController.js'; // Import controller functions

const router = express.Router();

router.get("/event/details", getEventDetails);  // Fetch event details
router.post("/event/submit", submitEventDetails);  // Submit new event details

export default router;
