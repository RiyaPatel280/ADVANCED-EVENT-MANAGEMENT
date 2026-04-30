import mongoose from "mongoose";

export const getEventDetails = async (req, res) => {
    try {
      const events = await Event.find(); // Retrieves all events
      res.status(200).json(events); // Sends the events as a response
    } catch (error) {
      console.error("Error fetching event details:", error);
      res.status(500).json({ success: false, message: "An error occurred. Please try again." });
    }
  };
  
const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  eventType: { type: String, required: true },
  selectedServices: { type: [String], required: true },
  numberOfPeople: { type: Number, required: true },
  dinnerOption: String,
  theme: String,
  cakeDetails: String,
  entertainment: String,
  giftRegistry: String,
  specialRequests: String,
  venue: String,
  photographer: String,
  weddingCake: String,
});

const Event = mongoose.model("Event", eventSchema);


export default Event;
