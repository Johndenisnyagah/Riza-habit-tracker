/* =========================================================
   SHARED HABIT MANAGER
   - Unified CRUD operations for habits
   - Used across all pages (dashboard, habits, progress)
   - Consistent storage keys and behavior
   ========================================================= */

// Storage keys - UNIFIED across all pages
const STORAGE_KEY = "rizaHabits";
const COMPLETIONS_KEY = "habitCompletions";

// State variables
let isEditing = false;
let currentHabitId = null;
let chartInstance = null;
let currentFilter = "all";

/**
 * Initialize the habit manager
 * @param {Object} options - Configuration options
 */
export function initializeHabitManager(options = {}) {
  console.log("Initializing shared habit manager");

  // Store chart instance if provided
  if (options.chartInstance) {
    chartInstance = options.chartInstance;
  }

  // Setup event listeners
  setupEventListeners(options);

  // Render habits if container exists
  const habitListId = options.habitListId || "habit-list";
  updateHabitSummaryList(habitListId);
}

/**
 * Setup all event listeners
 */
function setupEventListeners(options = {}) {
  // Open modal button
  const openModalBtn = document.querySelector(
    options.openModalSelector || ".open-habit-modal"
  );
  if (openModalBtn) {
    openModalBtn.addEventListener("click", () => openModal());
  }

  // Close modal buttons
  const closeBtn = document.querySelector(".close-modal");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  const cancelBtn = document.querySelector(".cancel-btn");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", closeModal);
  }

  // Save habit button
  const saveBtn = document.querySelector(".save-btn");
  if (saveBtn) {
    saveBtn.addEventListener("click", saveHabit);
  }

  // Delete habit button
  const deleteBtn = document.querySelector(".delete-btn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      if (currentHabitId) {
        deleteHabit(currentHabitId);
      }
    });
  }

  // Frequency buttons
  document.querySelectorAll(".freq-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault(); // Prevent form submission
      document
        .querySelectorAll(".freq-btn")
        .forEach((b) => b.classList.remove("active"));
      this.classList.add("active");

      // Show/hide custom days based on selection
      const customDaysDiv = document.querySelector(".custom-days");
      if (customDaysDiv) {
        if (this.dataset.value === "custom") {
          customDaysDiv.classList.remove("hidden");
        } else {
          customDaysDiv.classList.add("hidden");
        }
      }
    });
  });

  // Icon selection
  document.querySelectorAll(".icon-option").forEach((icon) => {
    icon.addEventListener("click", function (e) {
      e.preventDefault(); // Prevent any default action
      document
        .querySelectorAll(".icon-option")
        .forEach((i) => i.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // Filter buttons
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      // Update active state
      document
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("active"));
      this.classList.add("active");

      // Update filter and refresh display
      currentFilter = this.dataset.filter;
      const habitListId = options.habitListId || "habit-list";
      updateHabitSummaryList(habitListId);
    });
  });
}

/**
 * Open the modal for adding or editing a habit
 * @param {Object} habitData - Habit data for editing, null for adding
 */
