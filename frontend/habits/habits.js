/* =========================================================
   HABITS.JS - Using Shared Components
   - Imports shared habit manager utilities
   - Initializes habits-specific functionality
   ========================================================= */

import { initializeHabitManager } from "../shared/habit-manager.js";
import {
  HABIT_ICONS,
  HABIT_ICONS_PATH,
} from "../assets/habit-icons/habit-icons-config.js";

// Storage keys
const STORAGE_KEY = "rizaHabits";
const COMPLETIONS_KEY = "habitCompletions";

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
}

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Load habit icons first
  loadHabitIcons();

  // Initialize habit manager
  initializeHabitManager({
    habitListId: "habit-list",
    openModalSelector: ".open-habit-modal",
  });

  // Update current streak display
  updateCurrentStreak();

  // Update stats card
  updateStatsCard();
});

// ===================== CURRENT STREAK =====================

function updateCurrentStreak() {
  const streakElement = document.getElementById("habits-current-streak");
  if (!streakElement) return;

  const habits = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const completions = JSON.parse(localStorage.getItem(COMPLETIONS_KEY)) || {};

  // Calculate current streak (same logic as progress page)
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

  // Scale flame animation gradually based on streak (exact same as progress page)
  const flameAnimation = document.getElementById("habits-flame-animation");
  if (flameAnimation) {
    let size = 80; // Small starting size

    if (currentStreak === 0) {
      size = 80; // Minimum size
    } else if (currentStreak >= 100) {
      size = 200; // 👑 Champion size (max)
    } else if (currentStreak >= 30) {
      // Grow from 170px to 200px over 70 days (30-99)
      size = 170 + (currentStreak - 30) * 0.43;
    } else if (currentStreak >= 7) {
      // Grow from 145px to 170px over 23 days (7-29)
      size = 145 + (currentStreak - 7) * 1.09;
    } else {
      // Grow from 80px to 145px over 6 days (1-6)
      size = 80 + currentStreak * 10.83;
    }

    // Apply the size to the animation element directly
    flameAnimation.style.width = `${size}px`;
    flameAnimation.style.height = `${size}px`;
  }

  // Highlight achieved streak milestones
  if (currentStreak >= 7) {
    document.getElementById("habits-milestone-7")?.classList.add("achieved");
  }
  if (currentStreak >= 30) {
    document.getElementById("habits-milestone-30")?.classList.add("achieved");
  }
  if (currentStreak >= 100) {
    document.getElementById("habits-milestone-100")?.classList.add("achieved");
  }
}

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

// Function to update stats card
function updateStatsCard() {
  const habits = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

  // Track daily login (counts once per day) - same as progress page
  const totalCheckins = trackDailyLogin();

  // Calculate longest streak - same as progress page
  const longestStreak = calculateLongestStreak();

  // Update stats card
  document.getElementById("habits-total-checkins").textContent = totalCheckins;
  document.getElementById("habits-longest-streak").textContent = longestStreak;
  document.getElementById("habits-total-habits").textContent = habits.length;
}
