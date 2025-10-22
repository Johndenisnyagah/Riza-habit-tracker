import mongoose from "mongoose";

const habitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  description: { type: String },
  frequency: {
    type: String,
    enum: ["daily", "weekdays", "weekends", "custom"],
    default: "daily",
  },
  customDays: {
    type: [String],
    default: [],
  },
  icon: { type: String, default: "target.svg" },
  streak: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Habit", habitSchema);
