/**
 * ============================================================================
 * CHECK-IN ROUTES
 * ============================================================================
 *
 * Purpose:
 * - Handles habit completion tracking (check-ins)
 * - Manages daily habit completion status
 * - Calculates habit streaks
 * - All routes are protected and require JWT authentication
 *
 * Routes:
 * - POST /api/checkins/toggle          → Toggle habit completion for today
 * - GET  /api/checkins/:habitId        → Get all check-ins for a habit
 * - GET  /api/checkins/:habitId/streak → Calculate current streak
 *
 * Check-in Properties:
 * - habitId: ObjectId (links to habit)
 * - userId: ObjectId (links to user)
 * - date: Date (normalized to midnight UTC)
 * - completed: Boolean (always true for existing check-ins)
 *
 * Date Handling:
 * - All dates normalized to midnight UTC for consistency
 * - Prevents duplicate check-ins for same day
 * - Ensures accurate streak calculations across timezones
 *
 * Security:
 * - All routes protected with JWT authentication
 * - Users can only check-in their own habits
 * - userId automatically extracted from JWT token
 *
 * Author: John Denis Nyagah
 * ============================================================================
 */

import express from "express";
import Checkin from "../models/Checkin.js";
import Habit from "../models/Habit.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ============================================================================
// TOGGLE HABIT CHECK-IN
// ============================================================================
/**
 * POST /api/checkins/toggle
 *
 * Purpose: Toggle habit completion for today (mark as done/undone)
 *
 * Authentication: Required (JWT token)
 *
 * Request Body:
 * - habitId: string (MongoDB ObjectId of the habit)
 *
 * Response:
 * - 200: Check-in removed (if already existed)
 * - 201: Check-in recorded (if didn't exist)
 * - 500: Server error
 *
 * Behavior:
 * - If check-in exists for today: Delete it (toggle off)
 * - If check-in doesn't exist: Create it (toggle on)
 * - Date normalized to midnight UTC for consistency
 *
 * Date Normalization:
 * - Creates date at 00:00:00 UTC to prevent timezone issues
 * - Ensures one check-in per day regardless of time
 * - Example: 2025-01-15T00:00:00.000Z
 */
router.post("/toggle", protect, async (req, res) => {
  try {
    const { habitId } = req.body;

    // Create today's date at midnight UTC for consistency
    const now = new Date();
    const today = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
    );

    // Check if this habit already has a check-in for today
    const existingCheckin = await Checkin.findOne({
      habitId,
      userId: req.user.id,
      date: today,
    });

    if (existingCheckin) {
      // If exists, delete it (toggle off)
      await Checkin.deleteOne({ _id: existingCheckin._id });
      return res.status(200).json({
        message: "Check-in removed",
        completed: false,
      });
    } else {
      // If doesn't exist, create it (toggle on)
      const checkin = new Checkin({
        habitId,
        userId: req.user.id,
        date: today,
        completed: true,
      });
      await checkin.save();
      return res.status(201).json({
        message: "Check-in recorded",
        completed: true,
        checkin,
      });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ============================================================================
// GET HABIT CHECK-INS
// ============================================================================
/**
 * GET /api/checkins/:habitId
 *
 * Purpose: Retrieve all check-ins for a specific habit
 *
 * Authentication: Required (JWT token)
 *
 * URL Parameters:
 * - habitId: string (MongoDB ObjectId of the habit)
 *
 * Response:
 * - 200: Array of check-in objects (sorted newest first)
 * - 500: Server error
 *
 * Security:
 * - Filters by both habitId and userId
 * - Prevents users from seeing other users' check-ins
 * - Returns empty array if no check-ins exist
 *
 * Sorting:
 * - Results sorted by date in descending order
 * - Most recent check-ins appear first
 * - Useful for displaying recent completion history
 */
router.get("/:habitId", protect, async (req, res) => {
  try {
    const checkins = await Checkin.find({
      habitId: req.params.habitId,
      userId: req.user.id,
    }).sort({ date: -1 });

    res.status(200).json(checkins);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ============================================================================
// CALCULATE HABIT STREAK
// ============================================================================
/**
 * GET /api/checkins/:habitId/streak
 *
 * Purpose: Calculate current consecutive day streak for a habit
 *
 * Authentication: Required (JWT token)
 *
 * URL Parameters:
 * - habitId: string (MongoDB ObjectId of the habit)
 *
 * Response:
 * - 200: { streak: number } - Current streak count
 * - 500: Server error
 *
 * Calculation Logic:
 * 1. Fetch all check-ins sorted newest to oldest
 * 2. Start with most recent check-in (streak = 1)
 * 3. Check if each previous check-in is exactly 1 day earlier
 * 4. Increment streak for each consecutive day
 * 5. Stop when gap > 1 day is found
 *
 * Edge Cases:
 * - No check-ins: Returns streak = 0
 * - Single check-in: Returns streak = 1
 * - Multiple same-day check-ins: Handled by date normalization
 *
 * Example:
 * - Check-ins: Jan 15, Jan 14, Jan 13, Jan 11
 * - Streak: 3 (stops at Jan 11 due to gap)
 */
router.get("/:habitId/streak", protect, async (req, res) => {
  try {
    const checkins = await Checkin.find({
      habitId: req.params.habitId,
      userId: req.user.id,
    }).sort({ date: -1 });

    if (checkins.length === 0) {
      return res.status(200).json({ streak: 0 });
    }

    // Normalize dates (ignore time)
    const normalize = (d) => new Date(d).setHours(0, 0, 0, 0);

    let streak = 1;
    let lastDate = normalize(checkins[0].date);

    for (let i = 1; i < checkins.length; i++) {
      const currentDate = normalize(checkins[i].date);
      const diffInDays = Math.floor(
        (lastDate - currentDate) / (1000 * 60 * 60 * 24)
      );

      if (diffInDays === 1) {
        streak++;
        lastDate = currentDate;
      } else if (diffInDays > 1) {
        break;
      }
    }

    res.status(200).json({ streak });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
