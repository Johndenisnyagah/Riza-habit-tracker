/* =========================================================
   DASHBOARD.JS - Main Dashboard Controller
   
   Purpose: Manages the user dashboard interface including:
   - User authentication and login tracking
   - Habit statistics (total habits, logins, streaks)
   - Real-time habit check-in updates
   - Progress chart visualization
   - Dynamic user name display
   
   Data Source: All data fetched from MongoDB via backend API

   John Denis Nyagah
   ========================================================= */

import {
  isAuthenticated,
  logoutUser,
  getHabits as apiGetHabits,
  getCheckins as apiGetCheckins,
  getAllCheckins as apiGetAllCheckins,
  getUserProfile,
  trackDailyLogin,
  getTotalLoginDays,
} from "../shared/api.js";
import {
  initializeHabitManager,
  refreshHabitDisplay,
  getHabitsData,
  updateHabitSummaryList,
} from "../shared/habit-manager.js";
import {
  initializeProgressChart,
  updateChartWithHabitData,
} from "../shared/chart.js";
import {
  HABIT_ICONS,
  HABIT_ICONS_PATH,
} from "../assets/habit-icons/habit-icons-config.js";

/* =========================================================
   AUTHENTICATION CHECK
   ========================================================= */

// Verify user is logged in before accessing dashboard
if (!isAuthenticated()) {
  alert("Please login to access the dashboard");
  window.location.href = "../login/signin_signup.html";
}

/* =========================================================
   GLOBAL VARIABLES
   ========================================================= */

// Chart instance for progress visualization
let chartInstance = null;

/* =========================================================
   INITIALIZATION FUNCTIONS
   ========================================================= */

/**
 * Dynamically loads habit icons from configuration
 * Creates clickable icon options in the habit creation modal
 *
 * Test: Verify icon count in console
 */
function loadHabitIcons() {
  const iconSelector = document.getElementById("icon-selector");
  if (!iconSelector) return;

  // Clear existing icons
  iconSelector.innerHTML = "";

  // Create icon options from config
  HABIT_ICONS.forEach((icon, index) => {
    const iconOption = document.createElement("button");
    iconOption.type = "button";
    iconOption.className = "icon-option" + (index === 0 ? " active" : "");
    iconOption.setAttribute("data-icon", icon.filename);
    iconOption.setAttribute("aria-label", icon.name);
    iconOption.setAttribute("aria-pressed", index === 0 ? "true" : "false");

    const img = document.createElement("img");
    img.src = HABIT_ICONS_PATH + icon.filename;
    img.alt = ""; // Decorative as button has aria-label
    img.setAttribute("aria-hidden", "true");
    img.title = icon.name;

    iconOption.appendChild(img);
    iconSelector.appendChild(iconOption);
  });

  // TEST: Log number of icons loaded
  console.log(`✅ TEST: Loaded ${HABIT_ICONS.length} habit icons`);
}

/**
 * Fetches and displays user's name in welcome message
 * Displays first name only (e.g., "John Doe" → "John!")
 *
 * Data Source: MongoDB via /api/auth/profile
 * Test: Check console for user profile fetch
 */
async function loadUserName() {
  try {
    const response = await getUserProfile();
    const user = response.user; // Extract user object from API response
    const userNameDisplay = document.getElementById("user-name-display");
    if (userNameDisplay && user && user.name) {
      // Extract first name only
      const firstName = user.name.split(" ")[0];
      userNameDisplay.textContent = `${firstName}`;
      console.log("✅ TEST: User name loaded:", firstName);
    }
  } catch (error) {
    console.error("❌ Failed to load user name:", error);
    // Fallback to generic greeting
    const userNameDisplay = document.getElementById("user-name-display");
    if (userNameDisplay) {
      userNameDisplay.textContent = "there!";
    }
  }
}

/**
 * Update all dashboard UI elements using pre-fetched data
 * This avoids redundant API calls and N+1 query patterns.
 */
async function updateUI() {
  try {
    const [habits, allCheckins, loginData] = await Promise.all([
      getHabitsData(true), // Force refresh to ensure latest data
      apiGetAllCheckins(),
      getTotalLoginDays(),
    ]);

    const totalLoginDays = loginData.totalLoginDays || 0;

    updateStatsDisplay(habits, allCheckins, totalLoginDays);
    updateTodayCheckins(habits, allCheckins);
    updateCurrentStreak(habits, allCheckins);

    // Also update habit list and chart with pre-fetched data
    await updateHabitSummaryList("habit-list", habits, allCheckins);
    if (chartInstance) {
      await updateChartWithHabitData(chartInstance, habits, allCheckins);
    }
  } catch (error) {
    console.error("❌ Failed to update dashboard UI:", error);
  }
}

