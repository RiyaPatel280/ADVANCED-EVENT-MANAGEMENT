import Registration from "../models/registrationModel.js";
import paymentModel from "../models/paymentModel.js";
import EventCategory from "../models/EventCategory.js";// Assuming you have this model
import { createNotification } from "./notificationController.js";

// Register user for an event
import mongoose from "mongoose";


// export const registerForEvent = async (req, res) => {
//   const { name, email, phone, organizer, eventName, venue, eventId } = req.body;

//   // Validate required fields
//   if (!name || !email || !phone || !organizer || !eventName || !eventId) {
//     return res.status(400).json({ success: false, message: "All required fields must be provided." });
//   }

//   try {
//     // Find the event by eventId to ensure it exists
//     const eventCategory = await EventCategory.findOne({
//       _id: eventId,
//       organizer: organizer.trim(),
//       title: eventName.trim(),
//       // Removed venue from the strict match to allow flexibility
//     });

//     if (!eventCategory) {
//       console.log("No event found for:", { eventId, organizer, eventName });
//       return res.status(400).json({
//         success: false,
//         message: "Invalid event selection. No matching event found.",
//       });
//     }

//     // Check for existing registration with the same email and eventId (ignore venue)
//     const existingRegistration = await Registration.findOne({
//       email,
//       eventId,
//     });

//     if (existingRegistration) {
//       return res.status(400).json({
//         success: false,
//         message: "You have already registered for this event.",
//       });
//     }

//     // Create new registration
//     const newRegistration = new Registration({
//       name,
//       email,
//       phone,
//       eventId,
//       organizer: organizer.trim(),
//       eventName: eventName.trim(),
//       venue: venue ? venue.trim() : undefined, // Venue is optional
//     });

//     await newRegistration.save();
//     res.status(201).json({ success: true, message: "Registration successful!" });
//   } catch (error) {
//     console.error("Registration Error:", error.message);
//     res.status(500).json({ success: false, message: "Server error. Please try again." });
//   }
// };

// export const registerForEvent = async (req, res) => {
//   const { name, email, phone, organizer, eventName, venue, city, eventId } = req.body;

//   // Validate required fields
//   if (!name || !email || !phone || !organizer || !eventName || !eventId || !city) {
//     return res.status(400).json({ success: false, message: "All required fields (including city) must be provided." });
//   }

//   try {
//     // Find the event by eventId to ensure it exists
//     const eventCategory = await EventCategory.findOne({
//       _id: eventId,
//       organizer: organizer.trim(),
//       title: eventName.trim(),
//     });

//     if (!eventCategory) {
//       console.log("No event found for:", { eventId, organizer, eventName });
//       return res.status(400).json({
//         success: false,
//         message: "Invalid event selection. No matching event found.",
//       });
//     }

//     // Check for existing registration with the same email, eventId, AND city
//     const existingRegistration = await Registration.findOne({
//       email,
//       eventId,
//       city: city.trim(), // Add city to the duplicate check
//     });

//     if (existingRegistration) {
//       return res.status(400).json({
//         success: false,
//         message: "You have already registered for this event in this city.",
//       });
//     }

//     // Create new registration with city
//     const newRegistration = new Registration({
//       name,
//       email,
//       phone,
//       eventId,
//       organizer: organizer.trim(),
//       eventName: eventName.trim(),
//       venue: venue ? venue.trim() : undefined, // Venue is optional
//       city: city.trim(), // Store the city
//     });

//     await newRegistration.save();
//     res.status(201).json({ success: true, message: "Registration successful!" });
//   } catch (error) {
//     console.error("Registration Error:", error.message);
//     res.status(500).json({ success: false, message: "Server error. Please try again." });
//   }
// };


