import React, { useEffect, useState } from "react";
import axiosInstance from "../../utilities/axiosInstance.js";
import { API_PATH } from "../../utilities/apiPath.js";
import TaskShow from "../../Card/taskShow.jsx";
import { parseDateOnlyLocal } from "../../utilities/dateUtils.js";
import { 
  FiClock, 
  FiCheckCircle, 
  FiFilter, 
  FiCalendar, 
  FiList 
} from "react-icons/fi"; 
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const TaskPage = () => {
  const navigate = useNavigate();
  const [allTasks, setAllTasks] = useState([]);
  const [nDays, setNDays] = useState(7);

  const THEME = {
    bg: 'oklch(0.96 0.03 245)',
    card: 'oklch(1 0.03 245)',
    primary: 'oklch(0.4 0.1 245)',
    text: 'oklch(0.15 0.06 245)',
    border: 'oklch(0.85 0.03 245)',
  };

  const fetchTasks = async () => {
    try {
      const res = await axiosInstance.get(API_PATH.TASK.GET_ALL_TASK);
      setAllTasks(res.data.tasks || []);
    } catch {
      toast.error("Error loading tasks");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // --- TASK ACTIONS (Passed to TaskShow) ---
  const handleCompleteTask = async (taskId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
      await axiosInstance.put(API_PATH.TASK.UPDATE_TASK(taskId), { status: newStatus });
      toast.success(`Task moved to ${newStatus.toLowerCase()}`);
      fetchTasks(); // Refresh list
    } catch {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await axiosInstance.delete(API_PATH.TASK.DELETE_TASK(taskId));
      toast.success('Task deleted successfully');
      fetchTasks(); // Refresh list
    } catch{
      toast.error('Failed to delete task');
    }
  };

  // --- FILTER LOGIC (FIXED with UTC-aware date parsing) ---
  const isToday = (dateStr) => {
    if (!dateStr) return false;
    
    // Get today's date in UTC (to match backend's UTC storage)
    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    
    const taskDate = parseDateOnlyLocal(dateStr);
    const taskDateUTC = taskDate ? new Date(Date.UTC(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate())) : null;
    
    return taskDateUTC && taskDateUTC.getTime() === todayUTC.getTime();
  };

  const isWithinNDays = (dateStr, days) => {
    if (!dateStr) return false;
    const taskDate = parseDateOnlyLocal(dateStr);
    if (!taskDate) return false;
    
    // Compare in UTC to match backend's UTC storage
    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    
    const limitDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    limitDate.setUTCDate(limitDate.getUTCDate() - Number(days));
    
    const taskDateUTC = new Date(Date.UTC(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate()));
    
    return taskDateUTC >= limitDate;
  };

  return (
    <div style={{ backgroundColor: THEME.bg, minHeight: '100vh', padding: '16px md:30px', paddingBottom: '60px' }}>
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-10">
        
        {/* ROW 1: TODAY */}
        <section>
          <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2" style={{ color: THEME.text }}>
            <FiClock size={20} style={{ color: THEME.primary }} /> Today's Focus
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TaskShow 
              Icon={FiList} 
              Heading="Today's Pending" 
              Tasks={allTasks.filter(t => isToday(t.date) && t.status === "Pending")}
              handleCompleteTask={handleCompleteTask}
              handleDeleteTask={handleDeleteTask}
              navigate={navigate}
            />
            <TaskShow 
              Icon={FiCheckCircle} 
              Heading="Today's Completed" 
              Tasks={allTasks.filter(t => isToday(t.date) && t.status === "Completed")}
              handleCompleteTask={handleCompleteTask}
              handleDeleteTask={handleDeleteTask}
              navigate={navigate}
            />
          </div>
        </section>

        {/* SEPARATOR / FILTER BAR */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4 md:py-6 border-t border-b" style={{ borderColor: THEME.border }}>
          <h2 className="text-lg md:text-xl font-bold flex items-center gap-2" style={{ color: THEME.text }}>
            <FiCalendar size={20} style={{ color: THEME.primary }} /> History Analysis
          </h2>
          <div className="flex items-center gap-2 md:gap-3 bg-white px-3 md:px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
            <FiFilter className="text-gray-400 flex-shrink-0" size={18} />
            <span className="text-xs md:text-sm font-medium">Last</span>
            <input 
              type="number" 
              value={nDays} 
              onChange={(e) => setNDays(e.target.value)}
              className="w-12 md:w-14 text-center font-bold outline-none text-purple-600 bg-gray-50 rounded-lg p-1 text-sm"
              min="1"
            />
            <span className="text-xs md:text-sm font-medium">Days</span>
          </div>
        </div>

        {/* ROW 2: DYNAMIC N DAYS */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TaskShow 
              Icon={FiList} 
              Heading={`Pending (Last ${nDays} Days)`} 
              Tasks={allTasks.filter(t => isWithinNDays(t.date, nDays) && t.status === "Pending")}
              handleCompleteTask={handleCompleteTask}
              handleDeleteTask={handleDeleteTask}
              navigate={navigate}
            />
            <TaskShow 
              Icon={FiCheckCircle} 
              Heading={`Completed (Last ${nDays} Days)`} 
              Tasks={allTasks.filter(t => isWithinNDays(t.date, nDays) && t.status === "Completed")}
              handleCompleteTask={handleCompleteTask}
              handleDeleteTask={handleDeleteTask}
              navigate={navigate}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default TaskPage;