export function openModal(habitData = null) {
  const modal = document.getElementById("habit-modal");
  const modalTitle = document.getElementById("modal-title");
  const habitForm = document.getElementById("habit-form");
  const deleteBtn = document.querySelector(".delete-btn");

  if (!modal || !habitForm) {
    console.error("Modal or form not found");
    return;
  }

  // Reset form
  habitForm.reset();

  // Reset frequency and icon selections
  document
    .querySelectorAll(".freq-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document
    .querySelectorAll(".icon-option")
    .forEach((icon) => icon.classList.remove("active"));

  if (habitData) {
    // EDIT MODE
    isEditing = true;
    currentHabitId = habitData.id;
    modalTitle.textContent = "Edit Habit";
    deleteBtn?.classList.remove("hidden");

    // Fill form with habit data
    document.getElementById("habit-name").value = habitData.name || "";
    document.getElementById("habit-description").value =
      habitData.description || "";

    // Set frequency
    const freqBtn = document.querySelector(
      `.freq-btn[data-value="${habitData.frequency || "daily"}"]`
    );
    if (freqBtn) freqBtn.classList.add("active");

    // Set icon
    const iconOption = document.querySelector(
      `.icon-option[data-icon="${habitData.icon || "meditation.svg"}"]`
    );
    if (iconOption) iconOption.classList.add("active");
  } else {
    // ADD MODE
    isEditing = false;
    currentHabitId = null;
    modalTitle.textContent = "Add New Habit";
    deleteBtn?.classList.add("hidden");

    // Set default frequency to daily
    const dailyBtn = document.querySelector('.freq-btn[data-value="daily"]');
    if (dailyBtn) dailyBtn.classList.add("active");

    // Set default icon
    const defaultIcon = document.querySelector(".icon-option");
    if (defaultIcon) defaultIcon.classList.add("active");
  }

  // Show modal
  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");

  // Focus the name input
  setTimeout(() => {
    document.getElementById("habit-name")?.focus();
  }, 300);
}

/**
 * Close the habit modal
 */
export function closeModal() {
  const modal = document.getElementById("habit-modal");
  if (!modal) return;

  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");

  // Reset state
  isEditing = false;
  currentHabitId = null;
}

/**
 * Save the current habit (add or update)
 */
function saveHabit() {
  // Collect form data
  const nameField = document.getElementById("habit-name");
  if (!nameField) {
    console.error("Name field not found");
    return;
  }

  const name = nameField.value.trim();
  if (!name) {
    alert("Please enter a habit name");
    return;
  }

  // Get selected frequency
  const frequencyBtn = document.querySelector(".freq-btn.active");
  const frequency = frequencyBtn ? frequencyBtn.dataset.value : "daily";

  // Get selected icon
  const iconOption = document.querySelector(".icon-option.active");
  const icon = iconOption ? iconOption.dataset.icon : "meditation.svg";

  // Create habit object
  const habit = {
    id: isEditing ? currentHabitId : Date.now().toString(),
    name,
    description: document.getElementById("habit-description")?.value || "",
    frequency,
    icon,
    createdAt: isEditing ? undefined : new Date().toISOString(),
    streak: isEditing ? undefined : 0,
  };

  if (isEditing) {
    updateHabit(habit);
  } else {
    addHabit(habit);
  }

  // Close modal and refresh UI
  closeModal();
  refreshHabitDisplay();
}

/**
 * Add a new habit to storage
 * @param {Object} habit - The habit object to add
 */
export function addHabit(habit) {
  let habits = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  habits.push(habit);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  console.log("Habit added:", habit);
}

/**
 * Update an existing habit in storage
 * @param {Object} updatedHabit - The habit object with updates
 */
export function updateHabit(updatedHabit) {
  let habits = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const index = habits.findIndex((h) => h.id === updatedHabit.id);

  if (index !== -1) {
    // Preserve fields not in the update
    habits[index] = {
      ...habits[index],
      ...updatedHabit,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
    console.log("Habit updated:", updatedHabit);
  }
}

/**
 * Delete a habit from storage
 * @param {String} habitId - The ID of the habit to delete
 */
export function deleteHabit(habitId) {
  if (!confirm("Are you sure you want to delete this habit?")) return;

  let habits = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  habits = habits.filter((h) => h.id !== habitId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));

  // Also remove completions
  const completions = JSON.parse(localStorage.getItem(COMPLETIONS_KEY)) || {};
  delete completions[habitId];
  localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(completions));

  console.log("Habit deleted:", habitId);

  // Close modal and refresh UI
  closeModal();
  refreshHabitDisplay();
}

/**
 * Update the habit summary list in a container
 * @param {String} elementId - ID of the container element
 */
export function updateHabitSummaryList(elementId = "habit-list") {
  const habitList = document.getElementById(elementId);
  if (!habitList) {
    console.warn(`Habit list element '${elementId}' not found`);
    return;
  }

  let habits = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const completions = JSON.parse(localStorage.getItem(COMPLETIONS_KEY)) || {};
  const today = new Date().toISOString().split("T")[0];

  // Apply filter
  if (currentFilter !== "all") {
    habits = habits.filter((habit) => habit.frequency === currentFilter);
  }

  habitList.innerHTML = "";

  if (habits.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.textContent =
      currentFilter === "all"
        ? "No habits added yet. Click 'Add Habit' to get started."
        : `No ${currentFilter} habits found.`;
    emptyMessage.className = "empty-message";
    habitList.appendChild(emptyMessage);
    return;
  }

  habits.forEach((habit) => {
    const isCompleted =
      completions[habit.id] && completions[habit.id].includes(today);

    const item = document.createElement("li");
    item.className = `habit-item ${isCompleted ? "completed" : ""}`;
    item.dataset.id = habit.id;

    item.innerHTML = `
      <div class="habit-left">
        <label class="checkbox-container">
          <input type="checkbox" ${isCompleted ? "checked" : ""}>
          <span class="checkmark"></span>
        </label>
        <img src="../assets/habit-icons/${
          habit.icon || "meditation.svg"
        }" class="icon" alt="">
        <div class="habit-info">
          <span class="habit-name">${habit.name}</span>
          ${
            habit.description
              ? `<span class="habit-description">${habit.description}</span>`
              : ""
          }
        </div>
      </div>
      <div class="habit-actions">
        <button class="btn-outline edit-btn" data-id="${habit.id}">
          <i class="fa-solid fa-pen"></i>
          <span class="btn-text">Edit</span>
        </button>
        <button class="btn-outline delete-btn-item" data-id="${habit.id}">
          <i class="fa-solid fa-trash"></i>
          <span class="btn-text">Delete</span>
        </button>
      </div>
    `;

    // Add click handler for checkbox
    const checkbox = item.querySelector("input[type='checkbox']");
    checkbox.addEventListener("change", function () {
      toggleHabitCompletion(habit.id, this);
    });

    // Add click handler for edit button
    const editBtn = item.querySelector(".edit-btn");
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openModal(habit);
    });

    // Add click handler for delete button
    const deleteBtn = item.querySelector(".delete-btn-item");
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteHabit(habit.id);
    });

    habitList.appendChild(item);
  });
}

