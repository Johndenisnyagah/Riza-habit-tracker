/* =========================================================
   RIZA HABIT TRACKER | AUTHENTICATION SCRIPT
   
   Purpose: Handles user login and registration functionality
   
   Features:
   - User login with email and password
   - New user registration with validation
   - Password strength validation (minimum 6 characters)
   - Password confirmation matching
   - Smooth card switching animations
   - Loading states during API calls
   - Error handling and user feedback
   - Automatic redirect after successful authentication
   
   Data Flow:
   - Form data sent to MongoDB via backend API
   - JWT token received and stored in localStorage
   - User redirected to dashboard on success
   
   Dependencies:
   - api.js (Backend API communication functions)
   
   Author: John Denis Kirungia Nyagah
   ========================================================= */

import { loginUser, registerUser } from "../shared/api.js";

/* =========================================================
   FORM SUBMISSION HANDLERS
   ========================================================= */

/**
 * Handles login form submission
 *
 * Process:
 * 1. Validates email and password fields
 * 2. Shows loading state on submit button
 * 3. Calls backend API to authenticate user
 * 4. Stores JWT token in localStorage
 * 5. Redirects to dashboard on success
 * 6. Shows error message on failure
 *
 * @param {Event} e - Form submit event
 *
 * API Endpoint: POST /api/auth/login
 */
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  // Simple validation
  if (!email || !password) {
    alert("Please fill in all fields");
    return;
  }

  try {
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Logging in...";
    submitBtn.disabled = true;

    // Call API (sends credentials to backend)
    const response = await loginUser(email, password);

    console.log("Login successful:", response.user.name);
    alert(`Welcome back, ${response.user.name}!`);

    // Redirect to dashboard
    window.location.href = "/frontend/dashboard/dashboard.html";
  } catch (error) {
    alert(error.message || "Login failed. Please check your credentials.");
    console.error("Login error:", error);

    // Reset button state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.textContent = "Login";
    submitBtn.disabled = false;
  }
}

/**
 * Handles signup form submission
 *
 * Validation Rules:
 * - All fields required
 * - Password minimum 6 characters
 * - Password and confirm password must match
 * - Email must be unique (checked by backend)
 *
 * Process:
 * 1. Validates all input fields
 * 2. Shows loading state on submit button
 * 3. Calls backend API to create user account
 * 4. Creates user document in MongoDB
 * 5. Switches to login card on success
 * 6. Shows error message on failure (e.g., duplicate email)
 *
 * @param {Event} e - Form submit event
 *
 * API Endpoint: POST /api/auth/register
 */
async function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById("signup-name")?.value || "User";
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  // Validation: Check all fields filled
  if (!email || !password || !confirmPassword) {
    alert("Please fill in all fields");
    return;
  }

  // Validation: Check passwords match
  if (password !== confirmPassword) {
    alert("Passwords don't match");
    return;
  }

  // Validation: Check password length
  if (password.length < 6) {
    alert("Password must be at least 6 characters long");
    return;
  }

  try {
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Creating account...";
    submitBtn.disabled = true;

    // Call API (creates user in MongoDB)
    await registerUser(name, email, password);

    console.log("Signup successful");
    alert("Account created successfully! Please login.");

    // Switch to login form
    switchCard("login");

    // Reset button and form
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
    e.target.reset(); // Clear all form fields
  } catch (error) {
    alert(error.message || "Signup failed. Email might already be in use.");
    console.error("Signup error:", error);

    // Reset button state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.textContent = "Sign Up";
    submitBtn.disabled = false;
  }
}

/* =========================================================
   CARD SWITCHING FUNCTION
   ========================================================= */

/**
 * Switches between login and signup cards with smooth animation
 *
 * Animation Process:
 * - Outgoing card slides out (left or right)
 * - Incoming card slides in from opposite direction
 * - Animation duration: 600ms
 * - CSS classes applied for smooth transitions
 *
 * @param {string} type - Either "login" or "signup"
 */
function switchCard(type) {
  const loginCard = document.getElementById("login-card");
  const signupCard = document.getElementById("signup-card");

  if (type === "signup") {
    // Switch from login to signup
    loginCard.classList.remove("active");
    loginCard.classList.add("slide-out-left");
    signupCard.classList.add("active", "slide-in-right");

    // Clean up animation classes after transition
    setTimeout(() => {
      loginCard.classList.remove("slide-out-left");
      signupCard.classList.remove("slide-in-right");
    }, 600);
  } else {
    // Switch from signup to login
    signupCard.classList.remove("active");
    signupCard.classList.add("slide-out-right");
    loginCard.classList.add("active", "slide-in-left");

    // Clean up animation classes after transition
    setTimeout(() => {
      signupCard.classList.remove("slide-out-right");
      loginCard.classList.remove("slide-in-left");
    }, 600);
  }
}

/* =========================================================
   EVENT LISTENERS AND INITIALIZATION
   ========================================================= */

/**
 * Initialize page on DOM load
 *
 * Setup:
 * 1. Attach click handlers to card switching links
 * 2. Check URL parameters for initial card display
 * 3. Attach form submit handlers for login/signup
 *
 * URL Parameters:
 * - ?mode=signup - Shows signup card on load
 * - ?mode=login - Shows login card on load (default)
 */
document.addEventListener("DOMContentLoaded", () => {
  // Button / Link elements for card switching
  const goSignup = document.getElementById("go-signup");
  const goLogin = document.getElementById("go-login");

  // Add click event listeners for navigation between cards
  goSignup.addEventListener("click", (e) => {
    e.preventDefault();
    switchCard("signup");
  });

  goLogin.addEventListener("click", (e) => {
    e.preventDefault();
    switchCard("login");
  });

  // Load initial card based on URL query parameter
  // Example: signin_signup.html?mode=signup
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");
  if (mode === "signup") switchCard("signup");

  // Form submission event listeners
  const loginForm = document.querySelector("#login-card form");
  const signupForm = document.querySelector("#signup-card form");

  loginForm.addEventListener("submit", handleLogin);
  signupForm.addEventListener("submit", handleSignup);
});
