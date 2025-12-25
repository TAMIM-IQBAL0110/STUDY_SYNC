import express from 'express'
import {
  addTask,
  updateTask,
  deleteTask,
  getAllTask
} from '../controllers/taskController.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/add', protect, addTask)
router.get('/get', protect, getAllTask)
router.put('/update/:taskId', protect, updateTask)
router.delete('/:taskId', protect, deleteTask)

export default router
