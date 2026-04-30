import BirthdayPayment from "../models/birthdayPaymentModel.js";
import BirthdayEvent from "../models/birthdayEventModel.js"; // Assuming this exists

import User from "../models/userModel.js"; // Replace with the actual path to your User model

// Save birthday payment details
// export const saveBirthdayPayment = async (req, res) => {
//     const { razorpayPaymentId, eventDate, amount, venue } = req.body;
  
//     console.log("Received birthday payment data:", { razorpayPaymentId, eventDate, amount, venue, user: req.user });
  
//     if (!razorpayPaymentId || !eventDate || !amount) {
//       return res.status(400).json({ success: false, message: "Missing required fields" });
//     }
  
//     if (!req.user || !req.user._id) {
//       return res.status(401).json({ success: false, message: "User not authenticated" });
//     }
  
//     try {
//       const payment = new BirthdayPayment({
//         userId: req.user._id,
//         eventDate,
//         razorpayPaymentId,
//         amount: String(amount), // Store as string to preserve large values
//         venue,
//       });
  
//       await payment.save();
//       console.log("Birthday payment saved successfully:", payment);
  
//       const formData = JSON.parse(localStorage.getItem("birthdayFormData") || "{}");
//       const bookingData = {
//         name: formData.name,
//         email: formData.email,
//         eventDate,
//         location: formData.location,
//         numberOfMembers: formData.numberOfMembers,
//         selectedServices: formData.selectedServices || {},
//         organizer: formData.organizer,
//         totalAmount: String(formData.totalAmount), // Store as string
//         venue,
//       };
  
//       const birthdayEvent = new BirthdayEvent(bookingData);
//       await birthdayEvent.save();
//       console.log("Birthday event saved:", birthdayEvent);
  
//       res.status(201).json({ success: true, message: "Payment and booking recorded successfully", payment });
//     } catch (error) {
//       console.error("Error saving birthday payment:", error);
//       res.status(500).json({ success: false, message: "Failed to save payment", error: error.message });
//     }
//   };
// export const saveBirthdayPayment = async (req, res) => {
//     const { razorpayPaymentId, eventDate, amount, venue, formData } = req.body;
  
//     console.log("Received birthday payment data:", { razorpayPaymentId, eventDate, amount, venue, formData, user: req.user });
  
//     if (!razorpayPaymentId || !eventDate || !amount || !formData) {
//       return res.status(400).json({ success: false, message: "Missing required fields" });
//     }
  
//     if (!req.user || !req.user._id) {
//       return res.status(401).json({ success: false, message: "User not authenticated" });
//     }
  
//     try {
//       const payment = new BirthdayPayment({
//         userId: req.user._id,
//         eventDate,
//         razorpayPaymentId,
//         amount: String(amount), // Store as string to preserve large values
//         venue,
//       });
  
//       await payment.save();
//       console.log("Birthday payment saved successfully:", payment);
  
//       const bookingData = {
//         name: formData.name,
//         email: formData.email,
//         eventDate: formData.eventDate,
//         location: formData.location,
//         numberOfMembers: formData.numberOfMembers,
//         selectedServices: formData.selectedServices || {},
//         organizer: formData.organizer,
//         totalAmount: String(formData.totalAmount), // Use totalAmount from frontend
//         venue,
//       };
  
//       // Validate required fields for BirthdayEvent
//       if (!bookingData.name || !bookingData.email || !bookingData.eventDate || !bookingData.location || !bookingData.numberOfMembers || !bookingData.organizer || !bookingData.totalAmount) {
//         return res.status(400).json({ success: false, message: "Missing required booking fields" });
//       }
  
//       const birthdayEvent = new BirthdayEvent(bookingData);
//       await birthdayEvent.save();
//       console.log("Birthday event saved:", birthdayEvent);
  
//       res.status(201).json({ success: true, message: "Payment and booking recorded successfully", payment });
//     } catch (error) {
//       console.error("Error saving birthday payment:", error);
//       res.status(500).json({ success: false, message: "Failed to save payment or booking", error: error.message });
//     }
//   };

