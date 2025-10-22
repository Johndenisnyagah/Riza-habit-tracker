/* =========================================================
   SHARED HABIT MANAGER
   - Unified CRUD operations for habits
   - Used across all pages (dashboard, habits, progress)
   - NOW USING BACKEND API INSTEAD OF LOCALSTORAGE
   ========================================================= */

import {
  getHabits as apiGetHabits,
  createHabit as apiCreateHabit,
  updateHabit as apiUpdateHabit,
  deleteHabit as apiDeleteHabit,
  toggleHabitCompletion as apiToggleCompletion,
  getCheckins as apiGetCheckins,
  getHabitStreak as apiGetStreak,
} from "./api.js";

// Cache for habits (reduces API calls)
let habitsCache = null;
let checkinsCache = {};

// State variables
let isEditing = false;
let currentHabitId = null;
let chartInstance = null;
let currentFilter = "all";
let onHabitChangeCallback = null; // Callback for when habits are added/updated/deleted

/**
 * Load habits from API (with caching)
 * @returns {Promise<Array>} Array of habits
 */
async function loadHabitsFromAPI() {
  try {
    const habits = await apiGetHabits();
    habitsCache = habits;
    return habits;
  } catch (error) {
    console.error("Failed to load habits:", error);
    return [];
  }
}

/**
 * Get habits (uses cache or fetches from API)
 * @param {boolean} forceRefresh - Force refresh from API
 * @returns {Promise<Array>} Array of habits
 */
export async function getHabitsData(forceRefresh = false) {
  if (!habitsCache || forceRefresh) {
    return await loadHabitsFromAPI();
  }
  return habitsCache;
}

/**
 * Initialize the habit manager
 * @param {Object} options - Configuration options
 * @param {Function} options.onHabitChange - Callback when habits change
 */
export async function initializeHabitManager(options = {}) {
  console.log("Initializing shared habit manager with API");

  // Store chart instance if provided
  if (options.chartInstance) {
    chartInstance = options.chartInstance;
  }

  // Store callback if provided
  if (options.onHabitChange && typeof options.onHabitChange === "function") {
    onHabitChangeCallback = options.onHabitChange;
  }

  // Load habits from API
  await loadHabitsFromAPI();

  // Setup event listeners
  setupEventListeners(options);

  // Render habits if container exists
  const habitListId = options.habitListId || "habit-list";
  await updateHabitSummaryList(habitListId);
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

    // Show custom days section if frequency is custom
    const customDaysDiv = document.querySelector(".custom-days");
    if (habitData.frequency === "custom" && customDaysDiv) {
      customDaysDiv.classList.remove("hidden");

      // Check the custom days
      if (habitData.customDays && habitData.customDays.length > 0) {
        habitData.customDays.forEach((day) => {
          const checkbox = document.querySelector(
            `.day-checkboxes input[value="${day}"]`
          );
          if (checkbox) checkbox.checked = true;
        });
      }
    }

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

  // Remove focus from any focused element inside the modal
  if (document.activeElement && modal.contains(document.activeElement)) {
    document.activeElement.blur();
  }

  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");

  // Reset state
  isEditing = false;
  currentHabitId = null;
}

/**
 * Save the current habit (add or update)
 */
async function saveHabit() {
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

  // Get custom days if frequency is custom
  let customDays = [];
  if (frequency === "custom") {
    const checkedDays = document.querySelectorAll(
      '.day-checkboxes input[type="checkbox"]:checked'
    );
    customDays = Array.from(checkedDays).map((cb) => cb.value);

    if (customDays.length === 0) {
      alert("Please select at least one day for custom frequency");
      return;
    }
  }

  // Get selected icon
  const iconOption = document.querySelector(".icon-option.active");
  const icon = iconOption ? iconOption.dataset.icon : "meditation.svg";

  // Create habit object
  const habit = {
    id: isEditing ? currentHabitId : Date.now().toString(),
    name,
    description: document.getElementById("habit-description")?.value || "",
    frequency,
    customDays: frequency === "custom" ? customDays : [],
    icon,
    createdAt: isEditing ? undefined : new Date().toISOString(),
    streak: isEditing ? undefined : 0,
  };

  try {
    if (isEditing) {
      await updateHabit(habit);
    } else {
      await addHabit(habit);
    }

    // Close modal and refresh UI
    closeModal();
    await refreshHabitDisplay();
  } catch (error) {
    console.error("Failed to save habit:", error);
    alert("Failed to save habit. Please try again.");
  }
}

