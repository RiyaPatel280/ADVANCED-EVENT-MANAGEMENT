// routes/teamRoutes.js
import express from "express";
import { verifyToken } from "../controllers/userController.js";
import { addTeamMember, updateTeamMember, deleteTeamMember } from "../controllers/teamController.js";
import Team from "../models/Team.js"; // Import Team model directly here for GET
import multer from "multer";
import path from "path";

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only JPEG/JPG/PNG images are allowed"));
  },
});

// GET: View all team members
router.get("/viewteam", async (req, res) => {
  try {
    const teamMembers = await Team.find();
    res.json({ success: true, teamMembers });
  } catch (err) {
    console.error("Error fetching team members:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// POST: Add a team member
router.post("/add", verifyToken, upload.single("image"), addTeamMember);
// PUT: Update a team member
router.put("/update/:id", verifyToken, upload.single("image"), updateTeamMember);

// DELETE: Remove a team member
router.delete("/delete/:id", verifyToken, deleteTeamMember);

export default router;