export const saveBirthdayPayment = async (req, res) => {
  try {
    console.log("Received payment request:", req.body);
    console.log("Authenticated user:", req.user);

    const { 
      razorpayPaymentId, 
      eventDate, 
      amount, 
      venue, 
      formData 
    } = req.body;

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated." });
    }

    if (!razorpayPaymentId || !eventDate || !amount || !venue || !formData) {
      console.log("Missing fields:", { razorpayPaymentId, eventDate, amount, venue, formData });
      return res.status(400).json({ success: false, message: "All payment and booking fields are required." });
    }

    const { 
      name, 
      email, 
      location, 
      numberOfMembers, 
      selectedServices, 
      organizer, 
      totalAmount 
    } = formData;

    if (!name || !email || !eventDate || !totalAmount || !location || !numberOfMembers || !selectedServices || !organizer) {
      console.log("Missing booking fields:", { name, email, eventDate, totalAmount, location, numberOfMembers, selectedServices, organizer });
      return res.status(400).json({ success: false, message: "All booking fields are required." });
    }

    // Check for existing event
    const existingEvent = await BirthdayEvent.findOne({ eventDate });
    if (existingEvent) {
      return res.status(409).json({ 
        success: false, 
        message: "Sorry, this date is not available. Please choose another date." 
      });
    }

    // Fetch the organizer's data from the User collection
    const organizerData = await User.findOne({ name: organizer });
    if (!organizerData) {
      console.log(`Organizer not found: ${organizer}`);
      return res.status(400).json({ 
        success: false, 
        message: `Organizer '${organizer}' not found in the system.` 
      });
    }
    if (!organizerData.email) {
      console.log(`Organizer email missing for: ${organizer}`);
      return res.status(400).json({ 
        success: false, 
        message: `Email not found for organizer '${organizer}'. Please update the organizer's profile.` 
      });
    }

    // Save the booking with organizer name and email
    const newEvent = new BirthdayEvent({
      name,
      email,
      eventDate,
      userId,
      location,
      numberOfMembers,
      selectedServices,
      totalAmount,
      organizer: organizer, // Store the name
      organizerEmail: organizerData.email, // Store the email
      venue,
      razorpayPaymentId,
    });

    await newEvent.save();
    console.log("Event saved:", newEvent);

    // Save the payment
    const newPayment = new BirthdayPayment({
      userId,
      eventDate,
      razorpayPaymentId,
      amount: parseInt(amount) / 100, // Convert paise back to INR
      venue,
    });

    await newPayment.save();
    console.log("Payment saved:", newPayment);

    return res.status(201).json({
      success: true,
      message: "🎉 Payment and Booking Confirmed!",
      event: newEvent,
      payment: newPayment,
    });
  } catch (error) {
    console.error("Error saving payment or booking:", error.message, error.stack);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to save payment or booking details: " + error.message 
    });
  }
};
// Check birthday payment status
// export const checkBirthdayPaymentStatus = async (req, res) => {
//   try {
//     if (!req.user || !req.user._id) {
//       return res.status(401).json({ success: false, message: "User not authenticated" });
//     }

//     // Find all completed payments for the userId
//     const payments = await BirthdayPayment.find({
//       userId: req.user._id,
//       status: "completed",
//     });

//     res.status(200).json({
//       success: true,
//       payments: payments, // Array of payment documents
//     });
//   } catch (error) {
//     console.error("Error checking birthday payment status:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };
export const checkBirthdayPaymentStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated." });
    }

    // Find birthday payments for the user
    const payments = await BirthdayPayment.find({ userId });
    // Find birthday events for the user
    const birthdayEvents = await BirthdayEvent.find({ userId });

    if (!payments.length || !birthdayEvents.length) {
      return res.status(200).json({
        success: true,
        hasCompletedPayment: false,
        payments: [],
        birthdayEvents: [],
        message: "No matching birthday events or payments found for this user"
      });
    }

    // Filter payments and events that match by eventDate
    const matchedPayments = [];
    const matchedEvents = [];

    payments.forEach(payment => {
      const matchingEvent = birthdayEvents.find(event => 
        event.eventDate.toString() === payment.eventDate?.toString()
      );
      if (matchingEvent) {
        matchedPayments.push(payment);
        matchedEvents.push(matchingEvent);
      }
    });

    if (!matchedPayments.length) {
      return res.status(200).json({
        success: true,
        hasCompletedPayment: false,
        payments: [],
        birthdayEvents: [],
        message: "No matching events and payments found with same date"
      });
    }

    // Check if there's at least one completed payment among matched records
    const hasCompletedPayment = matchedPayments.some((payment) => payment.status === "completed");

    return res.status(200).json({
      success: true,
      hasCompletedPayment,
      payments: matchedPayments,
      birthdayEvents: matchedEvents
    });

  } catch (error) {
    console.error("Error checking payment status:", error);
    return res.status(500).json({ success: false, message: "An error occurred." });
  }
};


// Fetch payment details for a specific user and event date
export const getUserBirthdayPaymentDetails = async (req, res) => {
  try {
    const { eventDate } = req.query;

    if (!eventDate) {
      return res.status(400).json({ success: false, message: "Event date is required" });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const payment = await BirthdayPayment.findOne({
      userId: req.user._id,
      eventDate,
    }).populate("userId", "name email");

    if (!payment) {
      return res.status(404).json({ success: false, message: "No payment found for this event date" });
    }

    res.status(200).json({ success: true, payment });
  } catch (error) {
    console.error("Error fetching birthday payment details:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



export const getAllBirthdayPayments = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const payments = await BirthdayPayment.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    if (!payments || payments.length === 0) {
      return res.status(404).json({ message: "No birthday payments found." });
    }

    // Debug: Log the raw data
    console.log("Fetched birthday payments:", JSON.stringify(payments, null, 2));

    res.status(200).json({ payments });
  } catch (error) {
    console.error("Error fetching all birthday payments:", error.message);
    res.status(500).json({ message: "Server error while fetching payment details.", error: error.message });
  }
};