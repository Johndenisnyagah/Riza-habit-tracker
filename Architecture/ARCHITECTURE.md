# Habit Tracker - RIZA Full-Stack Architecture

## System Overview

**Stack:** MERN-like (MongoDB + Express + Vanilla JS Frontend)

- **Backend:** Node.js/Express REST API (Port 5000)
- **Database:** MongoDB Atlas (Cloud)
- **Frontend:** Vanilla JavaScript (ES6 Modules)
- **Authentication:** JWT (JSON Web Tokens)

## High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND LAYER                               │
│                     (Vanilla JavaScript - ES6 Modules)                 │
│                                                                        │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │                    AUTHENTICATION PAGES                       │     │
│  │  ┌─────────────┐                                              │     │
│  │  │ Login/Signup│  → JWT Token → localStorage                  │     │
│  │  └─────────────┘                                              │     │
│  └───────────────────────────────────────────────────────────────┘     │
│                                                                        │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │                    AUTHENTICATED PAGES                        │     │
│  │  ┌──────────┐  ┌─────────┐  ┌──────────┐  ┌─────────┐         │     │
│  │  │Dashboard │  │ Habits  │  │ Progress │  │ Profile │         │     │
│  │  └──────────┘  └─────────┘  └──────────┘  └─────────┘         │     │
│  └───────────────────────────────────────────────────────────────┘     │
│                              ▲ ▲ ▲ ▲                                   │
│                              │ │ │ │                                   │
│  ┌───────────────────────────┘ │ │ └──────────────────┐                │
│  │          ┌──────────────────┘ └───────┐            │                │
│  │          │                            │            │                │
│  ┌──────────┴──┐  ┌──────────────┐  ┌────┴──────────┐ │  ┌──────────┐  │
│  │  api.js     │  │ chart.js     │  │ habit-mgr.js  │ │  │ daily-   │  │
│  │ (HTTP)      │  │ (Chart.js)   │  │ (UI Logic)    │ │  │motivation│  │
│  │ ──────      │  │ ──────       │  │ ──────        │ │  │ ──────   │  │
│  │• Auth APIs  │  │• Init charts │  │• Modal mgmt   │ │  │• Quotes  │  │
│  │• Habit APIs │  │• Update data │  │• Form handler │ │  │• Refresh │  │
│  │• Checkin    │  │• Week calc   │  │• List render  │ │  │• Category│  │
│  │• Profile    │  │              │  │               │ │  │          │  │
│  │• Login track│  │              │  │               │ │  │          │  │
│  └─────────────┘  └──────────────┘  └───────────────┘ │  └──────────┘  │
│         │                                             │                │
│         │ HTTP/HTTPS Requests (JSON)                  │                │
│         │ Authorization: Bearer <JWT>                 │                │
└─────────┼─────────────────────────────────────────────┼────────────────┘
          │                                             │
          ▼                                             ▼
