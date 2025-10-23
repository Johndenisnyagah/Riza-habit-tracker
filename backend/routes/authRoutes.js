/**
 * ============================================================================
 * AUTHENTICATION ROUTES
 * ============================================================================
 *
 * Purpose:
 * - Handles all user authentication and profile management endpoints
 * - Implements JWT-based authentication system
 * - Provides secure user registration, login, and profile operations
 *
 * Routes:
 * - POST   /api/auth/register          → Register new user account
 * - POST   /api/auth/login             → Login and receive JWT token
 * - GET    /api/auth/profile           → Get authenticated user profile
 * - PUT    /api/auth/profile           → Update user profile name
 * - PUT    /api/auth/profile-picture   → Update profile picture (base64)
 * - PUT    /api/auth/change-password   → Change user password
 * - DELETE /api/auth/account           → Delete user account and all data
 * - POST   /api/auth/logout            → Logout user (server-side tracking)
 *
 * Security Features:
 * - Password hashing with bcrypt (10 salt rounds)
 * - JWT tokens for stateless authentication
 * - Protected routes require valid JWT token
 * - Password validation and strength requirements
 * - Secure profile picture upload with size limits (5MB max)
 *
 * Dependencies:
 * - bcrypt: Password hashing and comparison
 * - jsonwebtoken: JWT token generation and verification
 * - User model: MongoDB user schema
 * - authMiddleware: JWT verification middleware
 *
 * Author: John Denis Nyagah
 * ============================================================================
 */

import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ============================================================================
// USER REGISTRATION
// ============================================================================
/**
 * POST /api/auth/register
 *
 * Purpose: Register a new user account
 *
 * Request Body:
 * - name: string (user's full name)
 * - email: string (unique email address)
 * - password: string (will be hashed before storage)
 *
 * Response:
 * - 201: User registered successfully
 * - 400: Email already exists
 * - 500: Server error
 *
 * Security:
 * - Checks for duplicate email addresses
 * - Hashes password with bcrypt (10 salt rounds)
 * - Never stores plain text passwords
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the email is already used
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save user
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ============================================================================
// USER LOGIN
// ============================================================================
/**
 * POST /api/auth/login
 *
 * Purpose: Authenticate user and issue JWT token
 *
 * Request Body:
 * - email: string (user's email address)
 * - password: string (user's password)
 *
 * Response:
 * - 200: Login successful with JWT token and user data
 * - 400: User not found or invalid password
 * - 500: Server error
 *
 * Security:
 * - Validates user credentials
 * - Compares hashed passwords using bcrypt
 * - Generates JWT token valid for 1 hour
 * - Token includes user ID and email in payload
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture || "",
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ============================================================================
// GET USER PROFILE
// ============================================================================
/**
 * GET /api/auth/profile
 *
 * Purpose: Get authenticated user's profile information
 *
 * Authentication: Required (JWT token)
 *
 * Response:
 * - 200: User profile data
 * - 404: User not found
 * - 500: Server error
 *
 * Security:
 * - Protected route (requires valid JWT token)
 * - Password field excluded from response
 * - User ID extracted from JWT token
 */
