import { verifyEmail } from "../shared/api.js";

document.addEventListener("DOMContentLoaded", async () => {
  const statusContainer = document.getElementById("status-container");
  const backToLogin = document.getElementById("back-to-login");

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const email = params.get("email");

  if (!token || !email) {
    statusContainer.innerHTML = `
      <p class="error">Invalid verification link. Missing token or email.</p>
    `;
    backToLogin.style.display = "block";
    return;
  }

  try {
    await verifyEmail(email, token);
    statusContainer.innerHTML = `
      <p class="success">Your email has been verified successfully!</p>
      <p>You can now log in to your account.</p>
    `;
    backToLogin.style.display = "block";
  } catch (error) {
    statusContainer.innerHTML = `
      <p class="error">${error.message || "Verification failed. The link may be invalid or expired."}</p>
    `;
    backToLogin.style.display = "block";
  }
});
