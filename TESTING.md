# Test Cases & Test Data - Riza Habit Tracker

## Test Strategy

This document outlines the test cases and test data used to validate the Riza Habit Tracker application.

## Test Data

### Sample Habits

```javascript
// Test Habit 1: Daily Meditation
{
  id: "habit_1729500000001",
  name: "Morning Meditation",
  description: "10 minutes of mindfulness practice",
  frequency: "daily",
  icon: "meditation.svg",
  createdAt: "2025-01-15",
  streak: 12
}

// Test Habit 2: Weekday Exercise
{
  id: "habit_1729500000002",
  name: "Exercise",
  description: "30 minutes of cardio or strength training",
  frequency: "weekdays",
  customDays: ["mon", "tue", "wed", "thu", "fri"],
  icon: "dumbbell.svg",
  createdAt: "2025-01-10",
  streak: 8
}

// Test Habit 3: Weekend Reading
{
  id: "habit_1729500000003",
  name: "Read Book",
  description: "Read for at least 20 minutes",
  frequency: "weekends",
  customDays: ["sat", "sun"],
  icon: "book.svg",
  createdAt: "2025-01-01",
  streak: 4
}

// Test Habit 4: Custom Schedule
{
  id: "habit_1729500000004",
  name: "Water Plants",
  description: "Water all indoor plants",
  frequency: "custom",
  customDays: ["mon", "wed", "fri"],
  icon: "plant.svg",
  createdAt: "2025-02-01",
  streak: 0
}
```

### Sample Completions

```javascript
{
  "habit_1729500000001": [
    "2025-10-10",
    "2025-10-11",
    "2025-10-12",
    "2025-10-13",
    "2025-10-14",
    "2025-10-15",
    "2025-10-16",
    "2025-10-17",
    "2025-10-18",
    "2025-10-19",
    "2025-10-20",
    "2025-10-21"
  ],
  "habit_1729500000002": [
    "2025-10-13", // Mon
    "2025-10-14", // Tue
    "2025-10-15", // Wed
    "2025-10-17", // Fri
    "2025-10-20", // Mon
    "2025-10-21"  // Tue
  ],
  "habit_1729500000003": [
    "2025-10-12", // Sat
    "2025-10-13", // Sun
    "2025-10-19", // Sat
    "2025-10-20"  // Sun
  ]
}
```

## Manual Test Cases

### TC-001: Create New Habit

**Objective**: Verify users can create a new habit

**Test Steps**:

1. Navigate to Dashboard or Habits page
2. Click "Add Habit" button
3. Fill in habit name: "Morning Workout"
4. Add description: "30 minutes of exercise"
5. Select frequency: "Daily"
6. Choose icon: dumbbell.svg
7. Click "Save Habit"

**Expected Result**:

- Modal closes
- New habit appears in habit list
- Habit is saved to localStorage
- Habit visible on all pages (Dashboard, Habits, Progress)

**Status**: Complete & Works

---

### TC-002: Edit Existing Habit

**Objective**: Verify users can modify habit details

**Test Steps**:

1. Click "Edit" button on any habit
2. Change name to "Evening Workout"
3. Update frequency to "Weekdays"
4. Change icon
5. Click "Save Habit"

**Expected Result**:

- Changes are saved
- Updated habit displays correctly
- Changes persist after page reload
- Previous completions remain intact

**Status**: Complete & Works

---

### TC-003: Delete Habit

**Objective**: Verify habit deletion works correctly

**Test Steps**:

1. Click "Edit" on a habit
2. Click "Delete" button
3. Confirm deletion

**Expected Result**:

- Habit removed from list
- Habit removed from localStorage
- Associated completions are deleted
- Charts update to reflect removal

**Status**: Complete & Works

---

### TC-004: Toggle Habit Completion

**Objective**: Verify habit completion tracking

**Test Steps**:

1. Check the checkbox next to a habit
2. Verify visual feedback
3. Uncheck the checkbox
4. Verify completion is removed

**Expected Result**:

- Checkbox shows checked state
- Today's date added to completions array
- Streak updates correctly
- Charts update in real-time
- Unchecking removes today's completion

**Status**: Complete & Works

---

### TC-005: Streak Calculation

**Objective**: Verify streak counting logic

**Test Steps**:

1. Complete a habit for 3 consecutive days
2. Check current streak value
3. Skip one day
4. Complete habit again
5. Verify streak reset

**Expected Result**:

- Streak shows 3 after 3 consecutive days
- Streak resets to 1 after gap
- Longest streak is preserved
- Flame animation scales with streak

**Status**: Complete & Works

---

### TC-006: Data Persistence

**Objective**: Verify localStorage persistence

**Test Steps**:

1. Add 3 new habits
2. Complete some habits
3. Refresh the page
4. Navigate to different pages

**Expected Result**:

- All habits remain after refresh
- Completions persist
- Streaks maintained
- Data consistent across all pages

**Status**: Complete & Works

---

### TC-007: Chart Updates

**Objective**: Verify chart visualization updates

**Test Steps**:

