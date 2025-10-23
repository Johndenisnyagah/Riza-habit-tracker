# Comprehensive Testing Guide - Riza Habit Tracker

## Overview

This document provides complete testing documentation for the Riza Habit Tracker application, including test cases, test data, backend integration steps, and troubleshooting guides.

## System Architecture

- **Frontend**: Vanilla JavaScript (ES6 modules)
- **Backend**: Node.js + Express (Port 5000)
- **Database**: MongoDB Atlas
- **Authentication**: JWT tokens
- **Data Storage**: MongoDB collections (users, habits, checkins, logins)
- **Profile Pictures**: localStorage (Base64)

---

## Pre-Testing Checklist

### Backend Status

- [ ] Server running on http://localhost:5000
- [ ] MongoDB Atlas connected
- [ ] Terminal shows: "🚀 Server running on port 5000"
- [ ] Terminal shows: "✅ MongoDB Connected"

### Start Backend

```bash
cd backend
npm start
```

---

## Test Data

### Sample Habits (MongoDB Documents)

```javascript
// Test Habit 1: Daily Meditation
{
  _id: ObjectId("6717a1b2c3d4e5f6g7h8i9j0"),
  userId: ObjectId("6717a1b2c3d4e5f6g7h8i9j1"),
  name: "Morning Meditation",
  description: "10 minutes of mindfulness practice",
  frequency: "daily",
  icon: "meditation.svg",
  streak: 12,
  createdAt: "2025-01-15T08:00:00.000Z",
  updatedAt: "2025-10-21T08:00:00.000Z"
}

// Test Habit 2: Weekday Exercise
{
  _id: ObjectId("6717a1b2c3d4e5f6g7h8i9j2"),
  userId: ObjectId("6717a1b2c3d4e5f6g7h8i9j1"),
  name: "Exercise",
  description: "30 minutes of cardio or strength training",
  frequency: "weekdays",
  customDays: ["mon", "tue", "wed", "thu", "fri"],
  icon: "dumbbell.svg",
  streak: 8,
  createdAt: "2025-01-10T08:00:00.000Z"
}

// Test Habit 3: Weekend Reading
{
  _id: ObjectId("6717a1b2c3d4e5f6g7h8i9j3"),
  userId: ObjectId("6717a1b2c3d4e5f6g7h8i9j1"),
  name: "Read Book",
  description: "Read for at least 20 minutes",
  frequency: "weekends",
  customDays: ["sat", "sun"],
  icon: "book.svg",
  streak: 4,
  createdAt: "2025-01-01T08:00:00.000Z"
}

// Test Habit 4: Custom Schedule
{
  _id: ObjectId("6717a1b2c3d4e5f6g7h8i9j4"),
  userId: ObjectId("6717a1b2c3d4e5f6g7h8i9j1"),
  name: "Water Plants",
  description: "Water all indoor plants",
  frequency: "custom",
  customDays: ["mon", "wed", "fri"],
  icon: "plant.svg",
  streak: 0,
  createdAt: "2025-02-01T08:00:00.000Z"
}
```

### Sample Check-ins (MongoDB Documents)

```javascript
// Check-ins for Morning Meditation habit
[
  {
    _id: ObjectId("6717a1b2c3d4e5f6g7h8i9j5"),
    habitId: ObjectId("6717a1b2c3d4e5f6g7h8i9j0"),
    userId: ObjectId("6717a1b2c3d4e5f6g7h8i9j1"),
    date: "2025-10-21T00:00:00.000Z",
    createdAt: "2025-10-21T08:30:00.000Z",
  },
  {
    _id: ObjectId("6717a1b2c3d4e5f6g7h8i9j6"),
    habitId: ObjectId("6717a1b2c3d4e5f6g7h8i9j0"),
    userId: ObjectId("6717a1b2c3d4e5f6g7h8i9j1"),
    date: "2025-10-20T00:00:00.000Z",
    createdAt: "2025-10-20T08:30:00.000Z",
  },
  // ... more check-ins
];
```

---

## Quick Integration Testing Steps

### 1. Test Authentication & Profile

**Steps**:

1. Open `frontend/login/signin_signup.html` in browser
2. **Sign Up** with a new account:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
3. After signup, redirected to dashboard
4. Click **Profile** in sidebar

**Verify**:

- ✅ Your name displays (not hardcoded)
- ✅ Your email displays correctly
- ✅ Join date shows current month/year
- ✅ Profile picture upload works (localStorage)
- ✅ Data fetched from MongoDB `/api/profile` endpoint

