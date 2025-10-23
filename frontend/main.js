/* =========================================================
   RIZA HABIT TRACKER | MAIN APPLICATION LOADER
   
   Purpose: 
   - Dynamically loads shared sidebar navigation component
   - Handles mobile sidebar toggle and overlay functionality
   - Highlights current active page in navigation
   - Manages responsive behavior (mobile ≤768px)
   
   Used By: All authenticated pages
   - dashboard.html
   - habits.html
   - progress.html
   - profile.html
   
   Features:
   - Component-based sidebar loading
   - Mobile-first responsive design
   - Overlay backdrop for mobile menu
   - Active page link highlighting
   - Body scroll lock when sidebar open
   - Auto-close on resize to desktop
   
   Sidebar Behavior:
   - Desktop (>768px): Always visible, fixed left
   - Mobile (≤768px): Hidden by default, toggles with menu button
   - Overlay: Shown on mobile when sidebar active
   - Navigation click: Auto-closes sidebar on mobile
   
   DOM Elements Required:
   - #sidebar-container: Container for loaded sidebar HTML
   - .menu-toggle: Mobile menu button (in page header)
   
   Sidebar Component:
   - HTML: /frontend/components/sidebar.html
   - CSS: /frontend/components/sidebar.css
   
   Author: John Denis Nyagah
   ========================================================= */

/* =========================================================
   INITIALIZATION
   Purpose: Load sidebar when DOM is ready
   ========================================================= */

/**
 * Main initialization sequence
 *
 * Executes when DOM is fully loaded:
 * 1. Check if sidebar container exists
 * 2. Fetch sidebar HTML component
 * 3. Inject HTML into container
 * 4. Setup sidebar styles
 * 5. Initialize sidebar behavior (toggle, overlay)
 * 6. Highlight current page link
 *
 * Error Handling:
 * - Returns early if container not found
 * - Logs error if fetch fails
 * - Continues execution on error (graceful degradation)
 */
document.addEventListener("DOMContentLoaded", () => {
  const sidebarContainer = document.getElementById("sidebar-container");

  // Guard: Exit if sidebar container doesn't exist
  if (!sidebarContainer) return;

  // Fetch sidebar HTML component from server
  fetch("/frontend/components/sidebar.html")
    .then((response) => {
      if (!response.ok) throw new Error("Failed to load sidebar.");
      return response.text();
    })
    .then((html) => {
      // Inject sidebar HTML into container
      sidebarContainer.innerHTML = html;

      // Setup and initialize sidebar
      setupSidebarStyles(); // Ensure CSS is loaded
      initializeSidebarBehavior(); // Add event listeners
      highlightCurrentPageLink(); // Mark active page
    })
    .catch((error) => console.error("Sidebar load error:", error));
});

/* =========================================================
   SIDEBAR STYLES SETUP
   ========================================================= */

/**
 * Ensure sidebar CSS is properly loaded
 *
 * Purpose:
 * - Converts preloaded CSS to active stylesheet
 * - Creates stylesheet link if not preloaded
 * - Prevents duplicate CSS loading
 *
 * Algorithm:
 * 1. Check if CSS was preloaded in HTML
 * 2. If preloaded, convert to stylesheet
 * 3. If not preloaded, create new link element
 * 4. Ensure only one stylesheet link exists
 *
 * CSS Path: /frontend/components/sidebar.css
 *
 * Preload Example:
 * <link rel="preload" href="/frontend/components/sidebar.css" as="style">
 *
 * This function converts it to:
 * <link rel="stylesheet" href="/frontend/components/sidebar.css">
 */
