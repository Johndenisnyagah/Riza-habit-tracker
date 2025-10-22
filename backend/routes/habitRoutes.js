import express from "express";
import Habit from "../models/Habit.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// CREATE a new habit
router.post("/", protect, async (req, res) => {
  try {
    const { name, description, frequency, customDays, icon } = req.body;
    const habit = new Habit({
      userId: req.user.id,
      name,
      description,
      frequency: frequency || "daily",
      customDays: customDays || [],
      icon: icon || "target.svg",
    });
    await habit.save();
    res.status(201).json({ message: "Habit created", habit });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET all habits for logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user.id });
    res.status(200).json(habits);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// UPDATE a habit by ID
router.put("/:id", protect, async (req, res) => {
  try {
    const { name, description, frequency, customDays, icon } = req.body;
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { name, description, frequency, customDays, icon },
      { new: true }
    );
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }
    res.status(200).json({ message: "Habit updated", habit });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE a habit by ID
router.delete("/:id", protect, async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }
    res.status(200).json({ message: "Habit deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
