/* =========================================================
   PROGRESS PAGE SCRIPT
   
   Purpose: Manages progress tracking page including:
   - Weekly and monthly chart visualizations
   - Statistics (total logins, longest streak, current streak)
   - Activity calendar with check-in history
   - Streak milestones and flame animation
   - Daily motivation quotes
   
   Data Source: All data fetched from MongoDB via backend API
   
   Author: John Denis Nyagah
   ========================================================= */

import {
  isAuthenticated,
  getCheckins as apiGetCheckins,
  trackDailyLogin,
  getTotalLoginDays,
  getUserProfile,
} from "../shared/api.js";
import {
  initializeProgressChart,
  updateChartWithHabitData,
} from "../shared/chart.js";
import { getHabitsData } from "../shared/habit-manager.js";

/* =========================================================
   AUTHENTICATION CHECK
   ========================================================= */

// Verify user is logged in before accessing progress page
if (!isAuthenticated()) {
  alert("Please login to access the progress page");
  window.location.href = "../login/signin_signup.html";
}

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
 * Calculates current streak (consecutive days from today backwards)
 *
 * @returns {Promise<number>} Current streak in days
 *
 * Data Source: MongoDB via /api/checkins/habit/:id
 */
async function calculateCurrentStreak() {
  try {
    const habits = await getHabitsData();
    if (habits.length === 0) return 0;

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

    return currentStreak;
  } catch (error) {
    console.error("❌ Failed to calculate current streak:", error);
    return 0;
  }
}

/**
 * Calculates comprehensive statistics for the progress page
 *
 * @returns {Promise<Object>} Statistics object with all metrics
 *
 * Data Sources (all from MongoDB):
 * - Total Logins: /api/logins/count
 * - Current Streak: Calculated from /api/checkins
 * - Longest Streak: Calculated from /api/checkins
 * - Success Rate: Calculated from /api/checkins
 */
