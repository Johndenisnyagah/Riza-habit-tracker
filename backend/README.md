# Backend Setup Guide

## Quick Start (For Reviewers/Lecturers)

This guide helps you set up and run the backend server locally for testing and grading purposes.

### CREDENTIALS PROVIDED

All credentials needed to run this backend are provided on the **presentation title slide**:

- MongoDB Atlas connection string
- JWT secret key

Simply copy these credentials from the presentation and paste them into your `.env` file.

### Prerequisites

- **Node.js v18+** installed ([Download here](https://nodejs.org/))

### Setup Steps

1. **Install Dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables**

   Copy the `.env.example` file to create your own `.env`:

   ```bash
   # In the backend folder
   cp .env.example .env

   # Or on Windows:
   copy .env.example .env
   ```

   Then edit `.env` and **paste the credentials from the presentation title slide**.

   **Note**: No need to create your own MongoDB Atlas account for grading purposes. All credentials are provided in the presentation.

3. **Start the Server**

   ```bash
   npm start
   ```

   You should see:

   ```
   ✅ MongoDB connected
   🚀 Server running on port 5000
   ```

4. **Verify Backend is Running**

   Open your browser and visit:

   ```
   http://localhost:5000/
   ```

   You should see: "Riza Habit Tracker API is running"

5. **Test the Frontend**

   Open the main project folder in a browser:

   - Open `frontend/login/signin_signup.html` in your browser
   - Create a new account
   - Start testing the habit tracker features!

## Testing the Application

### Option A: Use Pre-existing Test Account

The database is pre-populated with test data. Login credentials are provided in the submission documentation.

### Option B: Create Your Own Test Account

1. Open `frontend/login/signin_signup.html` in your browser
2. Click "Sign Up"
3. Create a new account
4. Login and test all features
5. All data will be saved to the live database

### Option C: Test with Postman/API Calls

1. **Register a new user:**

   ```
   POST http://localhost:5000/api/auth/register
   Body: {
     "username": "reviewer",
     "email": "reviewer@test.com",
     "password": "test123"
   }
   ```

2. **Login and get JWT token:**

   ```
   POST http://localhost:5000/api/auth/login
   Body: {
     "email": "reviewer@test.com",
     "password": "test123"
   }
   ```

   Copy the `token` from the response.

3. **Test protected routes:**
   Add this header to all requests:

   ```
   Authorization: Bearer <paste-token-here>
   ```

   Then test:

   ```
   GET http://localhost:5000/api/habits
   POST http://localhost:5000/api/habits
   ```

## Available Scripts

- `npm start` - Start server in production mode
- `npm run dev` - Start server with auto-restart (nodemon)

## API Documentation

Once running, the backend provides these endpoints:

### Authentication

- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/profile` - Get user profile (requires JWT)

### Habits

- GET `/api/habits` - Get all user habits (requires JWT)
- POST `/api/habits` - Create habit (requires JWT)
- PUT `/api/habits/:id` - Update habit (requires JWT)
- DELETE `/api/habits/:id` - Delete habit (requires JWT)

### Check-ins

- POST `/api/checkins/toggle` - Toggle habit completion (requires JWT)
- GET `/api/checkins` - Get all check-ins (requires JWT)

### Login Tracking

- POST `/api/logins/visit` - Record page visit (requires JWT)
- GET `/api/logins/today` - Get today's visits (requires JWT)

## Troubleshooting

### "MongoDB connection failed"

- Verify the `.env` file is in the `backend/` folder
- Check that you haven't modified the `MONGO_URI` value
- Ensure you have internet connection (connects to MongoDB Atlas cloud)

### "Port 5000 already in use"

- Change `PORT=5000` in `.env` to another port (e.g., 5001)
- Or kill the process using port 5000

### "Module not found"

- Run `npm install` again
- Delete `node_modules/` and `package-lock.json`, then `npm install`

## Project Structure

```
backend/
├── server.js           # Express app entry point
├── middleware/
│   └── authMiddleware.js  # JWT verification
├── models/
│   ├── User.js         # User schema
│   ├── Habit.js        # Habit schema
│   ├── Checkin.js      # Check-in schema
│   └── Login.js        # Login tracking schema
├── routes/
│   ├── authRoutes.js   # Auth endpoints
│   ├── habitRoutes.js  # Habit CRUD
│   ├── checkinRoutes.js # Check-in management
│   └── loginRoutes.js  # Visit tracking
├── package.json        # Dependencies
├── .env.example        # Environment template
└── README.md          # This file
```

## Support

For issues or questions about the backend:

- Check TESTING.md in project root
- See main README.md for complete setup guide
