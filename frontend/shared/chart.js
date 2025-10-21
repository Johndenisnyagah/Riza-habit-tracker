/* =========================================================
   Riza Shared Chart Utility
   - Reusable Chart.js function for any page
   - Supports Weekly, Monthly, or Custom charts
   - Used by: dashboard.html, progress.html, habits.html
   ========================================================= */

// Storage keys
const CHART_STORAGE_KEY = "rizaWeekData";

/**
 * Initialize the progress chart
 * @param {Object} options - Configuration options
 * @returns {Object} Chart instance with updateData method
 */
export function initializeProgressChart(options = {}) {
  const {
    canvasId = "progressChart",
    storageKey = CHART_STORAGE_KEY,
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

  const savedData =
    JSON.parse(localStorage.getItem(storageKey)) ||
    new Array(labels.length).fill(0);

  const chart = new Chart(ctx, {
    type: chartType,
    data: {
      labels,
      datasets: [
        {
          label,
          data: savedData,
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
        x: { grid: { display: false } },
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
          grid: { color: "rgba(0,0,0,0.05)" },
        },
      },
    },
  });

  // Utility for updating and saving data
  chart.updateData = function (index, value) {
    const data = chart.data.datasets[0].data;
    data[index] = value;
    chart.update();
    localStorage.setItem(storageKey, JSON.stringify(data));
  };

  // Global function for backward compatibility
  window.updateChartData = function (index, value) {
    chart.updateData(index, value);
  };

  return chart;
}

/**
 * Update chart with current week's habit completions
 * @param {Object} chartInstance - Chart instance to update
 */
export function updateChartWithHabitData(chartInstance) {
  if (!chartInstance) return;

  const habits = JSON.parse(localStorage.getItem("rizaHabits")) || [];
  const completions =
    JSON.parse(localStorage.getItem("habitCompletions")) || {};
  const today = new Date();

  // Calculate data for each day of the week
  const weekData = [0, 0, 0, 0, 0, 0, 0]; // Mon-Sun

  habits.forEach((habit) => {
    if (completions[habit.id]) {
      completions[habit.id].forEach((dateStr) => {
        const date = new Date(dateStr);
        if (isThisWeek(date, today)) {
          const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1; // Convert to Mon=0
          weekData[dayIndex]++;
        }
      });
    }
  });

  // Update chart data
  chartInstance.data.datasets[0].data = weekData;
  chartInstance.update();
  localStorage.setItem(CHART_STORAGE_KEY, JSON.stringify(weekData));
}

/**
 * Helper function to check if date is in current week
 */
function isThisWeek(date, today) {
  const todayDate = today.getDate();
  const todayDay = today.getDay();

  const monday = new Date(today);
  monday.setDate(todayDate - todayDay + (todayDay === 0 ? -6 : 1));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(today);
  sunday.setDate(todayDate + (7 - todayDay));
  sunday.setHours(23, 59, 59, 999);

  return date >= monday && date <= sunday;
}
