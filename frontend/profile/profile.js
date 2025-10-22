/* =========================================================
   PROFILE PAGE SCRIPT
   
   Purpose: Manages user profile page functionality including:
   - Loading and displaying user information from MongoDB
   - Profile editing (name update)
   - Profile picture upload with validation
   - Password change functionality
   - Account logout
   - Account deletion with confirmation
   
   Data Source: All user data fetched from MongoDB via backend API
   
   Author: John Denis Kirungia Nyagah
   ========================================================= */

/* =========================================================
   IMPORTS
   ========================================================= */
import {
  isAuthenticated,
  logoutUser,
  getUserProfile,
  changePassword,
  deleteAccount,
  updateUserProfile,
  updateProfilePicture,
} from "../shared/api.js";

/* =========================================================
   AUTHENTICATION CHECK
   ========================================================= */
// Verify user is logged in before accessing profile page
if (!isAuthenticated()) {
  alert("Please login to access your profile");
  window.location.href = "../login/signin_signup.html";
}

/* =========================================================
   GLOBAL VARIABLES
   ========================================================= */
// Store current user data
let user = null;

/* =========================================================
   USER PROFILE LOADING
   ========================================================= */

/**
 * Load user profile data from backend API
 * Populates UI elements with user information:
 * - Name
 * - Email
 * - Profile picture
 * - Join date (from createdAt timestamp)
 *
 * Data Source: MongoDB via /api/auth/profile
 * Test: Check console for profile fetch confirmation
 */
async function loadUserProfile() {
  try {
    const response = await getUserProfile();
    user = response.user; // Extract user object from API response

    // Populate UI elements with user data
    document.getElementById("user-name").textContent = user.name || "User";
    document.getElementById("user-email").textContent = user.email || "";

    // Load profile picture from backend (Base64 encoded)
    const profilePic = document.getElementById("profilePic");
    if (user.profilePicture) {
      profilePic.src = user.profilePicture;
      console.log("✅ Profile picture loaded");
    } else {
      console.log("⚠️ No profile picture found for user");
    }

    // Calculate and display join date from MongoDB timestamp
    if (user.createdAt) {
      const joinedDate = new Date(user.createdAt);
      const monthYear = joinedDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      document.querySelector(
        ".joined-date"
      ).textContent = `Joined: ${monthYear}`;
    } else {
      // Fallback for users created before timestamps were added
      document.querySelector(".joined-date").textContent = `Joined: Recently`;
    }

    console.log("✅ TEST: User profile loaded successfully");
  } catch (error) {
    console.error("❌ Failed to load user profile:", error);
    alert("Failed to load profile. Please try logging in again.");
    logoutUser();
    window.location.href = "../login/signin_signup.html";
  }
}

/* =========================================================
   PAGE INITIALIZATION
   ========================================================= */
// Initialize profile page when DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  loadUserProfile();
  console.log("📄 Profile page initialized");

  // Setup all event listeners after DOM is loaded
  setupEventListeners();
});

/* =========================================================
   EVENT HANDLERS - PROFILE MANAGEMENT
   ========================================================= */

/**
 * Setup all event listeners for profile page
 * Called after DOM is fully loaded
 */
function setupEventListeners() {
  // Edit Profile Name Button
  const editBtn = document.querySelector(".edit-btn");
  if (editBtn) {
    editBtn.addEventListener("click", handleEditProfile);
  }

  // Profile Picture Upload
  const uploadBtn = document.getElementById("uploadPicBtn");
  const profilePicInput = document.getElementById("profilePicInput");
  if (uploadBtn && profilePicInput) {
    uploadBtn.addEventListener("click", () => {
      profilePicInput.click();
    });
    profilePicInput.addEventListener("change", handleProfilePictureUpload);
  }

  // Change Password Button
  const changePasswordBtn = document.querySelectorAll(".setting-btn")[0];
  if (changePasswordBtn) {
    changePasswordBtn.addEventListener("click", handleChangePassword);
  }

  // Logout Button
  const logoutBtn = document.querySelector(".logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }

  // Delete Account Button
  const deleteBtn = document.querySelector(".delete-btn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", handleDeleteAccount);
  }

  console.log("✅ Event listeners attached");
}

/**
 * Edit Profile Name
 * Allows user to update their display name
 * Updates both UI and MongoDB backend
 *
 * Data Flow:
 * 1. User enters new name via prompt
 * 2. Frontend validates input
 * 3. API call to PUT /api/auth/profile
 * 4. MongoDB updates user document
 * 5. UI refreshes with new name
 */
