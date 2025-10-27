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
   3. Fetch check-ins for each habit via /api/checkins/habit/:id
   4. Calculate completions per day
   5. Update chart with real data
   
   Dependencies:
   - Chart.js library (must be loaded globally)
   - api.js (getHabits, getCheckins functions)
   
   Data Source: MongoDB via backend API (replaces localStorage initially used for UI testing)
   
   Author: John Denis Nyagah
   ========================================================= */

import {
  getHabits as apiGetHabits,
  getCheckins as apiGetCheckins,
} from "./api.js";

/* =========================================================
   CHART INITIALIZATION FUNCTION
   ========================================================= */

/**
 * Initialize a Chart.js progress chart with custom configuration
 *
 * Purpose:
 * - Creates a new Chart.js instance with specified options
 * - Sets up responsive bar/line chart for habit tracking
 * - Initializes with zero data (updated later via API)
 *
 * @param {Object} options - Configuration options
 * @param {string} options.canvasId - ID of canvas element (default: "progressChart")
 * @param {string} options.chartType - Chart type: "bar" or "line" (default: "bar")
 * @param {string} options.label - Dataset label (default: "Habits Completed")
 * @param {string} options.color - Chart color in hex (default: "#74c69d" - medium green)
 * @param {Array<string>} options.labels - X-axis labels (default: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])
 *
 * @returns {Object|null} Chart instance with updateData method, or null if canvas not found
 *
 * Chart Configuration:
 * - Responsive: true (adapts to container size)
 * - Aspect Ratio: 3:1 (width:height)
 * - Legend: Hidden (cleaner design)
 * - Grid: Y-axis only (horizontal lines)
 * - Bar Radius: 8px (rounded corners for bars)
 * - Line Tension: 0.35 (smooth curves for line charts)
 *
 * Error Handling:
 * - Returns null if canvas element not found
 * - Logs error if Chart.js library not loaded
 *
 * Example Usage:
 * ```javascript
 * const chart = initializeProgressChart({
 *   canvasId: "weeklyChart",
 *   chartType: "bar",
 *   color: "#2d6a4f",
 *   labels: ["W1", "W2", "W3", "W4"]
 * });
 *
 * // Update data later
 * await updateChartWithHabitData(chart);
 * ```
 */
