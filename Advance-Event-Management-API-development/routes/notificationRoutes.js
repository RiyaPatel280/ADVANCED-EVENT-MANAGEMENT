// routes/notificationRoutes.js
import express from "express";
import { 
  getUserNotifications, 
  deleteNotification, 
  markNotificationAsRead 
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/notification", getUserNotifications);
router.delete("/notification/:id", deleteNotification);
router.put("/notification/:id/read", markNotificationAsRead);

export default router;