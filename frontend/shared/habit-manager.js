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
 * Author: John Denis Nyagah
 * ============================================================================
 */

import {
  getHabits as apiGetHabits,
  createHabit as apiCreateHabit,
  updateHabit as apiUpdateHabit,
  deleteHabit as apiDeleteHabit,
  toggleHabitCompletion as apiToggleCompletion,
  getCheckins as apiGetCheckins,
  getHabitStreak as apiGetStreak,
  getAllCheckins as apiGetAllCheckins,
} from "./api.js";

let habitsCache = null;
let currentFilter = "all";
let onHabitChangeCallback = null;
let isEditing = false;
let currentHabitId = null;
let chartInstance = null;

function escapeHTML(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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

export async function getHabitsData(forceRefresh = false) {
  if (!habitsCache || forceRefresh) {
    return await loadHabitsFromAPI();
  }
  return habitsCache;
}

export async function initializeHabitManager(options = {}) {
  if (options.chartInstance) chartInstance = options.chartInstance;
  if (options.onHabitChange && typeof options.onHabitChange === "function") {
    onHabitChangeCallback = options.onHabitChange;
  }

  await loadHabitsFromAPI();
  setupEventListeners(options);

  const habitListId = options.habitListId || "habit-list";
  await updateHabitSummaryList(habitListId);
}

function setupEventListeners(options = {}) {
  const openModalBtn = document.querySelector(options.openModalSelector || ".open-habit-modal");
  if (openModalBtn) openModalBtn.addEventListener("click", () => openModal());

  const closeBtn = document.querySelector(".close-modal");
  if (closeBtn) closeBtn.addEventListener("click", closeModal);

  const cancelBtn = document.querySelector(".cancel-btn");
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  const saveBtn = document.querySelector(".save-btn");
  if (saveBtn) saveBtn.addEventListener("click", saveHabit);

  const deleteBtn = document.querySelector(".delete-btn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      if (currentHabitId) deleteHabit(currentHabitId);
    });
  }

  document.querySelectorAll(".freq-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      document.querySelectorAll(".freq-btn").forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      const customDaysDiv = document.querySelector(".custom-days");
      if (customDaysDiv) {
        if (this.dataset.value === "custom") customDaysDiv.classList.remove("hidden");
        else customDaysDiv.classList.add("hidden");
      }
    });
  });

  document.querySelectorAll(".icon-option").forEach((icon) => {
    icon.addEventListener("click", function (e) {
      e.preventDefault();
      document.querySelectorAll(".icon-option").forEach((i) => i.classList.remove("active"));
      this.classList.add("active");
    });
  });

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      currentFilter = this.dataset.filter;
      updateHabitSummaryList(options.habitListId || "habit-list");
    });
  });
}

export function openModal(habitData = null) {
  const modal = document.getElementById("habit-modal");
  const modalTitle = document.getElementById("modal-title");
  const habitForm = document.getElementById("habit-form");
  const deleteBtn = document.querySelector(".delete-btn");

  if (!modal || !habitForm) return;

  habitForm.reset();
  document.querySelectorAll(".freq-btn, .icon-option").forEach((el) => el.classList.remove("active"));

  if (habitData) {
    isEditing = true;
    currentHabitId = habitData._id || habitData.id;
    modalTitle.textContent = "Edit Habit";
    deleteBtn?.classList.remove("hidden");

    document.getElementById("habit-name").value = habitData.name || "";
    document.getElementById("habit-description").value = habitData.description || "";

    const freqBtn = document.querySelector(`.freq-btn[data-value="${habitData.frequency || "daily"}"]`);
    if (freqBtn) freqBtn.classList.add("active");

    const customDaysDiv = document.querySelector(".custom-days");
    if (habitData.frequency === "custom" && customDaysDiv) {
      customDaysDiv.classList.remove("hidden");
      if (habitData.customDays) {
        habitData.customDays.forEach((day) => {
          const checkbox = document.querySelector(`.day-checkboxes input[value="${day}"]`);
          if (checkbox) checkbox.checked = true;
        });
      }
    }

    const iconOption = document.querySelector(`.icon-option[data-icon="${habitData.icon || "meditation.svg"}"]`);
    if (iconOption) iconOption.classList.add("active");
  } else {
    isEditing = false;
    currentHabitId = null;
    modalTitle.textContent = "Add New Habit";
    deleteBtn?.classList.add("hidden");
    document.querySelector('.freq-btn[data-value="daily"]')?.classList.add("active");
    document.querySelector(".icon-option")?.classList.add("active");
  }

  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
  setTimeout(() => document.getElementById("habit-name")?.focus(), 300);
}

export function closeModal() {
  const modal = document.getElementById("habit-modal");
  if (!modal) return;
  if (document.activeElement && modal.contains(document.activeElement)) document.activeElement.blur();
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  isEditing = false;
  currentHabitId = null;
}

async function saveHabit() {
  const name = document.getElementById("habit-name")?.value.trim();
  if (!name) {
    alert("Please enter a habit name");
    return;
  }

  const frequency = document.querySelector(".freq-btn.active")?.dataset.value || "daily";
  let customDays = [];
  if (frequency === "custom") {
    customDays = Array.from(document.querySelectorAll('.day-checkboxes input[type="checkbox"]:checked')).map((cb) => cb.value);
    if (customDays.length === 0) {
      alert("Please select at least one day for custom frequency");
      return;
    }
  }

  const icon = document.querySelector(".icon-option.active")?.dataset.icon || "meditation.svg";

  const habit = {
    name,
    description: document.getElementById("habit-description")?.value || "",
    frequency,
    customDays,
    icon,
  };

  try {
    if (isEditing) await updateHabit({ ...habit, _id: currentHabitId });
    else await addHabit(habit);
    closeModal();
    await refreshHabitDisplay();
  } catch (error) {
    console.error("Failed to save habit:", error);
    alert("Failed to save habit.");
  }
}