┌───────────────────────────────────────────────────────────────────────┐
│                           BACKEND LAYER                               │
│                      (Node.js + Express REST API)                     │
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐    │
│  │                        MIDDLEWARE                             │    │
│  │  • express.json() - Parse JSON bodies                         │    │
│  │  • cors() - Enable cross-origin requests                      │    │
│  │  • authMiddleware.js - Verify JWT tokens                      │    │
│  └───────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐    │
│  │                          ROUTES                               │    │
│  │  ┌───────────────┐  ┌──────────────┐  ┌──────────────┐        │    │
│  │  │ authRoutes    │  │ habitRoutes  │  │checkinRoutes │        │    │
│  │  │ /api/auth     │  │ /api/habits  │  │/api/checkins │        │    │
│  │  │ ──────────    │  │ ──────────   │  │ ──────────   │        │    │
│  │  │• POST/register│  │• GET /       │  │• POST/toggle │        │    │
│  │  │• POST/login   │  │• POST/       │  │• GET /habit/:│        │    │
│  │  │• POST/logout  │  │• PUT /:id    │  │• GET /streak │        │    │
│  │  │• PUT /password│  │• DELETE /:id │  │              │        │    │
│  │  │• DELETE/acct  │  │              │  │              │        │    │
│  │  └───────────────┘  └──────────────┘  └──────────────┘        │    │
│  │                                                               │    │
│  │  ┌───────────────┐  ┌──────────────┐                          │    │
│  │  │ loginRoutes   │  │ profileRoute │                          │    │
│  │  │ /api/logins   │  │ (in auth)    │                          │    │
│  │  │ ──────────    │  │ ──────────   │                          │    │
│  │  │• POST/visit   │  │• GET /profile│                          │    │
│  │  │• GET /today   │  │• PUT /profile│                          │    │
│  │  └───────────────┘  └──────────────┘                          │    │
│  └───────────────────────────────────────────────────────────────┘    │
│                              ▼ ▼ ▼ ▼                                  │
│  ┌───────────────────────────────────────────────────────────────┐    │
│  │                       MONGOOSE MODELS                         │    │
│  │  ┌──────────┐  ┌─────────┐  ┌─────────┐  ┌──────────┐         │    │
│  │  │User.js   │  │Habit.js │  │Checkin  │  │Login.js  │         │    │
│  │  │──────    │  │──────   │  │.js      │  │──────    │         │    │
│  │  │• username│  │• title  │  │──────   │  │• userId  │         │    │
│  │  │• email   │  │• color  │  │• habitId│  │• visitDate│        │    │
│  │  │• password│  │• icon   │  │• date   │  │• page    │         │    │
│  │  │• profile │  │• userId │  │• userId │  │          │         │    │
│  │  │• createdAt│ │• streak │  │         │  │          │         │    │
│  │  └──────────┘  └─────────┘  └─────────┘  └──────────┘         │    │
│  └───────────────────────────────────────────────────────────────┘    │
│                                  ▼                                    │
└──────────────────────────────────┼────────────────────────────────────┘
                                   │
                                   ▼
┌───────────────────────────────────────────────────────────────────────┐
│                         DATABASE LAYER                                │
│                      (MongoDB Atlas - Cloud)                          │
│                                                                       │
│  Database: riza-habit-tracker                                         │
│  ┌───────────────────────────────────────────────────────────────┐    │
│  │  Collections:                                                 │    │
│  │  • users         - User accounts, auth, profile data          │    │
│  │  • habits        - User habits (title, color, icon, streak)   │    │
│  │  • checkins      - Daily habit completions                    │    │
│  │  • logins        - Page visit tracking                        │    │
│  └───────────────────────────────────────────────────────────────┘    │
```

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER REGISTRATION                            │
└─────────────────────────────────────────────────────────────────┘

1. User fills registration form (username, email, password)
   │
   ▼
2. Frontend: api.register(userData)
   │
   ▼
3. POST /api/auth/register
   │
   ├─► Validate input (email format, password strength)
   ├─► Hash password with bcrypt (10 salt rounds)
   ├─► Create User document in MongoDB
   ├─► Generate JWT token (24h expiry)
   │
   ▼
4. Return: { token, user: { id, username, email } }
   │
   ▼
5. Frontend: Store token in localStorage
   │
   ▼
6. Redirect to dashboard.html

┌─────────────────────────────────────────────────────────────────┐
│                       USER LOGIN                                │
└─────────────────────────────────────────────────────────────────┘

1. User enters email + password
   │
   ▼
2. Frontend: api.login(email, password)
   │
   ▼
3. POST /api/auth/login
   │
   ├─► Find user by email
   ├─► Compare password with bcrypt
   ├─► Generate JWT token (24h expiry)
   │
   ▼
4. Return: { token, user: { id, username, email, profilePicture } }
   │
   ▼
5. Frontend:
   ├─► Store token in localStorage ('token')
   ├─► Store user data in localStorage ('user')
   │
   ▼
6. Redirect to dashboard.html

┌─────────────────────────────────────────────────────────────────┐
│                  AUTHENTICATED REQUESTS                         │
└─────────────────────────────────────────────────────────────────┘

1. User performs action (add habit, check-in, etc.)
   │
   ▼
2. Frontend: api.someProtectedEndpoint()
   │
   ├─► Get token from localStorage
   ├─► Add header: Authorization: Bearer <token>
   │
   ▼
3. Backend: authMiddleware verifies JWT
   │
   ├─► Extract token from header
   ├─► Verify with jwt.verify()
   ├─► Decode userId from token
   ├─► Attach req.user = { userId }
   │
   ▼
4. Route handler processes request
   │
   ├─► Access userId via req.user.userId
   ├─► Query MongoDB with userId filter
   │
   ▼
5. Return response to frontend
```

