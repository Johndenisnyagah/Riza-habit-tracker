import express from "express";
import Login from "../models/Login.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/logins/track → Track daily login
router.post("/track", protect, async (req, res) => {
  try {
    // Create today's date at midnight UTC for consistency
    const now = new Date();
    const today = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
    );

    // Check if already logged today
    const existingLogin = await Login.findOne({
      userId: req.user.id,
      date: today,
    });

    if (existingLogin) {
      return res.status(200).json({
        message: "Already logged today",
        alreadyLogged: true,
      });
    }

    // Create new login record
    const login = new Login({
      userId: req.user.id,
      date: today,
    });

    await login.save();

    res.status(201).json({
      message: "Login tracked",
      alreadyLogged: false,
      login,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/logins/count → Get total login days
router.get("/count", protect, async (req, res) => {
  try {
    const count = await Login.countDocuments({
      userId: req.user.id,
    });

    res.status(200).json({ totalLoginDays: count });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
