// controllers/teamController.js
import Team from "../models/Team.js";
import multer from "multer";
export const getAllTeamMembers = async (req, res) => {
  try {
    const teamMembers = await Team.find();
    res.json({ success: true, teamMembers });
  } catch (err) {
    console.error("Error fetching team members:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};


export const addTeamMember = async (req, res) => {
  const { name, description } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

  if (!name || !description) {
    return res.status(400).json({ success: false, message: "Name and description are required" });
  }

  try {
    const teamMember = new Team({ name, description, imageUrl });
    await teamMember.save();
    res.status(201).json({ success: true, message: "Team member added successfully", teamMember });
  } catch (err) {
    console.error("Error adding team member:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
}; 

export const updateTeamMember = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

  try {
    const updatedFields = { name, description };
    if (imageUrl) updatedFields.imageUrl = imageUrl;

    const updatedMember = await Team.findByIdAndUpdate(id, updatedFields, { new: true });

    if (!updatedMember) {
      return res.status(404).json({ success: false, message: "Team member not found" });
    }

    res.json({ success: true, message: "Team member updated successfully", teamMember: updatedMember });
  } catch (err) {
    console.error("Error updating team member:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const deleteTeamMember = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedMember = await Team.findByIdAndDelete(id);

    if (!deletedMember) {
      return res.status(404).json({ success: false, message: "Team member not found" });
    }

    res.json({ success: true, message: "Team member deleted successfully" });
  } catch (err) {
    console.error("Error deleting team member:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};


