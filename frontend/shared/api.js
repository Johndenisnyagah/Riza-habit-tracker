/**
 * ============================================================================
 * API MODULE - Centralized HTTP Request Handler
 * ============================================================================
 *
 * This module provides a clean interface for all backend communication.
 * All HTTP requests to the Express backend flow through this centralized API layer.
 *
 * @module api
 * @author John Denis Kirungia Nyagah
 *
 * API ENDPOINTS:
 * - Authentication: register, login, logout, changePassword, deleteAccount
 * - Profile Management: getUserProfile, updateUserProfile, updateProfilePicture
 * - Habits: getHabits, createHabit, updateHabit, deleteHabit
 * - Check-ins: toggleHabitCompletion, getCheckins, getHabitStreak
 * - Login Tracking: recordPageVisit, getTodayLoginCount
 *
 * ERROR HANDLING:
 * - All functions use try-catch blocks
 * - Console errors prefixed with ❌ for easy testing verification
 * - Success logs prefixed with ✅
 * - Data logs prefixed with 📊
 *
 * STORAGE STRATEGY:
 * - JWT tokens stored in localStorage under key 'token'
 * - User data cached in localStorage under key 'user'
 * - All data persisted to MongoDB via backend API
 *
 * BASE URL:
 * - Development: http://localhost:5000/api
 *
 * Author: John Denis Nyagah
 * ============================================================================
 */

const API_BASE_URL = "http://localhost:5000/api";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Retrieves the JWT token from localStorage
 * @returns {string|null} JWT token or null if not found
 */
function getToken() {
  return localStorage.getItem("token");
}

/**
 * Constructs authorization headers for authenticated requests
 * @returns {Object} Headers object with Content-Type and Authorization
 */
function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

/**
 * Register a new user account
 * @param {string} name - User's full name
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} Response with user data and token
 */
export async function registerUser(name, email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      console.log("✅ User registered successfully");
    }
    return data;
  } catch (error) {
    console.error("❌ Registration error:", error);
    throw error;
  }
}

/**
 * Login an existing user
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} Response with user data and token
 */
export async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      console.log("✅ User logged in successfully");
    }
    return data;
  } catch (error) {
    console.error("❌ Login error:", error);
    throw error;
  }
}

/**
 * Logout the current user
 * Clears all authentication data from localStorage
 */
export function logoutUser() {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    console.log("✅ User logged out successfully");
  } catch (error) {
    console.error("❌ Logout error:", error);
    throw error;
  }
}

/**
 * Change user password
 * @param {string} currentPassword - User's current password
 * @param {string} newPassword - User's new password
 * @returns {Promise<Object>} Response message
 */
export async function changePassword(currentPassword, newPassword) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await response.json();
    console.log("✅ Password changed successfully");
    return data;
  } catch (error) {
    console.error("❌ Password change error:", error);
    throw error;
  }
}

/**
 * Delete user account permanently
 * @returns {Promise<Object>} Response message
 */
export async function deleteAccount() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/delete-account`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (response.ok) {
      logoutUser();
      console.log("✅ Account deleted successfully");
    }
    return data;
  } catch (error) {
    console.error("❌ Account deletion error:", error);
    throw error;
  }
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has valid token
 */
export function isAuthenticated() {
  return !!getToken();
}

// ============================================================================
// USER PROFILE ENDPOINTS
// ============================================================================

/**
 * Get current user profile data
 * @returns {Promise<Object>} User profile data
 */
export async function getUserProfile() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    console.log("✅ User profile fetched:", data);
    return data;
  } catch (error) {
    console.error("❌ Get profile error:", error);
    throw error;
  }
}

/**
 * Update user profile information
 * @param {Object} updates - Profile fields to update
 * @returns {Promise<Object>} Updated user profile
 */
export async function updateUserProfile(updates) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("user", JSON.stringify(data.user));
      console.log("✅ Profile updated successfully");
    }
    return data;
  } catch (error) {
    console.error("❌ Update profile error:", error);
    throw error;
  }
}

/**
 * Update user profile picture
 * @param {string} profilePicture - Base64 encoded image data
 * @returns {Promise<Object>} Updated user profile
 */
export async function updateProfilePicture(profilePicture) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile-picture`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ profilePicture }),
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("user", JSON.stringify(data.user));
      console.log("✅ Profile picture updated successfully");
    }
    return data;
  } catch (error) {
    console.error("❌ Update profile picture error:", error);
    throw error;
  }
}

// ============================================================================
// HABIT MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * Get all habits for current user
 * @returns {Promise<Array>} Array of habit objects
 */
