import mongoose from "mongoose";

const checkinSchema = new mongoose.Schema({
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Habit",
    required: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  completed: { type: Boolean, default: true },
});

export default mongoose.model("Checkin", checkinSchema);
