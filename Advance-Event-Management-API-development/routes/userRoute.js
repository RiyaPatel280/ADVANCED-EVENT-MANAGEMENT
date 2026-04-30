import express from "express";
import { 
  signup, login, getAllUsers, 
  verifyToken, editUser,deleteUser,getUserProfile
} from "../controllers/userController.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import userModel from "../models/userModel.js";
import imageModel from "../models/imageModel.js";
const router = express.Router();
// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Get all images
router.get('/images', async (req, res) => {
  try {
    const images = await imageModel.find().populate('uploadedBy', 'name role');
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/images/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete images' });
    }

    const imageId = req.params.id;
    const image = await imageModel.findById(imageId);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    await imageModel.findByIdAndDelete(imageId);
    res.json({ message: 'Image deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Upload image (restricted to organizers)
router.post('/upload', verifyToken, upload.single('image'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can upload images' });
    }

    const image = new imageModel({
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`,
      uploadedBy: req.user.id // From verifyToken middleware
    });
    await image.save();
    res.json(image);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
router.post("/signup", signup);
router.post("/login", login);
router.get("/all-users", verifyToken, getAllUsers);

router.get("/user-profile", verifyToken, getUserProfile);

router.get("/organizers", async (req, res) => {
  try {
    // Fetch users who have the role "Organizer"
    const organizers = await userModel.find({ role: "organizer" }).select("name role");

    res.json(organizers);
  } catch (err) {
    console.error("Error fetching organizers:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.put("/edit-user/:id", verifyToken, editUser);
router.delete("/delete-user/:id", verifyToken, deleteUser);

export default router;