## Data Flow - Complete Request Cycle

### Example: User Adds a New Habit

```
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND (Dashboard Page)                                      │
└─────────────────────────────────────────────────────────────────┘

1. User clicks "Add Habit" button
   │
   ▼
2. habit-manager.js: openModal()
   │
   ▼
3. User fills form (title, color, icon)
   │
   ▼
4. User clicks "Save"
   │
   ▼
5. habit-manager.js: saveHabit()
   │
   ├─► Collect form data
   ├─► Call: api.createHabit(habitData)
   │
   ▼

┌─────────────────────────────────────────────────────────────────┐
│  API LAYER (api.js)                                             │
└─────────────────────────────────────────────────────────────────┘

6. api.createHabit()
   │
   ├─► Get JWT token from localStorage
   ├─► Prepare request:
   │   • URL: POST http://localhost:5000/api/habits
   │   • Headers: { Authorization: Bearer <token> }
   │   • Body: { title, color, icon }
   │
   ▼

┌─────────────────────────────────────────────────────────────────┐
│  BACKEND (Express Server)                                       │
└─────────────────────────────────────────────────────────────────┘

7. Request hits: POST /api/habits
   │
   ▼
8. authMiddleware.js
   │
   ├─► Verify JWT token
   ├─► Extract userId
   ├─► Attach to req.user.userId
   │
   ▼
9. habitRoutes.js: Create habit handler
   │
   ├─► Get userId from req.user.userId
   ├─► Create habit object: { ...habitData, userId, streak: 0 }
   ├─► Save to MongoDB: await Habit.create(habit)
   │
   ▼
10. Return created habit: { _id, title, color, icon, userId, streak, createdAt }
   │
   ▼

┌─────────────────────────────────────────────────────────────────┐
│  API LAYER (api.js) - Response                                  │
└─────────────────────────────────────────────────────────────────┘

11. api.createHabit() receives response
   │
   ├─► Parse JSON response
   ├─► Return habit object
   │
   ▼

┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND (habit-manager.js) - UI Update                        │
└─────────────────────────────────────────────────────────────────┘

12. saveHabit() receives habit
   │
   ├─► Close modal
   ├─► Call refreshHabitDisplay()
   │   │
   │   ├─► updateHabitSummaryList() - Re-render habit cards
   │   ├─► updateChartWithHabitData() - Refresh chart
   │   └─► Update statistics
   │
   ▼
13. User sees new habit in list across ALL pages
```

### Example: User Completes a Habit (Check-in)

```
1. User clicks checkbox on habit card
   │
   ▼
2. habit-manager.js: toggleHabitCompletion(habitId, checkbox)
   │
   ├─► Get today's date
   ├─► Call: api.toggleHabitCompletion(habitId, date)
   │
   ▼
3. api.js: POST /api/checkins/toggle
   │
   ├─► Headers: Authorization: Bearer <token>
   ├─► Body: { habitId, date: "2025-10-23" }
   │
   ▼
4. Backend: authMiddleware → checkinRoutes
   │
   ├─► Check if checkin exists for this habit + date
   ├─► If exists: Delete checkin (uncheck)
   ├─► If not exists: Create checkin (check)
   ├─► Update habit streak
   │
   ▼
5. Return: { isCompleted: true/false, streak: number }
   │
   ▼
6. Frontend: toggleHabitCompletion()
   │
   ├─► Update checkbox visual state
   ├─► Update streak display
   ├─► Refresh chart data
   ├─► Update statistics
   │
   ▼
7. Changes visible immediately
```

## Frontend Module Dependencies

