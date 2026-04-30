import express from "express";
import { addService, verifyToken, getServices, getVenueOptions, getAllServices, getServiceById, updateService, deleteService } from "../controllers/serviceController.js";


const router = express.Router();

// Add a new service
router.post("/services", verifyToken, addService);

// Get all services
router.get("/services", getAllServices);

// Get all services
router.get("/allservices", getServices);

// Get a single service by ID
router.get("/services/:id", getServiceById);

// Update a service
router.put("/services/:id", updateService);

// Delete a service
router.delete("/services/:id", deleteService);

router.get("/venue-options", getVenueOptions);
export default router;
