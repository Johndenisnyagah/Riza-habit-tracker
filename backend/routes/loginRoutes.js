/**
 * ============================================================================
 * LOGIN TRACKING ROUTES
 * ============================================================================
 *
 * Purpose:
 * - Tracks user login activity and engagement
 * - Records daily logins (one entry per day)
 * - Provides statistics on total login days
 * - All routes are protected and require JWT authentication
 *
 * Routes:
 * - POST /api/logins/track → Track daily login
 * - GET  /api/logins/count → Get total login days
 *
 * Login Record Properties:
 * - userId: ObjectId (links to user)
 * - date: Date (normalized to midnight UTC)
 *
 * Use Cases:
 * - User engagement metrics
 * - Login streak tracking
 * - Activity monitoring
 * - Motivational statistics for dashboard
 *
 * Date Handling:
 * - All dates normalized to midnight UTC
 * - Prevents duplicate records for same day
 * - Consistent across different timezones
 *
 * Author: John Denis Nyagah
 * ============================================================================
 */

import express from "express";
import Login from "../models/Login.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ============================================================================
// TRACK DAILY LOGIN
// ============================================================================
/**
 * POST /api/logins/track
 *
 * Purpose: Track user login for today (one entry per day)
 *
 * Authentication: Required (JWT token)
 *
 * Response:
 * - 200: Already logged today (no duplicate created)
 * - 201: Login tracked (new record created)
 * - 500: Server error
 *
 * Behavior:
 * - Checks if login already tracked for today
 * - If yes: Returns message, no duplicate created
 * - If no: Creates new login record for today
 *
 * Date Normalization:
 * - Creates date at 00:00:00 UTC
 * - Prevents multiple entries for same day
 * - Ensures accurate daily tracking
 *
 * Usage:
 * - Called from frontend when user logs in
 * - Or called on first page load after authentication
 * - Provides data for "Days Active" metric on dashboard
 */
router.post("/track", protect, async (req, res) => {
  try {
    // Create today's date at midnight UTC for consistency
    const now = new Date();
    const today = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
    );

    // Check if already logged today
    const existingLogin = await Login.findOne({
      userId: req.user.id,
      date: today,
    });

    if (existingLogin) {
      return res.status(200).json({
        message: "Already logged today",
        alreadyLogged: true,
      });
    }

    // Create new login record
    const login = new Login({
      userId: req.user.id,
      date: today,
    });

    await login.save();

    res.status(201).json({
      message: "Login tracked",
      alreadyLogged: false,
      login,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ============================================================================
// GET TOTAL LOGIN DAYS
// ============================================================================
/**
 * GET /api/logins/count
 *
 * Purpose: Get total number of days user has logged in
 *
 * Authentication: Required (JWT token)
 *
 * Response:
 * - 200: { totalLoginDays: number } - Total count of login days
 * - 500: Server error
 *
 * Calculation:
 * - Counts all login records for authenticated user
 * - Each record represents one unique day
 * - Returns total count
 *
 * Usage:
 * - Displayed on dashboard as engagement metric
 * - Shows user activity over time
 * - Useful for "Days Active" statistics
 *
 * Example Response:
 * {
 *   "totalLoginDays": 45
 * }
 */
router.get("/count", protect, async (req, res) => {
  try {
    const count = await Login.countDocuments({
      userId: req.user.id,
    });

    res.status(200).json({ totalLoginDays: count });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