```
┌──────────────┐      Import      ┌──────────────────┐
│  dashboard   │ ═══════════════► │ api.js           │
│  .js         │                  │ (HTTP Client)    │
└──────────────┘                  │ ──────────       │
                                  │ • getHabits()    │
┌──────────────┐      Import      │ • createHabit()  │
│  habits.js   │ ═══════════════► │ • updateHabit()  │
│              │                  │ • deleteHabit()  │
└──────────────┘                  │ • toggleCheckin()│
                                  │ • getProfile()   │
┌──────────────┐      Import      │ • recordVisit()  │
│  progress.js │ ═══════════════► └──────────────────┘
│              │                           │
└──────────────┘                           │ HTTP
                                          ▼
┌──────────────┐                  ┌──────────────────┐
│  profile.js  │                  │ Express Backend  │
│              │                  │  (Port 5000)     │
└──────────────┘                  │ ──────────       │
                                  │ • MongoDB Atlas  │
       │                          │ • JWT Auth       │
       │ Import                   │ • Mongoose ODM   │
       ▼                          └──────────────────┘
┌──────────────────┐
│ habit-manager.js │              ┌──────────────────┐
│ (UI Logic)       │              │ chart.js         │
│ ──────────       │◄─────Import──│ (Visualization)  │
│ • Modal mgmt     │              │ ──────────       │
│ • Form handling  │              │ • initChart()    │
│ • List rendering │              │ • updateChart()  │
│ • Uses api.js    │              │ • weekCalc()     │
└──────────────────┘              └──────────────────┘
       │
       │ Import
       ▼
┌──────────────────┐
│ daily-motivation │              Used by:
│      .js         │              • Dashboard
│ ──────────       │              • Habits
│ • Quote system   │              • Progress
│ • Categories     │
│ • Refresh        │
└──────────────────┘
```

## Component Responsibilities

## Component Responsibilities

### `api.js` - HTTP Client Layer (NEW)

```
Responsibilities:
  - Centralized HTTP communication with backend
  - JWT token management (localStorage)
  - Request/response handling
  - Error logging and handling
  - All API endpoint abstractions

API Groups:
  • Authentication:
    - register(userData)
    - login(email, password)
    - logout()
    - changePassword(currentPassword, newPassword)
    - deleteAccount()

  • Profile Management:
    - getUserProfile()
    - updateUserProfile(updates)
    - updateProfilePicture(base64Image)

  • Habits CRUD:
    - getHabits()
    - createHabit(habitData)
    - updateHabit(id, updates)
    - deleteHabit(id)

  • Check-ins:
    - toggleHabitCompletion(habitId, date)
    - getCheckins()
    - getHabitStreak(habitId)

  • Login Tracking:
    - recordPageVisit(page)
    - getTodayLoginCount()

Dependencies:
  • None (standalone HTTP client)
  • Communicates with Express backend (Port 5000)

Storage:
  • JWT Token: localStorage.getItem('token')
  • User Data: localStorage.getItem('user')
```

### `chart.js` - Visualization Layer

```
Responsibilities:
  - Create and configure Chart.js instances
  - Fetch habit data via api.getHabits()
  - Fetch checkin data via api.getCheckins()
  - Calculate weekly aggregations
  - Render bar/line charts
  - Export reusable functions

Key Functions:
  • initializeProgressChart(options)
    - Creates Chart.js instance
    - Configures responsive options
    - Sets up 3:1 aspect ratio

  • updateChartWithHabitData(chartInstance)
    - Fetches habits and checkins from MongoDB
    - Calculates weekly completion data
    - Updates chart datasets

  • isThisWeek(dateStr)
    - Helper: Determines if date is in current week (Mon-Sun)

Dependencies:
  • Chart.js library (CDN)
  • api.js (for data fetching)
```

### `habit-manager.js` - Business Logic Layer

```
Responsibilities:
  - All UI interactions for habit management
  - Modal management (open/close)
  - Form handling and validation
  - Habit completion toggling
  - List rendering with real-time updates
  - Chart synchronization
  - Communicates with backend via api.js

Key Functions:
  • initializeHabitManager(options)
    - Sets up modal, buttons, event listeners

  • saveHabit()
    - Collects form data
    - Calls api.createHabit() or api.updateHabit()
    - Refreshes UI

  • deleteHabit(habitId)
    - Calls api.deleteHabit(habitId)
    - Removes from UI

  • toggleHabitCompletion(habitId, checkbox)
    - Calls api.toggleHabitCompletion(habitId, date)
    - Updates checkbox visual state
    - Updates streak count

  • refreshHabitDisplay()
    - Re-fetches all habits from MongoDB
    - Renders updated list
    - Updates chart
    - Updates statistics

Dependencies:
  • api.js (all backend communication)
  • chart.js (for chart updates)
```

### `daily-motivation.js` - Motivation Quotes Module

