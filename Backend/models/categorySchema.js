import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false }, // true for default categories
    color: { type: String, default: "#3B82F6" }, // Optional color for UI
}, { timestamps: true });

// Prevent duplicate categories for the same user
categorySchema.index({ user: 1, name: 1 }, { unique: true });

export default mongoose.model("Category", categorySchema);