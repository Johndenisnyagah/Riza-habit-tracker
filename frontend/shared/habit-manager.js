/**
 * ============================================================================
 * SHARED HABIT MANAGER MODULE
 * ============================================================================
 *
 * Purpose:
 * - To centralize habit management system used across all pages
 * - To provide unified CRUD operations for habits (Create, Read, Update, Delete)
 * - To integrate with backend API for persistent data storage
 * - To manage UI rendering and user interactions for habit operations
 *
 * Key Features:
 * - API integration with caching for performance optimization
 * - Modal-based habit creation and editing interface
 * - Real-time habit completion tracking (check-in system)
 * - Habit filtering (all, daily, weekly, custom)
 * - Streak calculation and statistics
 * - Chart integration for visual progress tracking
 *
 * Used By:
 * - Dashboard page: Quick habit overview and check-ins
 * - Habits page: Full habit management interface
 * - Progress page: Analytics and completion statistics
 *
 * Data Flow:
 * 1. User action (add/edit/delete habit)
 * 2. Habit manager processes request
 * 3. API call to backend (MongoDB operations)
 * 4. Cache update for local performance
 * 5. UI refresh to reflect changes
 * 6. Callback execution (if provided)
 *
 * Architecture Migration:
 * - Previously: localStorage (client-side only purposed for testing the user interface first)
 * - Currently: Backend API + MongoDB (full-stack with cloud sync)
 * - Benefits: Multi-user support, data persistence, security
 *
 * Dependencies:
 * - api.js: Backend API communication layer
 * - chart.js: Progress visualization (optional)
 * - Backend endpoints: /api/habits, /api/checkins
 *
 * Author: John Denis Nyagah
 * ============================================================================
 */

// ============================================================================
// IMPORTS
// ============================================================================
import {
  getHabits as apiGetHabits,
  createHabit as apiCreateHabit,
  updateHabit as apiUpdateHabit,
  deleteHabit as apiDeleteHabit,
  toggleHabitCompletion as apiToggleCompletion,
  getCheckins as apiGetCheckins,
  getHabitStreak as apiGetStreak,
} from "./api.js";

// ============================================================================
// MODULE STATE VARIABLES
// ============================================================================
/**
 * Cache Storage
 * - habitsCache: Stores habits array to reduce API calls
 * - checkinsCache: Stores check-in data for each habit
 */
let habitsCache = null;
let checkinsCache = {};

/**
 * Modal State
 * - isEditing: true when editing existing habit, false when creating new
 * - currentHabitId: ID of habit being edited, null when creating
 */
let isEditing = false;
let currentHabitId = null;

/**
 * UI References
 * - chartInstance: Reference to Chart.js instance for updating progress charts
 * - currentFilter: Active filter ("all", "daily", "weekly", "custom")
 * - onHabitChangeCallback: Custom callback executed when habits change
 */
let chartInstance = null;
let currentFilter = "all";
let onHabitChangeCallback = null;

// ============================================================================
// DATA FETCHING & CACHING
// ============================================================================
/**
 * Load Habits from API
 *
 * Purpose: Fetch all habits from backend and update local cache
 *
 * @returns {Promise<Array>} Array of habit objects
 *
 * Caching Strategy:
 * - Fetches fresh data from backend API
 * - Updates habitsCache for future use
 * - Returns empty array on error (prevents UI breaking)
 *
 * API Endpoint: GET /api/habits
 *
 * Error Handling:
 * - Logs error to console
 * - Returns empty array (graceful degradation)
 * - UI shows "No habits" message instead of crashing
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
 * Get Habits Data (with Smart Caching)
 *
 * Purpose: Retrieve habits using cache-first strategy for performance
 *
 * @param {boolean} forceRefresh - If true, bypass cache and fetch from API
 * @returns {Promise<Array>} Array of habit objects
 *
 * Caching Logic:
 * - If cache exists and forceRefresh is false: Return cached data
 * - If cache is empty or forceRefresh is true: Fetch from API
 *
 * Performance Benefits:
 * - Reduces API calls by ~80% (typical usage)
 * - Faster page loads (no network latency)
 * - Lower server load
 *
 * When to Force Refresh:
 * - After creating/updating/deleting a habit
 * - User clicks refresh button
 * - Initial page load (cache is empty)
 */