```
Responsibilities:
  - Provide motivational quotes by category
  - Day-based quote selection (day of week)
  - Manual quote refresh functionality
  - Category display (9 categories)

Quote Categories:
  • Consistency, Growth, Mindfulness, Resilience
  • Action, Balance, Self-Compassion, Purpose, Progress

Key Functions:
  • setDailyMotivation(mode)
    - mode: 'day-based' (default) or 'next'
    - Rotates through 10 curated quotes
    - Updates DOM with quote + category

  • Refresh button listener
    - Advances to next quote
    - Updates UI immediately

Dependencies:
  • None (standalone module)
  • No backend communication
```

### Page Scripts - Presentation Layer

```
Responsibilities:
  - Initialize shared modules
  - Page-specific statistics display
  - Fetch data from MongoDB via api.js
  - Handle user authentication status
  - Custom UI elements
  - Layout management

Common Functions (across dashboard.js, habits.js, progress.js):
  • trackDailyLogin()
    - Calls api.recordPageVisit(pageName)
    - Returns total check-ins count

  • calculateLongestStreak()
    - Fetches checkins via api.getCheckins()
    - Calculates longest consecutive streak
    - Returns streak value

  • updateCurrentStreak()
    - Fetches checkins data
    - Calculates current active streak
    - Updates UI (flame animation, milestones)

Dependencies:
  • api.js (all data fetching)
  • habit-manager.js (UI management)
  • chart.js (visualizations)
  • daily-motivation.js (quotes, on some pages)
```

## Backend API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint    | Description                             | Auth Required |
| ------ | ----------- | --------------------------------------- | ------------- |
| POST   | `/register` | Create new user account                 | No            |
| POST   | `/login`    | Login user, return JWT                  | No            |
| POST   | `/logout`   | Logout user (client-side token removal) | No            |
| GET    | `/profile`  | Get user profile data                   | Yes           |
| PUT    | `/profile`  | Update user profile                     | Yes           |
| PUT    | `/password` | Change password                         | Yes           |
| DELETE | `/account`  | Delete user account                     | Yes           |

### Habit Routes (`/api/habits`)

| Method | Endpoint | Description           | Auth Required |
| ------ | -------- | --------------------- | ------------- |
| GET    | `/`      | Get all user's habits | Yes           |
| POST   | `/`      | Create new habit      | Yes           |
| PUT    | `/:id`   | Update habit by ID    | Yes           |
| DELETE | `/:id`   | Delete habit by ID    | Yes           |

### Check-in Routes (`/api/checkins`)

| Method | Endpoint           | Description                      | Auth Required |
| ------ | ------------------ | -------------------------------- | ------------- |
| POST   | `/toggle`          | Toggle habit completion for date | Yes           |
| GET    | `/`                | Get all user's check-ins         | Yes           |
| GET    | `/habit/:habitId`  | Get check-ins for specific habit | Yes           |
| GET    | `/streak/:habitId` | Get current streak for habit     | Yes           |

### Login Tracking Routes (`/api/logins`)

| Method | Endpoint | Description             | Auth Required |
| ------ | -------- | ----------------------- | ------------- |
| POST   | `/visit` | Record page visit       | Yes           |
| GET    | `/today` | Get today's visit count | Yes           |

## Database Schema

### User Collection

```javascript
{
  _id: ObjectId,
  username: String (required, unique),
  email: String (required, unique, lowercase),
  password: String (required, hashed with bcrypt),
  profilePicture: String (base64 image, optional),
  bio: String (optional),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

### Habit Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  title: String (required, max 50 chars),
  color: String (hex color, required),
  icon: String (emoji/icon, required),
  streak: Number (default: 0),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

### Checkin Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  habitId: ObjectId (ref: Habit, required),
  date: String (YYYY-MM-DD format, required),
  createdAt: Date (auto-generated)
}

// Unique Index: userId + habitId + date (prevents duplicate check-ins)
```

### Login Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  page: String (page name: 'dashboard', 'habits', etc.),
  visitDate: String (YYYY-MM-DD format, required),
  createdAt: Date (auto-generated)
}
```

## Module Exports

### `api.js` (NEW)

```javascript
// Authentication
export async function register(userData)
export async function login(email, password)
export async function logout()
export async function changePassword(currentPassword, newPassword)
export async function deleteAccount()

// Profile
export async function getUserProfile()
export async function updateUserProfile(updates)
export async function updateProfilePicture(base64Image)

