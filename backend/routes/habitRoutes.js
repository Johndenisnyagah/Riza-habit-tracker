/**
 * ============================================================================
 * HABIT ROUTES
 * ============================================================================
 *
 * Purpose:
 * - Handles all CRUD operations for user habits
 * - Each habit belongs to a specific user (isolated by userId)
 * - All routes are protected and require JWT authentication
 *
 * Routes:
 * - GET    /api/habits     → Get all habits for logged-in user
 * - POST   /api/habits     → Create a new habit
 * - PUT    /api/habits/:id → Update existing habit
 * - DELETE /api/habits/:id → Delete habit
 *
 * Habit Properties:
 * - name: string (habit name/title)
 * - description: string (habit description/notes)
 * - frequency: string (daily, weekly, custom)
 * - customDays: array (for custom frequency - specific weekdays)
 * - icon: string (SVG filename from habit-icons folder)
 * - userId: ObjectId (links habit to user)
 *
 * Security:
 * - All routes protected with JWT authentication middleware
 * - Users can only access/modify their own habits
 * - userId automatically extracted from JWT token
 *
 * Author: John Denis Nyagah
 * ============================================================================
 */

import express from "express";
import Habit from "../models/Habit.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ============================================================================
// CREATE NEW HABIT
// ============================================================================
/**
 * POST /api/habits
 *
 * Purpose: Create a new habit for the authenticated user
 *
 * Authentication: Required (JWT token)
 *
 * Request Body:
 * - name: string (required, habit name)
 * - description: string (optional, habit description)
 * - frequency: string (optional, default: "daily")
 * - customDays: array (optional, for custom frequency)
 * - icon: string (optional, default: "target.svg")
 *
 * Response:
 * - 201: Habit created successfully with habit data
 * - 500: Server error
 *
 * Default Values:
 * - frequency defaults to "daily" if not provided
 * - icon defaults to "target.svg" if not provided
 * - userId automatically set from JWT token
 */
router.post("/", protect, async (req, res) => {
  try {
    const { name, description, frequency, customDays, icon } = req.body;
    const habit = new Habit({
      userId: req.user.id,
      name,
      description,
      frequency: frequency || "daily",
      customDays: customDays || [],
      icon: icon || "target.svg",
    });
    await habit.save();
    res.status(201).json({ message: "Habit created", habit });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ============================================================================
// GET ALL USER HABITS
// ============================================================================
/**
 * GET /api/habits
 *
 * Purpose: Retrieve all habits for the authenticated user
 *
 * Authentication: Required (JWT token)
 *
 * Response:
 * - 200: Array of habit objects
 * - 500: Server error
 *
 * Data Isolation:
 * - Only returns habits where userId matches authenticated user
 * - Other users' habits are never accessible
 * - Returns empty array if user has no habits
 */
router.get("/", protect, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user.id });
    res.status(200).json(habits);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ============================================================================
// UPDATE HABIT
// ============================================================================
/**
 * PUT /api/habits/:id
 *
 * Purpose: Update an existing habit
 *
 * Authentication: Required (JWT token)
 *
 * URL Parameters:
 * - id: string (MongoDB ObjectId of the habit)
 *
 * Request Body:
 * - name: string (updated habit name)
 * - description: string (updated description)
 * - frequency: string (updated frequency)
 * - customDays: array (updated custom days)
 * - icon: string (updated icon filename)
 *
 * Response:
 * - 200: Habit updated successfully with updated data
 * - 404: Habit not found or doesn't belong to user
 * - 500: Server error
 *
 * Security:
 * - Query includes both habit ID and userId
 * - Prevents users from updating other users' habits
 * - Returns 404 if habit doesn't exist or user doesn't own it
 */
router.put("/:id", protect, async (req, res) => {
  try {
    const { name, description, frequency, customDays, icon } = req.body;
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { name, description, frequency, customDays, icon },
      { new: true }
    );
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }
    res.status(200).json({ message: "Habit updated", habit });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ============================================================================
// DELETE HABIT
// ============================================================================
/**
 * DELETE /api/habits/:id
 *
 * Purpose: Delete a habit permanently
 *
 * Authentication: Required (JWT token)
 *
 * URL Parameters:
 * - id: string (MongoDB ObjectId of the habit)
 *
 * Response:
 * - 200: Habit deleted successfully
 * - 404: Habit not found or doesn't belong to user
 * - 500: Server error
 *
 * Security:
 * - Query includes both habit ID and userId
 * - Prevents users from deleting other users' habits
 * - Returns 404 if habit doesn't exist or user doesn't own it
 *
 * Note:
 * - Consider cascading deletion of related check-ins
 * - Currently check-ins may remain orphaned
 * - Future enhancement: Delete related check-ins when habit is deleted
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }
    res.status(200).json({ message: "Habit deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