export async function addHabit(habit) {
  const created = await apiCreateHabit(habit);
  await loadHabitsFromAPI();
  if (onHabitChangeCallback) await onHabitChangeCallback();
  return created;
}

export async function updateHabit(updatedHabit) {
  const habitId = updatedHabit._id || updatedHabit.id;
  const updated = await apiUpdateHabit(habitId, updatedHabit);
  await loadHabitsFromAPI();
  if (onHabitChangeCallback) await onHabitChangeCallback();
  return updated;
}

export async function deleteHabit(habitId) {
  if (!confirm("Are you sure?")) return;
  await apiDeleteHabit(habitId);
  await loadHabitsFromAPI();
  if (onHabitChangeCallback) await onHabitChangeCallback();
  closeModal();
  await refreshHabitDisplay();
}

export async function updateHabitSummaryList(elementId = "habit-list") {
  const habitList = document.getElementById(elementId);
  if (!habitList) return;

  try {
    let [habits, allCheckins] = await Promise.all([getHabitsData(), apiGetAllCheckins()]);
    const today = new Date().toISOString().split("T")[0];

    if (currentFilter !== "all") habits = habits.filter((h) => h.frequency === currentFilter);

    habitList.innerHTML = "";
    if (habits.length === 0) {
      habitList.innerHTML = '<li class="empty-message">No habits found.</li>';
      return;
    }

    const completions = {};
    allCheckins.forEach((c) => {
      if (!completions[c.habitId]) completions[c.habitId] = [];
      completions[c.habitId].push(c.date.split("T")[0]);
    });

    habits.forEach((habit) => {
      const habitId = habit._id || habit.id;
      const isCompleted = completions[habitId]?.includes(today);
      const item = document.createElement("li");
      item.className = `habit-item ${isCompleted ? "completed" : ""}`;
      item.innerHTML = `
        <div class="habit-left">
          <label class="checkbox-container">
            <input type="checkbox" ${isCompleted ? "checked" : ""}>
            <span class="checkmark"></span>
          </label>
          <img src="../assets/habit-icons/${escapeHTML(habit.icon || "meditation.svg")}" class="icon" alt="">
          <div class="habit-info">
            <span class="habit-name">${escapeHTML(habit.name)}</span>
            ${habit.description ? `<span class="habit-description">${escapeHTML(habit.description)}</span>` : ""}
          </div>
        </div>
        <div class="habit-actions">
          <button class="btn-outline edit-btn"><i class="fa-solid fa-pen"></i></button>
          <button class="btn-outline delete-btn-item"><i class="fa-solid fa-trash"></i></button>
        </div>
      `;

      item.querySelector("input").addEventListener("change", function () {
        toggleHabitCompletion(habitId, this);
      });
      item.querySelector(".edit-btn").addEventListener("click", () => openModal(habit));
      item.querySelector(".delete-btn-item").addEventListener("click", () => deleteHabit(habitId));
      habitList.appendChild(item);
    });
  } catch (error) {
    console.error("Failed to update habit list:", error);
  }
}

export async function toggleHabitCompletion(habitId, checkbox) {
  try {
    await apiToggleCompletion(habitId);
    const item = checkbox.closest(".habit-item");
    if (item) item.classList.toggle("completed", checkbox.checked);
    await refreshHabitDisplay();
  } catch (error) {
    console.error("Failed to toggle:", error);
    checkbox.checked = !checkbox.checked;
  }
}

export async function updateStreakCount() {
  const streakElement = document.getElementById("streak-count");
  if (!streakElement) return;

  const [habits, allCheckins] = await Promise.all([getHabitsData(), apiGetAllCheckins()]);
  const completions = {};
  allCheckins.forEach((c) => {
    if (!completions[c.habitId]) completions[c.habitId] = [];
    completions[c.habitId].push(c.date.split("T")[0]);
  });

  let streak = 0;
  let checkDate = new Date();
  while (true) {
    const dateStr = checkDate.toISOString().split("T")[0];
    const any = habits.some((h) => completions[h._id || h.id]?.includes(dateStr));
    if (any) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else break;
  }
  streakElement.textContent = `${streak} day${streak !== 1 ? "s" : ""}`;
}

async function updateTodayCheckins() {
  const el = document.querySelector(".checkins-status");
  if (!el) return;
  const [habits, allCheckins] = await Promise.all([getHabitsData(), apiGetAllCheckins()]);
  const today = new Date().toISOString().split("T")[0];
  const completed = new Set(allCheckins.filter((c) => c.date.split("T")[0] === today).map((c) => c.habitId)).size;
  el.textContent = `${completed}/${habits.length} habits completed`;
}

export async function refreshHabitDisplay() {
  await Promise.all([updateHabitSummaryList(), updateStreakCount(), updateTodayCheckins()]);
  if (chartInstance) {
    import("./chart.js").then((m) => m.updateChartWithHabitData(chartInstance));
  }
}

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