---

### 2. Test Habit Management

**Steps**:

1. From dashboard, click **"Add Habit"**
2. Create habit:
   - Name: "Morning Meditation"
   - Description: "10 minutes of meditation"
   - Frequency: Daily
   - Icon: Select any icon
3. Click **"Add Habit"**

**Verify**:

- ✅ Habit appears in list
- ✅ Habit saved to MongoDB `habits` collection
- ✅ Check checkbox to mark complete
- ✅ Creates check-in document in MongoDB `checkins` collection
- ✅ Stats update (1/1 habits completed)
- ✅ API calls: `POST /api/habits`, `POST /api/checkins`

---

### 3. Test Edit & Delete

**Steps**:

1. Click **"Edit"** on habit
2. Change name to "Evening Meditation"
3. Click **"Update Habit"**
4. Verify name updates
5. Click **"Delete"** on habit
6. Confirm deletion

**Verify**:

- ✅ Edit updates MongoDB document via `PUT /api/habits/:id`
- ✅ Delete removes from MongoDB via `DELETE /api/habits/:id`
- ✅ Associated check-ins also deleted
- ✅ Changes reflect immediately
- ✅ Empty message appears when no habits

---

### 4. Test Data Persistence

**Steps**:

1. Create 2-3 habits
2. Mark some as complete
3. **Refresh page** (F5)
4. **Logout** and **Login** again

**Verify**:

- ✅ All habits persist after refresh
- ✅ Completed habits still checked
- ✅ Data persists across sessions
- ✅ Stats preserved
- ✅ All data from MongoDB (not localStorage)

---

### 5. Test Cross-Page Consistency

**Steps**:

1. Create habit on Dashboard
2. Navigate to Habits page
3. Navigate to Progress page

**Verify**:

- ✅ Same habits on all pages
- ✅ Same completion status
- ✅ Same streak values
- ✅ Stats consistent across pages
- ✅ All fetched from same MongoDB API

---

## Detailed Test Cases

### TC-001: User Registration

**Objective**: Verify user signup functionality

**Test Steps**:

1. Navigate to signup page
2. Fill in: Name, Email, Password
3. Click "Sign Up"

**Expected Result**:

- User document created in MongoDB `users` collection
- Password hashed with bcrypt
- JWT token returned
- Redirected to dashboard
- Token stored in localStorage

**API Endpoint**: `POST /api/auth/register`

**Status**: ✅ Complete & Works

---

### TC-002: User Login

**Objective**: Verify user login functionality

**Test Steps**:

1. Navigate to login page
2. Enter registered email and password
3. Click "Login"

**Expected Result**:

- Credentials verified against MongoDB
- JWT token generated and returned
- Token stored in localStorage
- Redirected to dashboard
- Daily login tracked in `logins` collection

**API Endpoint**: `POST /api/auth/login`

**Status**: ✅ Complete & Works

---

### TC-003: Create New Habit

**Objective**: Verify users can create habits in MongoDB

**Test Steps**:

1. Navigate to Dashboard or Habits page
2. Click "Add Habit" button
3. Fill in:
   - Name: "Morning Workout"
   - Description: "30 minutes of exercise"
   - Frequency: "Daily"
   - Icon: dumbbell.svg
4. Click "Save Habit"

**Expected Result**:

- Modal closes
- `POST /api/habits` called with JWT auth
- Habit document created in MongoDB
- Habit appears in list immediately
- Habit visible on all pages (Dashboard, Habits, Progress)
- userId automatically added from JWT token

**API Endpoint**: `POST /api/habits`

**Status**: ✅ Complete & Works

---

### TC-004: Edit Existing Habit

**Objective**: Verify habit modification via MongoDB

**Test Steps**:

1. Click "Edit" button on any habit
2. Change name to "Evening Workout"
3. Update frequency to "Weekdays"
4. Change icon
5. Click "Save Habit"

**Expected Result**:

- `PUT /api/habits/:id` called
- MongoDB document updated
- Changes display immediately
- Changes persist after page reload
- Previous check-ins remain intact
- updatedAt timestamp updated

**API Endpoint**: `PUT /api/habits/:id`

**Status**: ✅ Complete & Works

---

### TC-005: Delete Habit

**Objective**: Verify habit deletion from MongoDB

**Test Steps**:

