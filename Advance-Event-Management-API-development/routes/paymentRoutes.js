import express from "express";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { savePayment, getBookedEvents, checkPaymentStatus, createOrder, getAllPayments, getUserPaymentDetails, getBookedEventsOA } from "../controllers/paymentController.js";

const router = express.Router();

// Routes
router.post("/save-payment", authenticateUser, savePayment);
router.get("/booked-events", authenticateUser, getBookedEvents);
router.get("/booked-eventsOA", authenticateUser, getBookedEventsOA);
router.post("/create-order", authenticateUser, createOrder);
router.get("/check-payment-status", authenticateUser, checkPaymentStatus);
router.get("/all-payments", authenticateUser, getAllPayments); // New route for admin
router.get("/user-payment-details", authenticateUser, getUserPaymentDetails);


export default router;