/* =========================================================
   MAIN INITIALIZATION
   ========================================================= */

/**
 * Dashboard initialization sequence
 * Executes when DOM is fully loaded
 *
 * Steps:
 * 1. Track daily login (counts unique days)
 * 2. Load user's name for personalized greeting
 * 3. Initialize habit icons
 * 4. Initialize progress chart
 * 5. Initialize habit manager with callbacks
 * 6. Update all statistics displays
 */
document.addEventListener("DOMContentLoaded", async () => {
  console.log("📊 Dashboard initializing...");

  // Track daily login (only counts once per day in MongoDB)
  try {
    await trackDailyLogin();
    console.log("✅ TEST: Daily login tracked successfully");
  } catch (error) {
    console.error("❌ Failed to track login:", error);
  }

  // Load user's personalized name
  await loadUserName();

  // Load available habit icons for modal
  loadHabitIcons();

  // Initialize progress chart
  chartInstance = initializeProgressChart({
    canvasId: "progressChart",
  });

  // Initialize habit manager with real-time update callbacks
  await initializeHabitManager({
    chartInstance: chartInstance,
    habitListId: "habit-list",
    openModalSelector: ".open-habit-modal",
    skipInitialRender: true, // updateUI will handle initial rendering
    onHabitChange: async () => {
      // Callback: Update all dashboard statistics when habits change
      // This ensures UI stays synchronized with backend
      await updateUI();
    },
  });

  // Initial update of all UI elements (including chart and stats)
  await updateUI();

  console.log("✅ Dashboard initialization complete");
});

/* =========================================================
   STATISTICS CALCULATION FUNCTIONS
   ========================================================= */

/**
 * Calculates the longest consecutive streak across all habits
 *
 * Algorithm:
 * 1. Collect all unique completion dates from pre-fetched check-ins
 * 2. Sort dates and find longest consecutive sequence
 *
 * @param {Array} allCheckins - All check-in records for the user
 * @returns {number} Longest streak in days
 */
function calculateLongestStreak(allCheckins) {
  try {
    if (!allCheckins || allCheckins.length === 0) return 0;

    // Optimization: Use a Set of date strings to get unique days, then sort.
    // Using Date.parse() avoids redundant Date object creation entirely.
    const uniqueDates = new Set();
    for (let i = 0; i < allCheckins.length; i++) {
      uniqueDates.add(allCheckins[i].date.substring(0, 10));
    }

    const allTimestamps = Array.from(uniqueDates)
      .sort()
      .map((d) => Date.parse(d));

    if (allTimestamps.length === 0) return 0;

    // Find longest consecutive sequence
    let longestStreak = 1;
    let currentStreakCount = 1;
    const ONE_DAY_MS = 86400000; // 1000 * 60 * 60 * 24

    for (let i = 1; i < allTimestamps.length; i++) {
      // Calculate difference in days using pre-calculated timestamps
      const diffDays = Math.round(
        (allTimestamps[i] - allTimestamps[i - 1]) / ONE_DAY_MS
      );

      if (diffDays === 1) {
        // Consecutive day - increment streak
        currentStreakCount++;
        if (currentStreakCount > longestStreak) longestStreak = currentStreakCount;
      } else {
        // Streak broken - reset counter
        currentStreakCount = 1;
      }
    }

    return longestStreak;
  } catch (error) {
    console.error("❌ Failed to calculate longest streak:", error);
    return 0;
  }
}

/**
 * Updates the statistics card with latest data
 * Displays: Total Habits, Total Logins, Longest Streak
 *
 * @param {Array} habits - All habits for the user
 * @param {Array} allCheckins - All check-in records for the user
 * @param {number} totalLoginDays - Pre-fetched total login days
 */
function updateStatsDisplay(habits, allCheckins, totalLoginDays) {
  try {
    console.log("📊 TEST: Habits loaded:", habits.length);
    console.log("📊 TEST: Total login days:", totalLoginDays);

    // Calculate longest streak from pre-fetched check-in history
    const longestStreak = calculateLongestStreak(allCheckins);
    console.log("📊 TEST: Longest streak:", longestStreak);

    // Update DOM elements with calculated values
    const totalCheckinsEl = document.getElementById("dashboard-total-checkins");
    const longestStreakEl = document.getElementById("dashboard-longest-streak");
    const totalHabitsEl = document.getElementById("dashboard-total-habits");

    if (totalCheckinsEl) totalCheckinsEl.textContent = totalLoginDays;
    if (longestStreakEl) longestStreakEl.textContent = longestStreak;
    if (totalHabitsEl) totalHabitsEl.textContent = habits.length;

    // TEST: Verify all stats updated successfully
    console.log(
      "✅ TEST: Stats updated - Habits:",
      habits.length,
      "| Logins:",
      totalLoginDays,
      "| Streak:",
      longestStreak
    );
  } catch (error) {
    console.error("❌ Failed to update stats display:", error);
  }
}

