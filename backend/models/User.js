/**
 * ============================================================================
 * USER MODEL (MONGOOSE SCHEMA)
 * ============================================================================
 *
 * Purpose:
 * - Defines the User data structure for MongoDB
 * - Represents registered users of the Habit Tracker application
 * - Stores authentication credentials and profile information
 *
 * Schema Fields:
 * - name: User's full name (required)
 * - email: Unique email address for login (required, unique index)
 * - password: Hashed password using bcrypt (required, never plain text)
 * - profilePicture: Base64 encoded image string (optional, default: empty)
 * - createdAt: Timestamp when user registered (auto-generated)
 * - updatedAt: Timestamp when user last updated profile (auto-generated)
 *
 * Security Features:
 * - Email uniqueness enforced at database level
 * - Password stored as bcrypt hash (10 salt rounds)
 * - Password excluded from API responses using .select("-password")
 *
 * Relationships:
 * - One User → Many Habits (one-to-many)
 * - One User → Many Check-ins (one-to-many)
 * - One User → Many Login records (one-to-many)
 *
 * Timestamps:
 * - Automatically adds createdAt and updatedAt fields
 * - Updated automatically by Mongoose on document changes
 *
 * Collection Name:
 * - MongoDB collection: "users" (Mongoose automatically pluralizes)
 *
 * Usage:
 * - User registration: Create new user with hashed password
 * - User login: Find by email, compare password hash
 * - Profile management: Update name and profile picture
 *
 * Author: John Denis Nyagah
 * ============================================================================
 */

import mongoose from "mongoose";

/**
 * User Schema Definition
 *
 * Defines the structure and validation rules for user documents in MongoDB
 */
const userSchema = new mongoose.Schema(
  {
    // User's full name (displayed in profile and dashboard)
    name: {
      type: String,
      required: true,
    },

    // Email address (used for login, must be unique)
    email: {
      type: String,
      required: true,
      unique: true, // Creates unique index in MongoDB
    },

    // Hashed password (bcrypt with 10 salt rounds)
    // Never stored in plain text for security
    password: {
      type: String,
      required: true,
    },

    // Profile picture (base64 encoded image string)
    // Stored directly in database (no external file storage)
    // Max size validated in API routes (5MB limit)
    profilePicture: {
      type: String,
      default: "", // Empty string if no picture uploaded
    },
  },
  {
    // Automatically manage createdAt and updatedAt timestamps
    timestamps: true,
  }
);

/**
 * Export User Model
 *
 * Creates a Mongoose model named "User" from the schema
 * MongoDB collection name will be "users" (automatically pluralized)
 *
 * Usage:
 * - User.create() - Create new user
 * - User.findOne() - Find user by criteria
 * - User.findById() - Find user by ID
 * - User.findByIdAndUpdate() - Update user
 * - User.findByIdAndDelete() - Delete user
 */
export default mongoose.model("User", userSchema);
