
import { daysAgo} from "../utilities/daysAgo.js";
import { getAllTask } from "../utilities/getAllTask.js";


export const dashboardData = async(req,res)=>{
    try{
        const userId = req.user._id;

        // Fetch all tasks of user
        const tasks = await getAllTask(userId);


        const today = daysAgo(0);
        const yesterday = daysAgo(1);
        const last30Days = daysAgo(30);

        // Prepare dashboard categories
        const pendingTasksToday = [];
        const completedTasksToday = [];
        const overdueTasks = [];  // All pending tasks with date before today
        
        const completedTask = [];
        const pendingTask = [];

        // performance of last 30 days
        const last30DaysMap = new Map();
        for (let i = 29; i >= 0; i--) {
            const date = daysAgo(i);
            const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
            last30DaysMap.set(dateKey, { pending: 0, completed: 0 });
        }

        
        tasks.forEach(task =>{
            const taskDateStr = task.date; // Already in YYYY-MM-DD format
            
            if(task.status === "Pending"){
                pendingTask.push(task);
                if(taskDateStr === today){
                    pendingTasksToday.push(task);
                }
                else if(taskDateStr < today){
                    // All pending tasks with date before today are overdue
                    overdueTasks.push(task);
                } 
            }
            else {
                completedTask.push(task);
                if(taskDateStr === today){
                    completedTasksToday.push(task);
                }
            }

            if (last30DaysMap.has(taskDateStr)) {
                const dayEntry = last30DaysMap.get(taskDateStr);
                if (task.status === "Pending") dayEntry.pending += 1; 
                else dayEntry.completed += 1;
            }
        });
        const last30DaysPerformance = Array.from(last30DaysMap, ([date, counts]) => ({
            date,
            ...counts,
        }));
        res.status(200).json({
            success:true,
            message: "Dashboard data fetched successfully!",
            totalTasks: tasks.length,
            pendingTasks: pendingTask.length,
            completedTasks: completedTask.length,
            today: {
                pending: pendingTasksToday.length,
                completed: completedTasksToday.length,
            },
            overdue: {
                all: overdueTasks.length,
            },
            last30DaysPerformance,
            data: {
                pendingTasksToday,
                completedTasksToday,
                overdueTasks,
            },
        })
    }catch(error){
        console.error("Dashboard Data Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data",
            error: error.message,
        });
    }
}