import Category from "../models/categorySchema.js";

// Default categories
const DEFAULT_CATEGORIES = [
    "Class", "Exam", "Assignment", "Exam Prep",
    "Project", "Lab", "Extra Curricular", "Others"
];

// Initialize default categories for a user
export const initializeDefaultCategories = async (userId) => {
    try {
        // Check if user already has default categories
        const existingDefaults = await Category.findOne({ 
            user: userId, 
            isDefault: true 
        });

        if (!existingDefaults) {
            // Create default categories for the user
            const defaultCategoryDocs = DEFAULT_CATEGORIES.map(cat => ({
                user: userId,
                name: cat,
                isDefault: true
            }));

            await Category.insertMany(defaultCategoryDocs);
        }
    } catch (error) {
        console.error("Error initializing default categories:", error);
    }
};

// Get all categories for a user
export const getAllCategories = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const categories = await Category.find({ user: userId }).sort({ isDefault: -1, createdAt: 1 });
        
        res.status(200).json({
            success: true,
            message: "Categories retrieved successfully",
            categories
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching categories",
            error: error.message
        });
    }
};

// Add a new category
export const addCategory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, color } = req.body;

        // Validation
        if (!name || name.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }

        // Check for duplicate
        const existingCategory = await Category.findOne({
            user: userId,
            name: { $regex: `^${name.trim()}$`, $options: "i" }
        });

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Category already exists"
            });
        }

        // Create new category
        const newCategory = new Category({
            user: userId,
            name: name.trim(),
            isDefault: false,
            color: color || "#3B82F6"
        });

        await newCategory.save();

        res.status(201).json({
            success: true,
            message: "Category added successfully",
            category: newCategory
        });
    } catch (error) {
        console.error("Error adding category:", error);
        res.status(500).json({
            success: false,
            message: "Error adding category",
            error: error.message
        });
    }
};

// Update a category
export const updateCategory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { categoryId } = req.params;
        const { name, color } = req.body;

        // Find category and verify ownership
        const category = await Category.findOne({
            _id: categoryId,
            user: userId
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // Cannot edit default categories
        if (category.isDefault) {
            return res.status(400).json({
                success: false,
                message: "Cannot edit default categories"
            });
        }

        // Check for duplicate name (if name is being changed)
        if (name && name !== category.name) {
            const existingCategory = await Category.findOne({
                user: userId,
                name: { $regex: `^${name.trim()}$`, $options: "i" },
                _id: { $ne: categoryId }
            });

            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: "Another category with this name already exists"
                });
            }

            category.name = name.trim();
        }

        if (color) {
            category.color = color;
        }

        await category.save();

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            category
        });
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({
            success: false,
            message: "Error updating category",
            error: error.message
        });
    }
};

// Delete a category
export const deleteCategory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { categoryId } = req.params;

        // Find category and verify ownership
        const category = await Category.findOne({
            _id: categoryId,
            user: userId
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // Cannot delete default categories
        if (category.isDefault) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete default categories"
            });
        }

        // Delete the category
        await Category.deleteOne({ _id: categoryId });

        res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting category",
            error: error.message
        });
    }
};

// Get default categories
export const getDefaultCategories = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "Default categories retrieved successfully",
            defaultCategories: DEFAULT_CATEGORIES
        });
    } catch (error) {
        console.error("Error fetching default categories:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching default categories",
            error: error.message
        });
    }
};
