import express from "express";
import Checkin from "../models/Checkin.js";
import Habit from "../models/Habit.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/checkins/toggle → toggle habit completion for today
router.post("/toggle", protect, async (req, res) => {
  try {
    const { habitId } = req.body;

    // Create today's date at midnight UTC for consistency
    const now = new Date();
    const today = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
    );

    // Check if this habit already has a check-in for today
    const existingCheckin = await Checkin.findOne({
      habitId,
      userId: req.user.id,
      date: today,
    });

    if (existingCheckin) {
      // If exists, delete it (toggle off)
      await Checkin.deleteOne({ _id: existingCheckin._id });
      return res.status(200).json({
        message: "Check-in removed",
        completed: false,
      });
    } else {
      // If doesn't exist, create it (toggle on)
      const checkin = new Checkin({
        habitId,
        userId: req.user.id,
        date: today,
        completed: true,
      });
      await checkin.save();
      return res.status(201).json({
        message: "Check-in recorded",
        completed: true,
        checkin,
      });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/checkins/:habitId → get all check-ins for a specific habit
router.get("/:habitId", protect, async (req, res) => {
  try {
    const checkins = await Checkin.find({
      habitId: req.params.habitId,
      userId: req.user.id,
    }).sort({ date: -1 });

    res.status(200).json(checkins);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/checkins/:habitId/streak → calculate current streak
router.get("/:habitId/streak", protect, async (req, res) => {
  try {
    const checkins = await Checkin.find({
      habitId: req.params.habitId,
      userId: req.user.id,
    }).sort({ date: -1 });

    if (checkins.length === 0) {
      return res.status(200).json({ streak: 0 });
    }

    // Normalize dates (ignore time)
    const normalize = (d) => new Date(d).setHours(0, 0, 0, 0);

    let streak = 1;
    let lastDate = normalize(checkins[0].date);

    for (let i = 1; i < checkins.length; i++) {
      const currentDate = normalize(checkins[i].date);
      const diffInDays = Math.floor(
        (lastDate - currentDate) / (1000 * 60 * 60 * 24)
      );

      if (diffInDays === 1) {
        streak++;
        lastDate = currentDate;
      } else if (diffInDays > 1) {
        break;
      }
    }

    res.status(200).json({ streak });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