1. Click "Edit" on a habit
2. Click "Delete" button
3. Confirm deletion

**Expected Result**:

- `DELETE /api/habits/:id` called
- Habit document removed from MongoDB
- Associated check-ins deleted from `checkins` collection
- Habit removed from UI
- Charts update to reflect removal

**API Endpoint**: `DELETE /api/habits/:id`

**Status**: ✅ Complete & Works

---

### TC-006: Toggle Habit Completion

**Objective**: Verify check-in creation/deletion in MongoDB

**Test Steps**:

1. Check the checkbox next to a habit
2. Verify visual feedback
3. Uncheck the checkbox
4. Verify completion removed

**Expected Result**:

- **Check**: `POST /api/checkins` creates check-in document
- Checkbox shows checked state
- Today's date recorded in MongoDB
- Streak updates correctly
- Charts update in real-time
- **Uncheck**: `DELETE /api/checkins` removes check-in
- Unchecking removes today's completion

**API Endpoints**:

- `POST /api/checkins`
- `DELETE /api/checkins`
- `GET /api/checkins/habit/:habitId`

**Status**: ✅ Complete & Works

---

### TC-007: Streak Calculation

**Objective**: Verify streak counting from MongoDB check-ins

**Test Steps**:

1. Complete a habit for 3 consecutive days
2. Check current streak value
3. Skip one day
4. Complete habit again
5. Verify streak reset

**Expected Result**:

- Streak calculated from MongoDB check-in documents
- Streak shows 3 after 3 consecutive days
- Streak resets to 1 after gap
- Longest streak preserved
- Flame animation scales with streak (80px-200px)
- Milestones highlighted (7, 30, 100 days)

**Status**: ✅ Complete & Works

---

### TC-008: Data Persistence Across Sessions

**Objective**: Verify MongoDB data persistence

**Test Steps**:

1. Create 3 habits and complete some
2. Close browser completely
3. Reopen and login
4. Check all pages

**Expected Result**:

- All habits loaded from MongoDB
- Check-ins fetched from MongoDB
- Streaks calculated correctly
- Stats accurate
- Charts populated with real data
- **No localStorage dependencies** (except JWT token & profile pic)

**Status**: ✅ Complete & Works

---

### TC-009: Chart Updates

**Objective**: Verify chart data from MongoDB

**Test Steps**:

1. View weekly progress chart
2. Complete a habit today
3. Observe chart update

**Expected Result**:

- Chart bar for today increases
- Data fetched from `GET /api/checkins/habit/:habitId`
- Chart updates without page reload
- Monthly chart shows weeks since user.createdAt
- All data from MongoDB API

**Status**: ✅ Complete & Works

---

### TC-010: Monthly Overview Chart

**Objective**: Verify registration-based weekly chart

**Test Steps**:

1. Navigate to Progress page
2. View Monthly Overview chart
3. Check week labels (W1, W2, etc.)

**Expected Result**:

- Weeks calculated from user.createdAt (registration date)
- All check-ins grouped by week
- Bar chart displays completion counts per week
- Labels compact (W1, W2, not "Week 1")
- No axis titles (clean design)
- Data from MongoDB

**API Endpoints**:

- `GET /api/profile` (for createdAt)
- `GET /api/habits` (all habits)
- `GET /api/checkins/habit/:habitId` (for each habit)

**Status**: ✅ Complete & Works

---

### TC-011: Responsive Design - Mobile

**Objective**: Verify mobile layout (< 768px)

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
- Monthly chart labels don't dominate
- API calls work on mobile

**Status**: ✅ Complete & Works

---

### TC-012: Responsive Design - Tablet

**Objective**: Verify tablet layout (768-900px)

**Test Steps**:

1. Resize browser to 768px width
2. Check layout adaptation
3. Test navigation

**Expected Result**:

- Cards properly sized
- Sidebar visible
- Content centered
- No horizontal scroll
- Charts scale properly

**Status**: ✅ Complete & Works

---

### TC-013: Responsive Design - Large Desktop

**Objective**: Verify large screen layout (> 1200px)

**Test Steps**:

1. Open on 1920px+ screen
2. Check layout expansion
3. Verify spacing

**Expected Result**:

- Content uses full width
- Proper padding (40px 50px)
- Sidebar fixed at 250px
- Cards scale appropriately

**Status**: ✅ Complete & Works

---

### TC-014: Empty State Handling

**Objective**: Verify behavior with no habits in MongoDB