export async function getHabits() {
  try {
    const response = await fetch(`${API_BASE_URL}/habits`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    console.log("✅ Habits fetched:", data);
    return data;
  } catch (error) {
    console.error("❌ Get habits error:", error);
    throw error;
  }
}

/**
 * Create a new habit
 * @param {Object} habitData - Habit creation data
 * @returns {Promise<Object>} Created habit object
 */
export async function createHabit(habitData) {
  try {
    const response = await fetch(`${API_BASE_URL}/habits`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(habitData),
    });
    const data = await response.json();
    console.log("✅ Habit created successfully:", data);
    return data;
  } catch (error) {
    console.error("❌ Create habit error:", error);
    throw error;
  }
}

/**
 * Update an existing habit
 * @param {string} habitId - ID of habit to update
 * @param {Object} updates - Habit fields to update
 * @returns {Promise<Object>} Updated habit object
 */
export async function updateHabit(habitId, updates) {
  try {
    const response = await fetch(`${API_BASE_URL}/habits/${habitId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    console.log("✅ Habit updated successfully:", data);
    return data;
  } catch (error) {
    console.error("❌ Update habit error:", error);
    throw error;
  }
}

/**
 * Delete a habit permanently
 * @param {string} habitId - ID of habit to delete
 * @returns {Promise<Object>} Deletion confirmation message
 */
export async function deleteHabit(habitId) {
  try {
    const response = await fetch(`${API_BASE_URL}/habits/${habitId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    console.log("✅ Habit deleted successfully");
    return data;
  } catch (error) {
    console.error("❌ Delete habit error:", error);
    throw error;
  }
}

// ============================================================================
// CHECK-IN ENDPOINTS
// ============================================================================

/**
 * Toggle habit completion for a specific date
 * @param {string} habitId - ID of habit
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object>} Check-in record
 */
export async function toggleHabitCompletion(habitId, date) {
  try {
    const response = await fetch(`${API_BASE_URL}/checkins/toggle`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ habitId, date }),
    });
    const data = await response.json();
    console.log("✅ Habit completion toggled:", data);
    return data;
  } catch (error) {
    console.error("❌ Toggle habit completion error:", error);
    throw error;
  }
}

/**
 * Get check-ins for a habit within date range
 * @param {string} habitId - ID of habit
 * @param {string} startDate - (Optional) Start date in YYYY-MM-DD format
 * @param {string} endDate - (Optional) End date in YYYY-MM-DD format
 * @returns {Promise<Array>} Array of check-in records
 */
export async function getCheckins(habitId, startDate, endDate) {
  try {
    let url = `${API_BASE_URL}/checkins/${habitId}`;

    // Add query parameters only if dates are provided
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    console.log("✅ Check-ins fetched:", data);
    return data;
  } catch (error) {
    console.error("❌ Get check-ins error:", error);
    throw error;
  }
}

/**
 * Get current streak for a habit
 * @param {string} habitId - ID of habit
 * @returns {Promise<Object>} Streak data with current and longest streaks
 */
export async function getHabitStreak(habitId) {
  try {
    const response = await fetch(`${API_BASE_URL}/checkins/${habitId}/streak`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    console.log("✅ Streak data fetched:", data);
    return data;
  } catch (error) {
    console.error("❌ Get streak error:", error);
    throw error;
  }
}

// ============================================================================
// LOGIN TRACKING ENDPOINTS
// ============================================================================

/**
 * Record a page visit/login for the current user
 * @returns {Promise<Object>} Login record
 */
export async function recordPageVisit() {
  try {
    const response = await fetch(`${API_BASE_URL}/logins/record`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    console.log("✅ Page visit recorded:", data);
    return data;
  } catch (error) {
    console.error("❌ Record page visit error:", error);
    throw error;
  }
}

/**
 * Get today's login count for current user
 * @returns {Promise<number>} Number of logins today
 */
export async function getTodayLoginCount() {
  try {
    const response = await fetch(`${API_BASE_URL}/logins/today`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    console.log("✅ Today login count:", data.count);
    return data.count;
  } catch (error) {
    console.error("❌ Get today login count error:", error);
    throw error;
  }
}

/**
 * Track daily login for the current user
 * Only counts once per day (creates record in MongoDB)
 * @returns {Promise<Object>} Login tracking result
 */
export async function trackDailyLogin() {
  try {
    const response = await fetch(`${API_BASE_URL}/logins/track`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    console.log("✅ Daily login tracked:", data);
    return data;
  } catch (error) {
    console.error("❌ Track daily login error:", error);
    throw error;
  }
}

/**
 * Get total number of unique login days for current user
 * @returns {Promise<Object>} Object with totalLoginDays count
 */
export async function getTotalLoginDays() {
  try {
    const response = await fetch(`${API_BASE_URL}/logins/count`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    console.log("✅ Total login days fetched:", data);
    return data;
  } catch (error) {
    console.error("❌ Get total login days error:", error);
    throw error;
  }
}