/**
 * Toggle completion status of a habit
 * @param {String} habitId - ID of the habit
 * @param {HTMLElement} checkbox - The checkbox element
 */
export function toggleHabitCompletion(habitId, checkbox) {
  const today = new Date().toISOString().split("T")[0];
  const completions = JSON.parse(localStorage.getItem(COMPLETIONS_KEY)) || {};

  // Initialize if doesn't exist
  if (!completions[habitId]) {
    completions[habitId] = [];
  }

  const isChecked = checkbox.checked;

  if (isChecked) {
    // Add completion
    if (!completions[habitId].includes(today)) {
      completions[habitId].push(today);

      // Update habit streak
      const habits = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      const habit = habits.find((h) => h.id === habitId);
      if (habit) {
        habit.streak = (habit.streak || 0) + 1;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
      }
    }
  } else {
    // Remove completion
    completions[habitId] = completions[habitId].filter((d) => d !== today);

    // Update habit streak
    const habits = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const habit = habits.find((h) => h.id === habitId);
    if (habit && habit.streak > 0) {
      habit.streak--;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
    }
  }

  // Save completions
  localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(completions));

  // Update UI
  const item = checkbox.closest(".habit-item");
  if (item) {
    if (isChecked) {
      item.classList.add("completed");
    } else {
      item.classList.remove("completed");
    }
  }

  // Update chart if available
  if (chartInstance) {
    import("./chart.js").then((module) => {
      module.updateChartWithHabitData(chartInstance);
    });
  } else if (window.updateChartData) {
    // Fallback to global function
    updateChartForToday();
  }

  // Update other UI elements
  updateTodayCheckins();
  updateStreakCount();
}

/**
 * Update chart for today's completions
 */
function updateChartForToday() {
  const habits = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const completions = JSON.parse(localStorage.getItem(COMPLETIONS_KEY)) || {};
  const today = new Date().toISOString().split("T")[0];

  let todayCount = 0;
  habits.forEach((habit) => {
    if (completions[habit.id] && completions[habit.id].includes(today)) {
      todayCount++;
    }
  });

  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  if (window.updateChartData) {
    window.updateChartData(todayIndex, todayCount);
  }
}

/**
 * Update streak count display
 */
export function updateStreakCount() {
  const streakElement = document.getElementById("streak-count");
  if (!streakElement) return;

  const habits = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const completions = JSON.parse(localStorage.getItem(COMPLETIONS_KEY)) || {};

  let currentStreak = 0;
  let checkDate = new Date();

  // Check consecutive days backwards
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

  streakElement.textContent = `${currentStreak} day${
    currentStreak !== 1 ? "s" : ""
  }`;
}

/**
 * Update today's checkins count
 */
function updateTodayCheckins() {
  const checkinsElement = document.querySelector(".checkins p");
  if (!checkinsElement) return;

  const habits = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const completions = JSON.parse(localStorage.getItem(COMPLETIONS_KEY)) || {};
  const today = new Date().toISOString().split("T")[0];

  let completed = 0;
  habits.forEach((habit) => {
    if (completions[habit.id] && completions[habit.id].includes(today)) {
      completed++;
    }
  });

  checkinsElement.textContent = `${completed}/${habits.length} habits completed`;
}

/**
 * Update all habit-related UI elements
 */
export function refreshHabitDisplay() {
  updateHabitSummaryList();
  updateStreakCount();
  updateTodayCheckins();

  // Update chart if available
  if (chartInstance) {
    import("./chart.js").then((module) => {
      module.updateChartWithHabitData(chartInstance);
    });
  }
}

// Export for global access
window.habitManager = {
  initializeHabitManager,
  openModal,
  closeModal,
  addHabit,
  updateHabit,
  deleteHabit,
  updateHabitSummaryList,
  toggleHabitCompletion,
  updateStreakCount,
  refreshHabitDisplay,
};
