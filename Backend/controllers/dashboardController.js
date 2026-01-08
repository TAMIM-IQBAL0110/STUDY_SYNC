
import { daysAgo} from "../utilities/daysAgo.js";
import { getAllTask } from "../utilities/getAllTask.js";


export const dashboardData = async(req,res)=>{
    try{
        const userId = req.user._id;

        // Fetch all tasks of user
        const tasks = await getAllTask(userId);


        const today = daysAgo(0); // Returns YYYY-MM-DD string
        const yesterday = daysAgo(1);
        const last30Days = daysAgo(30);
        
        console.log(`📅 Dashboard: today=${today}, userId=${userId}`);

        // Prepare dashboard categories
        const pendingTasksToday = [];
        const completedTasksToday = [];
        const overdueTasks = [];  // All pending tasks with date before today
        
        const completedTask = [];
        const pendingTask = [];

        // performance of last 30 days
        const last30DaysMap = new Map();
        for (let i = 29; i >= 0; i--) {
            const dateStr = daysAgo(i); // Now returns YYYY-MM-DD string
            last30DaysMap.set(dateStr, { pending: 0, completed: 0 });
        }

        
        tasks.forEach(task =>{
            // Sanitize task date - ensure it's in YYYY-MM-DD format
            const taskDateStr = String(task.date).trim().substring(0, 10); // Take first 10 chars: YYYY-MM-DD
            
            console.log(`   Task: "${task.taskName}" | Raw date=${task.date} | ISO=${typeof task.date.toISOString === 'function' ? task.date.toISOString() : 'N/A'} | Formatted=${taskDateStr} | Today=${today} | Match=${taskDateStr === today ? '✅' : '❌'}`);
            
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