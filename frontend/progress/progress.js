/* =========================================================
   Riza Progress Page Script
   - Imports shared chart.js module
   - Populates dynamic placeholders
   - Real data from localStorage
   ========================================================= */

import {
  initializeProgressChart,
  updateChartWithHabitData,
} from "../shared/chart.js";

// Storage keys
const STORAGE_KEY = "rizaHabits";
const COMPLETIONS_KEY = "habitCompletions";
const LOGIN_KEY = "rizaDailyLogins";
const STREAK_KEY = "rizaLongestStreak";

// ===================== TRACK DAILY LOGIN =====================
function trackDailyLogin() {
  const today = new Date().toISOString().split("T")[0];
  const logins = JSON.parse(localStorage.getItem(LOGIN_KEY)) || [];

  // Only add if not already logged in today
  if (!logins.includes(today)) {
    logins.push(today);
    localStorage.setItem(LOGIN_KEY, JSON.stringify(logins));
  }

  return logins.length;
}

// ===================== CALCULATE LONGEST STREAK =====================
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
  const savedLongest =
    parseInt(localStorage.getItem(STREAK_KEY)) || longestStreak;
  const newLongest = Math.max(savedLongest, longestStreak);
  localStorage.setItem(STREAK_KEY, newLongest.toString());

  return newLongest;
}

// ===================== CALCULATE REAL STATS =====================
function calculateStats() {
  const habits = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const completions = JSON.parse(localStorage.getItem(COMPLETIONS_KEY)) || {};

  // Track daily login (counts once per day)
  const totalCheckins = trackDailyLogin();

  // Current streak
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

  // Longest streak
  const longestStreak = calculateLongestStreak();

  // Success rate (this week)
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(
    today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)
  );
  weekStart.setHours(0, 0, 0, 0);

  let totalPossible = 0;
  let totalCompleted = 0;
  const dailySuccess = [0, 0, 0, 0, 0, 0, 0]; // Mon-Sun success counts
  const dailyTotal = [0, 0, 0, 0, 0, 0, 0]; // Mon-Sun total counts

  habits.forEach((habit) => {
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(weekStart);
      checkDate.setDate(weekStart.getDate() + i);
      const dateStr = checkDate.toISOString().split("T")[0];

      totalPossible++;
      dailyTotal[i]++;

      if (completions[habit.id] && completions[habit.id].includes(dateStr)) {
        totalCompleted++;
        dailySuccess[i]++;
      }
    }
  });

  const successRate =
    totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

  // Calculate last week's success rate for comparison
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(weekStart.getDate() - 7);

  let lastWeekPossible = 0;
  let lastWeekCompleted = 0;

  habits.forEach((habit) => {
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(lastWeekStart);
      checkDate.setDate(lastWeekStart.getDate() + i);
      const dateStr = checkDate.toISOString().split("T")[0];

      lastWeekPossible++;
      if (completions[habit.id] && completions[habit.id].includes(dateStr)) {
        lastWeekCompleted++;
      }
    }
  });

  const lastWeekRate =
    lastWeekPossible > 0
      ? Math.round((lastWeekCompleted / lastWeekPossible) * 100)
      : 0;
  const weekComparison = successRate - lastWeekRate;

  // Find best day of the week
  const dayNames = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  let bestDayIndex = 0;
  let bestDayRate = 0;

  dailySuccess.forEach((completed, index) => {
    const rate =
      dailyTotal[index] > 0 ? (completed / dailyTotal[index]) * 100 : 0;
    if (rate > bestDayRate) {
      bestDayRate = rate;
      bestDayIndex = index;
    }
  });

  return {
    totalCheckins,
    currentStreak,
    successRate,
    longestStreak,
    weekComparison,
    bestDay: dayNames[bestDayIndex],
  };
}

// ===================== POPULATE UI =====================
const stats = calculateStats();

// Update stats card
document.getElementById("total-checkins").textContent = stats.totalCheckins;

// Update longest streak
document.getElementById("longest-streak").textContent = stats.longestStreak;

// Update total habits count
const habits = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
document.getElementById("total-habits").textContent = habits.length;

// Update current streak
document.getElementById("current-streak").textContent = stats.currentStreak;

// Scale flame animation gradually based on streak
const flameAnimation = document.getElementById("flame-animation");

// Start small at 80px and grow gradually
// Each day adds approximately 1.2px until hitting milestone caps
let size = 80; // Small starting size

if (stats.currentStreak === 0) {
  size = 80; // Minimum size
} else if (stats.currentStreak >= 100) {
  size = 200; // 👑 Champion size (max)
} else if (stats.currentStreak >= 30) {
  // Grow from 170px to 200px over 70 days (30-99)
  size = 170 + (stats.currentStreak - 30) * 0.43;
} else if (stats.currentStreak >= 7) {
  // Grow from 145px to 170px over 23 days (7-29)
  size = 145 + (stats.currentStreak - 7) * 1.09;
} else {
  // Grow from 80px to 145px over 6 days (1-6)
  size = 80 + stats.currentStreak * 10.83;
}

// Apply the size to the animation element directly
flameAnimation.style.width = `${size}px`;
flameAnimation.style.height = `${size}px`;

// Highlight achieved streak milestones
if (stats.currentStreak >= 7) {
  document.getElementById("milestone-7").classList.add("achieved");
}
if (stats.currentStreak >= 30) {
  document.getElementById("milestone-30").classList.add("achieved");
}
if (stats.currentStreak >= 100) {
  document.getElementById("milestone-100").classList.add("achieved");
}

// Update success rate with circular progress animation
document.getElementById("success-rate").textContent = `${stats.successRate}%`;

