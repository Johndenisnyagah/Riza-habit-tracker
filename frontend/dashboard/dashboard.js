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
  getUserProfile,
  trackDailyLogin,
  getTotalLoginDays,
} from "../shared/api.js";
import {
  initializeHabitManager,
  refreshHabitDisplay,
  getHabitsData,
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
    const iconOption = document.createElement("div");
    iconOption.className = "icon-option" + (index === 0 ? " active" : "");
    iconOption.setAttribute("data-icon", icon.filename);

    const img = document.createElement("img");
    img.src = HABIT_ICONS_PATH + icon.filename;
    img.alt = icon.name;
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

  // Populate chart with user's habit data
  if (chartInstance) {
    await updateChartWithHabitData(chartInstance);
  }

  // Initialize habit manager with real-time update callbacks
  await initializeHabitManager({
    chartInstance: chartInstance,
    habitListId: "habit-list",
    openModalSelector: ".open-habit-modal",
    onHabitChange: async () => {
      // Callback: Update all dashboard statistics when habits change
      // This ensures UI stays synchronized with backend
      await updateStatsDisplay();
      await updateTodayCheckins();
      await updateCurrentStreak();
    },
  });

  // Initial update of all UI elements
  await updateStatsDisplay();
  await updateTodayCheckins();
  await updateCurrentStreak();

  console.log("✅ Dashboard initialization complete");
});

/* =========================================================
   STATISTICS CALCULATION FUNCTIONS
   ========================================================= */

/**
 * Calculates the longest consecutive streak across all habits
 *
 * Algorithm:
 * 1. Fetch all habit check-ins from backend
 * 2. Collect all unique completion dates
 * 3. Sort dates and find longest consecutive sequence
 *
 * @returns {Promise<number>} Longest streak in days
 *
 * Data Source: MongoDB via /api/checkins/habit/:id
 * Test: Check console for calculated streak value
 */
async function calculateLongestStreak() {
  try {
    const habits = await getHabitsData();
    if (habits.length === 0) return 0;

    // Fetch check-ins for all habits from backend
    const checkinPromises = habits.map((h) => apiGetCheckins(h._id || h.id));
    const checkinsArrays = await Promise.all(checkinPromises);

    // Collect all unique completion dates
    const allDatesSet = new Set();
    checkinsArrays.forEach((checkins) => {
      checkins.forEach((checkin) => {
        allDatesSet.add(checkin.date.split("T")[0]);
      });
    });

    // Sort dates chronologically
    const allDates = Array.from(allDatesSet).sort();
    if (allDates.length === 0) return 0;

    // Find longest consecutive sequence
    let longestStreak = 1;
    let currentStreakCount = 1;

    for (let i = 1; i < allDates.length; i++) {
      const prevDate = new Date(allDates[i - 1]);
      const currDate = new Date(allDates[i]);

      // Calculate difference in days
      const diffTime = currDate - prevDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day - increment streak
        currentStreakCount++;
        longestStreak = Math.max(longestStreak, currentStreakCount);
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
 * Data Sources (all from MongoDB):
 * - Total Habits: /api/habits
 * - Total Logins: /api/logins/count (unique days)
 * - Longest Streak: Calculated from /api/checkins
 *
 * Test: Console logs show fetched values for verification
 */
async function updateStatsDisplay() {
  try {
    // Fetch user's habits from backend
    const habits = await getHabitsData();
    console.log("📊 TEST: Habits loaded:", habits.length);

    // Fetch total unique login days from backend
    const loginData = await getTotalLoginDays();
    const totalLoginDays = loginData.totalLoginDays || 0;
    console.log("📊 TEST: Total login days:", totalLoginDays);

    // Calculate longest streak from check-in history
    const longestStreak = await calculateLongestStreak();
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
 * Algorithm:
 * 1. Get all user's habits from backend
 * 2. Check which ones have a check-in for today's date
 * 3. Display completion ratio
 *
 * Data Source: MongoDB via /api/checkins/habit/:id
 * Updates: Automatically when habits are checked/unchecked
 */
async function updateTodayCheckins() {
  try {
    const habits = await getHabitsData();
    const today = new Date().toISOString().split("T")[0];

    // Fetch check-ins for all habits from backend
    const checkinPromises = habits.map((h) => apiGetCheckins(h._id || h.id));
    const checkinsArrays = await Promise.all(checkinPromises);

    // Count habits with today's check-in
    let completed = 0;
    checkinsArrays.forEach((checkins) => {
      if (checkins.some((c) => c.date.split("T")[0] === today)) {
        completed++;
      }
    });

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
 * Features:
 * - Counts days backwards from today
 * - Stops when a day has no completions
 * - Scales flame animation based on streak length
 * - Highlights milestone achievements (7, 30, 100 days)
 *
 * Flame Sizes:
 * - 0 days: 80px (small)
 * - 1-6 days: 80-145px (growing)
 * - 7-29 days: 145-170px (medium)
 * - 30-99 days: 170-200px (large)
 * - 100+ days: 200px (champion)
 *
 * Data Source: MongoDB via /api/checkins/habit/:id
 */
async function updateCurrentStreak() {
  const streakElement = document.getElementById("dashboard-current-streak");
  if (!streakElement) return;

  try {
    const habits = await getHabitsData();

    // Fetch check-ins for all habits from backend
    const checkinPromises = habits.map((h) => apiGetCheckins(h._id || h.id));
    const checkinsArrays = await Promise.all(checkinPromises);

    // Build completion map: habitId -> array of completion dates
    const completions = {};
    habits.forEach((habit, index) => {
      const habitId = habit._id || habit.id;
      completions[habitId] = checkinsArrays[index].map(
        (c) => c.date.split("T")[0]
      );
    });

    // Calculate current streak (consecutive days from today backwards)
    let currentStreak = 0;
    let checkDate = new Date();

    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0];
      let anyCompleted = false;

      // Check if any habit was completed on this date
      for (const habit of habits) {
        const habitId = habit._id || habit.id;
        if (completions[habitId] && completions[habitId].includes(dateStr)) {
          anyCompleted = true;
          break;
        }
      }

      if (anyCompleted) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1); // Move to previous day
      } else {
        break; // Streak broken
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
