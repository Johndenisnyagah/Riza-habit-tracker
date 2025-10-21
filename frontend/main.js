/* =========================================================
   RIZA MAIN.JS
   - Dynamically loads shared sidebar component
   - Handles mobile sidebar toggle & overlay (≤768px)
   - Highlights current active page link
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const sidebarContainer = document.getElementById("sidebar-container");
  if (!sidebarContainer) return;

  // Load sidebar HTML
  fetch("/frontend/components/sidebar.html")
    .then((response) => {
      if (!response.ok) throw new Error("Failed to load sidebar.");
      return response.text();
    })
    .then((html) => {
      sidebarContainer.innerHTML = html;
      setupSidebarStyles();
      initializeSidebarBehavior();
      highlightCurrentPageLink();
    })
    .catch((error) => console.error("Sidebar load error:", error));
});

// Ensure sidebar styles are properly applied
function setupSidebarStyles() {
  const cssHref = "/frontend/components/sidebar.css";
  const preload = document.querySelector(
    `link[rel="preload"][href="${cssHref}"]`
  );

  // If CSS was preloaded, convert it to a stylesheet
  if (preload && preload.getAttribute("as") === "style") {
    preload.rel = "stylesheet";
  }
  // Otherwise create a new stylesheet link if it doesn't exist
  else if (
    !document.querySelector(`link[rel="stylesheet"][href="${cssHref}"]`)
  ) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssHref;
    document.head.appendChild(link);
  }
}

// Initialize sidebar behavior (mobile toggle, etc)
function initializeSidebarBehavior() {
  const menuToggle = document.querySelector(".menu-toggle");
  const sidebar = document.querySelector(".sidebar");

  // Create overlay for mobile view
  let overlay = document.querySelector(".overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.classList.add("overlay");
    document.body.appendChild(overlay);
  }

  // Toggle sidebar on mobile
  const handleSidebarToggle = () => {
    if (window.innerWidth <= 768) {
      sidebar.classList.toggle("active");
      overlay.classList.toggle("show");
      document.body.classList.toggle(
        "no-scroll",
        sidebar.classList.contains("active")
      );
    }
  };

  // Close sidebar function
  const closeSidebar = () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("show");
    document.body.classList.remove("no-scroll");
  };

  // Event listeners
  if (menuToggle) {
    menuToggle.addEventListener("click", handleSidebarToggle);
  }
  overlay.addEventListener("click", closeSidebar);
  document.querySelectorAll(".nav-links a, .logout a").forEach((link) => {
    link.addEventListener("click", closeSidebar);
  });

  // Responsive behavior
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      closeSidebar();
    }
  });
}

// Highlight the current page in the navigation
function highlightCurrentPageLink() {
  const currentPage = window.location.pathname.split("/").pop();
  document.querySelectorAll(".nav-links a").forEach((link) => {
    if (link.getAttribute("href").includes(currentPage)) {
      link.classList.add("active");
    }
  });
}
