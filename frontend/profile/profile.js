/* =========================================================
   RIZA PROFILE PAGE SCRIPT
   - Populates user info
   - Handles interactions: edit, logout, delete
   - Profile picture upload functionality
   ========================================================= */

// ===================== USER DATA =====================
const user = {
  name: "Sophie M.",
  email: "sophie@example.com",
  joined: "March 2025",
};

// ===================== POPULATE UI =====================
document.getElementById("user-name").textContent = user.name;
document.getElementById("user-email").textContent = user.email;
document.querySelector(".joined-date").textContent = `Joined: ${user.joined}`;

// ===================== EVENT HANDLERS =====================
// Edit Profile
document.querySelector(".edit-btn").addEventListener("click", () => {
  alert("Edit profile feature coming soon 🌿");
});

// Profile Picture Upload
const profilePicInput = document.getElementById("profilePicInput");
const profilePic = document.getElementById("profilePic");
const uploadBtn = document.getElementById("uploadPicBtn");

// Load saved profile picture from localStorage
const savedProfilePic = localStorage.getItem("userProfilePic");
if (savedProfilePic) {
  profilePic.src = savedProfilePic;
}

// Trigger file input when edit icon is clicked
uploadBtn.addEventListener("click", () => {
  profilePicInput.click();
});

// Handle file selection
profilePicInput.addEventListener("change", (e) => {
  const file = e.target.files[0];

  if (file) {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file!");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB!");
      return;
    }

    // Read and display the image
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target.result;
      profilePic.src = imageData;

      // Save to localStorage
      localStorage.setItem("userProfilePic", imageData);

      // Show success message
      showNotification("Profile picture updated successfully! ✨");
    };
    reader.readAsDataURL(file);
  }
});

// Notification function
function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Change Password
document.querySelectorAll(".setting-btn")[0].addEventListener("click", () => {
  alert("Password update feature coming soon 🔒");
});

// Logout
document.querySelector(".logout-btn").addEventListener("click", () => {
  alert("You've been logged out successfully.");
  window.location.href = "../login/signin_signup.html";
});

// Delete Account
document.querySelector(".delete-btn").addEventListener("click", () => {
  if (
    confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    )
  ) {
    alert("Account deleted (simulation).");
  }
});
