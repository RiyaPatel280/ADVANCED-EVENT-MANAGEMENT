import express from "express";
import multer from "multer";
import { 
  createCategory, 
  getAllCategories, 
  getCategories, 
  updateCategory, 
  deleteCategory,
  getOrganizers,
} from "../controllers/EventCategoryController.js";
import EventCategory from "../models/EventCategory.js";

import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Make sure 'uploads/' exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ✅ Get all categories (public)
router.get("/allcategories", getCategories);

// ✅ Get categories for the logged-in organizer
router.get("/categories", authenticateUser, getAllCategories);

// ✅ Create category (only authenticated organizers, with image upload)
router.post("/categories", authenticateUser, upload.single("image"), createCategory);

// ✅ Update category (only organizers can update, with image upload)
router.put("/categories/:id", authenticateUser, upload.single("image"), updateCategory);

// ✅ Delete category (only organizers can delete)
router.delete("/categories/:id", authenticateUser, deleteCategory);

// routes.js
router.get('/upcoming-events', authenticateUser, async (req, res) => {
  try {
    const today = new Date('2025-03-18'); // Current date from your context
    today.setHours(23, 59, 59, 999); // Set to end of day to exclude March 18 events
    const upcomingEvents = await EventCategory.find({
      startDate: { $gt: today }, // Events starting strictly after today
    })
      .sort({ startDate: 1 }) // Sort by start date ascending
      .limit(4) // Limit to 4 events for the dashboard
      .select('title startDate venue organizer'); // Select relevant fields

    res.status(200).json({ success: true, events: upcomingEvents });
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({ success: false, message: 'Error fetching upcoming events' });
  }
});


router.get("/organizers",authenticateUser , getOrganizers);


export default router;
