import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
    getAllCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getDefaultCategories,
    initializeDefaultCategories
} from "../controllers/categoryController.js";

const router = express.Router();

// Public routes
router.get("/default", getDefaultCategories);

// Protected routes (require authentication)
router.get("/", authMiddleware, getAllCategories);
router.post("/", authMiddleware, addCategory);
router.put("/:categoryId", authMiddleware, updateCategory);
router.delete("/:categoryId", authMiddleware, deleteCategory);

// Initialize default categories for a user
router.post("/initialize", authMiddleware, async (req, res) => {
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