**Test Steps**:

1. Delete all habits
2. Load application
3. Navigate pages

**Expected Result**:

- "No habits yet" message shown
- Charts show empty state
- Stats show 0
- Add button functional
- No API errors in console

**Status**: ✅ Complete & Works

---

### TC-015: Activity Calendar

**Objective**: Verify calendar with MongoDB check-ins

**Test Steps**:

1. Navigate to Progress page
2. View current month
3. Click previous/next month buttons
4. Check completed days highlighted

**Expected Result**:

- Current month displayed
- Navigation works smoothly
- Days with check-ins highlighted (green)
- Today marked with border
- Check-ins fetched from MongoDB
- Works for any selected month

**API Endpoint**: `GET /api/checkins/habit/:habitId` (for all habits)

**Status**: ✅ Complete & Works

---

### TC-016: Daily Motivation Quotes

**Objective**: Verify quote system

**Test Steps**:

1. Load page with motivation card
2. Note displayed quote
3. Click refresh button
4. Verify new quote appears

**Expected Result**:

- Quote displays on load
- Category shown (Consistency, Growth, etc.)
- Refresh generates new random quote
- Same component on Dashboard & Progress pages
- Managed by daily-motivation.js module

**Status**: ✅ Complete & Works

---

### TC-017: Profile Picture Upload

**Objective**: Verify image upload to localStorage

**Test Steps**:

1. Go to Profile page
2. Click edit icon on profile picture
3. Select an image file
4. Verify upload

**Expected Result**:

- File picker opens
- Image previews immediately
- Saved to localStorage as Base64
- Persists after reload
- Size validation works (< 5MB)
- **Note**: Profile pics use localStorage, not MongoDB

**Status**: ✅ Complete & Works

---

### TC-018: Cross-Page Data Consistency

**Objective**: Verify MongoDB data sync across pages

**Test Steps**:

1. Create habit on Dashboard
2. Navigate to Habits page
3. Navigate to Progress page
4. Complete habit on any page
5. Check other pages

**Expected Result**:

- Same habits visible everywhere
- Same completion status
- Same streak values
- Stats match across all pages
- All fetched from MongoDB API
- Real-time consistency

**Status**: ✅ Complete & Works

---

### TC-019: JWT Authentication Flow

**Objective**: Verify token-based authentication

**Test Steps**:

1. Login successfully
2. Check localStorage for token
3. Make API requests
4. Logout
5. Try accessing protected pages

**Expected Result**:

- Token stored after login
- Token sent in Authorization header
- Backend verifies token via middleware
- Protected routes return 401 without token
- Logout removes token
- Redirected to login when unauthorized

**Status**: ✅ Complete & Works

---

### TC-020: Profile Data Display

**Objective**: Verify real user data from MongoDB

**Test Steps**:

1. Login with account
2. Navigate to Profile page
3. Check displayed information

**Expected Result**:

- Name from MongoDB `users` collection
- Email from MongoDB
- Join date from user.createdAt
- **Not hardcoded** (e.g., not "Sophie M.")
- Profile fetched via `GET /api/profile`
- JWT authentication required

**API Endpoint**: `GET /api/profile`

**Status**: ✅ Complete & Works

---

## Edge Cases & Error Handling

### EC-001: Invalid Input Validation

**Test**: Submit empty habit name

**Expected**:

- Frontend validation prevents submission
- Error message displayed
- Form not submitted
- No API call made

**Status**: ✅ Complete & Works

---

### EC-002: Duplicate Habit Names

**Test**: Create two habits with identical names

**Expected**:

- Both created successfully
- Names don't need to be unique
- Each has unique MongoDB \_id
- Both tracked independently

**Status**: ✅ Complete & Works

---

### EC-003: Large Image Upload

**Test**: Upload 10MB profile picture

**Expected**:

- Size validation triggers
- Error message: "Image too large"
- Upload rejected
- Limit: 5MB

**Status**: ✅ Complete & Works

---

### EC-004: Invalid File Type

**Test**: Upload .txt file as profile picture

**Expected**:

- File type validation triggers
- Error message shown
- Only image/\* types accepted
- Upload rejected

**Status**: ✅ Complete & Works

---

### EC-005: Rapid Click Handling

**Test**: Click "Add Habit" button multiple times rapidly

**Expected**:

- Button disabled after first click
- Only one habit created
- No duplicate API calls
- Prevents race conditions

**Status**: ✅ Complete & Works