export const registerForEvent = async (req, res) => {
  const { name, email, phone, organizer, eventName, venue, city, eventId } = req.body;

  // Validate required fields
  if (!name || !email || !phone || !organizer || !eventName || !eventId || !city) {
    return res.status(400).json({ success: false, message: "All required fields (including city) must be provided." });
  }

  try {
    // Find the event by eventId to ensure it exists
    const eventCategory = await EventCategory.findOne({
      _id: eventId,
      organizer: organizer.trim(),
      title: eventName.trim(),
    });

    if (!eventCategory) {
      console.log("No event found for:", { eventId, organizer, eventName });
      return res.status(400).json({
        success: false,
        message: "Invalid event selection. No matching event found.",
      });
    }

    // Check for existing registration
    const existingRegistration = await Registration.findOne({
      email,
      eventId,
      city: city.trim(),
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: "You have already registered for this event in this city.",
      });
    }

    // Create new registration
    const newRegistration = new Registration({
      name,
      email,
      phone,
      eventId,
      organizer: organizer.trim(),
      eventName: eventName.trim(),
      venue: venue ? venue.trim() : undefined,
      city: city.trim(),
    });

    await newRegistration.save();

    // Create notification
    const notificationMessage = `Secure your spot today for ${eventName}! Click 'Book Now'`;
    await createNotification(email, notificationMessage, eventId);

    res.status(201).json({ success: true, message: "Registration successful!" });
  } catch (error) {
    console.error("Registration Error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

export const getAllRegistrations = async (req, res) => {
  try {
    const organizerEmail = req.user.email; // Authenticated user's email

    // Find registrations and populate eventId, filtering by email in EventCategory
    const registrations = await Registration.find()
      .populate({
        path: "eventId", // Matches the field in your Registration schema
        match: { email: organizerEmail }, // Filter EventCategory by email
        select: "title venue email", // Adjust based on EventCategory fields
      })
      .select("name email phone eventId organizer eventName venue city")
      .lean();

    // Filter out registrations where eventId is null (no match in populate)
    const filteredRegistrations = registrations.filter(reg => reg.eventId !== null);

    console.log("Fetched Registrations for", organizerEmail, ":", filteredRegistrations);

    if (filteredRegistrations.length === 0) {
      return res.status(200).json({
        success: true,
        registrations: [],
        message: `No registrations found for organizer email: ${organizerEmail}`
      });
    }

    res.status(200).json({ success: true, registrations: filteredRegistrations });
  } catch (error) {
    console.error("Get Registrations Error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};




export const getEventDetails = async (req, res) => {
  const { eventId } = req.params; // Extract eventId from request parameters

  try {
    // Check if eventId is provided
    if (!eventId) {
      return res.status(400).json({ message: "Event ID is required" });
    }

    // Fetch event details using eventId
    const event = await EventCategory.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(event);
  } catch (error) {
    console.error("Error fetching event details:", error.message);
    res.status(500).json({ message: "Error fetching event details", error: error.message });
  }
};


// Import paymentModel

export const getUserRegistrations = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ success: false, message: "User email is required" });
    }

    // Fetch registrations and populate event details
    const registrations = await Registration.find({ email: email })
      .populate("eventId")
      .lean(); // Using lean() for better performance since we don't need Mongoose documents

    console.log("Registrations fetched:", registrations);

    // Fetch payments for all eventIds in registrations
    const eventIds = registrations.map(reg => reg.eventId?._id).filter(id => id);
    const payments = await paymentModel.find({
      eventId: { $in: eventIds },
      status: "completed"
    }).lean();

    // Create a Set of eventIds with completed payments for efficient lookup
    const completedPaymentEventIds = new Set(payments.map(payment => payment.eventId.toString()));

    // Filter out registrations where payment is completed
    const registeredEvents = registrations
      .filter(reg => {
        const eventIdStr = reg.eventId?._id?.toString();
        return eventIdStr && !completedPaymentEventIds.has(eventIdStr);
      })
      .map((reg) => {
        if (!reg.eventId || !reg.eventId._id) {
          console.warn("Registration with missing or invalid eventId:", reg);
        }
        return reg;
      });

    console.log("Returning registered events:", registeredEvents);
    res.json({ success: true, registeredEvents });
  } catch (error) {
    console.error("Error fetching registrations:", error.stack);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};



