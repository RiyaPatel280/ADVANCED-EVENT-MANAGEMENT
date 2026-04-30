import paymentModel from "../models/paymentModel.js";
import registrationModel from "../models/registrationModel.js";
import EventCategory from "../models/EventCategory.js";
import User from "../models/userModel.js"; // Assuming you have a User model
import mongoose from "mongoose";
// Save payment details and remove from registrations
export const savePayment = async (req, res) => {
  const { razorpayPaymentId, eventId, amount } = req.body;

  console.log("Received payment data:", { razorpayPaymentId, eventId, amount, user: req.user });

  if (!razorpayPaymentId || !eventId || !amount) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  if (!req.user || !req.user._id) {
    return res.status(401).json({ success: false, message: "User not authenticated" });
  }

  try {
    const payment = new paymentModel({
      userId: req.user._id,
      eventId,
      razorpayPaymentId,
      amount,
    });

    await payment.save();
    console.log("Payment saved successfully:", payment);
    res.status(201).json({ success: true, message: "Payment recorded successfully", payment });
  } catch (error) {
    console.error("Error saving payment:", error);
    res.status(500).json({ success: false, message: "Failed to save payment", error: error.message });
  }
};

// Fetch booked events for a user

export const getBookedEvents = async (req, res) => {
  try {
    const userId = req.user._id; // Use authenticated user's ID from token
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated." });
    }

    // Fetch booked events where userId matches the authenticated user's ID
    const bookedEvents = await paymentModel.aggregate([
      {
        $match: {
          userId: userId, // Filter by userId first
          status: "completed", // Optionally filter for completed payments only
        },
      },
      {
        $lookup: {
          from: "eventcategories", // MongoDB collection name (lowercase, plural)
          localField: "eventId",
          foreignField: "_id",
          as: "eventDetails",
        },
      },
      { $unwind: "$eventDetails" }, // Deconstruct the array from $lookup
      {
        $project: {
          _id: 1,
          eventId: {
            _id: "$eventDetails._id",
            title: "$eventDetails.title",
            startDate: "$eventDetails.startDate",
            venue: "$eventDetails.venue",
            organizer: "$eventDetails.organizer",
            description: "$eventDetails.description",
            price: "$eventDetails.price",
            email: "$eventDetails.email",
            registrationLimit: "$eventDetails.registrationLimit",
          },
          razorpayPaymentId: 1,
          amount: 1,
          currency: 1,
          status: 1,
          createdAt: 1,
        },
      },
    ]);

    if (bookedEvents.length === 0) {
      return res.status(200).json({
        success: true,
        bookedEvents: [],
        message: `No booked events found for user ID: ${userId}`,
      });
    }

    console.log("Booked events from DB for user ID", userId, ":", bookedEvents);
    res.status(200).json({ success: true, bookedEvents });
  } catch (error) {
    console.error("Error fetching booked events:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getBookedEventsOA = async (req, res) => {
  try {
    const userEmail = req.user.email; // Authenticated user's email from token

    if (!userEmail) {
      return res.status(401).json({ success: false, message: "User not authenticated." });
    }

    // Fetch booked events where eventId.email matches the user's email
    const bookedEvents = await paymentModel.aggregate([
      {
        $match: {
          status: "completed", // Filter for completed payments only
        },
      },
      {
        $lookup: {
          from: "eventcategories", // Collection name for EventCategory model
          localField: "eventId",
          foreignField: "_id",
          as: "eventDetails",
        },
      },
      { $unwind: "$eventDetails" }, // Flatten the eventDetails array
      {
        $match: {
          "eventDetails.email": userEmail, // Only include events where email matches req.user.email
        },
      },
      {
        $project: {
          _id: 1,
          eventId: {
            _id: "$eventDetails._id",
            title: "$eventDetails.title",
            description: "$eventDetails.description",
            organizer: "$eventDetails.organizer",
            startDate: "$eventDetails.startDate",
            venue: "$eventDetails.venue",
            price: "$eventDetails.price",
            email: "$eventDetails.email", // This will show "megh@gmail.com"
            city: "$eventDetails.city",
            registrationLimit: "$eventDetails.registrationLimit",
          },
          razorpayPaymentId: 1,
          amount: 1,
          currency: 1,
          status: 1,
          createdAt: 1,
        },
      },
    ]);

    if (bookedEvents.length === 0) {
      return res.status(200).json({
        success: true,
        bookedEvents: [],
        message: `No booked events found for email: ${userEmail}`,
      });
    }

    console.log("Booked events from DB for email", userEmail, ":", bookedEvents);
    res.status(200).json({ success: true, bookedEvents });
  } catch (error) {
    console.error("Error fetching booked events:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// Create Razorpay order
export const createOrder = async (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    return res.status(400).json({ success: false, message: "Amount is required" });
  }

  const options = {
    amount,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const Razorpay = require("razorpay");
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: "Failed to create order", error: error.message });
  }
};

// Check payment status
export const checkPaymentStatus = async (req, res) => {
  try {
    const { eventId } = req.query;

    if (!eventId) {
      return res.status(400).json({ success: false, message: "Event ID is required" });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const payment = await paymentModel.findOne({
      userId: req.user._id,
      eventId,
      status: "completed",
    });

    res.status(200).json({
      success: true,
      hasCompletedPayment: !!payment,
    });
  } catch (error) {
    console.error("Error checking payment status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// New function to get all payment details for admin
export const getAllPayments = async (req, res) => {
  try {
    const payments = await paymentModel
      .find()
      .populate('userId', 'name email') // Populate user details
      .populate('eventId', 'title'); // Populate event title

    res.status(200).json({ success: true, payments });
  } catch (error) {
    console.error("Error fetching all payments:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Fetch payment details for a specific user and event
export const getUserPaymentDetails = async (req, res) => {
  try {
    const { eventId } = req.query;

    if (!eventId) {
      return res.status(400).json({ success: false, message: "Event ID is required" });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const payment = await paymentModel
      .findOne({ userId: req.user._id, eventId })
      .populate("userId", "name email") // Populate user details
      .populate("eventId", "title"); // Populate event title

    if (!payment) {
      return res.status(404).json({ success: false, message: "No payment found for this event" });
    }

    res.status(200).json({ success: true, payment });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};