function setupSidebarStyles() {
  const cssHref = "/frontend/components/sidebar.css";

  // Check for preloaded CSS link
  const preload = document.querySelector(
    `link[rel="preload"][href="${cssHref}"]`
  );

  // If CSS was preloaded, convert it to active stylesheet
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

/* =========================================================
   SIDEBAR BEHAVIOR INITIALIZATION
   ========================================================= */

/**
 * Initialize sidebar interactive behavior
 *
 * Purpose:
 * - Setup mobile menu toggle
 * - Create and manage overlay backdrop
 * - Handle sidebar open/close actions
 * - Manage body scroll lock
 * - Auto-close on window resize to desktop
 *
 * Features:
 * - Menu toggle button triggers sidebar
 * - Overlay click closes sidebar
 * - Navigation link click closes sidebar
 * - Window resize auto-closes if > 768px
 * - Body scroll prevention when sidebar open
 *
 * Breakpoint: 768px (mobile vs desktop)
 *
 * CSS Classes:
 * - .sidebar.active: Sidebar visible on mobile
 * - .overlay.show: Overlay backdrop visible
 * - body.no-scroll: Prevents background scrolling
 */
function initializeSidebarBehavior() {
  const menuToggle = document.querySelector(".menu-toggle");
  const sidebar = document.querySelector(".sidebar");

  /* =========================================================
     CREATE OVERLAY ELEMENT
     Purpose: Dark backdrop behind sidebar on mobile
     
     Overlay:
     - Created once dynamically
     - Reused for all toggle actions
     - Click closes sidebar
     ========================================================= */
  let overlay = document.querySelector(".overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.classList.add("overlay");
    document.body.appendChild(overlay);
  }

  /* =========================================================
     TOGGLE SIDEBAR FUNCTION
     Purpose: Open/close sidebar on mobile only
     
     Behavior:
     - Only active on mobile (≤768px)
     - Toggles .active class on sidebar
     - Toggles .show class on overlay
     - Toggles .no-scroll class on body
     
     States:
     - Closed: sidebar hidden, overlay hidden, body scrollable
     - Open: sidebar visible, overlay visible, body locked
     ========================================================= */
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

  /* =========================================================
     CLOSE SIDEBAR FUNCTION
     Purpose: Close sidebar and restore normal state
     
     Actions:
     1. Remove .active from sidebar (hide)
     2. Remove .show from overlay (hide)
     3. Remove .no-scroll from body (enable scroll)
     
     Called By:
     - Overlay click
     - Navigation link click
     - Window resize to desktop
     ========================================================= */
  const closeSidebar = () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("show");
    document.body.classList.remove("no-scroll");
  };

  /* =========================================================
     EVENT LISTENERS
     ========================================================= */

  // Menu toggle button (hamburger icon)
  if (menuToggle) {
    menuToggle.addEventListener("click", handleSidebarToggle);
  }

  // Overlay backdrop click closes sidebar
  overlay.addEventListener("click", closeSidebar);

  // Navigation links click closes sidebar (mobile)
  document.querySelectorAll(".nav-links a, .logout a").forEach((link) => {
    link.addEventListener("click", closeSidebar);
  });

  /* =========================================================
     RESPONSIVE BEHAVIOR
     Purpose: Auto-close sidebar on resize to desktop
     
     Breakpoint: 768px
     - Above 768px: Close sidebar (desktop layout)
     - Below 768px: Keep current state (mobile layout)
     
     Reason: Prevents sidebar stuck open when resizing window
     ========================================================= */
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      closeSidebar();
    }
  });
}

/* =========================================================
   ACTIVE PAGE HIGHLIGHTING
   ========================================================= */

/**
 * Highlight the current page link in navigation
 *
 * Purpose:
 * - Visual indicator of current page
 * - Adds .active class to matching nav link
 * - Improves user orientation
 *
 * Algorithm:
 * 1. Get current page filename from URL
 * 2. Loop through all navigation links
 * 3. Check if link href matches current page
 * 4. Add .active class to matching link
 *
 * Example:
 * - URL: .../dashboard/dashboard.html
 * - currentPage: "dashboard.html"
 * - Matches: <a href="../dashboard/dashboard.html">
 * - Result: Link gets .active class (green background)
 *
 * CSS Styling:
 * - .nav-links a.active: Green background, bold text
 */
function highlightCurrentPageLink() {
  // Extract filename from current URL path
  const currentPage = window.location.pathname.split("/").pop();

  // Find and highlight matching navigation link
  document.querySelectorAll(".nav-links a").forEach((link) => {
    if (link.getAttribute("href").includes(currentPage)) {
      link.classList.add("active");
    }
  });
}
