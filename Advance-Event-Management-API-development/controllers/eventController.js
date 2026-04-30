import Event from "../models/eventModel.js";

export const getEventDetails = async (req, res) => {
  try {
    const events = await Event.find(); // Retrieves all events
    res.status(200).json(events); // Sends the events as a response
  } catch (error) {
    console.error("Error fetching event details:", error);
    res.status(500).json({ success: false, message: "An error occurred. Please try again." });
  }
};

export const submitEventDetails = async (req, res) => {
  try {
    const { name, email, eventType, selectedServices, numberOfPeople, dinnerOption, theme, cakeDetails, entertainment, giftRegistry, specialRequests, venue, photographer, weddingCake } = req.body;

    // Validation
    if (!name || !email || !eventType || !selectedServices || !numberOfPeople) {
      return res.status(400).json({ success: false, message: "All required fields must be provided." });
    }

    // Create new event entry
    const newEvent = new Event({
      name,
      email,
      eventType,
      selectedServices,
      numberOfPeople,
      dinnerOption,
      theme,
      cakeDetails,
      entertainment,
      giftRegistry,
      specialRequests,
      venue,
      photographer,
      weddingCake,
    });

    await newEvent.save();

    res.status(201).json({ success: true, message: "Event details submitted successfully!" });
  } catch (error) {
    console.error("Error submitting event details:", error);
    res.status(500).json({ success: false, message: "An error occurred. Please try again." });
  }
};
