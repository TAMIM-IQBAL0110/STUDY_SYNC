import Task from '../models/taskSchema.js'
import Category from '../models/categorySchema.js'
import { convertToMinutes } from '../utilities/convertToMinutes.js';
import { minutesToTime } from './../utilities/minutesToTime.js';

const isValidStartTime = (minutes) => {
    return Number.isInteger(minutes) && minutes >= 0 && minutes < 1440;
}
// add task
export const addTask = async(req,res)=>{
    const userId = req.user._id;
    const {name,category,date,startTime,description,reminder} = req.body;
    try{
        let plainTime = startTime;
        if(!name) {
            return res.status(400).json({
                message:"taskName is required"
            });
        }
        if(!date) {
            return res.status(400).json({
                message:"date is required"
            });
        }
        if(!plainTime) {
            return res.status(400).json({
                message:"startTime is required"
            });
        }
        if(typeof plainTime === 'string') plainTime = convertToMinutes(startTime);
        if(!isValidStartTime(plainTime) || plainTime==null) return res.status(400).json({
            message: "Invalid startTime"
        })
        
        // Handle category - can be ObjectId or name string
        let categoryId = category;
        
        if (typeof category === 'string') {
            // If it looks like a MongoDB ObjectId (24 hex chars), validate it exists
            if (category.match(/^[0-9a-fA-F]{24}$/)) {
                // It's an ObjectId - verify it exists
                const categoryDoc = await Category.findOne({ 
                    _id: category,
                    user: userId
                });
                if (!categoryDoc) {
                    return res.status(400).json({
                        message: `Category not found`
                    });
                }
                categoryId = category;
            } else {
                // It's a category name - look it up by name
                const categoryDoc = await Category.findOne({ 
                    user: userId, 
                    name: category.trim()
                });
                if (!categoryDoc) {
                    return res.status(400).json({
                        message: `Category "${category}" not found for user`
                    });
                }
                categoryId = categoryDoc._id;
            }
        } else {
            // category is already an ObjectId
            const categoryDoc = await Category.findOne({ 
                _id: category,
                user: userId
            });
            if (!categoryDoc) {
                return res.status(400).json({
                    message: `Category not found`
                });
            }
            categoryId = category;
        }
        
        const task = await Task.create({
            user:userId,
            taskName:name,
            category:categoryId,
            date:date,
            startTime:plainTime,
            description:description,
            reminder:reminder
        });
        res.status(201).json({
            message:"Task created successfully",
            task
        });
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// update task
export const updateTask = async(req,res)=>{
    const userId = req.user._id;
    const {taskId} = req.params; 
    const {name,category,date,startTime,description,status,reminder} = req.body;
    if (startTime < 0 || startTime > 1440) {
        return res.status(400).json({ message: "Invalid startTime" });
    }
    try{
        // find the task and ensure it belongs to the user
        const task = await Task.findOne({_id:taskId,user:userId})
            .populate('category', 'name');
        if(!task){
            return res.status(404).json({message:"Task not found"})
        }
        // Update only provided fields
        let plainTime = startTime;
        if (name !== undefined) task.taskName = name;
        
        // Handle category - can be ObjectId or name string
        if (category !== undefined) {
            if (typeof category === 'string') {
                // If it looks like a MongoDB ObjectId (24 hex chars), validate it exists
                if (category.match(/^[0-9a-fA-F]{24}$/)) {
                    // It's an ObjectId - verify it exists
                    const categoryDoc = await Category.findOne({ 
                        _id: category,
                        user: userId
                    });
                    if (!categoryDoc) {
                        return res.status(400).json({
                            message: `Category not found`
                        });
                    }
                    task.category = category;
                } else {
                    // It's a category name - look it up by name
                    const categoryDoc = await Category.findOne({ 
                        user: userId, 
                        name: category.trim()
                    });
                    if (!categoryDoc) {
                        return res.status(400).json({
                            message: `Category "${category}" not found for user`
                        });
                    }
                    task.category = categoryDoc._id;
                }
            } else {
                // category is already an ObjectId
                const categoryDoc = await Category.findOne({ 
                    _id: category,
                    user: userId
                });
                if (!categoryDoc) {
                    return res.status(400).json({
                        message: `Category not found`
                    });
                }
                task.category = category;
            }
        }
        
        if (date !== undefined) task.date = date;
        if (plainTime !== undefined){
            if (typeof plainTime === 'string') plainTime = convertToMinutes(startTime);
            if (!isValidStartTime(plainTime)) return res.status(400).json({ message: "Invalid startTime" });
            task.startTime = plainTime;
        }
        if (description !== undefined) task.description = description;
        if (status !== undefined) task.status = status;
        if (reminder !== undefined) task.reminder = reminder;

        await task.save();

        res.status(200).json({
            message: "Task updated successfully",
            task
        })
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }

}
// delete task
export const deleteTask = async(req,res)=>{
    const userId = req.user._id;
    const {taskId} = req.params; 
    try{
        // find the task and ensure it belongs to the user
        const task = await Task.findOne({_id:taskId,user:userId})
            .populate('category', 'name');
        if(!task){
            return res.status(404).json({message:"Task is not found"});
        }
        await task.deleteOne();
        res.status(200).json({
            message:"Task deleted successfully",
            task
        })
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
}

// get all task
export const getAllTask = async(req,res)=>{
    const userId = req.user._id;
    try{
        const tasks = await Task.find({user:userId})
            .populate('category', 'name')
            .sort({date:-1 , startTime:1});
        //convert startTime back to "HH:MM AM/PM"
        const taskWithFormattedTime = tasks.map(task=>({
            ...task.toObject(),
            startTimeFormatted:minutesToTime(task.startTime)
        }));
        res.status(200).json({ tasks: taskWithFormattedTime });
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};