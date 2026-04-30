
import express from "express";
import { registerForEvent, getAllRegistrations, getUserRegistrations, getEventDetails } from "../controllers/registrationController.js";
import Registration from "../models/registrationModel.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerForEvent);
router.get("/registrations",authenticateUser, getAllRegistrations);
router.get("/user-registrations", getUserRegistrations);
router.get("/event-details/:eventId", getEventDetails);
router.get('/alluser-registrations', async (req, res) => {
    try {
      const { email } = req.query;
  
      if (!email) {
        return res.status(400).json({ success: false, message: "User email is required." });
      }
  
      const registeredEvents = await Registration.find({ email }).select('eventId');
      
      res.json({ success: true, registeredEvents });
    } catch (error) {
      console.error("Error fetching registered events:", error);
      res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
  });

  router.delete("/cancel-registration", async (req, res) => {
    try {
        const { email, eventId } = req.body;

        if (!email || !eventId) {
            return res.status(400).json({ success: false, message: "Email and Event ID are required." });
        }

        const deletedRegistration = await Registration.findOneAndDelete({ email, eventId });

        if (!deletedRegistration) {
            return res.status(404).json({ success: false, message: "Registration not found." });
        }

        res.json({ success: true, message: "Registration canceled successfully." });
    } catch (error) {
        console.error("Error canceling registration:", error);
        res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
});

router.get('/organizer-registrations', async (req, res) => {
  try {
      const { name } = req.query;
      if (!name) {
          return res.status(400).json({ success: false, message: "Organizer name is required." });
      }
      const registrations = await Registration.find({ organizer: name })
          .populate("eventId", "title");
      console.log("Registrations found:", registrations);
      res.json({ success: true, registrations });
  } catch (error) {
      console.error("Error fetching organizer registrations:", error);
      res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
});

export default router;
