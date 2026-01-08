import Task from "../models/taskSchema.js";
import { minutesToTime } from "../utilities/minutesToTime.js";

// Helper function to format Date to YYYY-MM-DD string (accounting for local timezone)
const formatDateToYYYYMMDD = (dateObj) => {
  // Create new date to avoid timezone issues
  const date = new Date(dateObj);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getAllTask = async (userId) => {
  try {
    const tasks = await Task.find({ user: userId })
      .populate('category', 'name')  // Populate category with only the name field
      .sort({ date:-1, startTime: 1 });

    // Map and format each task with proper category serialization
    const formattedTasks = tasks.map((task) => {
      const taskObj = task.toObject();
      return {
        ...taskObj,
        date: formatDateToYYYYMMDD(taskObj.date), // Convert Date to YYYY-MM-DD string
        startTimeFormatted: minutesToTime(task.startTime),
        category: taskObj.category ? {
          _id: taskObj.category._id,
          name: taskObj.category.name
        } : null
      };
    });

    return formattedTasks;

  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw new Error("Failed to fetch tasks");
  }
};