/**
 * ============================================================================
 * RIZA HABIT TRACKER - MAIN SERVER FILE
 * ============================================================================
 *
 * Purpose:
 * - Express.js server entry point for the Habit Tracker backend
 * - Connects to MongoDB Atlas cloud database
 * - Sets up middleware for JSON parsing, CORS, and request handling
 * - Registers all API route handlers
 *
 * API Structure:
 * - /api/auth      → User authentication (register, login, profile)
 * - /api/habits    → Habit CRUD operations
 * - /api/checkins  → Daily habit check-ins and streaks
 * - /api/logins    → User login tracking
 *
 * Dependencies:
 * - express: Web server framework
 * - mongoose: MongoDB ODM (Object Data Modeling)
 * - dotenv: Environment variable management
 * - cors: Cross-Origin Resource Sharing
 *
 * Environment Variables (from .env):
 * - MONGO_URI: MongoDB Atlas connection string
 * - JWT_SECRET: Secret key for JWT token signing
 * - PORT: Server port (default: 5000)
 *
 * Author: John Denis Nyagah
 * ============================================================================
 */

// ============================================================================
// IMPORT DEPENDENCIES
// ============================================================================
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

// Import route handlers
import authRoutes from "./routes/authRoutes.js";
import habitRoutes from "./routes/habitRoutes.js";
import checkinRoutes from "./routes/checkinRoutes.js";
import loginRoutes from "./routes/loginRoutes.js";

// ============================================================================
// INITIALIZE APPLICATION
// ============================================================================
// Load environment variables from .env file
dotenv.config();

// Create Express application instance
const app = express();

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================
/**
 * JSON Parser Middleware
 * - Parses incoming JSON request bodies
 * - Increased limit to 10MB to handle base64 encoded profile images
 * - Default limit is 100kb which is insufficient for image uploads
 */
app.use(express.json({ limit: "10mb" }));

/**
 * URL-Encoded Parser Middleware
 * - Parses URL-encoded request bodies (form data)
 * - Extended option allows parsing of rich objects and arrays
 */
app.use(express.urlencoded({ limit: "10mb", extended: true }));

/**
 * CORS Middleware
 * - Enables Cross-Origin Resource Sharing
 * - Allows frontend (running on different port) to access backend API
 * - In production, configure specific allowed origins for security
 */
app.use(cors());

// ============================================================================
// DATABASE CONNECTION
// ============================================================================
/**
 * MongoDB Connection
 * - Connects to MongoDB Atlas cloud database
 * - Connection string stored in environment variable (MONGO_URI)
 * - Uses async/await pattern with promise handling
 */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ============================================================================
// ROOT ROUTES
// ============================================================================
/**
 * Root Endpoint
 * - GET /
 * - Returns simple message to confirm server is running
 * - Useful for basic health checks
 */
app.get("/", (req, res) => {
  res.send("Habit Tracker API is running...");
});

/**
 * Test Endpoint
 * - GET /test
 * - Returns JSON response for API testing (Postman, curl, etc.)
 * - Can be removed in production
 */
app.get("/test", (req, res) => {
  res.json({ message: "Test route works!" });
});

// ============================================================================
// API ROUTE HANDLERS
// ============================================================================
/**
 * Authentication Routes
 * - POST /api/auth/register          → Register new user
 * - POST /api/auth/login             → Login user
 * - GET  /api/auth/profile           → Get user profile (protected)
 * - PUT  /api/auth/profile           → Update profile name (protected)
 * - PUT  /api/auth/profile-picture   → Update profile picture (protected)
 * - PUT  /api/auth/change-password   → Change password (protected)
 * - DELETE /api/auth/account         → Delete account (protected)
 * - POST /api/auth/logout            → Logout user (protected)
 */
app.use("/api/auth", authRoutes);

/**
 * Habit Routes
 * - GET    /api/habits     → Get all user habits (protected)
 * - POST   /api/habits     → Create new habit (protected)
 * - PUT    /api/habits/:id → Update habit (protected)
 * - DELETE /api/habits/:id → Delete habit (protected)
 */
app.use("/api/habits", habitRoutes);

/**
 * Check-in Routes
 * - POST /api/checkins/toggle          → Toggle habit completion (protected)
 * - GET  /api/checkins/:habitId        → Get all check-ins for habit (protected)
 * - GET  /api/checkins/:habitId/streak → Calculate current streak (protected)
 */
app.use("/api/checkins", checkinRoutes);

/**
 * Login Tracking Routes
 * - POST /api/logins/track → Track daily login (protected)
 * - GET  /api/logins/count → Get total login days (protected)
 */
app.use("/api/logins", loginRoutes);

// ============================================================================
// START SERVER
// ============================================================================
/**
 * Server Initialization
 * - Starts Express server on specified port
 * - Default port: 5000 (can be changed via PORT environment variable)
 * - Logs server status to console
 */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
