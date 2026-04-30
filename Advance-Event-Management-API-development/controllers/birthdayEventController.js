import BirthdayEvent from "../models/birthdayEventModel.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js"; // Replace with actual path to User model

// Fetch all birthday events
export const getBirthdayEvents = async (req, res) => {
  try {
    const events = await BirthdayEvent.find();
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching birthday events:", error);
    res.status(500).json({ success: false, message: "An error occurred. Please try again." });
  }
};
export const getUserBirthdayEvent = async (req, res) => {
  try {
    const { eventDate } = req.query;

    if (!eventDate) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID is required" 
      });
    }

    // Find all events for this userId (or use findOne for the latest)
    const events = await BirthdayEvent.find({ eventDate: eventDate });
    // Alternatively, for the most recent event:
    // const event = await BirthdayEvent.findOne({ userId: userId }).sort({ createdAt: -1 });

    if (!events || events.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No birthday events found for this user" 
      });
    }

    res.status(200).json({ 
      success: true,
      event: events[0] // Return the first event (or modify to return all events)
    });
  } catch (error) {
    console.error("Error fetching birthday event:", error);
    res.status(500).json({ 
      success: false, 
      message: "An error occurred. Please try again." 
    });
  }
};


export const addBirthdayEvent = async (req, res) => {
  try {
    console.log("Received request:", req.body);
    console.log("Authenticated user:", req.user);

    const { 
      name, 
      email, 
      eventDate, 
      totalAmount, 
      location, 
      numberOfMembers, 
      selectedServices,
      organizer,
      venue 
    } = req.body;

    // Log the organizer to verify input
    console.log("Organizer from request:", organizer);

    // Validate all required fields
    if (!name || !email || !eventDate || !totalAmount || !location || !numberOfMembers || !selectedServices || !venue || !organizer) {
      console.log("Missing fields:", { name, email, eventDate, totalAmount, location, numberOfMembers, selectedServices, venue, organizer });
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated." });
    }

    // Check for existing event on the same date
    const existingEvent = await BirthdayEvent.findOne({ eventDate });
    if (existingEvent) {
      return res.status(409).json({ 
        success: false, 
        message: "Sorry, this date is not available. Please choose another date." 
      });
    }

    // Fetch the organizer's email from the User collection
    const organizerData = await User.findOne({ name: organizer });
    console.log("Fetched organizer data:", organizerData); // Log the result

    if (!organizerData) {
      return res.status(400).json({ 
        success: false, 
        message: `Organizer '${organizer}' not found in the system.` 
      });
    }

    if (!organizerData.email) {
      return res.status(400).json({ 
        success: false, 
        message: `Email not found for organizer '${organizer}'. Please update the organizer's profile.` 
      });
    }

    // Create new event with organizerEmail auto-stored
    const newEvent = new BirthdayEvent({
      name,
      email,
      eventDate,
      userId,
      location,
      numberOfMembers,
      selectedServices,
      totalAmount,
      organizer,
      organizerEmail: organizerData.email, // Auto-populated from User model
      venue,
    });

    await newEvent.save();
    console.log("Event saved successfully:", newEvent);

    return res.status(201).json({ 
      success: true, 
      message: "🎉 Booking Confirmed! Your event has been successfully saved.", 
      event: newEvent 
    });
  } catch (error) {
    console.error("Error adding birthday event:", error.message, error.stack);
    return res.status(500).json({ 
      success: false, 
      message: error.message || "An error occurred. Please try again." 
    });
  }
};

