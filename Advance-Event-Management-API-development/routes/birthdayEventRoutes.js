import express from "express";
import { getBirthdayEvents, addBirthdayEvent, getUserBirthdayEvent, updateBirthdayEventbyOA, addBirthdayEventbyOA, updateBirthdayEvent, deleteBirthdayEvent, deleteBirthdayEventOA  } from "../controllers/birthdayEventController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import BirthdayEvent from "../models/birthdayEventModel.js";

import User from "../models/userModel.js"; // Adjust path to your User model

const router = express.Router();

router.get("/birthday-events", getBirthdayEvents);  // Fetch all birthday events
router.post("/birthday-events",authenticateUser, addBirthdayEvent);  // Add a new birthday event
router.post("/birthday-eventsbyOA",authenticateUser, addBirthdayEventbyOA);  // Add a new birthday event
// GET: Fetch birthday events based on user role and organizer name

router.get("/birthday-eventsbyOA", authenticateUser, async (req, res) => {
  try {
    let { organizer } = req.query; // Optional organizer name filter from query params (e.g., "Riya")
    const user = req.user; // Authenticated user info
    let query = {};

    console.log("Query organizer (name):", organizer);

    if (user.role === "admin") {
      // Admin can see all events, or filter by organizer name (mapped to email)
      if (organizer) {
        const organizerUser = await User.findOne({ name: organizer }).select("email");
        if (organizerUser) {
          query = { organizerEmail: organizerUser.email }; // e.g., { organizerEmail: "riya@example.com" }
          console.log("Mapped organizer name to email:", organizerUser.email);
        } else {
          console.log("No user found for organizer name:", organizer);
          return res.status(200).json({ success: true, events: [] }); // Return empty array if organizer not found
        }
      }
    } else if (user.role === "organizer") {
      // Organizers only see events where their email matches the organizerEmail field
      query = { organizerEmail: user.email }; // Use authenticated user's email directly
      console.log("Filtering by organizer's email:", user.email);
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized role" });
    }

    const events = await BirthdayEvent.find(query);
    console.log("Fetched events:", events);
    res.status(200).json({ success: true, events });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ success: false, message: "Error fetching events" });
  }
});
  router.put("/birthday-events/:id", updateBirthdayEvent);  // Update a birthday event
  router.put("/birthday-eventsbyOA/:id", updateBirthdayEventbyOA);  // Update a birthday event
router.delete("/birthday-events/:id", deleteBirthdayEvent);  // Delete a birthday event
router.delete("/birthday-eventsbyOA/:id", deleteBirthdayEventOA );  // Delete a birthday event
router.get("/user-birthday-event", getUserBirthdayEvent);

export default router;