---

### EC-006: Backend Not Running

**Test**: Access app with backend offline

**Expected**:

- API calls fail gracefully
- Error messages displayed
- No app crashes
- User prompted to check backend
- Console shows network errors

**Status**: ✅ Complete & Works

---

### EC-007: Invalid JWT Token

**Test**: Manually modify token in localStorage

**Expected**:

- Backend returns 401 Unauthorized
- User redirected to login
- Error message: "Please login again"
- Token cleared from localStorage

**Status**: ✅ Complete & Works

---

### EC-008: MongoDB Connection Loss

**Test**: Database becomes unavailable

**Expected**:

- Backend catches connection errors
- Returns 500 Internal Server Error
- Error logged in backend console
- Frontend displays error message
- App doesn't crash

**Status**: ✅ Complete & Works

---

## 🔍 MongoDB Data Verification

### Check Created Data in MongoDB Atlas

**Steps**:

1. Login to MongoDB Atlas dashboard
2. Browse Collections
3. Select your database

**Collections to Verify**:

#### `users` Collection

```javascript
{
  _id: ObjectId("..."),
  name: "Test User",
  email: "test@example.com",
  password: "$2b$10$...", // Hashed with bcrypt
  createdAt: "2025-10-22T...",
  updatedAt: "2025-10-22T..."
}
```

#### `habits` Collection

```javascript
{
  _id: ObjectId("..."),
  userId: ObjectId("..."), // Reference to user
  name: "Morning Meditation",
  description: "10 minutes of meditation",
  frequency: "daily",
  icon: "meditation.svg",
  streak: 5,
  customDays: [], // Empty for daily habits
  createdAt: "2025-10-22T...",
  updatedAt: "2025-10-22T..."
}
```

#### `checkins` Collection

```javascript
{
  _id: ObjectId("..."),
  habitId: ObjectId("..."), // Reference to habit
  userId: ObjectId("..."), // Reference to user
  date: "2025-10-22T00:00:00.000Z",
  createdAt: "2025-10-22T08:30:00.000Z"
}
```

#### `logins` Collection

```javascript
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),
  date: "2025-10-22T00:00:00.000Z",
  createdAt: "2025-10-22T08:00:00.000Z"
}
```

---

## Common Issues & Troubleshooting

### Issue 1: Backend Not Running

**Symptoms**:

- API calls fail
- Network errors in console
- "Failed to fetch" errors

**Solution**:

```bash
cd backend
npm start
```

**Expected Output**: "🚀 Server running on port 5000"

---

### Issue 2: CORS Errors

**Symptoms**:

- CORS policy errors in browser console
- API calls blocked

**Solution**:

- Verify backend has CORS enabled
- Check `backend/server.js` has:

```javascript
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
```

---

### Issue 3: 401 Unauthorized Errors

**Symptoms**:

- API returns 401
- Redirected to login unexpectedly

**Solution**:

- Token might be invalid/expired
- Logout and login again
- Check token in localStorage
- Verify `Authorization: Bearer <token>` header sent

---

### Issue 4: Habits Not Loading

**Symptoms**:

- Empty habit list
- "No habits yet" message when habits exist

**Solution**:

- Check browser console for API errors
- Verify backend is running
- Check MongoDB connection
- Verify JWT token is valid
- Check API endpoint: `GET /api/habits`

---

### Issue 5: MongoDB Connection Failed

**Symptoms**:

- Backend shows connection error
- "MongoDB connection failed" in terminal

**Solution**:

- Check MongoDB Atlas cluster is running
- Verify connection string in `.env`
- Check IP whitelist in MongoDB Atlas
- Ensure network access configured

---

### Issue 6: Charts Not Displaying

**Symptoms**:

- Blank chart areas
- Chart.js errors in console

**Solution**:

- Verify Chart.js CDN loaded
- Check data fetched from API
- Inspect canvas element in DevTools
- Verify check-ins exist in MongoDB
- Check browser console for errors

---

### Issue 7: Streak Not Updating

**Symptoms**:

- Streak shows 0 or incorrect value
- Doesn't update after completion

**Solution**:

- Verify check-ins saved to MongoDB
- Check `POST /api/checkins` succeeds
- Refresh page to recalculate
- Check consecutive day logic in code

---

## Success Criteria

All these should work **WITHOUT localStorage** (except JWT token & profile pic):

