import express from "express";
import { authenticateUser } from "../middleware/authMiddleware.js";
import {
  saveBirthdayPayment,
  checkBirthdayPaymentStatus,
  getUserBirthdayPaymentDetails,
  getAllBirthdayPayments
} from "../controllers/birthdayPaymentController.js";

const router = express.Router();

// Routes
router.post("/save-birthday-payment", authenticateUser, saveBirthdayPayment);
router.get("/check-birthday-payment-status", authenticateUser, checkBirthdayPaymentStatus);
router.get("/user-birthday-payment-details", authenticateUser, getUserBirthdayPaymentDetails);

router.get("/all-birthday-payments", authenticateUser, getAllBirthdayPayments); // New admin endpoint



export default router;