router.get("/profile", protect, async (req, res) => {
  try {
    console.log("Profile endpoint called, user ID:", req.user.id);

    // Fetch full user data from database (excluding password)
    const user = await User.findById(req.user.id).select("-password");

    console.log("User fetched from DB:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const responseData = {
      message: "Access granted",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture || "",
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };

    console.log("Sending response:", responseData);
    res.json(responseData);
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================================================================
// UPDATE USER PROFILE
// ============================================================================
/**
 * PUT /api/auth/profile
 *
 * Purpose: Update user's profile name
 *
 * Authentication: Required (JWT token)
 *
 * Request Body:
 * - name: string (new user name, trimmed)
 *
 * Response:
 * - 200: Profile updated successfully with updated user data
 * - 400: Invalid name (empty or whitespace only)
 * - 404: User not found
 * - 500: Server error
 *
 * Validation:
 * - Name must not be empty after trimming
 * - Whitespace is automatically removed
 */
router.put("/profile", protect, async (req, res) => {
  try {
    const { name } = req.body;

    // Validate input
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: "Please provide a valid name" });
    }

    // Get user from database
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user name
    user.name = name.trim();
    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture || "",
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================================================================
// UPDATE PROFILE PICTURE
// ============================================================================
/**
 * PUT /api/auth/profile-picture
 *
 * Purpose: Update user's profile picture (base64 encoded image)
 *
 * Authentication: Required (JWT token)
 *
 * Request Body:
 * - profilePicture: string (base64 encoded image with data URI scheme)
 *
 * Response:
 * - 200: Profile picture updated successfully
 * - 400: Invalid image format or size exceeds limit
 * - 404: User not found
 * - 500: Server error
 *
 * Validation:
 * - Must be valid base64 image (starts with "data:image/")
 * - Maximum size: 5MB (before base64 encoding)
 * - Calculates actual size from base64 string length
 *
 * Storage:
 * - Stores base64 string directly in MongoDB
 * - No external file storage required
 * - Images displayed via data URI in frontend
 */
router.put("/profile-picture", protect, async (req, res) => {
  try {
    const { profilePicture } = req.body;

    console.log("Profile picture update request received");
    console.log(
      "Image data length:",
      profilePicture ? profilePicture.length : 0
    );

    // Validate input
    if (!profilePicture) {
      return res
        .status(400)
        .json({ message: "Please provide a profile picture" });
    }

    // Validate base64 format
    if (!profilePicture.startsWith("data:image/")) {
      return res.status(400).json({ message: "Invalid image format" });
    }

    // Check image size (max 5MB base64 = ~6.6MB before encoding)
    const sizeInBytes = (profilePicture.length * 3) / 4;
    const maxSize = 5 * 1024 * 1024; // 5MB
    console.log(
      "Image size:",
      Math.round((sizeInBytes / 1024 / 1024) * 100) / 100,
      "MB"
    );

    if (sizeInBytes > maxSize) {
      return res
        .status(400)
        .json({ message: "Image size must be less than 5MB" });
    }

    // Get user from database
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update profile picture
    user.profilePicture = profilePicture;
    await user.save();

    console.log("Profile picture updated successfully");

    res.status(200).json({
      message: "Profile picture updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update profile picture error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================================================================
// CHANGE PASSWORD
// ============================================================================
/**
 * PUT /api/auth/change-password
 *
 * Purpose: Change user's password
 *
 * Authentication: Required (JWT token)
 *
 * Request Body:
 * - currentPassword: string (current password for verification)
 * - newPassword: string (new password, minimum 6 characters)
 *
 * Response:
 * - 200: Password updated successfully
 * - 400: Missing fields, incorrect current password, or weak new password
 * - 404: User not found
 * - 500: Server error
 *
 * Security:
 * - Verifies current password before allowing change
 * - Enforces minimum password length (6 characters)
 * - Hashes new password with bcrypt (10 salt rounds)
 * - Never stores plain text passwords
 */
router.put("/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Please provide current and new password" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    }

    // Get user from database
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================================================================
// DELETE USER ACCOUNT
// ============================================================================
/**
 * DELETE /api/auth/account
 *
 * Purpose: Delete user account and all associated data
 *
 * Authentication: Required (JWT token)
 *
 * Response:
 * - 200: Account deleted successfully
 * - 500: Server error
 *
 * Cascading Deletion:
 * - Deletes all user's habits
 * - Deletes all user's check-ins
 * - Deletes all user's login records
 * - Deletes the user account
 *
 * Security:
 * - User ID extracted from JWT token (prevents deleting other users)
 * - Irreversible operation (permanent data deletion)
 * - Maintains data integrity by removing all related records
 */
router.delete("/account", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Import models (we need Habit, Checkin, and Login to delete user's data)
    const Habit = (await import("../models/Habit.js")).default;
    const Checkin = (await import("../models/Checkin.js")).default;
    const Login = (await import("../models/Login.js")).default;

    // Delete all user's habits
    await Habit.deleteMany({ userId });

    // Delete all user's checkins
    await Checkin.deleteMany({ userId });

    // Delete all user's login records
    await Login.deleteMany({ userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================================================================
// USER LOGOUT
// ============================================================================
/**
 * POST /api/auth/logout
 *
 * Purpose: Logout user (server-side tracking)
 *
 * Authentication: Required (JWT token)
 *
 * Response:
 * - 200: Logged out successfully
 * - 500: Server error
 *
 * Note:
 * - JWT-based authentication is stateless
 * - Actual logout happens client-side (remove token from localStorage)
 * - This endpoint provides server-side logging for tracking purposes
 * - Could implement token blacklisting here for additional security
 */
router.post("/logout", protect, async (req, res) => {
  try {
    // In a JWT-based system, logout is typically client-side (removing token)
    // But we can log it on the server for tracking purposes
    console.log("User logged out:", req.user.id);

    // You could implement token blacklisting here if needed
    // For now, we just acknowledge the logout
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
