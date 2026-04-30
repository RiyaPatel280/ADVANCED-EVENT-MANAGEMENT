import express from "express";
import { authenticateUser } from "../middleware/authMiddleware.js";

import { submitContactForm ,getAllContacts, deleteContact } from "../controllers/contactController.js";

const router = express.Router();

// Route to submit contact form
router.post("/submit", submitContactForm);
router.get("/all-contacts", authenticateUser, getAllContacts);
router.delete("/contact/:id", authenticateUser, deleteContact);
export default router;