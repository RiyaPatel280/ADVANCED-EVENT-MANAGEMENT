import express from "express";
import { getVenues, verifyToken, addVenue, updateVenue, deleteVenue, uploadImage } from "../controllers/venueController.js";

const router = express.Router();

// Routes
router.get("/venues", getVenues);
router.post("/venues", verifyToken, uploadImage, addVenue);  // Handle image upload with POST
router.put("/venues/:id", uploadImage, updateVenue);  // Handle image upload with PUT
router.delete("/venues/:id", deleteVenue);


export default router;
