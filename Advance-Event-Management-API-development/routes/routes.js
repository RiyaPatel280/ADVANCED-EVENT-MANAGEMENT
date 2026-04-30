import express from "express";
import userRouter from "./userRoute.js";
import eventRoutes from "./eventRoutes.js";
import venueRoutes from "./venueRoutes.js";
import serviceRoutes from "./serviceRoutes.js";
import birthdayEventRoutes from "./birthdayEventRoutes.js";
import eventcategoryRoutes from "./eventcategoryRoutes.js";
import registrationRoutes from "./registrationRoutes.js";
import adminRoutes from "./adminRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import contactRoutes from "./contactRoutes.js";
import aboutRoutes from "./aboutRoutes.js";
import birthdayPaymentRoutes from "./birthdayPaymentRoutes.js";
import teamRoutes from "./teamRoutes.js";
import organizerRoutes from "./organizerRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import feedbackRoutes from "./feedbackRoutes.js";
const Router = express.Router();

Router.use("/api/users", userRouter);
Router.use("/api", eventRoutes);
Router.use("/api", venueRoutes);
Router.use('/api', serviceRoutes);
Router.use("/api", birthdayEventRoutes);
Router.use("/api", eventcategoryRoutes);
Router.use("/api", registrationRoutes);
Router.use("/api", adminRoutes);
Router.use("/api", paymentRoutes);
Router.use("/api", contactRoutes);
Router.use("/api", aboutRoutes);
Router.use("/api", birthdayPaymentRoutes);
Router.use("/api/team", teamRoutes);
Router.use("/api", organizerRoutes);
Router.use("/api", notificationRoutes);
Router.use("/api", feedbackRoutes);













export default Router;
