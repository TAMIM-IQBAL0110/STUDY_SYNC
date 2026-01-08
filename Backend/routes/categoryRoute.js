import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
    getAllCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getDefaultCategories,
    initializeDefaultCategories
} from "../controllers/categoryController.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/default", getDefaultCategories);

// Protected routes (require authentication)
router.get("/", protect, getAllCategories);
router.post("/", protect, addCategory);
router.put("/:categoryId", protect, updateCategory);
router.delete("/:categoryId", protect, deleteCategory);

// Initialize default categories for a user
router.post("/initialize", protect, async (req, res) => {
    try {
        await initializeDefaultCategories(req.user.id);
        res.status(200).json({
            success: true,
            message: "Default categories initialized"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error initializing categories",
            error: error.message
        });
    }
});

export default router;
