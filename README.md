# Riza - Habit Tracker Web Application

A modern, responsive habit tracking web application built with vanilla JavaScript, HTML, and CSS. Track your daily habits, visualize your progress, and build consistency.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Architecture](#architecture)
- [Testing](#testing)
- [Development Notes](#development-notes)
- [License](#license)

## Features

### Core Functionality

- **Habit Management**: Create, edit, and delete habits with custom icons and frequencies
- **Progress Tracking**: Visual charts showing daily, weekly, and monthly completion rates
- **Streak System**: Track current and longest streaks with dynamic flame animations
- **Activity Calendar**: View your habit completion history at a glance
- **Daily Motivation**: Inspirational quotes to keep you motivated
- **Statistics Dashboard**: Comprehensive stats including success rates and best days
- **User Profile**: Manage your account and upload profile pictures

### Technical Features

- **Fully Responsive**: Optimized for mobile, tablet, laptop, and large desktop screens
- **Modern UI**: Clean, green-themed interface with smooth animations
- **Local Storage**: All data persists in the browser
- **Real-time Updates**: Changes reflect immediately across all pages
- **Accessible**: ARIA labels and keyboard navigation support

## Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6 Modules)
- **Charts**: Chart.js
- **Animations**: Lottie (https://lottiefiles.com/)
- **Icons**: Lucide (https://lucide.dev/)
- **Storage**: Browser localStorage API
- **Version Control**: Git & GitHub

## Project Structure

```
habit-tracker/
├── frontend/
│   ├── assets/
│   │   ├── icons/              # UI icons
│   │   ├── habit-icons/        # Habit category icons
│   │   └── background.png      # Page background
│   ├── components/
│   │   ├── sidebar.html        # Navigation sidebar
│   │   └── sidebar.css
│   ├── shared/
│   │   ├── chart.js            # Shared chart module
│   │   ├── habit-manager.js    # Unified habit CRUD operations
│   │   └── daily-motivation.js # Motivation quotes system
│   ├── dashboard/
│   │   ├── dashboard.html
│   │   ├── dashboard.js
│   │   └── dashboard.css
│   ├── habits/
│   │   ├── habits.html
│   │   ├── habits.js
│   │   └── habits.css
│   ├── progress/
│   │   ├── progress.html
│   │   ├── progress.js
│   │   └── progress.css
│   ├── profile/
│   │   ├── profile.html
│   │   ├── profile.js
│   │   └── profile.css
│   └── login/
│       ├── signin_signup.html
│       ├── signin-signup.js
│       └── signin_signup.css
├── backend/
│   ├── server.js               # Express server
│   ├── models/                 # MongoDB models
│   └── routes/                 # API routes
├── Architecture/
│   └── ARCHITECTURE.md         # System architecture documentation
└── README.md
```

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/habit-tracker.git
   cd habit-tracker
   ```

2. **Open in browser**

   Simply open `frontend/homepage/homepage.html` in your web browser, or use a local server:

   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js http-server
   npx http-server
   ```

3. **Access the application**

   Navigate to `http://localhost:8000/frontend/homepage/homepage.html`

## Usage

### Getting Started

1. **Sign Up/Login** - Create an account or log in
2. **Add Your First Habit** - Click "Add Habit" on the Dashboard
3. **Choose Frequency** - Select daily, weekdays, weekends, or custom schedule
4. **Pick an Icon** - Choose from 25+ habit category icons
5. **Track Progress** - Check off habits as you complete them

### Pages Overview

#### Dashboard

- Quick stats overview
- Weekly progress chart
- Daily motivation
- Current streak display
- Today's check-ins

#### Habits

- Full habit list with filtering
- Add, edit, delete habits
- Quick completion toggles
- Stats summary

#### Progress

- Detailed statistics
- Weekly and monthly charts
- Activity calendar
- Success rate trends
- Best day analysis

#### Profile

- User information
- Profile picture upload
- Account settings
- Logout functionality

## Architecture

The application uses a **unified shared component system** to eliminate code duplication:

### Shared Modules

- **chart.js**: Centralized chart initialization and data management
- **habit-manager.js**: All CRUD operations and business logic
- **daily-motivation.js**: Quote system used across multiple pages

### Data Flow

All pages use the same localStorage keys:

- `rizaHabits`: Habit objects
- `habitCompletions`: Completion dates
- `rizaDailyLogins`: Login tracking
- `rizaLongestStreak`: Best streak record

### Key Benefits

- Single source of truth for all habit operations
- Consistent behavior across all pages
- 70% reduction in code duplication
- Easier maintenance and bug fixes

See [ARCHITECTURE.md](Architecture/ARCHITECTURE.md) for detailed system design.

## Testing

### Manual Testing

The application includes comprehensive manual test cases covering:

- Habit CRUD operations
- Completion toggling
- Data persistence
- Cross-page consistency
- Responsive design
- Edge cases (empty states, invalid inputs)

### Test Data

Sample habits and completions are automatically generated for testing purposes.

### Browser Compatibility

Tested on:

- Chrome 120+
- Firefox 121+
- Safari 17+
- Edge 120+

## Development Notes

### Changes from Conception Phase

1. **Unified Component System**: Moved from page-specific to shared modules
2. **Enhanced Statistics**: Added longest streak, success rate, and best day tracking
3. **Improved Responsiveness**: Added laptop (901-1440px) and large desktop (>1440px) optimizations
4. **Code Quality**: Removed all redundancies, console logs, and outdated comments

### Code Comments

All JavaScript files include:

- File-level documentation explaining purpose
- Function-level comments for complex logic
- Inline comments for clarity where needed
- JSDoc-style parameter descriptions

### Iterations

- **v1.0**: Basic habit tracking with localStorage
- **v1.5**: Added charts and progress visualization
- **v2.0**: Unified shared component system (current)

## License

This project is created for educational purposes as part of a school portfolio project.

## Author

**John Denis Nyagah**

- GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)
- School: [International University of AApplied Sciences (IU) ]
- Program: [Bachelor of Science Computer Science]

---

**Note**: This is a student project demonstrating web development skills including responsive design, JavaScript ES6 modules, data visualization, and modern web development practices.