/**
 * Add a new habit to storage
 * @param {Object} habit - The habit object to add
 */
export async function addHabit(habit) {
  try {
    const createdHabit = await apiCreateHabit(habit);
    console.log("Habit created via API:", createdHabit);
    // Refresh cache
    await loadHabitsFromAPI();

    // Call custom callback if provided
    if (onHabitChangeCallback) {
      await onHabitChangeCallback();
    }

    return createdHabit;
  } catch (error) {
    console.error("Failed to create habit:", error);
    throw error;
  }
}

/**
 * Update an existing habit via API
 * @param {Object} updatedHabit - The habit object with updates
 */
export async function updateHabit(updatedHabit) {
  try {
    // Backend uses _id, frontend uses id
    const habitId = updatedHabit._id || updatedHabit.id;
    const updated = await apiUpdateHabit(habitId, updatedHabit);
    console.log("Habit updated via API:", updated);
    // Refresh cache
    await loadHabitsFromAPI();

    // Call custom callback if provided
    if (onHabitChangeCallback) {
      await onHabitChangeCallback();
    }

    return updated;
  } catch (error) {
    console.error("Failed to update habit:", error);
    throw error;
  }
}

/**
 * Delete a habit from storage
 * @param {String} habitId - The ID of the habit to delete
 */
export async function deleteHabit(habitId) {
  if (!confirm("Are you sure you want to delete this habit?")) return;

  try {
    await apiDeleteHabit(habitId);
    console.log("Habit deleted via API:", habitId);
    // Refresh cache
    await loadHabitsFromAPI();

    // Call custom callback if provided
    if (onHabitChangeCallback) {
      await onHabitChangeCallback();
    }

    // Close modal and refresh UI
    closeModal();
    await refreshHabitDisplay();
  } catch (error) {
    console.error("Failed to delete habit:", error);
    alert("Failed to delete habit. Please try again.");
  }
}

/**
 * Update the habit summary list in a container
 * @param {String} elementId - ID of the container element
 */
