import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    console.log("Received Token:", token); // Debugging

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded); // Debugging

    const user = await userModel.findById(decoded.id).select("-password");
    console.log("User from DB:", user); // Debugging

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    req.user = user; // Attach user data to request
    next(); 
  } catch (error) {
    console.error("Token Verification Error:", error.message);
    return res.status(401).json({ success: false, message: "Invalid token." });
  }
};
