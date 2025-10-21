/* =========================================================
   RIZA SIGN IN / SIGN UP PAGE SCRIPT
   Handles smooth slide transition between cards
   and initializes mode switching via URL parameter
   ========================================================= */

// =========================================================
//  FORM SUBMISSION HANDLERS
// =========================================================
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  // Simple validation
  if (!email || !password) {
    alert("Please fill in all fields");
    return;
  }

  console.log("Login attempt:", email);
  // Simulate successful login
  setTimeout(() => {
    window.location.href = "/frontend/dashboard/dashboard.html";
  }, 1000);
}

function handleSignup(e) {
  e.preventDefault();
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  // Simple validation
  if (!email || !password || !confirmPassword) {
    alert("Please fill in all fields");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords don't match");
    return;
  }

  console.log("Signup attempt:", email);
  // Simulate successful signup
  setTimeout(() => {
    window.location.href = "/frontend/dashboard/dashboard.html";
  }, 1000);
}

// =========================================================
//  CARD SWITCHING FUNCTION
// =========================================================
function switchCard(type) {
  const loginCard = document.getElementById("login-card");
  const signupCard = document.getElementById("signup-card");

  if (type === "signup") {
    loginCard.classList.remove("active");
    loginCard.classList.add("slide-out-left");
    signupCard.classList.add("active", "slide-in-right");

    setTimeout(() => {
      loginCard.classList.remove("slide-out-left");
      signupCard.classList.remove("slide-in-right");
    }, 600);
  } else {
    signupCard.classList.remove("active");
    signupCard.classList.add("slide-out-right");
    loginCard.classList.add("active", "slide-in-left");

    setTimeout(() => {
      signupCard.classList.remove("slide-out-right");
      loginCard.classList.remove("slide-in-left");
    }, 600);
  }
}

// =========================================================
//  EVENT LISTENERS AND INITIALIZATION
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
  // Button / Link elements
  const goSignup = document.getElementById("go-signup");
  const goLogin = document.getElementById("go-login");

  // Add click event listeners for navigation
  goSignup.addEventListener("click", (e) => {
    e.preventDefault();
    switchCard("signup");
  });

  goLogin.addEventListener("click", (e) => {
    e.preventDefault();
    switchCard("login");
  });

  // Load based on ?mode=signup or ?mode=login
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");
  if (mode === "signup") switchCard("signup");

  // Form submission event listeners
  const loginForm = document.querySelector("#login-card form");
  const signupForm = document.querySelector("#signup-card form");

  loginForm.addEventListener("submit", handleLogin);
  signupForm.addEventListener("submit", handleSignup);
});
