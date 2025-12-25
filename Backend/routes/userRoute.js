import express from "express";
import User from "../models/user.js";
import { protect } from "../middlewares/authMiddleware.js"; 

const router = express.Router();

// Get current user
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update current user
router.put("/me", protect, async (req, res) => {
  try {
    const { name, userBio, profileImageUrl } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, userBio, profileImageUrl },
      { new: true, runValidators: true }
    ).select("-password");
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile" });
  }
});

export default router;