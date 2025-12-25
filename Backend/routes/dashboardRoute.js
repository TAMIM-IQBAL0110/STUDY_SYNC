import express from 'express'
import { dashboardData } from '../controllers/dashboardController.js'
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get("/", protect, dashboardData);

export default router;