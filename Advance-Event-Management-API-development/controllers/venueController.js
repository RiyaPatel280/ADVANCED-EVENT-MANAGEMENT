import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

// Define storage for the images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Save uploaded files in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Use a unique filename
  },
});

// Initialize multer
const upload = multer({ storage: storage });

// Define the venue schema
const venueSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  services: { type: [String], required: true }, // Array of services provided at the venue
  image: { type: String, required: true },  // Should store the filename with the extension (e.g., "image123.jpg")
  // Path to the uploaded image
  addBy: { type: String, required: true },
}, { timestamps: true });

const Venue = mongoose.model("Venue", venueSchema);

// Controller actions
export const getVenues = async (req, res) => {
  try {
    const { addBy } = req.query; // Expecting name (e.g., "riya")
    console.log("Query addBy (name):", addBy);

    let query = {};
    if (addBy) {
      // Map name to email dynamically
      const user = await userModel.findOne({ name: addBy }).select("email");
      if (user) {
        query.addBy = user.email; // Convert "riya" to "riya@gmail.com"
        console.log("Mapped to email:", query.addBy);
      } else {
        console.log("No user found for name:", addBy);
        return res.status(200).json([]); // Return empty array if no user found
      }
    }

    const venues = await Venue.find(query);

    // Fetch user names for each venue and add image path
    const venuesWithDetails = await Promise.all(
      venues.map(async (venue) => {
        const user = await userModel.findOne({ email: venue.addBy });
        return {
          ...venue.toObject(),
          image: venue.image ? `http://localhost:4000/uploads/${venue.image}` : null,
          addedByName: user ? user.name : "Unknown",
        };
      })
    );

    console.log("Filtered venues:", venuesWithDetails);
    res.status(200).json(venuesWithDetails);
  } catch (error) {
    console.error("Error fetching venues:", error.message || error);
    res.status(500).json({ success: false, message: "An error occurred. Please try again." });
  }
};


// Add a new venue with image
export const addVenue = async (req, res) => {
  try {
    const { name, price, services } = req.body; // Capture addBy field
    const image = req.file ? req.file.filename : null;
    const addBy = req.user.email; // Extract email from token

    if (!name || !price || !services || !image || !addBy) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const newVenue = new Venue({ name, price, services, image, addBy });

    await newVenue.save();

    res.status(201).json({ success: true, message: "Venue added successfully!", venue: newVenue });
  } catch (error) {
    console.error("Error adding venue:", error);
    res.status(500).json({ success: false, message: "An error occurred. Please try again." });
  }
};



export const verifyToken = (req, res, next) => {
  console.log("🔥 Received Headers:", req.headers); // Log request headers

  const authHeader = req.header("Authorization");
  if (!authHeader) {
    console.log("🚨 No Authorization header received!");
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Extract token
  console.log("🛠 Extracted Token:", token); // Debug token

  if (!token) {
    console.log("🚨 Token missing from Authorization header!");
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded Token:", decoded);
    req.user = decoded; // Attach user to request
    next();
  } catch (error) {
    console.error("❌ JWT Verification Error:", error.message);
    res.status(403).json({ message: "Invalid token" });
  }
};
// Update venue details with image


export const updateVenue = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, services } = req.body;

    // Find the existing venue
    const venue = await Venue.findById(id);
    if (!venue) {
      return res.status(404).json({ success: false, message: "Venue not found." });
    }

    // Only update image if a new file is uploaded
    const image = req.file ? req.file.filename : venue.image;

    // Update venue details
    const updatedVenue = await Venue.findByIdAndUpdate(
      id,
      { name, price, services, image },
      { new: true }
    );

    res.status(200).json({ success: true, message: "Venue updated successfully!", venue: updatedVenue });
  } catch (error) {
    console.error("Error updating venue:", error);
    res.status(500).json({ success: false, message: "An error occurred. Please try again." });
  }
};

// Delete a venue
export const deleteVenue = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedVenue = await Venue.findByIdAndDelete(id);

    if (!deletedVenue) {
      return res.status(404).json({ success: false, message: "Venue not found." });
    }

    res.status(200).json({ success: true, message: "Venue deleted successfully!" });
  } catch (error) {
    console.error("Error deleting venue:", error);
    res.status(500).json({ success: false, message: "An error occurred. Please try again." });
  }
};

// Multer middleware for file upload
export const uploadImage = upload.single('image'); // Ensure that 'image' is the name attribute used in the frontend