async function calculateStats() {
  try {
    const habits = await getHabitsData();

    // Track daily login (only counts once per day in MongoDB)
    await trackDailyLogin();

    // Fetch total unique login days from backend
    const loginData = await getTotalLoginDays();
    const totalCheckins = loginData.totalLoginDays || 0;

    // Calculate current streak
    const currentStreak = await calculateCurrentStreak();

    // Calculate longest streak
    const longestStreak = await calculateLongestStreak();

    // Calculate success rate (this week)
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

    // Calculate success rate for this week
    habits.forEach((habit) => {
      const habitId = habit._id || habit.id;
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(weekStart);
        checkDate.setDate(weekStart.getDate() + i);
        const dateStr = checkDate.toISOString().split("T")[0];

        totalPossible++;
        dailyTotal[i]++;

        if (completions[habitId] && completions[habitId].includes(dateStr)) {
          totalCompleted++;
          dailySuccess[i]++;
        }
      }
    });

    const successRate =
      totalPossible > 0
        ? Math.round((totalCompleted / totalPossible) * 100)
        : 0;

    // Calculate last week's success rate for comparison
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(weekStart.getDate() - 7);

    let lastWeekPossible = 0;
    let lastWeekCompleted = 0;

    habits.forEach((habit) => {
      const habitId = habit._id || habit.id;
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(lastWeekStart);
        checkDate.setDate(lastWeekStart.getDate() + i);
        const dateStr = checkDate.toISOString().split("T")[0];

        lastWeekPossible++;
        if (completions[habitId] && completions[habitId].includes(dateStr)) {
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
  } catch (error) {
    console.error("❌ Failed to calculate stats:", error);
    return {
      totalCheckins: 0,
      currentStreak: 0,
      successRate: 0,
      longestStreak: 0,
      weekComparison: 0,
      bestDay: "Monday",
    };
  }
}

/* =========================================================
   UI UPDATE FUNCTIONS
   ========================================================= */

/**
 * Updates all statistics displays on the page
 * Fetches data from MongoDB and updates DOM elements
 */
async function updateUI() {
  try {
    // Calculate all statistics from MongoDB
    const stats = await calculateStats();

    // Fetch habits from backend
    const habits = await getHabitsData();

    // Update stats card
    document.getElementById("total-checkins").textContent = stats.totalCheckins;

    // Update longest streak
    document.getElementById("longest-streak").textContent = stats.longestStreak;

    // Update total habits count
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
    document.getElementById(
      "success-rate"
    ).textContent = `${stats.successRate}%`;

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

    // Create Monthly Chart (line chart - weeks since registration)
    // Chart will be initialized with dynamic data from updateMonthlyChart
    const monthlyChartCanvas = document.getElementById("monthlyChart");
    if (monthlyChartCanvas) {
      await updateMonthlyChart();
    }
  } catch (error) {
    console.error("❌ Error updating UI:", error);
  }
}

/* =========================================================
   MONTHLY CHART UPDATE (MongoDB-based)
   ========================================================= */

/**
 * Updates the monthly chart with habit completion data from MongoDB
 * Calculates weeks from user registration date and displays as bar chart
 */
async function updateMonthlyChart() {
  try {
    // Fetch user profile to get registration date
    const profileData = await getUserProfile();
    const user = profileData.user;
    const registrationDate = new Date(user.createdAt);
    const today = new Date();

    // Calculate total weeks since registration
    const totalDays = Math.floor(
      (today - registrationDate) / (1000 * 60 * 60 * 24)
    );
    const totalWeeks = Math.ceil(totalDays / 7);

    // Fetch all habits from MongoDB
    const habits = await getHabitsData();

    // Initialize weekly data array (one element per week since registration)
    const weeklyData = new Array(totalWeeks).fill(0);
    const weekLabels = [];

    // Create week labels
    for (let i = 0; i < totalWeeks; i++) {
      weekLabels.push(`W${i + 1}`);
    }

    // For each habit, fetch check-ins and count by week
    for (const habit of habits) {
      const checkIns = await apiGetCheckins(habit._id);

      checkIns.forEach((checkIn) => {
        const checkInDate = new Date(checkIn.date);

        // Calculate which week this check-in belongs to (since registration)
        const daysSinceRegistration = Math.floor(
          (checkInDate - registrationDate) / (1000 * 60 * 60 * 24)
        );
        const weekIndex = Math.floor(daysSinceRegistration / 7);

        // Increment the count for that week (if valid index)
        if (weekIndex >= 0 && weekIndex < totalWeeks) {
          weeklyData[weekIndex]++;
        }
      });
    }

    // Get canvas and create/update chart
    const canvas = document.getElementById("monthlyChart");
    const ctx = canvas.getContext("2d");

    // Destroy existing chart if it exists
    if (window.monthlyChartInstance) {
      window.monthlyChartInstance.destroy();
    }

    // Create new bar chart (matching dashboard style)
    window.monthlyChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: weekLabels,
        datasets: [
          {
            label: "Habits Completed Per Week",
            data: weeklyData,
            backgroundColor: "#2d6a4f",
            borderColor: "#2d6a4f",
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 3,
        plugins: {
          legend: {
            display: false, // Hide legend (top title)
          },
          tooltip: {
            mode: "index",
            intersect: false,
            callbacks: {
              title: function (context) {
                return `Week ${context[0].dataIndex + 1}`;
              },
              label: function (context) {
                return `Completions: ${context.parsed.y}`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
            title: {
              display: false, // Hide y-axis title
            },
            grid: {
              color: "rgba(0,0,0,0.05)",
            },
          },
          x: {
            title: {
              display: false, // Hide x-axis title
            },
            ticks: {
              maxRotation: 45,
              minRotation: 0,
              autoSkip: true,
              maxTicksLimit: 12,
            },
            grid: {
              display: false,
            },
          },
        },
      },
    });

    console.log(
      `✅ Monthly chart updated: ${totalWeeks} weeks since registration`
    );
  } catch (error) {
    console.error("❌ Error updating monthly chart:", error);
  }
}

/* =========================================================
   ACTIVITY CALENDAR (MongoDB-based)
   ========================================================= */

let currentCalendarDate = new Date();

/**
 * Renders the activity calendar showing days with habit completions
 * Fetches data from MongoDB instead of localStorage
 */
async function renderCalendar() {
  try {
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

    // Fetch all habits and their check-ins from MongoDB
    const habits = await getHabitsData();
    const activeDays = new Set(); // Set of dates with any activity

    // Collect all dates with habit completions
    for (const habit of habits) {
      const checkIns = await apiGetCheckins(habit._id);
      checkIns.forEach((checkIn) => {
        // Extract date from MongoDB (already in UTC midnight format)
        // Backend stores as: 2025-10-23T00:00:00.000Z
        const dateStr = checkIn.date.split("T")[0];
        activeDays.add(dateStr);
      });
    }

    // Get today's date in local timezone (YYYY-MM-DD format)
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = String(today.getMonth() + 1).padStart(2, "0");
    const todayDay = String(today.getDate()).padStart(2, "0");
    const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;

    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

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

      // Create date for this calendar day
      const currentDate = new Date(year, month, day);
      const currentYear = currentDate.getFullYear();
      const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");
      const currentDay = String(currentDate.getDate()).padStart(2, "0");
      const dateStr = `${currentYear}-${currentMonth}-${currentDay}`;

      // Check if it's today
      if (dateStr === todayStr) {
        dayDiv.classList.add("today");
      }

      // Check if there was activity on this day
      if (activeDays.has(dateStr)) {
        dayDiv.classList.add("logged-in");

        // Check if part of current streak (consecutive days)
        const yesterday = new Date(currentDate);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayYear = yesterday.getFullYear();
        const yesterdayMonth = String(yesterday.getMonth() + 1).padStart(
          2,
          "0"
        );
        const yesterdayDay = String(yesterday.getDate()).padStart(2, "0");
        const yesterdayStr = `${yesterdayYear}-${yesterdayMonth}-${yesterdayDay}`;

        if (activeDays.has(yesterdayStr) || dateStr === todayStr) {
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
  } catch (error) {
    console.error("❌ Error rendering calendar:", error);
  }
}

/* =========================================================
   CALENDAR NAVIGATION
   ========================================================= */

// Calendar navigation
document.getElementById("prevMonth").addEventListener("click", () => {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
  renderCalendar();
});

document.getElementById("nextMonth").addEventListener("click", () => {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
  renderCalendar();
});

/* =========================================================
   PAGE INITIALIZATION
   ========================================================= */

// Initialize page when DOM is fully loaded
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Track today's login in MongoDB
    await trackDailyLogin();

    // Update all statistics and UI elements from MongoDB
    await updateUI();

    // Render the activity calendar
    await renderCalendar();
  } catch (error) {
    console.error("❌ Error initializing progress page:", error);
  }
});