// Habits
export async function getHabits()
export async function createHabit(habitData)
export async function updateHabit(id, updates)
export async function deleteHabit(id)

// Check-ins
export async function toggleHabitCompletion(habitId, date)
export async function getCheckins()
export async function getHabitStreak(habitId)

// Login Tracking
export async function recordPageVisit(page)
export async function getTodayLoginCount()
```

### `chart.js`

```javascript
export function initializeProgressChart(options)
export function updateChartWithHabitData(chartInstance)
```

### `habit-manager.js`

```javascript
export function initializeHabitManager(options)
export function openModal(habitData)
export function closeModal()
export function refreshHabitDisplay()
export function updateHabitSummaryList(elementId)
export function toggleHabitCompletion(habitId, checkbox)
```

### `daily-motivation.js`

```javascript
// Automatically initializes quote system on all pages
// Provides motivational quotes with categories
// Features:
//   • Day-based quote selection (0-6 for days of week)
//   • Manual refresh button functionality
//   • Quote categories (Consistency, Growth, Mindfulness, etc.)
//   • 10 curated inspirational quotes
```

### Shared Statistics Functions (in each page)

```javascript
async function trackDailyLogin()
  // Calls api.recordPageVisit(pageName)
  // Tracks unique daily visits in MongoDB
  // Returns total check-ins count
  // Used consistently across Dashboard, Habits and Progress

async function calculateLongestStreak()
  // Fetches all checkins via api.getCheckins()
  // Calculates longest consecutive streak across all habits
  // Returns longest streak value
  // Updates UI with streak count

async function updateCurrentStreak()
  // Fetches checkins from MongoDB
  // Calculates current active streak (consecutive days)
  // Updates flame animation and milestone achievements
  // Displays current streak count
```

## CSS Architecture

```
components/
  sidebar.css ──► Shared sidebar styling
                  • Navigation
                  • Logo
                  • Menu items
                  • Responsive behavior

shared/
  habit-styles.css ──► Shared habit card styling
                       • .habit-item
                       • .checkbox-container
                       • .habit-actions
                       • .btn-outline

dashboard/
  dashboard.css ──► Page-specific layout
                    • .dashboard-grid (3-column responsive)
                    • .card styles
                    • Stats, Streak, Motivation cards
                    • Modal overrides
                    • Large screen optimization (901px+, 1441px+)

habits/
  habits.css ──► Page-specific layout
                 • .habits-top (3-card row)
                 • .habit-list (full-width)
                 • Filter buttons
                 • Large screen optimization (901px+, 1441px+)

progress/
  progress.css ──► Page-specific layout
                   • .progress-summary (stats grid)
                   • .progress-charts
                   • .progress-insights
                   • Calendar styling
                   • Large screen optimization (901px+, 1441px+)

profile/
  profile.css ──► Page-specific layout
                  • .profile-grid (2-column)
                  • Profile picture upload
                  • Settings cards
                  • Notification styles
```

## Responsive Design

```
Breakpoints:
  • < 375px    - Extra small phones
  • < 600px    - Small phones
  • 600-900px  - Tablets (portrait)
  • 901-1440px - Laptops (centered, max-width: 1200px)
  • > 1440px   - Large desktops (full-width, no max-width)

All pages share consistent responsive behavior:
  - Mobile-first approach
  - Centered content on laptops
  - Full-width on large screens
  - Proper spacing and padding at all breakpoints
```

## Key Benefits

```
┌─────────────────────┬──────────────┬──────────────┐
│ Aspect              │ Before       │ After        │
├─────────────────────┼──────────────┼──────────────┤
│ Data Storage        │ localStorage │ MongoDB Atlas│
│ Authentication      │ None         │ JWT Tokens   │
│ Multi-user Support  │ No           │ Yes          │
│ Data Persistence    │ Browser only │ Cloud DB     │
│ Security            │ None         │ bcrypt + JWT │
│ API Architecture    │ None         │ REST API     │
│ Code Organization   │ Scattered    │ Centralized  │
│ Lines of Code       │ ~2,500       │ ~3,200       │
│ Duplicate Code      │ High         │ Minimal      │
│ Maintenance         │ Update 3x    │ Update 1x    │
│ Consistency         │ Variable     │ 100%         │
│ Scalability         │ Limited      │ High         │
│ Cross-device Sync   │ No           │ Yes          │
│ Data Backup         │ Manual       │ Automatic    │
│ Testing             │ 3 locations  │ 1 API layer  │
└─────────────────────┴──────────────┴──────────────┘
```

## Security Features

```
 Authentication
  • JWT tokens with 24-hour expiry
  • Secure token storage in localStorage
  • Token verification on every protected request
  • Automatic logout on token expiry

 Password Security
  • bcrypt hashing (10 salt rounds)
  • No plain text password storage
  • Secure password change flow
  • Password validation on frontend

 Authorization
  • User-specific data isolation
  • Every request validates userId from JWT
  • MongoDB queries filtered by userId
  • Protected routes with authMiddleware

 Data Validation
  • Input validation on frontend
  • Server-side validation on backend
  • Mongoose schema validation
  • Email format verification
  • Password strength requirements
