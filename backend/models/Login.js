/**
 * ============================================================================
 * LOGIN MODEL (MONGOOSE SCHEMA)
 * ============================================================================
 *
 * Purpose:
 * - Defines the Login tracking data structure for MongoDB
 * - Records daily user login activity
 * - Enables engagement metrics and statistics
 *
 * Schema Fields:
 * - userId: Reference to the user who logged in (required)
 * - date: Date of login, normalized to midnight UTC (required)
 *
 * Unique Constraint:
 * - Composite unique index on (userId + date)
 * - Ensures only one login record per user per day
 * - Prevents duplicate entries for same day
 *
 * Data Tracking:
 * - One record per user per day (regardless of login count)
 * - First login of the day creates record
 * - Subsequent logins on same day return existing record
 * - Used for "Days Active" metric on dashboard
 *
 * Date Normalization:
 * - All dates stored as midnight UTC
 * - Example: 2025-01-15T00:00:00.000Z
 * - Prevents duplicate records across timezones
 *
 * Use Cases:
 * - User engagement tracking: Total days active
 * - Login streak calculation: Consecutive login days
 * - Activity analytics: Login patterns over time
 * - Motivation: Show user consistency
 *
 * Collection Name:
 * - MongoDB collection: "logins" (Mongoose automatically pluralizes)
 *
 * Relationships:
 * - Many Login records → One User (many-to-one)
 *
 * Index Benefits:
 * - Fast lookup: Check if user logged in today
 * - Uniqueness enforced: Prevents duplicates at database level
 * - Efficient queries: Count total login days per user
 *
 * Usage:
 * - Track login: Create record when user logs in
 * - Check today: See if user already has record for today
 * - Count days: Total number of login records for user
 * - Calculate streak: Count consecutive login days
 *
 * Author: John Denis Nyagah
 * ============================================================================
 */

import mongoose from "mongoose";

/**
 * Login Schema Definition
 *
 * Defines the structure and validation rules for login tracking documents
 */
const loginSchema = new mongoose.Schema({
  // Reference to the user who logged in
  // Links login record to specific user account
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Date of login (normalized to midnight UTC)
  // Format: YYYY-MM-DDT00:00:00.000Z
  // Example: 2025-10-23T00:00:00.000Z
  // Only one record per user per date allowed
  date: {
    type: Date,
    required: true,
  },
});

/**
 * Composite Unique Index
 *
 * Purpose: Ensure one login record per user per day
 *
 * Index Structure:
 * - Field 1: userId (ascending)
 * - Field 2: date (ascending)
 * - Constraint: unique = true
 *
 * Benefits:
 * - Prevents duplicate login records for same user and date
 * - Fast queries: "Did user log in today?"
 * - Efficient aggregation: Count total login days
 *
 * Example Scenarios:
 * - User logs in at 8:00 AM: Record created
 * - User logs in again at 3:00 PM: No new record (same date)
 * - User logs in next day: New record created
 */
loginSchema.index({ userId: 1, date: 1 }, { unique: true });

/**
 * Export Login Model
 *
 * Creates a Mongoose model named "Login" from the schema
 * MongoDB collection name will be "logins" (automatically pluralized)
 *
 * Usage:
 * - Login.create() - Track new login (fails if already exists for today)
 * - Login.findOne({ userId, date }) - Check if user logged in on specific date
 * - Login.countDocuments({ userId }) - Get total login days for user
 * - Login.find({ userId }).sort({ date: -1 }) - Get login history
 * - Login.deleteMany({ userId }) - Cascading delete when user account removed
 *
 * Common Queries:
 * - Today's login: Find by userId and today's date
 * - Total days active: Count documents for userId
 * - Login streak: Find consecutive dates backwards
 * - Monthly activity: Aggregate logins by month
 */
const Login = mongoose.model("Login", loginSchema);

export default Login;
