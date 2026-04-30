// controllers/notificationController.js
import Notification from "../models/notificationModel.js";

// Create a new notification after successful registration
export const createNotification = async (userEmail, message, eventId) => {
  try {
    const notification = new Notification({
      userEmail,
      message,
      eventId
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Get all notifications for a user
export const getUserNotifications = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ success: false, message: "User email is required" });
    }

    // Aggregate to remove duplicates based on eventId
    const notifications = await Notification.aggregate([
      { $match: { userEmail: email } }, // Filter by email
      { $group: { 
          _id: "$eventId", // Group by eventId to remove duplicates
          notification: { $first: "$$ROOT" } // Keep the first occurrence
        }
      },
      { $replaceRoot: { newRoot: "$notification" } }, // Restore the original document structure
      { $sort: { createdAt: -1 } }, // Sort by creation date
    ]);

    // Populate eventId field after aggregation
    await Notification.populate(notifications, { path: "eventId", select: "title" });

    res.json({ success: true, notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndDelete(id);
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.json({ success: true, message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update notification status to read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.json({ success: true, notification });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};