1. View weekly progress chart
2. Complete a habit today
3. Observe chart update

**Expected Result**:

- Chart bar for today increases
- Chart updates without page reload
- Data matches localStorage

**Status**: Complete & Works

---

### TC-008: Responsive Design - Mobile

**Objective**: Verify mobile layout (< 600px)

**Test Steps**:

1. Resize browser to 375px width
2. Navigate through all pages
3. Test all interactions

**Expected Result**:

- Cards stack vertically
- Sidebar becomes hamburger menu
- All buttons accessible
- Text readable
- Charts fit screen

**Status**: Complete & Works

---

### TC-009: Responsive Design - Tablet

**Objective**: Verify tablet layout (600-900px)

**Test Steps**:

1. Resize browser to 768px width
2. Check layout adaptation
3. Test navigation

**Expected Result**:

- Cards properly sized
- Sidebar visible
- Content centered
- No horizontal scroll

**Status**: Complete & Works

---

### TC-010: Responsive Design - Large Desktop

**Objective**: Verify large screen layout (> 1440px)

**Test Steps**:

1. Open on 1920px+ screen
2. Check layout expansion
3. Verify spacing

**Expected Result**:

- Content uses full width
- Proper padding (40px 50px)
- No max-width constraint
- Cards scale appropriately

**Status**: Complete & Works

---

### TC-011: Empty State

**Objective**: Verify behavior with no habits

**Test Steps**:

1. Clear localStorage
2. Load application
3. Navigate pages

**Expected Result**:

- "No habits yet" message shown
- Charts show empty state
- Stats show 0
- Add button still functional

**Status**: Complete & Works

---

### TC-012: Activity Calendar

**Objective**: Verify calendar display and navigation

**Test Steps**:

1. Navigate to Progress page
2. View current month
3. Click previous/next month buttons
4. Check logged days highlighted

**Expected Result**:

- Current month displayed
- Navigation works
- Completed days highlighted
- Today marked distinctly
- Streak days connected visually

**Status**: Complete & Works

---

### TC-013: Daily Motivation

**Objective**: Verify quote system

**Test Steps**:

1. Load page with motivation card
2. Note displayed quote
3. Click refresh button
4. Verify new quote appears

**Expected Result**:

- Quote displays on load
- Category shown
- Refresh generates new quote
- Same on all pages using it

**Status**: Complete & Works

---

### TC-014: Profile Picture Upload

**Objective**: Verify image upload functionality

**Test Steps**:

1. Go to Profile page
2. Click edit icon on profile picture
3. Select an image file
4. Verify upload

**Expected Result**:

- File picker opens
- Image previews immediately
- Saved to localStorage
- Persists after reload
- Size validation works (< 5MB)

**Status**: Complete & Works

---

### TC-015: Cross-Page Consistency

**Objective**: Verify data sync across pages

**Test Steps**:

1. Add habit on Dashboard
2. Navigate to Habits page
3. Navigate to Progress page
4. Verify habit appears everywhere

**Expected Result**:

- Same habits on all pages
- Same completion status
- Same streak values
- Stats match across pages

**Status**: Complete & Works

---

## Edge Cases & Error Handling

### EC-001: Invalid Input

- **Test**: Submit empty habit name
- **Expected**: Validation error, form not submitted
- **Status**: Complete & Works

### EC-002: Duplicate Habit Names

- **Test**: Create two habits with same name
- **Expected**: Both created (names don't need to be unique)
- **Status**: Complete & Works

### EC-003: Large Image Upload

- **Test**: Upload 10MB image
- **Expected**: Error message, upload rejected
- **Status**: Complete & Works

### EC-004: Invalid File Type

- **Test**: Upload .txt file as profile picture
- **Expected**: Error message, only images accepted
- **Status**: Complete & Works

### EC-005: Rapid Click Handling

- **Test**: Click save button multiple times quickly
- **Expected**: Only one habit created
- **Status**: Complete & Works

---

## Test Coverage Summary

| Component           | Test Cases | Passed | Failed |
| ------------------- | ---------- | ------ | ------ |
| Habit CRUD          | 3          | 3      | 0      |
| Completion Tracking | 2          | 2      | 0      |
| Streak System       | 1          | 1      | 0      |
| Data Persistence    | 1          | 1      | 0      |
| Charts              | 1          | 1      | 0      |
| Responsive Design   | 3          | 3      | 0      |
| UI Components       | 4          | 4      | 0      |
| Edge Cases          | 5          | 5      | 0      |
| **TOTAL**           | **20**     | **20** | **0**  |

**Overall Pass Rate**: 100%

---

## Future Testing Improvements

1. **Automated Unit Tests**: Implement Jest or Mocha for automated testing
2. **Integration Tests**: Test component interactions
3. **Performance Tests**: Measure load times with large datasets
4. **Accessibility Tests**: WCAG compliance validation
5. **Cross-browser Automated Testing**: Selenium/Playwright setup

---

**Last Updated**: October 21, 2025  
**Tested By**: [John Denis Nyagah]  
**Test Environment**: Chrome 120.0, Windows 11, 1920x1080
