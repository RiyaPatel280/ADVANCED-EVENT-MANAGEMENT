import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import Request from "../models/requestModel.js";
import dotenv from "dotenv";


dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

// Helper function to generate a token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET // No expiration time
  );
};

// Signup
export const signup = async (req, res) => {
  const { name, email, phone, password, password_confirmation, role } = req.body;

  // Validate all required fields
  if (!name || !email || !phone || !password || !password_confirmation || !role) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  if (password !== password_confirmation) {
    return res.status(400).json({ success: false, message: "Passwords do not match." });
  }

  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({ success: false, message: "Please enter a valid 10-digit phone number." });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({ 
      name, 
      email, 
      phone, 
      password: hashedPassword, 
      role 
    });

    await newUser.save();
    res.status(201).json({ success: true, message: "User registered successfully." });
  } catch (error) {
    console.error("Signup Error:", error.message);
    res.status(500).json({ success: false, message: "An error occurred. Please try again." });
  }
};


// Login
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required." });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    if (user.status === "banned") {
      return res.status(403).json({ success: false, message: "Your account is banned." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const token = generateToken(user);
    res.status(200).json({ success: true, message: "Login successful.", token, user });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ success: false, message: "An error occurred. Please try again." });
  }
};

// Get All Users (Admin Only)
// Get All Users (Admin Only, Excluding Admin Role)
export const getAllUsers = async (req, res) => {
  console.log("User in getAllUsers:", req.user); // Debugging

  if (!req.user) {
    return res.status(403).json({ success: false, message: "User not found in request." });
  }

  if (req.user.role.toLowerCase() !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied. Role mismatch." });
  }

  try {
    const users = await userModel.find({ role: { $ne: "admin" } }); // Exclude users with role 'admin'
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Get All Users Error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};






// Middleware to Verify JWT Token
export const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Extract token
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded); // Log to check if 'id' is included
    req.user = decoded; // Attach user to request
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    res.status(403).json({ message: "Invalid token" });
  }
};


// Request Upgrade to Organizer



export const editUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role, currentPassword, newPassword } = req.body;

  try {
    // Find the user by ID
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Handle password update if newPassword is provided
    if (newPassword) {
      // Check if currentPassword is provided
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: "Current password is required to update password" });
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Current password is incorrect" });
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // Update other fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;

    // Save the updated user
    await user.save();

    res.status(200).json({ success: true, message: "User updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await userModel.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const getUserProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(403).json({ success: false, message: "User email not found in request." });
    }

    const user = await userModel.findOne({ email: req.user.email }); // Find by email
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Get User Profile Error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