- ✅ User registration
- ✅ User login with JWT authentication
- ✅ Profile page shows real user data from MongoDB
- ✅ Create habit (saved to MongoDB)
- ✅ Edit habit (updated in MongoDB)
- ✅ Delete habit (removed from MongoDB)
- ✅ Toggle completion (creates/deletes check-in in MongoDB)
- ✅ Streak calculation from MongoDB check-ins
- ✅ Data persists across sessions
- ✅ Data persists after logout/login
- ✅ Dashboard stats calculated from MongoDB API
- ✅ Charts populated from MongoDB data
- ✅ Activity calendar shows MongoDB check-ins
- ✅ Cross-page data consistency
- ✅ Responsive design on all screen sizes
- ✅ Monthly chart calculates from user registration date
- ✅ All API endpoints secured with JWT middleware

---

## Test Coverage Summary

| Component              | Test Cases | Passed | Failed |
| ---------------------- | ---------- | ------ | ------ |
| Authentication & JWT   | 2          | 2      | 0      |
| Habit CRUD (MongoDB)   | 3          | 3      | 0      |
| Check-in Management    | 2          | 2      | 0      |
| Streak System          | 1          | 1      | 0      |
| Data Persistence       | 2          | 2      | 0      |
| Charts & Visualization | 2          | 2      | 0      |
| Responsive Design      | 3          | 3      | 0      |
| UI Components          | 4          | 4      | 0      |
| Edge Cases             | 8          | 8      | 0      |
| MongoDB Integration    | 1          | 1      | 0      |
| **TOTAL**              | **28**     | **28** | **0**  |

**Overall Pass Rate**: 100% ✅

---

## API Endpoints Reference

### Authentication

- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - User login, returns JWT

### Profile

- `GET /api/profile` - Get user profile (requires JWT)

### Habits

- `GET /api/habits` - Get all user habits (requires JWT)
- `POST /api/habits` - Create new habit (requires JWT)
- `PUT /api/habits/:id` - Update habit (requires JWT)
- `DELETE /api/habits/:id` - Delete habit (requires JWT)

### Check-ins

- `GET /api/checkins/habit/:habitId` - Get habit check-ins (requires JWT)
- `POST /api/checkins` - Create check-in (requires JWT)
- `DELETE /api/checkins` - Delete check-in (requires JWT)

### Logins

- `POST /api/logins/track` - Track daily login (requires JWT)
- `GET /api/logins/total-days` - Get total login days (requires JWT)

---

## Future Testing Improvements

1. **Automated Unit Tests**

   - Implement Jest for frontend components
   - Test API utility functions
   - Test streak calculation logic

2. **Integration Tests**

   - Supertest for backend API testing
   - Test database operations
   - Mock MongoDB connections

3. **End-to-End Tests**

   - Playwright or Cypress
   - Automated user flow testing
   - Cross-browser testing

4. **Performance Tests**

   - Load testing with large datasets (1000+ habits)
   - Measure API response times
   - Database query optimization

5. **Accessibility Tests**

   - WCAG 2.1 AA compliance
   - Screen reader testing
   - Keyboard navigation validation

6. **Security Tests**
   - JWT token security audit
   - SQL injection prevention (NoSQL)
   - XSS attack prevention
   - Rate limiting tests

---

## Test Execution Log

| Date       | Tester            | Environment    | Results | Notes                            |
| ---------- | ----------------- | -------------- | ------- | -------------------------------- |
| 2025-10-22 | John Denis Nyagah | Chrome, Win 11 | 28/28   | All tests passing, MongoDB live  |
| 2025-10-21 | John Denis Nyagah | Chrome, Win 11 | 20/20   | localStorage → MongoDB migration |

---

## Next Steps After Testing

Once all tests pass:

1. ✅ **Code Review**: Review all MongoDB integration code
2. ✅ **Documentation**: Update README with setup instructions
3. ✅ **Deployment**: Deploy backend to cloud (Heroku, Render, etc.)
4. ✅ **Environment Variables**: Secure MongoDB credentials
5. ✅ **Screen Recording**: Record demo video for school submission
6. ✅ **Final Testing**: Test on production environment
7. ✅ **Submission**: Submit project with documentation

---

**Last Updated**: October 22, 2025  
**Tested By**: John Denis Nyagah  
**Test Environment**: Chrome 120.0, Windows 11, 1920x1080  
**Backend**: Node.js + Express + MongoDB Atlas  
**Status**: ✅ All Tests Passing

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