export async function updateHabitSummaryList(elementId = "habit-list") {
  const habitList = document.getElementById(elementId);
  if (!habitList) {
    console.warn(`Habit list element '${elementId}' not found`);
    return;
  }

  try {
    let habits = await getHabitsData();
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

    // Get checkins for all habits
    const checkinPromises = habits.map((h) => apiGetCheckins(h._id || h.id));
    const checkinsArrays = await Promise.all(checkinPromises);

    // Build completion map
    const completions = {};
    habits.forEach((habit, index) => {
      const habitId = habit._id || habit.id;
      completions[habitId] = checkinsArrays[index].map(
        (c) => c.date.split("T")[0]
      );
    });

    habits.forEach((habit) => {
      const habitId = habit._id || habit.id;
      const isCompleted =
        completions[habitId] && completions[habitId].includes(today);

      const item = document.createElement("li");
      item.className = `habit-item ${isCompleted ? "completed" : ""}`;
      item.dataset.id = habitId;

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
          <button class="btn-outline edit-btn" data-id="${habitId}">
            <i class="fa-solid fa-pen"></i>
            <span class="btn-text">Edit</span>
          </button>
          <button class="btn-outline delete-btn-item" data-id="${habitId}">
            <i class="fa-solid fa-trash"></i>
            <span class="btn-text">Delete</span>
          </button>
        </div>
      `;

      // Add click handler for checkbox
      const checkbox = item.querySelector("input[type='checkbox']");
      checkbox.addEventListener("change", function () {
        toggleHabitCompletion(habitId, this);
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
        deleteHabit(habitId);
      });

      habitList.appendChild(item);
    });
  } catch (error) {
    console.error("Failed to update habit list:", error);
  }
}

/**
 * Toggle completion status of a habit
 * @param {String} habitId - ID of the habit
 * @param {HTMLElement} checkbox - The checkbox element
 */
export async function toggleHabitCompletion(habitId, checkbox) {
  const isChecked = checkbox.checked;

  try {
    // Call API to toggle completion (backend handles today's date)
    await apiToggleCompletion(habitId);
    console.log("Toggled completion for habit:", habitId);

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
      import("./chart.js").then(async (module) => {
        await module.updateChartWithHabitData(chartInstance);
      });
    } else if (window.updateChartData) {
      // Fallback to global function
      await updateChartForToday();
    }

    // Update other UI elements
    await updateTodayCheckins();
    await updateStreakCount();
  } catch (error) {
    console.error("Failed to toggle habit completion:", error);
    // Revert checkbox on error
    checkbox.checked = !checkbox.checked;
  }
}

/**
 * Update chart for today's completions
 */
async function updateChartForToday() {
  try {
    const habits = await getHabitsData();
    const today = new Date().toISOString().split("T")[0];

    // Get checkins for all habits
    const checkinPromises = habits.map((h) => apiGetCheckins(h._id || h.id));
    const checkinsArrays = await Promise.all(checkinPromises);

    let todayCount = 0;
    checkinsArrays.forEach((checkins) => {
      if (checkins.some((c) => c.date.split("T")[0] === today)) {
        todayCount++;
      }
    });

    const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
    if (window.updateChartData) {
      window.updateChartData(todayIndex, todayCount);
    }
  } catch (error) {
    console.error("Failed to update chart:", error);
  }
}

/**
 * Update streak count display
 */
export async function updateStreakCount() {
  const streakElement = document.getElementById("streak-count");
  if (!streakElement) return;

  try {
    const habits = await getHabitsData();

    // Get all checkins for all habits
    const checkinPromises = habits.map((h) => apiGetCheckins(h._id || h.id));
    const checkinsArrays = await Promise.all(checkinPromises);

    // Build completion map
    const completions = {};
    habits.forEach((habit, index) => {
      const habitId = habit._id || habit.id;
      completions[habitId] = checkinsArrays[index].map(
        (c) => c.date.split("T")[0]
      );
    });

    let currentStreak = 0;
    let checkDate = new Date();

    // Check consecutive days backwards
    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0];
      let anyCompleted = false;

      for (const habit of habits) {
        const habitId = habit._id || habit.id;
        if (completions[habitId] && completions[habitId].includes(dateStr)) {
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
  } catch (error) {
    console.error("Failed to update streak count:", error);
  }
}

/**
 * Update today's checkins count
 */
async function updateTodayCheckins() {
  const checkinsElement = document.querySelector(".checkins-status");
  if (!checkinsElement) return;

  try {
    const habits = await getHabitsData();
    const today = new Date().toISOString().split("T")[0];

    // Get checkins for all habits
    const checkinPromises = habits.map((h) => apiGetCheckins(h._id || h.id));
    const checkinsArrays = await Promise.all(checkinPromises);

    let completed = 0;
    checkinsArrays.forEach((checkins) => {
      if (checkins.some((c) => c.date.split("T")[0] === today)) {
        completed++;
      }
    });

    checkinsElement.textContent = `${completed}/${habits.length} habits completed`;
  } catch (error) {
    console.error("Failed to update today's checkins:", error);
  }
}

/**
 * Update all habit-related UI elements
 */
export async function refreshHabitDisplay() {
  await updateHabitSummaryList();
  await updateStreakCount();
  await updateTodayCheckins();

  // Update chart if available
  if (chartInstance) {
    import("./chart.js").then(async (module) => {
      await module.updateChartWithHabitData(chartInstance);
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
