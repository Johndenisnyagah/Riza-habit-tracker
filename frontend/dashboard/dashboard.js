/* =========================================================
   DASHBOARD.JS - Using Shared Components
   - Imports shared habit manager and chart utilities
   - Initializes dashboard-specific functionality
   ========================================================= */

import {
  initializeHabitManager,
  refreshHabitDisplay,
} from "../shared/habit-manager.js";
import {
  initializeProgressChart,
  updateChartWithHabitData,
} from "../shared/chart.js";
import {
  HABIT_ICONS,
  HABIT_ICONS_PATH,
} from "../assets/habit-icons/habit-icons-config.js";

// Storage keys
const STORAGE_KEY = "rizaHabits";
const COMPLETIONS_KEY = "habitCompletions";

// Global chart instance
let chartInstance = null;

// Function to dynamically load habit icons
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

  console.log(`Loaded ${HABIT_ICONS.length} habit icons`);
}

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("Dashboard initializing...");

  // Load habit icons first
  loadHabitIcons();

  // Initialize chart first
  chartInstance = initializeProgressChart({
    canvasId: "progressChart",
    storageKey: "rizaWeekData",
  });

  // Update chart with current data
  if (chartInstance) {
    updateChartWithHabitData(chartInstance);
  }

  // Initialize habit manager with chart instance
  initializeHabitManager({
    chartInstance: chartInstance,
    habitListId: "habit-list",
    openModalSelector: ".open-habit-modal",
  });

  // Update UI elements
  updateStatsDisplay();
  updateTodayCheckins();
  updateCurrentStreak();
});

// ===================== STATISTICS =====================

// Track daily login (same as progress page)
function trackDailyLogin() {
  const LOGIN_KEY = "rizaDailyLogins";
  const today = new Date().toISOString().split("T")[0];
  const logins = JSON.parse(localStorage.getItem(LOGIN_KEY)) || [];

  // Only add if not already logged in today
  if (!logins.includes(today)) {
    logins.push(today);
    localStorage.setItem(LOGIN_KEY, JSON.stringify(logins));
  }

  return logins.length;
}

// Calculate longest streak (same as progress page)
function calculateLongestStreak() {
  const habits = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const completions = JSON.parse(localStorage.getItem(COMPLETIONS_KEY)) || {};

  if (habits.length === 0) return 0;

  // Get all unique dates with at least one completion
  const allDatesSet = new Set();
  habits.forEach((habit) => {
    if (completions[habit.id]) {
      completions[habit.id].forEach((dateStr) => {
        allDatesSet.add(dateStr);
      });
    }
  });

  // Convert to sorted array
  const allDates = Array.from(allDatesSet).sort();
  if (allDates.length === 0) return 0;

  let longestStreak = 1;
  let currentStreakCount = 1;

  for (let i = 1; i < allDates.length; i++) {
    const prevDate = new Date(allDates[i - 1]);
    const currDate = new Date(allDates[i]);

    // Calculate difference in days
    const diffTime = currDate - prevDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day
      currentStreakCount++;
      longestStreak = Math.max(longestStreak, currentStreakCount);
    } else {
      // Streak broken
      currentStreakCount = 1;
    }
  }

  // Save longest streak
  const STREAK_KEY = "rizaLongestStreak";
  const savedLongest =
    parseInt(localStorage.getItem(STREAK_KEY)) || longestStreak;
  const newLongest = Math.max(savedLongest, longestStreak);
  localStorage.setItem(STREAK_KEY, newLongest.toString());

  return newLongest;
}

function updateStatsDisplay() {
  const habits = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  // Track daily login (counts once per day) - same as progress page
  const totalCheckins = trackDailyLogin();

  // Calculate longest streak - same as progress page
  const longestStreak = calculateLongestStreak();

  // Update stats card
  const totalCheckinsEl = document.getElementById("dashboard-total-checkins");
  const longestStreakEl = document.getElementById("dashboard-longest-streak");
  const totalHabitsEl = document.getElementById("dashboard-total-habits");

  if (totalCheckinsEl) totalCheckinsEl.textContent = totalCheckins;
  if (longestStreakEl) longestStreakEl.textContent = longestStreak;
  if (totalHabitsEl) totalHabitsEl.textContent = habits.length;
}

function updateTodayCheckins() {
  const habits = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const completions = JSON.parse(localStorage.getItem(COMPLETIONS_KEY)) || {};
  const today = new Date().toISOString().split("T")[0];

  let completed = 0;
  habits.forEach((habit) => {
    if (completions[habit.id] && completions[habit.id].includes(today)) {
      completed++;
    }
  });

  const checkinsCard = document.querySelector(".checkins-status");
  if (checkinsCard) {
    checkinsCard.textContent = `${completed}/${habits.length} habits completed`;
  }
}

function updateCurrentStreak() {
  const streakElement = document.getElementById("dashboard-current-streak");
  if (!streakElement) return;

  const habits = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const completions = JSON.parse(localStorage.getItem(COMPLETIONS_KEY)) || {};

  // Calculate current streak - same logic as progress page
  let currentStreak = 0;
  let checkDate = new Date();

  while (true) {
    const dateStr = checkDate.toISOString().split("T")[0];
    let anyCompleted = false;

    for (const habit of habits) {
      if (completions[habit.id] && completions[habit.id].includes(dateStr)) {
        anyCompleted = true;
        break;
      }
    }

    if (anyCompleted) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Update streak number
  streakElement.textContent = currentStreak;

  // Scale flame animation based on streak
  const flameAnimation = document.getElementById("dashboard-flame-animation");
  if (flameAnimation) {
    let size = 80; // Small starting size

    if (currentStreak === 0) {
      size = 80;
    } else if (currentStreak >= 100) {
      size = 200; // Champion size (max)
    } else if (currentStreak >= 30) {
      size = 170 + (currentStreak - 30) * 0.43;
    } else if (currentStreak >= 7) {
      size = 145 + (currentStreak - 7) * 1.09;
    } else {
      size = 80 + currentStreak * 10.83;
    }

    flameAnimation.style.width = `${size}px`;
    flameAnimation.style.height = `${size}px`;
  }

  // Highlight achieved milestones
  if (currentStreak >= 7) {
    document.getElementById("dashboard-milestone-7")?.classList.add("achieved");
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
}
