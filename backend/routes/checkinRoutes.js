import express from "express";
import Checkin from "../models/Checkin.js";
import Habit from "../models/Habit.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/checkins  → mark a habit as done today
router.post("/", protect, async (req, res) => {
  try {
    const { habitId } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if this habit already has a check-in for today
    const existingCheckin = await Checkin.findOne({
      habitId,
      userId: req.user.id,
      date: today,
    });

    if (existingCheckin) {
      return res
        .status(400)
        .json({ message: "Habit already checked in today" });
    }

    // Create new check-in
    const checkin = new Checkin({
      habitId,
      userId: req.user.id,
      date: today,
      completed: true,
    });

    await checkin.save();

    res.status(201).json({ message: "Check-in recorded", checkin });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/checkins/:habitId  → get all check-ins for a specific habit
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

export default router;

// GET /api/checkins/:habitId/streak  → calculate current streak
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

    let streak = 1; // start at 1 for today
    let lastDate = normalize(checkins[0].date);

    for (let i = 1; i < checkins.length; i++) {
      const currentDate = normalize(checkins[i].date);

      // Calculate difference in days
      const diffInDays = Math.floor(
        (lastDate - currentDate) / (1000 * 60 * 60 * 24)
      );

      if (diffInDays === 1) {
        streak++; // consecutive day
        lastDate = currentDate;
      } else if (diffInDays > 1) {
        break; // streak broken
      }
    }

    res.status(200).json({ streak });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
