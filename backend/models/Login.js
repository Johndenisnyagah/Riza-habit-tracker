import mongoose from "mongoose";

const loginSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

// Ensure one login record per user per day
loginSchema.index({ userId: 1, date: 1 }, { unique: true });

const Login = mongoose.model("Login", loginSchema);

export default Login;