// Animate the circular progress ring
const circle = document.getElementById("progress-ring-fill");
const radius = circle.r.baseVal.value;
const circumference = radius * 2 * Math.PI;
const offset = circumference - (stats.successRate / 100) * circumference;

circle.style.strokeDasharray = `${circumference} ${circumference}`;
setTimeout(() => {
  circle.style.strokeDashoffset = offset;
}, 100);

// Update week comparison
const comparisonEl = document.getElementById("success-comparison");
if (stats.weekComparison > 0) {
  comparisonEl.innerHTML = `
    <img src="../assets/icons/up.svg" class="trend-icon" alt="Up" />
    <span class="comparison-text">${Math.abs(
      stats.weekComparison
    )}% from last week</span>
  `;
} else if (stats.weekComparison < 0) {
  comparisonEl.innerHTML = `
    <img src="../assets/icons/down.svg" class="trend-icon" alt="Down" />
    <span class="comparison-text">${Math.abs(
      stats.weekComparison
    )}% from last week</span>
  `;
} else {
  comparisonEl.innerHTML = `
    <span class="comparison-text">Same as last week</span>
  `;
}

// Update best day
const bestDayEl = document.getElementById("best-day");
bestDayEl.innerHTML = `
  <span class="best-day-label">Best day:</span>
  <span class="best-day-value">${stats.bestDay}</span>
`;

// ===================== CHARTS =====================
// Create Weekly Chart (bar chart - same as dashboard)
const weeklyChart = initializeProgressChart({
  canvasId: "weeklyChart",
  storageKey: "rizaWeekData",
  label: "Habits Completed",
  chartType: "bar",
  color: "#74c69d",
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
});

// Update weekly chart with real data
if (weeklyChart) {
  updateChartWithHabitData(weeklyChart);
}

// Create Monthly Chart (line chart - 4 weeks of data)
const monthlyChart = initializeProgressChart({
  canvasId: "monthlyChart",
  storageKey: "rizaMonthData",
  label: "Weekly Totals",
  chartType: "line",
  color: "#2d6a4f",
  labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
});

// Calculate and update monthly data
if (monthlyChart) {
  updateMonthlyChart(monthlyChart);
}

// ===================== MONTHLY CHART UPDATE =====================
function updateMonthlyChart(chartInstance) {
  const habits = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const completions = JSON.parse(localStorage.getItem(COMPLETIONS_KEY)) || {};
  const today = new Date();

  const monthData = [0, 0, 0, 0]; // 4 weeks

  habits.forEach((habit) => {
    if (completions[habit.id]) {
      completions[habit.id].forEach((dateStr) => {
        const date = new Date(dateStr);
        const daysDiff = Math.floor((today - date) / (1000 * 60 * 60 * 24));

        // Group by weeks (0-6 days = week 4, 7-13 = week 3, etc.)
        if (daysDiff >= 0 && daysDiff < 7) {
          monthData[3]++; // This week
        } else if (daysDiff >= 7 && daysDiff < 14) {
          monthData[2]++; // Last week
        } else if (daysDiff >= 14 && daysDiff < 21) {
          monthData[1]++; // 2 weeks ago
        } else if (daysDiff >= 21 && daysDiff < 28) {
          monthData[0]++; // 3 weeks ago
        }
      });
    }
  });

  // Update chart data
  chartInstance.data.datasets[0].data = monthData;
  chartInstance.update();
  localStorage.setItem("rizaMonthData", JSON.stringify(monthData));
}

// ===================== ACTIVITY CALENDAR =====================
let currentCalendarDate = new Date();

function renderCalendar() {
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();

  // Update month display
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  document.getElementById(
    "currentMonth"
  ).textContent = `${monthNames[month]} ${year}`;

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Get logged in days from localStorage
  const logins = JSON.parse(localStorage.getItem(LOGIN_KEY)) || [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Clear calendar
  const calendarDays = document.getElementById("calendarDays");
  calendarDays.innerHTML = "";

  // Add previous month's days
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const dayDiv = document.createElement("div");
    dayDiv.className = "calendar-day other-month";
    dayDiv.textContent = day;
    calendarDays.appendChild(dayDiv);
  }

  // Add current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDiv = document.createElement("div");
    dayDiv.className = "calendar-day";
    dayDiv.textContent = day;

    const currentDate = new Date(year, month, day);
    currentDate.setHours(0, 0, 0, 0);
    const dateStr = currentDate.toISOString().split("T")[0];

    // Check if it's today
    if (currentDate.getTime() === today.getTime()) {
      dayDiv.classList.add("today");
    }

    // Check if logged in on this day
    if (logins.includes(dateStr)) {
      dayDiv.classList.add("logged-in");

      // Check if part of current streak
      const yesterday = new Date(currentDate);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      if (
        logins.includes(yesterdayStr) ||
        currentDate.getTime() === today.getTime()
      ) {
        dayDiv.classList.add("streak");
      }
    }

    calendarDays.appendChild(dayDiv);
  }

  // Add next month's days to fill the grid
  const totalCells = calendarDays.children.length;
  const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

  for (let day = 1; day <= remainingCells; day++) {
    const dayDiv = document.createElement("div");
    dayDiv.className = "calendar-day other-month";
    dayDiv.textContent = day;
    calendarDays.appendChild(dayDiv);
  }
}

// Calendar navigation
document.getElementById("prevMonth").addEventListener("click", () => {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
  renderCalendar();
});

document.getElementById("nextMonth").addEventListener("click", () => {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
  renderCalendar();
});

// Initialize calendar
renderCalendar();