export const addBirthdayEventbyOA = async (req, res) => {
  try {
    console.log("Received request:", req.body);
    console.log("Authenticated user:", req.user);

    const { 
      name, 
      email, 
      eventDate, 
      totalAmount, 
      location, 
      numberOfMembers, 
      selectedServices = [], // Default to empty array if not provided
      organizer,
      venue = "" // Default to empty string if not provided
    } = req.body;

    // Log the organizer to verify input
    console.log("Organizer from request:", organizer);

    // Validate all required fields
    if (!name || !email || !eventDate || !totalAmount || !location || !numberOfMembers || !organizer) {
      console.log("Missing required fields:", { name, email, eventDate, totalAmount, location, numberOfMembers, organizer });
      return res.status(400).json({ success: false, message: "Required fields (name, email, eventDate, totalAmount, location, numberOfMembers, organizer) are missing." });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated." });
    }

    // Check for existing event on the same date
    const existingEvent = await BirthdayEvent.findOne({ eventDate });
    if (existingEvent) {
      return res.status(409).json({ 
        success: false, 
        message: "Sorry, this date is not available. Please choose another date." 
      });
    }

    // Fetch the organizer's email from the User collection
    const organizerData = await User.findOne({ name: organizer });
    console.log("Fetched organizer data:", organizerData); // Log the result

    if (!organizerData) {
      return res.status(400).json({ 
        success: false, 
        message: `Organizer '${organizer}' not found in the system.` 
      });
    }

    if (!organizerData.email) {
      return res.status(400).json({ 
        success: false, 
        message: `Email not found for organizer '${organizer}'. Please update the organizer's profile.` 
      });
    }

    // Create new event with organizerEmail auto-stored
    const newEvent = new BirthdayEvent({
      name,
      email,
      eventDate,
      userId,
      location,
      numberOfMembers,
      selectedServices, // Will be empty array if not provided
      totalAmount,
      organizer, // Store the name
      organizerEmail: organizerData.email, // Auto-populated from User model
      venue, // Will be empty string if not provided
    });

    await newEvent.save();
    console.log("Event saved successfully:", newEvent);

    return res.status(201).json({ 
      success: true, 
      message: "🎉 Booking Confirmed! Your event has been successfully saved.", 
      event: newEvent 
    });
  } catch (error) {
    console.error("Error adding birthday event:", error.message, error.stack);
    return res.status(500).json({ 
      success: false, 
      message: error.message || "An error occurred. Please try again." 
    });
  }
};
// Update birthday event details
export const updateBirthdayEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, eventDate, location, numberOfMembers, selectedServices, organizer } = req.body;

    const updatedEvent = await BirthdayEvent.findByIdAndUpdate(id, { name, email, eventDate, location, numberOfMembers, selectedServices, organizer }, { new: true });

    if (!updatedEvent) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    res.status(200).json({ success: true, message: "Birthday event updated successfully!", event: updatedEvent });
  } catch (error) {
    console.error("Error updating birthday event:", error);
    res.status(500).json({ success: false, message: "An error occurred. Please try again." });
  }
};


export const updateBirthdayEventbyOA = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      email, 
      eventDate, 
      location, 
      numberOfMembers, 
      selectedServices, 
      organizer, 
      venue, // Added venue
      totalAmount // Added totalAmount
    } = req.body;

    // Validate required fields
    if (!name || !email || !eventDate || !location || !numberOfMembers || !organizer) {
      return res.status(400).json({ success: false, message: "Required fields are missing." });
    }

    const updatedEvent = await BirthdayEvent.findByIdAndUpdate(
      id, 
      { 
        name, 
        email, 
        eventDate, 
        location, 
        numberOfMembers, 
        selectedServices, 
        organizer, 
        venue, // Include venue in update
        totalAmount // Include totalAmount in update
      }, 
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    res.status(200).json({ 
      success: true, 
      message: "Birthday event updated successfully!", 
      event: updatedEvent 
    });
  } catch (error) {
    console.error("Error updating birthday event:", error);
    res.status(500).json({ success: false, message: "An error occurred. Please try again." });
  }
};

// Delete a birthday event
export const deleteBirthdayEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedEvent = await BirthdayEvent.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    res.status(200).json({ success: true, message: "Birthday event deleted successfully!" });
  } catch (error) {
    console.error("Error deleting birthday event:", error);
    res.status(500).json({ success: false, message: "An error occurred. Please try again." });
  }
};

export const deleteBirthdayEventOA = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedEvent = await BirthdayEvent.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    res.status(200).json({ success: true, message: "Birthday event deleted successfully!" });
  } catch (error) {
    console.error("Error deleting birthday event:", error);
    res.status(500).json({ success: false, message: "An error occurred. Please try again." });
  }
};