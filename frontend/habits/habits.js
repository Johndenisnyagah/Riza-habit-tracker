/* =========================================================
   HABITS.JS - Habits Page Controller
   
   Purpose: Manages habits page functionality including:
   - Habit statistics (total habits, logins, streaks)
   - Current streak with animated flame
   - Habit list display with filters
   - Habit creation/editing via modal
   
   Data Source: All data fetched from MongoDB via backend API

   Author: John Denis Nyagah
   ========================================================= */

import {
  isAuthenticated,
  getHabits as apiGetHabits,
  getCheckins as apiGetCheckins,
  trackDailyLogin,
  getTotalLoginDays,
} from "../shared/api.js";
import {
  initializeHabitManager,
  getHabitsData,
} from "../shared/habit-manager.js";
import {
  HABIT_ICONS,
  HABIT_ICONS_PATH,
} from "../assets/habit-icons/habit-icons-config.js";

/* =========================================================
   AUTHENTICATION CHECK
   ========================================================= */

// Verify user is logged in before accessing habits page
if (!isAuthenticated()) {
  alert("Please login to access the habits page");
  window.location.href = "../login/signin_signup.html";
}

/* =========================================================
   INITIALIZATION FUNCTIONS
   ========================================================= */

/**
 * Dynamically loads habit icons from configuration
 * Creates clickable icon options in the habit creation modal
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

  console.log(`✅ TEST: Loaded ${HABIT_ICONS.length} habit icons`);
}

console.log(`✅ TEST: Loaded ${HABIT_ICONS.length} habit icons`);

/* =========================================================
   MAIN INITIALIZATION
   ========================================================= */

/**
 * Habits page initialization sequence
 * Executes when DOM is fully loaded
 */
document.addEventListener("DOMContentLoaded", async () => {
  console.log("📋 Habits page initializing...");

  // Track daily login (only counts once per day in MongoDB)
  try {
    await trackDailyLogin();
    console.log("✅ TEST: Daily login tracked successfully");
  } catch (error) {
    console.error("❌ Failed to track login:", error);
  }

  // Load habit icons for modal
  loadHabitIcons();

  // Initialize habit manager with real-time update callbacks
  await initializeHabitManager({
    habitListId: "habit-list",
    openModalSelector: ".open-habit-modal",
    onHabitChange: async () => {
      // Callback: Update all statistics when habits change
      await updateStatsCard();
      await updateCurrentStreak();
    },
  });

  // Initial update of all UI elements
  await updateStatsCard();
  await updateCurrentStreak();

  console.log("✅ Habits page initialization complete");
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
 */
async function updateStatsCard() {
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
    const totalCheckinsEl = document.getElementById("habits-total-checkins");
    const longestStreakEl = document.getElementById("habits-longest-streak");
    const totalHabitsEl = document.getElementById("habits-total-habits");

    if (totalCheckinsEl) totalCheckinsEl.textContent = totalLoginDays;
    if (longestStreakEl) longestStreakEl.textContent = longestStreak;
    if (totalHabitsEl) totalHabitsEl.textContent = habits.length;

    console.log(
      "✅ TEST: Stats updated - Habits:",
      habits.length,
      "| Logins:",
      totalLoginDays,
      "| Streak:",
      longestStreak
    );
  } catch (error) {
    console.error("❌ Failed to update stats card:", error);
  }
}

/* =========================================================
   CURRENT STREAK CALCULATION
   ========================================================= */

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
  const streakElement = document.getElementById("habits-current-streak");
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
    const flameAnimation = document.getElementById("habits-flame-animation");
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
      document.getElementById("habits-milestone-7")?.classList.add("achieved");
    }
    if (currentStreak >= 30) {
      document.getElementById("habits-milestone-30")?.classList.add("achieved");
    }
    if (currentStreak >= 100) {
      document
        .getElementById("habits-milestone-100")
        ?.classList.add("achieved");
    }
  } catch (error) {
    console.error("❌ Failed to update current streak:", error);
  }
}
