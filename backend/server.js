// Import dependencies
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import habitRoutes from "./routes/habitRoutes.js";
import checkinRoutes from "./routes/checkinRoutes.js";
import loginRoutes from "./routes/loginRoutes.js";

// Initialize app
dotenv.config();
const app = express();

// Middleware
// Increase body size limit to handle base64 images (default is 100kb, we need ~10MB)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Basic route
app.get("/", (req, res) => {
  res.send("Habit Tracker API is running...");
});

// temporary line to test with postman
app.get("/test", (req, res) => {
  res.json({ message: "Test route works!" });
});

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/checkins", checkinRoutes);
app.use("/api/logins", loginRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
