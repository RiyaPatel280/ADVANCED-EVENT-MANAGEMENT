import contactModel from "../models/contactModel.js";

export const submitContactForm = async (req, res) => {
  const { name, email, message } = req.body;

  // Validate required fields
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    const contact = new contactModel({
      name,
      email,
      message,
    });

    await contact.save();
    res.status(201).json({ success: true, message: "Message submitted successfully" });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    res.status(500).json({ success: false, message: "Failed to submit message", error: error.message });
  }
};
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await contactModel.find()
      .sort({ createdAt: -1 }); // Sort by date, newest first

    res.status(200).json({ success: true, contacts });
  } catch (error) {
    console.error("Error fetching all contacts:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// contactController.js
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await contactModel.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }

    res.status(200).json({ success: true, message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ success: false, message: "Failed to delete contact" });
  }
};
