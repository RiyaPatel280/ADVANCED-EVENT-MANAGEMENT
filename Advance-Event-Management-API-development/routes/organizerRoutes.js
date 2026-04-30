import express from "express";
import Registration from "../models/registrationModel.js";
import EventCategory from "../models/EventCategory.js";
import Payment from "../models/paymentModel.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/organizer-stats", authenticateUser, async (req, res) => {
  try {
    const organizerEmail = req.user.email; // e.g., "megh@gmail.com"
    if (!organizerEmail) {
      return res.status(401).json({ success: false, message: "Unauthorized: No user email found" });
    }

    // Count total events created by this organizer based on email
    const totalEvents = await EventCategory.countDocuments({ email: organizerEmail });

    // Count registrations for events by this organizer based on eventId.email
    const registeredEvents = await Registration.aggregate([
      {
        $lookup: {
          from: "eventcategories", // MongoDB collection name
          localField: "eventId",
          foreignField: "_id",
          as: "eventDetails",
        },
      },
      { $unwind: "$eventDetails" },
      {
        $match: {
          "eventDetails.email": organizerEmail, // Match email from EventCategory
        },
      },
      { $count: "total" },
    ]);
    const registeredEventsCount = registeredEvents.length > 0 ? registeredEvents[0].total : 0;

    // Count booked events (payments) where eventId's email matches the logged-in organizer
    const bookedEvents = await Payment.aggregate([
      {
        $lookup: {
          from: "eventcategories", // MongoDB collection name
          localField: "eventId",
          foreignField: "_id",
          as: "eventDetails",
        },
      },
      { $unwind: "$eventDetails" },
      {
        $match: {
          "eventDetails.email": organizerEmail, // Match email from EventCategory
        },
      },
      { $count: "total" },
    ]);
    const bookedEventsCount = bookedEvents.length > 0 ? bookedEvents[0].total : 0;

    const stats = {
      totalEvents,
      registeredEvents: registeredEventsCount,
      bookedEvents: bookedEventsCount,
    };

    console.log("Organizer Stats for", organizerEmail, ":", stats);

    res.json({ success: true, stats });
  } catch (err) {
    console.error("Organizer Stats Error:", err.message);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

export default router;