/**
 * Updates "Today's Check-ins" display
 * Shows how many habits completed today vs total (e.g., "3/8 habits completed")
 *
 * @param {Array} habits - All habits for the user
 * @param {Array} allCheckins - All check-in records for the user
 */
function updateTodayCheckins(habits, allCheckins) {
  try {
    const today = new Date().toISOString().substring(0, 10);

    // Optimization: Use early exit for today's check-ins since they are sorted newest first.
    // Complexity: O(TodayCheckins) instead of O(TotalCheckins)
    const completedToday = new Set();
    for (let i = 0; i < allCheckins.length; i++) {
      const checkinDate = allCheckins[i].date.substring(0, 10);
      if (checkinDate === today) {
        completedToday.add(allCheckins[i].habitId);
      } else if (checkinDate < today) {
        break; // Stop once we encounter dates before today
      }
    }

    let completed = completedToday.size;

    // Update display
    const checkinsCard = document.querySelector(".checkins-status");
    if (checkinsCard) {
      checkinsCard.textContent = `${completed}/${habits.length} habits completed`;
    }
  } catch (error) {
    console.error("❌ Failed to update today's checkins:", error);
  }
}

/**
 * Updates current streak display with animated flame
 * Calculates consecutive days with at least one habit completed
 *
 * @param {Array} habits - All habits for the user
 * @param {Array} allCheckins - All check-in records for the user
 */
function updateCurrentStreak(habits, allCheckins) {
  const streakElement = document.getElementById("dashboard-current-streak");
  if (!streakElement) return;

  try {
    // Optimization: Directly iterate over sorted check-ins to calculate current streak.
    // Avoids O(N) Set creation and multiple O(1) lookups in a loop.
    // Complexity: O(StreakCheckins) instead of O(TotalCheckins)
    let currentStreak = 0;
    let checkDate = new Date();
    let checkinIdx = 0;

    while (true) {
      const dateStr = checkDate.toISOString().substring(0, 10);
      let found = false;

      // Find if any check-in exists for the current checkDate
      while (checkinIdx < allCheckins.length) {
        const checkinDate = allCheckins[checkinIdx].date.substring(0, 10);
        if (checkinDate === dateStr) {
          found = true;
          // Move index to next day's check-ins
          while (
            checkinIdx < allCheckins.length &&
            allCheckins[checkinIdx].date.substring(0, 10) === dateStr
          ) {
            checkinIdx++;
          }
          break;
        } else if (checkinDate < dateStr) {
          // Since check-ins are descending, once we pass the date, it doesn't exist
          break;
        }
        checkinIdx++;
      }

      if (found) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Update streak number display
    streakElement.textContent = currentStreak;

    // Scale flame animation based on streak length
    const flameAnimation = document.getElementById("dashboard-flame-animation");
    if (flameAnimation) {
      let size = 80; // Default small size

      // Calculate flame size based on streak milestones
      if (currentStreak === 0) {
        size = 80;
      } else if (currentStreak >= 100) {
        size = 200; // Champion size (maximum)
      } else if (currentStreak >= 30) {
        size = 170 + (currentStreak - 30) * 0.43; // Large
      } else if (currentStreak >= 7) {
        size = 145 + (currentStreak - 7) * 1.09; // Medium
      } else {
        size = 80 + currentStreak * 10.83; // Growing
      }

      flameAnimation.style.width = `${size}px`;
      flameAnimation.style.height = `${size}px`;
    }

    // Highlight achieved milestone badges
    if (currentStreak >= 7) {
      document
        .getElementById("dashboard-milestone-7")
        ?.classList.add("achieved");
    }
    if (currentStreak >= 30) {
      document
        .getElementById("dashboard-milestone-30")
        ?.classList.add("achieved");
    }
    if (currentStreak >= 100) {
      document
        .getElementById("dashboard-milestone-100")
        ?.classList.add("achieved");
    }
  } catch (error) {
    console.error("❌ Failed to update current streak:", error);
  }
}