async function handleEditProfile() {
  const newName = prompt("Enter your new name:", user.name);

  if (newName === null) {
    // User cancelled
    return;
  }

  if (!newName || newName.trim().length === 0) {
    alert("Name cannot be empty");
    return;
  }

  try {
    const response = await updateUserProfile({ name: newName.trim() });
    if (response.user) {
      user = response.user; // Update local user object
      document.getElementById("user-name").textContent = response.user.name;
      alert("Profile updated successfully! ✅");
    }
  } catch (error) {
    console.error("Profile update error:", error);
    alert("Failed to update profile. Please try again.");
  }
}

/**
 * Profile Picture Upload Handler
 * Handles image file selection, validation, and upload
 *
 * Validation:
 * - File type: Must be an image
 * - File size: Max 5MB
 *
 * Process:
 * 1. User selects image file
 * 2. File is validated
 * 3. Image converted to Base64
 * 4. Uploaded to MongoDB via API
 * 5. UI updates with new profile picture
 *
 * Data Source: Saved to MongoDB as Base64 string
 */
async function handleProfilePictureUpload(e) {
  const file = e.target.files[0];

  if (file) {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file!");
      return;
    }

    // Validate file size (max 5MB)
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
    if (file.size > 5 * 1024 * 1024) {
      alert(
        `Image size is ${fileSizeMB}MB. Please choose an image smaller than 5MB.\n\nTip: You can resize the image before uploading.`
      );
      return;
    }

    // Read and display the image
    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageData = event.target.result;

      try {
        // Upload to backend
        await updateProfilePicture(imageData);

        // Update UI
        const profilePic = document.getElementById("profilePic");
        profilePic.src = imageData;

        // Show success message
        showNotification("Profile picture updated successfully! ✨");
      } catch (error) {
        console.error("Profile picture upload error:", error);
        alert("Failed to update profile picture: " + error.message);
      }
    };
    reader.readAsDataURL(file);
  }
}

/**
 * Display notification message to user
 * Shows temporary notification at top of screen
 * Auto-dismisses after 3 seconds
 *
 * @param {string} message - Message to display
 */
function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  document.body.appendChild(notification);

  // Trigger animation
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/**
 * Change Password Handler
 * Allows user to update their password
 * Requires current password verification
 *
 * Validation:
 * - New password must be at least 6 characters
 * - Password confirmation must match
 *
 * Security:
 * - Current password verified by backend
 * - Passwords not stored in frontend
 * - API endpoint requires authentication
 */
async function handleChangePassword() {
  const currentPassword = prompt("Enter your current password:");
  if (!currentPassword) return;

  const newPassword = prompt("Enter your new password (min 6 characters):");
  if (!newPassword) return;

  if (newPassword.length < 6) {
    alert("Password must be at least 6 characters long!");
    return;
  }

  const confirmPassword = prompt("Confirm your new password:");
  if (confirmPassword !== newPassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const response = await changePassword(currentPassword, newPassword);
    if (response.message || response.success !== false) {
      showNotification("Password updated successfully! ✨");
    }
  } catch (error) {
    console.error("Password change error:", error);
    alert("Failed to change password. Please check your current password.");
  }
}

/**
 * Logout Handler
 * Logs user out and redirects to login page
 * Clears localStorage (token and cached user data)
 */
async function handleLogout() {
  if (confirm("Are you sure you want to logout?")) {
    logoutUser();
    window.location.href = "../login/signin_signup.html";
  }
}

/**
 * Delete Account Handler
 * PERMANENTLY deletes user account and all associated data
 *
 * Safety Features:
 * - Double confirmation required
 * - Must type "DELETE" to confirm
 * - Warns about permanent data loss
 *
 * Deletes:
 * - User account
 * - All habits
 * - All check-ins
 * - All login records
 * - Profile picture
 *
 * CANNOT BE UNDONE!
 */
async function handleDeleteAccount() {
  const confirmDelete = confirm(
    "⚠️ WARNING: This will permanently delete your account and ALL your habits and data.\n\nThis action CANNOT be undone.\n\nAre you absolutely sure?"
  );

  if (!confirmDelete) return;

  const finalConfirm = prompt(
    "Type 'DELETE' in capital letters to confirm account deletion:"
  );

  if (finalConfirm !== "DELETE") {
    alert("Account deletion cancelled.");
    return;
  }

  try {
    await deleteAccount();
    alert("Your account has been permanently deleted.");
    window.location.href = "../login/signin_signup.html";
  } catch (error) {
    alert(error.message || "Failed to delete account. Please try again.");
  }
}
