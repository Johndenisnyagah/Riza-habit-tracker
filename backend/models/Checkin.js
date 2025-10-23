/**
 * ============================================================================
 * CHECK-IN MODEL (MONGOOSE SCHEMA)
 * ============================================================================
 *
 * Purpose:
 * - Defines the Check-in data structure for MongoDB
 * - Records daily habit completions
 * - Enables streak calculations and progress tracking
 *
 * Schema Fields:
 * - habitId: Reference to the habit that was completed (required)
 * - userId: Reference to user who completed the habit (required)
 * - date: Date of completion, normalized to midnight UTC (required)
 * - completed: Boolean flag, always true for existing check-ins (default: true)
 *
 * Check-in Logic:
 * - One check-in per habit per day
 * - Toggling: If exists, delete it; if doesn't exist, create it
 * - Date normalized to 00:00:00 UTC to prevent timezone issues
 *
 * Data Relationships:
 * - Many Check-ins → One Habit (many-to-one)
 * - Many Check-ins → One User (many-to-one)
 * - Used for: Streak calculation, progress charts, completion statistics
 *
 * Date Normalization:
 * - All dates stored as midnight UTC
 * - Example: 2025-01-15T00:00:00.000Z
 * - Prevents duplicate check-ins on same calendar day
 * - Ensures consistent behavior across timezones
 *
 * Streak Calculation:
 * - Sort check-ins by date descending
 * - Count consecutive days backwards from most recent
 * - Break streak when gap > 1 day found
 *
 * Collection Name:
 * - MongoDB collection: "checkins" (Mongoose automatically pluralizes)
 *
 * Usage:
 * - Toggle completion: Create or delete check-in for today
 * - Get check-ins: Fetch all check-ins for a habit
 * - Calculate streak: Count consecutive days
 * - Generate charts: Group check-ins by week/month
 *
 * Author: John Denis Nyagah
 * ============================================================================
 */

import mongoose from "mongoose";

/**
 * Check-in Schema Definition
 *
 * Defines the structure and validation rules for check-in documents in MongoDB
 */
const checkinSchema = new mongoose.Schema({
  // Reference to the habit that was completed
  // Links check-in to specific habit
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Habit",
    required: true,
  },

  // Reference to the user who completed the habit
  // Enables filtering check-ins by user
  // Ensures data isolation between users
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Date of completion (normalized to midnight UTC)
  // Format: YYYY-MM-DDT00:00:00.000Z
  // Example: 2025-10-23T00:00:00.000Z
  // Prevents duplicate check-ins for same day
  date: {
    type: Date,
    required: true,
  },

  // Completion status flag
  // Always true for existing check-ins
  // Toggle behavior: Delete entire document to mark as incomplete
  completed: {
    type: Boolean,
    default: true,
  },
});

/**
 * Export Check-in Model
 *
 * Creates a Mongoose model named "Checkin" from the schema
 * MongoDB collection name will be "checkins" (automatically pluralized)
 *
 * Usage:
 * - Checkin.create() - Record habit completion
 * - Checkin.findOne({ habitId, userId, date }) - Check if completed today
 * - Checkin.find({ habitId, userId }).sort({ date: -1 }) - Get completion history
 * - Checkin.deleteOne({ _id }) - Remove check-in (toggle off)
 * - Checkin.deleteMany({ habitId }) - Cascading delete when habit removed
 *
 * Common Queries:
 * - Today's check-ins: Find by userId and today's date
 * - Habit history: Find by habitId, sort by date descending
 * - Streak calculation: Find by habitId, check consecutive dates
 * - Weekly progress: Aggregate check-ins by week
 */
export default mongoose.model("Checkin", checkinSchema);
