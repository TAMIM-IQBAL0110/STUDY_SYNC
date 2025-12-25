import Task from "../models/taskSchema.js";
import { minutesToTime } from "../utilities/minutesToTime.js"; 

export const getAllTask = async (userId) => {
  try {
    const tasks = await Task.find({ user: userId }).sort({ date:-1, startTime: 1 });

    // Map and format each task
    const formattedTasks = tasks.map((task) => ({
      ...task.toObject(),
      startTimeFormatted: minutesToTime(task.startTime),
    }));

    return formattedTasks;

  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw new Error("Failed to fetch tasks");
  }
};