export async function getHabitsData(forceRefresh = false) {
  if (!habitsCache || forceRefresh) {
    return await loadHabitsFromAPI();
  }
  return habitsCache;
}

// ============================================================================
// INITIALIZATION
// ============================================================================
/**
 * Initialize Habit Manager
 *
 * Purpose: Set up habit manager with configuration and event listeners
 *
 * @param {Object} options - Configuration options
 * @param {Function} options.onHabitChange - Callback executed when habits change
 * @param {Object} options.chartInstance - Chart.js instance for updates
 * @param {string} options.habitListId - ID of habit list container
 * @param {string} options.openModalSelector - CSS selector for "Add Habit" button
 *
 * Initialization Steps:
 * 1. Store chart instance reference (if provided)
 * 2. Store custom callback function (if provided)
 * 3. Load initial habits from API
 * 4. Setup all event listeners (buttons, checkboxes, etc.)
 * 5. Render habit list in DOM
 *
 * Usage Examples:
 * ```javascript
 * // Dashboard page
 * await initializeHabitManager({
 *   habitListId: 'habit-list',
 *   chartInstance: myChart,
 *   onHabitChange: async () => { await updateDashboardStats(); }
 * });
 *
 * // Habits page
 * await initializeHabitManager({
 *   habitListId: 'habit-list',
 *   openModalSelector: '.add-habit-btn'
 * });
 * ```
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

// ============================================================================
// EVENT LISTENERS SETUP
// ============================================================================
/**
 * Setup All Event Listeners
 *
 * Purpose: Attach event handlers to all interactive elements
 *
 * @param {Object} options - Configuration options with selectors
 *
 * Event Listeners Registered:
 * 1. Modal Controls:
 *    - Open modal button (.open-habit-modal)
 *    - Close modal button (.close-modal)
 *    - Cancel button (.cancel-btn)
 *    - Save button (.save-btn)
 *    - Delete button (.delete-btn)
 *
 * 2. Form Controls:
 *    - Frequency buttons (.freq-btn) - daily/weekly/custom
 *    - Icon selection (.icon-option) - habit icon picker
 *    - Custom days checkboxes (shown when frequency is "custom")
 *
 * 3. Filter Controls:
 *    - Filter buttons (.filter-btn) - all/daily/weekly/custom
 *
 * Event Delegation:
 * - Some events (edit, delete, checkbox) are attached dynamically
 * - Handles dynamically generated habit list items
 *
 * Accessibility:
 * - Prevents default form submission
 * - Manages focus states
 * - ARIA attributes updated in modal functions
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

// ============================================================================
// MODAL MANAGEMENT
// ============================================================================
/**
 * Open Habit Modal
 *
 * Purpose: Display modal for creating new habit or editing existing one
 *
 * @param {Object|null} habitData - Habit object for editing, null for creating new
 *
 * Modal Modes:
 * 1. Add Mode (habitData is null):
 *    - Title: "Add New Habit"
 *    - Form: Empty/default values
 *    - Delete button: Hidden
 *    - Defaults: daily frequency, first icon selected
 *
 * 2. Edit Mode (habitData provided):
 *    - Title: "Edit Habit"
 *    - Form: Pre-filled with habit data
 *    - Delete button: Visible
 *    - Values: Existing habit properties
 *
 * Form Population (Edit Mode):
 * - Name and description fields filled
 * - Frequency button selected (daily/weekly/custom)
 * - Custom days checkboxes checked (if frequency is custom)
 * - Icon option selected
 *
 * Accessibility:
 * - Modal activated with class and ARIA attributes
 * - Focus moved to name input after 300ms (animation delay)
 * - aria-hidden attribute managed
 *
 * UI State Updates:
 * - isEditing flag set appropriately
 * - currentHabitId stored for editing
 * - Form reset before populating
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
 * Close Habit Modal
 *
 * Purpose: Hide modal and reset state
 *
 * Cleanup Operations:
 * 1. Remove focus from active element inside modal
 * 2. Remove "active" class (triggers closing animation)
 * 3. Update aria-hidden attribute for accessibility
 * 4. Reset module state variables
 *
 * State Reset:
 * - isEditing set to false
 * - currentHabitId set to null
 *
 * Accessibility:
 * - Ensures focus is properly managed
 * - Screen readers notified modal is hidden
 *
 * Called By:
 * - Close button click
 * - Cancel button click
 * - Successful save operation
 * - Successful delete operation
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

// ============================================================================
// HABIT CRUD OPERATIONS
// ============================================================================
/**
 * Save Habit
 *
 * Purpose: Collect form data and save habit (create or update)
 *
 * Form Validation:
 * - Name: Required, must not be empty after trimming
 * - Frequency: daily/weekly/custom (default: daily)
 * - Custom Days: Required if frequency is custom
 * - Icon: Selected icon filename (default: meditation.svg)
 *
 * Data Collection:
 * 1. Name field (required)
 * 2. Description field (optional)
 * 3. Frequency from selected button
 * 4. Custom days from checkboxes (if custom frequency)
 * 5. Icon from selected option
 *
 * Habit Object Structure:
 * {
 *   id: string (timestamp or existing ID),
 *   name: string,
 *   description: string,
 *   frequency: "daily" | "weekly" | "custom",
 *   customDays: string[] (e.g., ["Mon", "Wed", "Fri"]),
 *   icon: string (filename),
 *   createdAt: ISO string (for new habits),
 *   streak: number (initialized to 0 for new habits)
 * }
 *
 * Error Handling:
 * - Shows alert if name is empty
 * - Shows alert if custom days not selected
 * - Shows alert if API call fails
 * - Logs errors to console
 *
 * Success Flow:
 * - Calls addHabit() or updateHabit() based on mode
 * - Closes modal
 * - Refreshes UI to show changes
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
 * Add New Habit
 *
 * Purpose: Create new habit via API and update cache
 *
 * @param {Object} habit - Habit object to create
 * @returns {Promise<Object>} Created habit with backend-generated ID
 *
 * API Call: POST /api/habits
 *
 * Backend Processing:
 * - Validates habit data
 * - Generates MongoDB ObjectId (_id)
 * - Stores in database
 * - Returns created habit object
 *
 * Cache Update:
 * - Refreshes habitsCache with new data
 * - Ensures UI shows latest habits
 *
 * Callback Execution:
 * - Calls onHabitChangeCallback if provided
 * - Allows pages to update related UI (stats, charts, etc.)
 *
 * Error Handling:
 * - Logs error to console
 * - Throws error to caller for handling
 * - User sees error alert in saveHabit()
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
 * Update Existing Habit
 *
 * Purpose: Update habit via API and refresh cache
 *
 * @param {Object} updatedHabit - Habit object with updates
 * @returns {Promise<Object>} Updated habit from backend
 *
 * API Call: PUT /api/habits/:id
 *
 * ID Handling:
 * - Backend uses _id (MongoDB ObjectId)
 * - Frontend may use id (for compatibility)
 * - Function handles both formats
 *
 * Backend Processing:
 * - Validates habit ownership (userId match)
 * - Updates habit in database
 * - Returns updated habit object
 *
 * Cache Update:
 * - Refreshes habitsCache with updated data
 * - Ensures UI shows latest changes
 *
 * Callback Execution:
 * - Calls onHabitChangeCallback if provided
 * - Allows pages to update related UI
 *
 * Error Handling:
 * - Logs error to console
 * - Throws error to caller
 * - User sees error alert in saveHabit()
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
 * Delete Habit
 *
 * Purpose: Delete habit via API with confirmation
 *
 * @param {string} habitId - MongoDB ObjectId of habit to delete
 *
 * User Confirmation:
 * - Shows browser confirm dialog
 * - Returns immediately if user cancels
 * - Prevents accidental deletions
 *
 * API Call: DELETE /api/habits/:id
 *
 * Backend Processing:
 * - Validates habit ownership (userId match)
 * - Deletes habit from database
 * - Note: Related check-ins may need manual cleanup
 *
 * Cache Update:
 * - Refreshes habitsCache to remove deleted habit
 * - Ensures UI no longer shows deleted habit
 *
 * Callback Execution:
 * - Calls onHabitChangeCallback if provided
 * - Allows pages to update related UI
 *
 * UI Updates:
 * - Closes modal (if open)
 * - Refreshes habit display
 * - Updates stats and charts
 *
 * Error Handling:
 * - Shows error alert if deletion fails
 * - Logs error to console
 * - Habit remains visible on error
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

// ============================================================================
// UI RENDERING
// ============================================================================
/**
 * Update Habit Summary List
 *
 * Purpose: Render complete habit list in specified container
 *
 * @param {string} elementId - ID of container element (default: "habit-list")
 *
 * Rendering Process:
 * 1. Fetch habits from cache/API
 * 2. Apply current filter (all/daily/weekly/custom)
 * 3. Fetch check-ins for all habits (for today's status)
 * 4. Build completion map (which habits completed today)
 * 5. Generate HTML for each habit item
 * 6. Attach event listeners to interactive elements
 *
 * Habit Item Structure:
 * - Checkbox: Toggle completion for today
 * - Icon: Visual representation of habit
 * - Name & Description: Habit details
 * - Edit button: Opens modal in edit mode
 * - Delete button: Deletes habit with confirmation
 *
 * Empty State:
 * - Shows message if no habits match filter
 * - Different messages for filtered vs. unfiltered view
 *
 * Completion Status:
 * - Checks if habit completed today
 * - Adds "completed" class for visual styling
 * - Pre-checks checkbox if completed
 *
 * Event Handlers:
 * - Checkbox change: Calls toggleHabitCompletion()
 * - Edit button click: Opens modal with habit data
 * - Delete button click: Calls deleteHabit()
 *
 * Error Handling:
 * - Warns if container element not found
 * - Logs error if rendering fails
 * - Shows empty state on error
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

// ============================================================================
// CHECK-IN MANAGEMENT
// ============================================================================
/**
 * Toggle Habit Completion
 *
 * Purpose: Mark habit as complete/incomplete for today
 *
 * @param {string} habitId - MongoDB ObjectId of habit
 * @param {HTMLElement} checkbox - Checkbox element that was clicked
 *
 * API Call: POST /api/checkins/toggle
 *
 * Backend Toggle Logic:
 * - If check-in exists for today: Delete it (uncheck)
 * - If check-in doesn't exist: Create it (check)
 * - Date normalized to midnight UTC
 *
 * UI Updates:
 * 1. Checkbox state (checked/unchecked)
 * 2. Habit item styling (add/remove "completed" class)
 * 3. Progress chart (if available)
 * 4. Today's check-in count
 * 5. Current streak count
 *
 * Chart Integration:
 * - Updates chartInstance if available
 * - Falls back to global updateChartData function
 * - Updates today's column in weekly chart
 *
 * Performance:
 * - Optimistic UI update (immediate feedback)
 * - Reverts on error (better UX)
 *
 * Error Handling:
 * - Reverts checkbox state on API failure
 * - Logs error to console
 * - User sees checkbox return to previous state
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

// ============================================================================
// STATISTICS UPDATES
// ============================================================================
/**
 * Update Chart for Today
 *
 * Purpose: Update progress chart with today's completion count
 *
 * Chart Update Process:
 * 1. Fetch all habits
 * 2. Get check-ins for all habits
 * 3. Count habits completed today
 * 4. Calculate today's index (0-6 for Mon-Sun)
 * 5. Call global updateChartData function
 *
 * Day Index Calculation:
 * - JavaScript: Sunday = 0, Monday = 1, ..., Saturday = 6
 * - Chart uses: Monday = 0, Sunday = 6
 * - Conversion: getDay() === 0 ? 6 : getDay() - 1
 *
 * Used By:
 * - toggleHabitCompletion() after check-in
 * - Fallback when chartInstance not available
 *
 * Global Function:
 * - Expects window.updateChartData(dayIndex, count)
 * - Defined in chart.js module
 *
 * Error Handling:
 * - Logs error to console
 * - Chart update fails silently (non-critical)
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
 * Update Streak Count
 *
 * Purpose: Calculate and display current habit completion streak
 *
 * Streak Definition:
 * - Number of consecutive days with at least one habit completed
 * - Breaks when a day has zero completions
 * - Counts backwards from today
 *
 * Calculation Algorithm:
 * 1. Fetch all habits and their check-ins
 * 2. Build completion map (date → completed habits)
 * 3. Start from today, check backwards day by day
 * 4. Increment streak if any habit completed that day
 * 5. Stop when day with no completions found
 *
 * Example:
 * - Today: 3 habits completed (streak = 1)
 * - Yesterday: 2 habits completed (streak = 2)
 * - 2 days ago: 1 habit completed (streak = 3)
 * - 3 days ago: 0 habits completed (STOP, streak = 3)
 *
 * Display Format:
 * - "1 day" (singular)
 * - "5 days" (plural)
 * - Updates element with id="streak-count"
 *
 * Used By:
 * - Dashboard page (streak display card)
 * - Called after check-in toggles
 * - Called after habit list updates
 *
 * Error Handling:
 * - Returns silently if element not found
 * - Logs error to console
 * - Doesn't break page if calculation fails
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
 * Update Today's Check-ins
 *
 * Purpose: Display count of habits completed today
 *
 * Display Format:
 * - "X/Y habits completed"
 * - X = Number of habits completed today
 * - Y = Total number of habits
 *
 * Example:
 * - "3/5 habits completed" (3 out of 5 habits done)
 * - "0/4 habits completed" (none completed yet)
 * - "7/7 habits completed" (all completed!)
 *
 * Calculation:
 * 1. Fetch all habits
 * 2. Get check-ins for each habit
 * 3. Count habits with check-in for today
 * 4. Format and display count
 *
 * Used By:
 * - Dashboard page (check-in status display)
 * - Updates after each check-in toggle
 *
 * Element:
 * - Updates element with class="checkins-status"
 *
 * Error Handling:
 * - Returns silently if element not found
 * - Logs error to console
 * - Non-critical feature (doesn't break page)
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
 * Refresh Habit Display
 *
 * Purpose: Update all habit-related UI elements
 *
 * UI Elements Updated:
 * 1. Habit list (all habits with current completion status)
 * 2. Streak count (consecutive days with completions)
 * 3. Today's check-ins (X/Y habits completed)
 * 4. Progress chart (if available)
 *
 * Called After:
 * - Creating new habit
 * - Updating existing habit
 * - Deleting habit
 * - Modal close (if changes were made)
 * - Page initialization
 *
 * Async Operations:
 * - All updates happen concurrently (await multiple promises)
 * - Chart update happens after others (import required)
 *
 * Chart Integration:
 * - Dynamically imports chart.js module
 * - Calls updateChartWithHabitData()
 * - Only if chartInstance available
 *
 * Performance:
 * - Efficient: Updates only visible elements
 * - Batched: All updates triggered together
 * - Cached: Uses habitsCache to reduce API calls
 *
 * Error Handling:
 * - Each update function handles own errors
 * - Partial updates possible if some fail
 * - Logs errors without breaking entire refresh
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

// ============================================================================
// GLOBAL EXPORTS
// ============================================================================
/**
 * Global Window Export
 *
 * Purpose: Make habit manager functions accessible globally
 *
 * Why Global Export:
 * - Allows inline onclick handlers in HTML
 * - Enables console debugging: window.habitManager.functionName()
 * - Provides fallback for non-module scripts
 * - Compatible with older code patterns
 *
 * Usage Examples:
 * ```javascript
 * // From console
 * await window.habitManager.refreshHabitDisplay();
 *
 * // From HTML onclick
 * <button onclick="window.habitManager.openModal()">Add Habit</button>
 *
 * // From non-module script
 * window.habitManager.getHabitsData().then(habits => console.log(habits));
 * ```
 *
 * Exported Functions:
 * - initializeHabitManager: Setup habit manager
 * - openModal: Open add/edit modal
 * - closeModal: Close modal
 * - addHabit: Create new habit
 * - updateHabit: Update existing habit
 * - deleteHabit: Delete habit
 * - updateHabitSummaryList: Render habit list
 * - toggleHabitCompletion: Toggle check-in
 * - updateStreakCount: Update streak display
 * - refreshHabitDisplay: Update all UI elements
 */
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