```

## Code Quality

```
 Clean Code
  • Professional commenting throughout
  • No console.log in production (using structured logging)
  • No dead/commented-out code
  • Consistent naming conventions (camelCase, async/await)
  • JSDoc documentation for all functions

 Consistency
  • Centralized API communication (api.js)
  • Unified error handling patterns
  • Identical streak calculation across all pages
  • Same responsive breakpoints everywhere
  • Consistent card styling and animations

 Maintainability
  • Single source of truth (MongoDB)
  • Modular ES6 components
  • Clear separation of concerns (Frontend/Backend/Database)
  • Well-documented architecture
  • Reusable utility functions

 Performance
  - Efficient MongoDB queries with indexes
  - JWT-based stateless authentication
  - Minimal DOM manipulation
  - Optimized Chart.js updates
  - Smart caching with localStorage (token, user)
  - Async/await for non-blocking operations

 Scalability
  - MongoDB Atlas cloud database
  - RESTful API design
  - Stateless backend (JWT)
  - Multi-user support
  - Easy to add new features/endpoints
```

## Technology Stack Summary

### Frontend

```
- Vanilla JavaScript (ES6 Modules)
- HTML5 + CSS3
- Chart.js v4.4.1 (visualization)
- Fetch API (HTTP requests)
- localStorage (JWT tokens, user cache)
```

### Backend

```
- Node.js v18+
- Express.js v4.18+ (REST API)
- Mongoose v7.0+ (MongoDB ODM)
- JWT (jsonwebtoken v9.0+)
- bcrypt.js v2.4+ (password hashing)
- CORS (cross-origin support)
- dotenv (environment variables)
```

### Database

```
- MongoDB Atlas (Cloud)
- 4 Collections: users, habits, checkins, logins
- Indexes: userId fields, unique constraints
- Auto-generated timestamps (createdAt, updatedAt)
```

### Development Tools

```
- npm/yarn (package management)
- nodemon (auto-restart server)
- Postman (API testing)
- Git/GitHub (version control)
- VS Code (IDE)
```

## Deployment Considerations

### Environment Variables (`.env`)

```
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/riza-habit-tracker
JWT_SECRET=your-secure-random-secret-key-here
PORT=5000
NODE_ENV=production
```

### Production Checklist

```
□ Set secure JWT_SECRET (random, 32+ characters)
□ Enable MongoDB Atlas IP whitelist
□ Configure CORS for production domain
□ Update API_BASE_URL in frontend/shared/api.js
□ Enable HTTPS for API endpoints
□ Set NODE_ENV=production
□ Remove development console.logs
□ Enable MongoDB authentication
□ Set up database backups
□ Configure rate limiting (optional)
□ Add API request logging (optional)
```

## Future Enhancements

### Potential Features

```
- Email verification on registration
- Password reset via email
- Social login (Google, GitHub)
- Habit sharing between users
- Team/group habit tracking
- Push notifications for reminders
- Mobile app (React Native)
- Data export (CSV, JSON)
- Advanced analytics dashboard
- Habit templates library
- Gamification (badges, levels)
- Dark mode support
```

### Technical Improvements

```
- WebSocket for real-time updates
- Redis caching layer
- GraphQL API alternative
- Server-side rendering (SSR)
- Progressive Web App (PWA)
- Automated testing (Jest, Cypress)
- CI/CD pipeline (GitHub Actions)
- Docker containerization
- Kubernetes orchestration
```