export function initializeProgressChart(options = {}) {
  // Destructure options with defaults
  const {
    canvasId = "progressChart",
    chartType = "bar",
    label = "Habits Completed",
    color = "#74c69d", // Medium green from color palette
    labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  } = options;

  // Get canvas element from DOM
  const ctx = document.getElementById(canvasId);
  if (!ctx) {
    console.warn(`Canvas element '${canvasId}' not found`);
    return null;
  }

  // Verify Chart.js library is loaded
  if (typeof Chart === "undefined") {
    console.error("Chart.js library not loaded");
    return null;
  }

  // Initialize with zeros - updated later with real API data
  const initialData = new Array(labels.length).fill(0);

  // Create Chart.js instance
  const chart = new Chart(ctx, {
    type: chartType, // "bar" or "line"
    data: {
      labels, // X-axis labels (days or weeks)
      datasets: [
        {
          label, // Dataset label (e.g., "Habits Completed")
          data: initialData, // Start with zeros
          backgroundColor: color, // Fill color
          borderColor: color, // Border/line color
          borderRadius: chartType === "bar" ? 8 : 0, // Rounded corners for bars
          fill: chartType === "line", // Fill area under line charts
          tension: chartType === "line" ? 0.35 : 0, // Smooth curves for lines
        },
      ],
    },
    options: {
      responsive: true, // Adapt to container size
      maintainAspectRatio: true, // Keep aspect ratio
      aspectRatio: 3, // Width:height ratio (3:1)
      plugins: {
        legend: { display: false }, // Hide legend for cleaner look
      },
      scales: {
        x: {
          grid: { display: false }, // No vertical grid lines
        },
        y: {
          beginAtZero: true, // Y-axis starts at 0
          ticks: { stepSize: 1 }, // Increment by 1 (whole numbers only)
          grid: { color: "rgba(0,0,0,0.05)" }, // Subtle horizontal lines
        },
      },
    },
  });

  /* =========================================================
     CHART UPDATE UTILITY METHOD
     Purpose: Update individual data point in chart
     
     @param {number} index - Data point index (0-6 for days)
     @param {number} value - New value for that data point
     
     Example: chart.updateData(0, 5) // Set Monday to 5 completions
     ========================================================= */
  chart.updateData = function (index, value) {
    const data = chart.data.datasets[0].data;
    data[index] = value;
    chart.update(); // Redraw chart
  };

  /* =========================================================
     GLOBAL UPDATE FUNCTION (Backward Compatibility)
     Purpose: Allow non-module scripts to update chart
     
     Note: This is a legacy feature for scripts without ES6 modules
     Prefer using chart.updateData() in modern code
     ========================================================= */
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
 * Purpose:
 * - Fetches all user habits from backend
 * - Retrieves check-in history for each habit
 * - Calculates completions per day for current week
 * - Updates chart visualization with real data
 *
 * Algorithm:
 * 1. Fetch all habits via GET /api/habits
 * 2. For each habit, fetch check-ins via GET /api/checkins/habit/:id
 * 3. Filter check-ins to current week (Monday-Sunday)
 * 4. Count completions for each day
 * 5. Update chart with calculated data
 *
 * Week Definition:
 * - Week starts on Monday (index 0)
 * - Week ends on Sunday (index 6)
 * - Current week calculated from today's date
 *
 * Data Structure:
 * - weekData: [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
 * - Each value is count of habit completions for that day
 *
 * @param {Object} chartInstance - Chart.js instance to update
 *
 * @returns {Promise<void>} Resolves when chart is updated
 *
 * Error Handling:
 * - Returns early if chartInstance is null
 * - Logs error if API calls fail
 * - Chart remains with zero data on error
 *
 * Example Usage:
 * ```javascript
 * const chart = initializeProgressChart({ canvasId: "weeklyChart" });
 * await updateChartWithHabitData(chart); // Populates with real data
 * ```
 *
 * Data Flow:
 * MongoDB → Backend API → This Function → Chart.js → User sees bars
 */
export async function updateChartWithHabitData(chartInstance) {
  // Guard: Exit if no chart instance provided
  if (!chartInstance) return;

  try {
    // Step 1: Fetch all user habits from MongoDB
    const habits = await apiGetHabits();
    const today = new Date();

    // Step 2: Initialize week data array (Mon-Sun, all zeros)
    const weekData = [0, 0, 0, 0, 0, 0, 0]; // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]

    // Step 3: Fetch check-ins for all habits (parallel requests)
    const checkinPromises = habits.map((h) => apiGetCheckins(h._id || h.id));
    const checkinsArrays = await Promise.all(checkinPromises);

    // Step 4: Process all check-ins and count by day
    checkinsArrays.forEach((checkins) => {
      checkins.forEach((checkin) => {
        const date = new Date(checkin.date);

        // Only count check-ins from current week
        if (isThisWeek(date, today)) {
          // Convert JavaScript day (0=Sun, 1=Mon) to chart index (0=Mon, 6=Sun)
          const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
          weekData[dayIndex]++;
        }
      });
    });

    // Step 5: Update chart with calculated data
    chartInstance.data.datasets[0].data = weekData;
    chartInstance.update(); // Redraw chart with new data
  } catch (error) {
    console.error("Failed to update chart with habit data:", error);
    // Chart remains with zero/previous data on error
  }
}

/* =========================================================
   HELPER FUNCTION: WEEK DATE CHECKER
   ========================================================= */

/**
 * Check if a given date falls within the current week
 *
 * Purpose:
 * - Determines if a check-in date is in the current week
 * - Used to filter check-ins for weekly chart
 *
 * Week Definition:
 * - Week starts on Monday at 00:00:00
 * - Week ends on Sunday at 23:59:59
 * - Handles edge case where today is Sunday (day 0)
 *
 * Algorithm:
 * 1. Calculate Monday of current week
 *    - If today is Sunday (0), go back 6 days
 *    - Otherwise, go back to Monday (day 1)
 * 2. Calculate Sunday of current week
 *    - Go forward to end of week
 * 3. Check if date falls between Monday and Sunday (inclusive)
 *
 * @param {Date} date - Date to check (e.g., check-in date)
 * @param {Date} today - Reference date (current date)
 *
 * @returns {boolean} True if date is in current week, false otherwise
 *
 * Example:
 * ```javascript
 * const checkinDate = new Date("2025-10-20"); // Monday
 * const today = new Date("2025-10-22"); // Wednesday
 * isThisWeek(checkinDate, today); // true
 *
 * const oldDate = new Date("2025-10-13"); // Last Monday
 * isThisWeek(oldDate, today); // false
 * ```
 *
 * Edge Cases:
 * - Today is Sunday: Week calculated from previous Monday
 * - Date is Monday at 00:00:00: Included in week
 * - Date is Sunday at 23:59:59: Included in week
 */
function isThisWeek(date, today) {
  const todayDate = today.getDate();
  const todayDay = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

  // Calculate Monday of current week (start of week)
  const monday = new Date(today);
  monday.setDate(todayDate - todayDay + (todayDay === 0 ? -6 : 1));
  monday.setHours(0, 0, 0, 0); // Start of Monday

  // Calculate Sunday of current week (end of week)
  const sunday = new Date(today);
  sunday.setDate(todayDate + (7 - todayDay));
  sunday.setHours(23, 59, 59, 999); // End of Sunday

  // Check if date falls within week range (inclusive)
  return date >= monday && date <= sunday;
}
