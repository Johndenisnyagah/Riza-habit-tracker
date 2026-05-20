/* =========================================================
   RIZA HABIT TRACKER | SHARED CHART UTILITY
   
   Purpose: 
   - Reusable Chart.js wrapper for habit completion visualizations
   - Provides consistent chart styling across all pages
   - Handles data fetching and formatting from MongoDB
   
   Used By:
   - dashboard.js (weekly habit completion chart)
   - progress.js (weekly and monthly charts)
   - habits.js (potential future charts)
   
   Chart Types Supported:
   - Bar charts (default, with rounded corners)
   - Line charts (with smooth curves)
   
   Key Features:
   - Dynamic data updates from backend API
   - Automatic week calculation (Mon-Sun)
   - Zero-initialization with real-time updates
   - Responsive design (aspect ratio 3:1)
   - Customizable colors and labels
   
   Data Flow:
   1. Initialize chart with zero data
   2. Fetch habits from MongoDB via /api/habits
   3. Fetch all check-ins via /api/checkins (optimized batch call)
   4. Calculate completions per day
   5. Update chart with real data
   
   Dependencies:
   - Chart.js library (must be loaded globally)
   - api.js (getHabits, getAllCheckins functions)
   
   Author: John Denis Nyagah
   ========================================================= */

import {
  getHabits as apiGetHabits,
  getAllCheckins as apiGetAllCheckins,
} from "./api.js";

/* =========================================================
   CHART INITIALIZATION FUNCTION
   ========================================================= */

/**
 * Initialize a Chart.js progress chart with custom configuration
 *
 * @param {Object} options - Configuration options
 * @returns {Object|null} Chart instance
 */
export function initializeProgressChart(options = {}) {
  const {
    canvasId = "progressChart",
    chartType = "bar",
    label = "Habits Completed",
    color = "#74c69d",
    labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  } = options;

  const ctx = document.getElementById(canvasId);
  if (!ctx) {
    console.warn(`Canvas element '${canvasId}' not found`);
    return null;
  }

  if (typeof Chart === "undefined") {
    console.error("Chart.js library not loaded");
    return null;
  }

  const initialData = new Array(labels.length).fill(0);

  const chart = new Chart(ctx, {
    type: chartType,
    data: {
      labels,
      datasets: [
        {
          label,
          data: initialData,
          backgroundColor: color,
          borderColor: color,
          borderRadius: chartType === "bar" ? 8 : 0,
          fill: chartType === "line",
          tension: chartType === "line" ? 0.35 : 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 3,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
          grid: { color: "rgba(0,0,0,0.05)" },
        },
      },
    },
  });

  chart.updateData = function (index, value) {
    const data = chart.data.datasets[0].data;
    data[index] = value;
    chart.update();
  };

  window.updateChartData = function (index, value) {
    chart.updateData(index, value);
  };

  return chart;
}

/* =========================================================
   CHART DATA UPDATE FUNCTION
   ========================================================= */

/**
 * Update chart with current week's habit completion data from MongoDB
 *
 * Performance: Uses apiGetAllCheckins() to resolve N+1 query problem.
 *
 * @param {Object} chartInstance - Chart.js instance to update
 * @param {Array} habits - (Optional) Pre-fetched habit data
 * @param {Array} allCheckins - (Optional) Pre-fetched check-in data
 * @returns {Promise<void>}
 */
export async function updateChartWithHabitData(chartInstance, habits = null, allCheckins = null) {
  if (!chartInstance) return;

  try {
    // Optimization: Fetch only if data not already provided
    if (!habits || !allCheckins) {
      [habits, allCheckins] = await Promise.all([
        apiGetHabits(),
        apiGetAllCheckins(),
      ]);
    }

    // Performance Optimization: Hoist date calculations outside the loop
    // and use timestamps for faster numerical comparisons.
    const today = new Date();
    const todayDate = today.getDate();
    const todayDay = today.getDay();

    // Calculate Monday of current week (00:00:00)
    const monday = new Date(today);
    monday.setDate(todayDate - todayDay + (todayDay === 0 ? -6 : 1));
    monday.setHours(0, 0, 0, 0);
    const mondayTs = monday.getTime();

    // Calculate Sunday of current week (23:59:59)
    // Fix: Using monday as base ensuring exactly 7 days
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    const sundayTs = sunday.getTime();

    const weekData = [0, 0, 0, 0, 0, 0, 0]; // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]

    // Optimization: Use for...of with early break since allCheckins is sorted descending
    // This reduces complexity from O(TotalCheckins) to O(WeeklyCheckins)
    for (const checkin of allCheckins) {
      const checkinDate = new Date(checkin.date);
      const checkinTs = checkinDate.getTime();

      if (checkinTs >= mondayTs && checkinTs <= sundayTs) {
        const dayIndex = checkinDate.getDay() === 0 ? 6 : checkinDate.getDay() - 1;
        weekData[dayIndex]++;
      } else if (checkinTs < mondayTs) {
        // Exit early once we reach check-ins from previous weeks
        break;
      }
    }

    chartInstance.data.datasets[0].data = weekData;
    chartInstance.update();
  } catch (error) {
    console.error("Failed to update chart with habit data:", error);
  }
}

/**
 * Check if a given date falls within the current week
 * Used by other modules if necessary, but updateChartWithHabitData now uses
 * an optimized internal loop.
 */
function isThisWeek(date, today) {
  const todayDate = today.getDate();
  const todayDay = today.getDay();

  const monday = new Date(today);
  monday.setDate(todayDate - todayDay + (todayDay === 0 ? -6 : 1));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return date >= monday && date <= sunday;
}
