/**
 * ============================================================================
 * HABIT MODEL (MONGOOSE SCHEMA)
 * ============================================================================
 *
 * Purpose:
 * - Defines the Habit data structure for MongoDB
 * - Represents user-created habits to track
 * - Stores habit configuration and metadata
 *
 * Schema Fields:
 * - userId: Reference to User who owns this habit (required, indexed)
 * - name: Habit name/title (required, e.g., "Morning Exercise")
 * - description: Optional habit description/notes
 * - frequency: How often habit should be done (daily/weekdays/weekends/custom)
 * - customDays: Array of days for custom frequency (e.g., ["Mon", "Wed", "Fri"])
 * - icon: SVG filename from habit-icons folder (default: "target.svg")
 * - streak: Current consecutive days streak (legacy field, calculated in routes)
 * - createdAt: Timestamp when habit was created
 *
 * Frequency Types:
 * - "daily": Every day of the week
 * - "weekdays": Monday through Friday
 * - "weekends": Saturday and Sunday
 * - "custom": Specific days defined in customDays array
 *
 * Data Isolation:
 * - Each habit belongs to exactly one user (userId reference)
 * - Users can only see/modify their own habits
 * - Enforced in API routes with userId filtering
 *
 * Relationships:
 * - Many Habits → One User (many-to-one)
 * - One Habit → Many Check-ins (one-to-many)
 *
 * Icon System:
 * - Icons stored as SVG files in frontend/assets/habit-icons/
 * - Only filename stored in database (e.g., "meditation.svg")
 * - Frontend builds full path when rendering
 *
 * Collection Name:
 * - MongoDB collection: "habits" (Mongoose automatically pluralizes)
 *
 * Usage:
 * - Create habit: User defines name, frequency, and icon
 * - Update habit: Change name, description, frequency, or icon
 * - Delete habit: Remove habit (consider cascading delete of check-ins)
 * - Filter habits: By frequency type or user
 *
 * Author: John Denis Nyagah
 * ============================================================================
 */

import mongoose from "mongoose";

/**
 * Habit Schema Definition
 *
 * Defines the structure and validation rules for habit documents in MongoDB
 */
const habitSchema = new mongoose.Schema({
  // Reference to the user who owns this habit
  // Enables data isolation and filtering
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Habit name (displayed in habit list and dashboard)
  // Example: "Morning Meditation", "Drink 8 Glasses of Water"
  name: {
    type: String,
    required: true,
  },

  // Optional description or notes about the habit
  // Example: "10 minutes of meditation before breakfast"
  description: {
    type: String,
  },

  // How often the habit should be performed
  // Enum ensures only valid frequency types can be stored
  frequency: {
    type: String,
    enum: ["daily", "weekdays", "weekends", "custom"],
    default: "daily",
  },

  // Array of day names for custom frequency
  // Only used when frequency is "custom"
  // Example: ["Mon", "Wed", "Fri"] for three times per week
  customDays: {
    type: [String],
    default: [],
  },

  // Icon filename from habit-icons folder
  // Example: "meditation.svg", "running.svg", "book.svg"
  // Frontend builds path: ../assets/habit-icons/{icon}
  icon: {
    type: String,
    default: "target.svg",
  },

  // Legacy field: Current streak count
  // Note: Streak now calculated dynamically from check-ins
  // Kept for backward compatibility
  streak: {
    type: Number,
    default: 0,
  },

  // Timestamp when habit was created
  // Used for sorting and analytics
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Export Habit Model
 *
 * Creates a Mongoose model named "Habit" from the schema
 * MongoDB collection name will be "habits" (automatically pluralized)
 *
 * Usage:
 * - Habit.create() - Create new habit
 * - Habit.find({ userId }) - Get all habits for a user
 * - Habit.findById() - Find habit by ID
 * - Habit.findByIdAndUpdate() - Update habit
 * - Habit.findByIdAndDelete() - Delete habit
 */
export default mongoose.model("Habit", habitSchema);
