# Riza - Habit Tracker Web Application

A modern, full-stack habit tracking web application built with Node.js, Express, MongoDB, and vanilla JavaScript. Track your daily habits, visualize your progress, and build consistency with secure cloud-based data storage.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Development Notes](#development-notes)
- [License](#license)

## Features

### Core Functionality

- **User Authentication**: Secure registration and login with JWT tokens
- **Habit Management**: Create, edit, and delete habits with custom icons and colors
- **Progress Tracking**: Visual charts showing daily, weekly, and monthly completion rates
- **Streak System**: Track current and longest streaks with dynamic flame animations
- **Activity Calendar**: View your habit completion history at a glance
- **Daily Motivation**: Inspirational quotes to keep you motivated
- **Statistics Dashboard**: Comprehensive stats including success rates and best days
- **User Profile**: Manage your account, upload profile pictures, and change password
- **Cloud Sync**: All data stored securely in MongoDB Atlas, accessible from any device

### Technical Features

- **Full-Stack Architecture**: RESTful API with Express.js backend and MongoDB database
- **JWT Authentication**: Secure token-based authentication with bcrypt password hashing
- **Multi-User Support**: Each user has their own isolated data
- **Fully Responsive**: Optimized for mobile, tablet, laptop, and large desktop screens
- **Modern UI**: Clean, green-themed interface with smooth animations
- **Real-time Updates**: Changes reflect immediately across all pages
- **Accessible**: ARIA labels and keyboard navigation support
- **Cloud Database**: MongoDB Atlas for reliable, scalable data storage

## Technologies Used

### Frontend

- **HTML5, CSS3**: Semantic markup and modern styling
- **Vanilla JavaScript (ES6 Modules)**: Modern JavaScript with imports/exports
- **Chart.js**: Interactive data visualization
- **Fetch API**: HTTP requests to backend
- **localStorage**: JWT token and user cache storage

### Backend

- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB Atlas**: Cloud NoSQL database
- **Mongoose**: MongoDB object modeling (ODM)
- **JWT (jsonwebtoken)**: Secure authentication tokens
- **bcrypt.js**: Password hashing and verification
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variable management

### Development Tools

- **Git & GitHub**: Version control and collaboration
- **npm**: Package management
- **nodemon**: Auto-restart server during development
- **Postman**: API testing and documentation

### Assets

- **Lottie**: Animation library (https://lottiefiles.com/)
- **Lucide Icons**: UI icons (https://lucide.dev/)

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
│   │   ├── api.js              # Centralized HTTP client (NEW)
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
│   ├── login/
│   │   ├── signin_signup.html
│   │   ├── signin-signup.js
│   │   └── signin_signup.css
│   └── main.js                 # Sidebar loader
├── backend/
│   ├── server.js               # Express server entry point
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT verification
│   ├── models/
│   │   ├── User.js             # User schema
│   │   ├── Habit.js            # Habit schema
│   │   ├── Checkin.js          # Check-in schema
│   │   └── Login.js            # Login tracking schema
│   ├── routes/
│   │   ├── authRoutes.js       # Authentication endpoints
│   │   ├── habitRoutes.js      # Habit CRUD endpoints
│   │   ├── checkinRoutes.js    # Check-in endpoints
│   │   └── loginRoutes.js      # Login tracking endpoints
│   └── package.json            # Backend dependencies
├── Architecture/
│   └── ARCHITECTURE.md         # System architecture documentation
├── TESTING.md                  # Comprehensive testing guide
├── .env                        # Environment variables (not in repo)
└── README.md
```

## Installation

### For Reviewers

**Quick Setup Guide** - The reviewer should set up their own MongoDB Atlas (cloud) database to test the application locally.

#### Prerequisites

- Node.js v18+ ([Download here](https://nodejs.org/))
- MongoDB Atlas account (free tier - [Sign up here](https://www.mongodb.com/cloud/atlas/register))

#### Setup Steps

1. **Clone Repository**

   ```bash
   git clone https://github.com/Johndenisnyagah/Riza-habit-tracker.git
   cd Riza-habit-tracker
   ```

2. **Install Backend Dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment Variables**

   ```bash
   # Copy the template file
   copy .env.example .env
   ```

   Then edit `.env` and add your MongoDB Atlas credentials:

   - Sign up at https://www.mongodb.com/cloud/atlas/register (free)
   - Create a new cluster (M0 free tier)
   - Get your connection string
   - Generate a JWT secret (see `.env.example` for command)
   - Fill in the values in `.env`

4. **Start the Backend Server**

   ```bash
   npm start
   ```

5. **Open the Application**
   - Open `index.html` in your browser
   - Create a new account and test all features

**Full setup instructions**: See `backend/README.md`

---

### For Developers

#### Prerequisites

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **MongoDB Atlas Account** (Free tier) - [Sign up here](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download here](https://git-scm.com/)

#### Step 1: Clone the Repository

```bash
git clone https://github.com/Johndenisnyagah/Riza-habit-tracker.git
cd habit-tracker
```

#### Step 2: Backend Setup

1. **Navigate to backend folder**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create `.env` file**

   Create a `.env` file in the `backend` folder with:

   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/riza-habit-tracker
   JWT_SECRET=your-super-secret-random-string-here
   PORT=5000
   ```

   - Replace `<username>` and `<password>` with your MongoDB Atlas credentials
   - Generate a secure random string for `JWT_SECRET` (at least 32 characters)

4. **Start the backend server**

   ```bash
   # Development mode (auto-restart on changes)
   npm run dev

   # Or production mode
   npm start
   ```

   You should see:

   ```
   ✅ MongoDB connected
   🚀 Server running on port 5000
   ```

### Step 3: Frontend Setup

1. **Open a new terminal** (keep the backend running)

2. **Navigate to project root**

   ```bash
   cd ..
   ```

3. **Serve the frontend**

   Option A: Using Python

   ```bash
   python -m http.server 8000
   ```

   Option B: Using Node.js http-server

   ```bash
   npx http-server -p 8000
   ```

   Option C: Using VS Code Live Server extension

   - Install "Live Server" extension
   - Right-click `index.html` → "Open with Live Server"

4. **Access the application**

   Open your browser and navigate to:

   ```
   http://localhost:8000/frontend/login/signin_signup.html
   ```

### Troubleshooting

**Backend won't start:**

- Check if MongoDB URI is correct
- Ensure MongoDB Atlas IP whitelist includes your IP (or use 0.0.0.0/0 for development)
- Verify `.env` file is in the `backend` folder

**Frontend can't connect to backend:**

- Ensure backend is running on port 5000
- Check `frontend/shared/api.js` has correct `API_BASE_URL: "http://localhost:5000/api"`
- Check browser console for CORS errors

## Usage

### Getting Started

1. **Register an Account**

   - Navigate to the login page
   - Click "Sign Up"
   - Enter username, email, and password
   - Your password will be securely hashed and stored

2. **Login**

   - Enter your email and password
   - JWT token is generated and stored in browser
   - Automatically redirected to dashboard

3. **Add Your First Habit**

   - Click "Add Habit" button on Dashboard
   - Enter habit name
   - Choose a color (visual identification)
   - Pick an icon (15+ categories available)
   - Click "Save"

4. **Track Your Progress**

   - Check off habits as you complete them
   - View real-time streak updates
   - Watch your statistics grow

5. **Sync Across Devices**
   - Login from any device
   - All your data is synced via MongoDB
   - Consistent experience everywhere

### Pages Overview

#### Dashboard

- Quick stats overview (today's check-ins, current streak)
- Weekly progress chart
- Daily motivational quote
- Recent habits list
- Login streak tracking

#### Habits

- Complete habit list with all your habits
- Filter by active/completed status
- Add, edit, delete habits
- Quick completion toggles
- Statistics summary (total habits, completion rate)

#### Progress

- Detailed statistics and analytics
- Weekly and monthly completion charts
- Activity calendar heatmap
- Success rate trends
- Best day analysis
- Longest streak records

#### Profile

- User information display
- Profile picture upload (base64 encoding)
- Change password functionality
- Account settings
- Delete account option
- Logout functionality

## Architecture

The application uses a **3-tier full-stack architecture** with separation of concerns:

### System Layers

1. **Frontend (Client)** - User interface and interaction
2. **Backend (Server)** - Business logic and API
3. **Database (Storage)** - MongoDB Atlas cloud database

### Data Flow

```
User Action (Browser)
    ↓
Frontend JavaScript (api.js)
    ↓
HTTP Request with JWT Token
    ↓
Express Backend (authMiddleware verifies token)
    ↓
MongoDB Atlas (user-specific data query)
    ↓
Response back to Frontend
    ↓
UI Updates in Real-time
```

### Shared Frontend Modules

- **api.js** (NEW): Centralized HTTP client for all backend communication

  - Manages JWT tokens
  - Handles all API requests
  - Error logging and handling

- **chart.js**: Chart initialization and data visualization

  - Fetches data via api.js
  - Calculates weekly aggregations
  - Renders Chart.js visualizations

- **habit-manager.js**: All habit CRUD operations and UI logic

  - Modal management
  - Form handling
  - Communicates with backend via api.js
  - Updates charts and statistics

- **daily-motivation.js**: Quote system used across multiple pages
  - 10 curated inspirational quotes
  - Day-based rotation
  - Manual refresh functionality

### Backend Architecture

- **Express REST API**: Handles all HTTP requests
- **JWT Authentication**: Secure token-based auth with 24h expiry
- **MongoDB + Mongoose**: ODM for schema validation and queries
- **Middleware**: authMiddleware verifies JWT on protected routes
- **Routes**: Organized by feature (auth, habits, checkins, logins)

### Security Features

- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Tokens**: Signed tokens with secret key
- **User Isolation**: All queries filtered by userId
- **Protected Routes**: authMiddleware guards sensitive endpoints
- **CORS**: Configured for secure cross-origin requests

### Database Schema

**Collections:**

- `users` - User accounts, auth credentials, profile data
- `habits` - User habits with userId reference
- `checkins` - Daily completions (unique: userId + habitId + date)
- `logins` - Page visit tracking

### Key Benefits

- ✅ **Multi-user support** - Each user has isolated data
- ✅ **Cloud sync** - Access from any device
- ✅ **Secure authentication** - JWT + bcrypt
- ✅ **Scalable architecture** - Can handle many concurrent users
- ✅ **Single source of truth** - MongoDB as central data store
- ✅ **Modular code** - Easy to maintain and extend
- ✅ **RESTful API** - Standard HTTP methods and status codes

See [ARCHITECTURE.md](Architecture/ARCHITECTURE.md) for detailed system design, data flow diagrams, and API documentation.

## API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint         | Description       | Auth Required |
| ------ | ---------------- | ----------------- | ------------- |
| POST   | `/auth/register` | Register new user | No            |
| POST   | `/auth/login`    | Login user        | No            |
| POST   | `/auth/logout`   | Logout user       | No            |
| GET    | `/auth/profile`  | Get user profile  | Yes           |
| PUT    | `/auth/profile`  | Update profile    | Yes           |
| PUT    | `/auth/password` | Change password   | Yes           |
| DELETE | `/auth/account`  | Delete account    | Yes           |

### Habit Endpoints

| Method | Endpoint      | Description         | Auth Required |
| ------ | ------------- | ------------------- | ------------- |
| GET    | `/habits`     | Get all user habits | Yes           |
| POST   | `/habits`     | Create new habit    | Yes           |
| PUT    | `/habits/:id` | Update habit        | Yes           |
| DELETE | `/habits/:id` | Delete habit        | Yes           |

### Check-in Endpoints

| Method | Endpoint                    | Description             | Auth Required |
| ------ | --------------------------- | ----------------------- | ------------- |
| POST   | `/checkins/toggle`          | Toggle habit completion | Yes           |
| GET    | `/checkins`                 | Get all check-ins       | Yes           |
| GET    | `/checkins/habit/:habitId`  | Get habit check-ins     | Yes           |
| GET    | `/checkins/streak/:habitId` | Get habit streak        | Yes           |

### Login Tracking Endpoints

| Method | Endpoint        | Description        | Auth Required |
| ------ | --------------- | ------------------ | ------------- |
| POST   | `/logins/visit` | Record page visit  | Yes           |
| GET    | `/logins/today` | Get today's visits | Yes           |

### Request/Response Examples

#### Register User

```javascript
// POST /api/auth/register
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123"
}

// Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "67891abc123",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

#### Create Habit

```javascript
// POST /api/habits
// Headers: { Authorization: "Bearer <token>" }
{
  "title": "Morning Jog",
  "color": "#e74c3c",
  "icon": "🏃"
}

// Response
{
  "_id": "67891xyz456",
  "userId": "67891abc123",
  "title": "Morning Jog",
  "color": "#e74c3c",
  "icon": "🏃",
  "streak": 0,
  "createdAt": "2025-10-23T10:30:00Z",
  "updatedAt": "2025-10-23T10:30:00Z"
}
```

#### Toggle Check-in

```javascript
// POST /api/checkins/toggle
// Headers: { Authorization: "Bearer <token>" }
{
  "habitId": "67891xyz456",
  "date": "2025-10-23"
}

// Response
{
  "isCompleted": true,
  "streak": 5
}
```

For complete API documentation, see [ARCHITECTURE.md](Architecture/ARCHITECTURE.md).

## Testing

For comprehensive test cases and testing procedures, see [TESTING.md](TESTING.md).

### Browser Compatibility

Tested and working on:

- ✅ Chrome 120+
- ✅ Firefox 121+
- ✅ Safari 17+
- ✅ Edge 120+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Development Notes

### Evolution from Conception

**v1.0 - Initial Version:**

- Basic habit tracking with localStorage
- Single-user only
- No authentication

**v1.5 - Enhanced Features:**

- Added charts and progress visualization
- Improved responsive design
- Unified shared components

**v2.0 - Full-Stack Migration (Current):**

- ✅ Node.js/Express backend
- ✅ MongoDB Atlas cloud database
- ✅ JWT authentication system
- ✅ Multi-user support
- ✅ RESTful API architecture
- ✅ Centralized HTTP client (api.js)
- ✅ Secure password hashing
- ✅ Cross-device data sync
- ✅ Professional documentation

### Key Technical Decisions

1. **MongoDB over SQL**

   - Flexible schema for rapid development
   - Easy to add new fields without migrations
   - Great for JSON-like data structures
   - Free cloud hosting (Atlas)

2. **JWT over Sessions**

   - Stateless authentication (scalable)
   - Easy to implement
   - Works well with REST APIs
   - Can be used for mobile apps later

3. **Vanilla JS over Framework**

   - Learning fundamental concepts
   - No build tools needed
   - Smaller bundle size
   - Full control over code

4. **Modular Architecture**
   - Separated frontend/backend concerns
   - Reusable components (api.js, habit-manager.js)
   - Easy to maintain and test
   - 70% reduction in code duplication

### Code Quality Standards

- ✅ **Comprehensive Comments**: Every file has detailed documentation
- ✅ **JSDoc Style**: Function parameters and return types documented
- ✅ **No Console Logs**: Removed all debugging logs from production code
- ✅ **Consistent Naming**: camelCase for variables, PascalCase for models
- ✅ **Error Handling**: Try-catch blocks in all async functions
- ✅ **Security Best Practices**: Password hashing, JWT tokens, input validation

### Environment Variables

Required in `.env` file:

```env
# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Secret key for JWT signing (min 32 characters)
JWT_SECRET=your-super-secret-random-key-here-make-it-long

# Server port
PORT=5000

# Environment (development/production)
NODE_ENV=development
```

### Deployment Considerations

**For Production:**

1. Set `NODE_ENV=production` in `.env`
2. Use a secure JWT_SECRET (generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
3. Update MongoDB Atlas IP whitelist for production server
4. Change `API_BASE_URL` in `frontend/shared/api.js` to production URL
5. Enable HTTPS for API endpoints
6. Configure CORS for production domain
7. Set up database backups
8. Add rate limiting middleware (optional)
9. Enable logging with Winston or Morgan (optional)

### Performance Optimizations

- Mongoose indexes on userId fields for fast queries
- JWT tokens cached in localStorage (reduce auth calls)
- Chart.js responsive and optimized
- Lazy loading for profile pictures
- Efficient MongoDB queries with select() and populate()

### Future Enhancements

**Planned Features:**

- [ ] Email verification on registration
- [ ] Password reset via email
- [ ] Two-factor authentication (2FA)
- [ ] Social login (Google, GitHub)
- [ ] Habit sharing between users
- [ ] Team/group habit challenges
- [ ] Push notifications for reminders
- [ ] Mobile app (React Native)
- [ ] Data export (CSV, JSON, PDF)
- [ ] Advanced analytics (trends, predictions)
- [ ] Habit templates library
- [ ] Gamification (badges, levels, achievements)
- [ ] Dark mode support

**Technical Improvements:**

- [ ] WebSocket for real-time updates
- [ ] Redis caching layer
- [ ] GraphQL API alternative
- [ ] Unit tests with Jest
- [ ] E2E tests with Cypress
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Docker containerization
- [ ] Kubernetes orchestration

## License

This project is created for educational purposes as part of a school portfolio project.

## Author

**John Denis Kirungia Nyagah**

- GitHub: [@Johndenisnyagah](https://github.com/Johndenisnyagah)
- Repository: [Riza-habit-tracker](https://github.com/Johndenisnyagah/Riza-habit-tracker)
- School: International University of Applied Sciences (IU)
- Program: Bachelor of Science Computer Science

## Acknowledgments

- **Chart.js** - Beautiful data visualizations
- **MongoDB** - Reliable cloud database
- **Lucide Icons** - Clean, modern icon set
- **Lottie** - Smooth animations
- **Stack Overflow Community** - Problem-solving support

---

**Note**: This is a full-stack student project demonstrating:

- Modern web development practices
- RESTful API design
- Database management with MongoDB
- JWT authentication and security
- Responsive design
- JavaScript ES6 modules
- Data visualization
- Professional code documentation

**Built with ❤️ for learning and portfolio purposes**
