import React, { useEffect, useState, useMemo } from "react";
import axiosInstance from "../../utilities/axiosInstance.js";
import { API_PATH } from "../../utilities/apiPath.js";
import TaskShow from "../../Card/taskShow.jsx";
import { parseDateOnlyLocal, toYYYYMMDD } from "../../utilities/dateUtils.js";
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiCalendar, 
  FiList, 
  FiPlus,
  FiCheckCircle
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const CalendarPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [allTasks, setAllTasks] = useState([]); 
  const [dayTasks, setDayTasks] = useState([]); 
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);

  const THEME = {
    bg: 'oklch(0.96 0.03 245)',
    card: 'oklch(1 0.03 245)',
    primary: 'oklch(0.4 0.1 245)', 
    text: 'oklch(0.15 0.06 245)',
    border: 'oklch(0.85 0.03 245)',
    dayBox: 'oklch(0.96 0.03 245)',
  };

  const formatDateKey = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const fetchAllTasks = async () => {
    try {
      const res = await axiosInstance.get(API_PATH.TASK.GET_ALL_TASK);
      setAllTasks(res.data.tasks || []);
    } catch (err) {
    }
  };

  const fetchTasksByDate = async (dateStr) => {
    setLoading(true);
    try {
      // Filter tasks for the selected date from allTasks using local date parsing
      const filtered = allTasks.filter(t => {
        const taskDate = parseDateOnlyLocal(t.date);
        const taskDateStr = toYYYYMMDD(taskDate);
        return taskDateStr === dateStr;
      });
      setDayTasks(filtered);
    } catch (err) {
      toast.error("Could not load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
      await axiosInstance.put(API_PATH.TASK.UPDATE_TASK(taskId), { status: newStatus });
      toast.success(`Task moved to ${newStatus.toLowerCase()}`);
      fetchAllTasks();
      if (selectedDate) fetchTasksByDate(selectedDate);
    } catch {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await axiosInstance.delete(API_PATH.TASK.DELETE_TASK(taskId));
      toast.success('Task deleted successfully');
      fetchAllTasks();
      if (selectedDate) fetchTasksByDate(selectedDate);
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  useEffect(() => {
    fetchAllTasks();
    const returnDate = location.state?.selectedDate;
    
    if (returnDate) {
      setSelectedDate(returnDate);
      const dateObj = new Date(returnDate);
      setCurrentMonth(new Date(dateObj.getFullYear(), dateObj.getMonth(), 1));
      window.history.replaceState({}, document.title);
    } else {
      // By default, load today's tasks
      const today = new Date();
      const todayStr = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());
      setSelectedDate(todayStr);
    }
  }, [location.state]);

  // Load tasks for selected date whenever allTasks or selectedDate changes
  useEffect(() => {
    if (selectedDate && allTasks.length > 0) {
      fetchTasksByDate(selectedDate);
    } else if (selectedDate && allTasks.length === 0 && !loading) {
      // If tasks are being loaded, wait for them
      fetchTasksByDate(selectedDate);
    }
  }, [allTasks, selectedDate]);

  const handleDayClick = (day) => {
    const dateStr = formatDateKey(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(dateStr);
    fetchTasksByDate(dateStr); 
  };

  const changeMonth = (offset) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  const { cells, monthLabel, yearLabel } = useMemo(() => {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDay = startOfMonth.getDay();
    const totalDays = endOfMonth.getDate();
    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let d = 1; d <= totalDays; d++) days.push(d);
    return { cells: days, monthLabel: months[currentMonth.getMonth()], yearLabel: currentMonth.getFullYear() };
  }, [currentMonth]);

  return (
    <div style={{ backgroundColor: THEME.bg, minHeight: '100vh' }}>
      <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-6 md:py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-1 md:mb-2 flex items-center gap-2 md:gap-3" style={{ color: THEME.text }}>
            <FiCalendar size={24} className="md:w-8 md:h-8 lg:w-9 lg:h-9" style={{ color: THEME.primary }} />
            Task Calendar
          </h1>
          <p style={{ color: 'oklch(0.4 0.06 245)' }} className="text-sm md:text-base">Organize and track your tasks by date</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 lg:gap-6">
        
        {/* ================= CALENDAR PORTION ================= */}
        <div 
          className="lg:col-span-7 rounded-2xl shadow-lg p-3 md:p-4 lg:p-6 border h-fit"
          style={{ backgroundColor: THEME.card, borderColor: THEME.border }}
        >
          {/* Calendar Header */}
          <div className="flex items-start md:items-center justify-between gap-3 mb-4 md:mb-6 pb-3 md:pb-4 border-b" style={{ borderColor: THEME.border }}>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold" style={{ color: THEME.text }}>
                {monthLabel} 
              </h2>
              <p className="text-xs opacity-70 mt-0.5" style={{ color: THEME.text }}>
                {yearLabel}
              </p>
            </div>
            <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            <button 
              onClick={() => {
                setCurrentMonth(new Date());
                const today = new Date();
                const todayStr = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());
                setSelectedDate(todayStr);
                fetchTasksByDate(todayStr);
              }}
              className="text-xs font-bold px-2 md:px-3 py-1 md:py-1.5 rounded-lg transition-all hover:shadow-md active:scale-95 whitespace-nowrap"
              style={{ backgroundColor: THEME.bg, color: THEME.primary }}
            >
              Today
            </button>
              <div className="flex gap-0.5 md:gap-1 bg-gray-100/50 rounded-lg p-1 md:p-1.5">
                <button 
                  onClick={() => changeMonth(-1)} 
                  className="p-1 md:p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all"
                  title="Previous month"
                >
                  <FiChevronLeft style={{ color: THEME.primary }} size={16} className="md:w-4.5 md:h-4.5" />
                </button>
                <button 
                  onClick={() => changeMonth(1)} 
                  className="p-1 md:p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all"
                  title="Next month"
                >
                  <FiChevronRight style={{ color: THEME.primary }} size={16} className="md:w-4.5 md:h-4.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-0.5 md:gap-1 lg:gap-2 mb-2 md:mb-3">
            {weekDays.map(d => (
              <div 
                key={d} 
                className="text-center text-xs font-bold uppercase pb-1 md:pb-2 border-b-2" 
                style={{ color: THEME.primary, borderColor: THEME.border }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0.5 md:gap-1 lg:gap-2">
            {cells.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />;
              
              const dateKey = formatDateKey(currentMonth.getFullYear(), currentMonth.getMonth(), day);
              const isSelected = selectedDate === dateKey;
              const today = new Date();
              const isToday = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate()) === dateKey;
              
              const dayTaskList = allTasks.filter(t => {
                const taskDate = new Date(t.date);
                return formatDateKey(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate()) === dateKey;
              });
              
              const taskCount = dayTaskList.length;
              const completedCount = dayTaskList.filter(t => t.status === "Completed").length;

              return (
                <div
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`h-8 sm:h-10 md:h-12 lg:h-14 flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all relative group shadow-sm
                    ${isSelected ? "shadow-md scale-105 z-10 ring-2 ring-offset-1" : "hover:shadow-md hover:-translate-y-0.5"}
                  `}
                  style={{ 
                    backgroundColor: isSelected ? THEME.primary : (isToday ? 'oklch(0.92 0.04 245)' : THEME.dayBox),
                    ringColor: isSelected ? THEME.primary : 'transparent',
                    color: isSelected ? '#fff' : THEME.text
                  }}
                >
                  <span className={`text-xs sm:text-sm font-bold transition-all`}>
                    {day}
                  </span>
                  
                  {/* Task indicators */}
                  {taskCount > 0 && (
                    <div className="hidden md:flex items-center gap-0.5 mt-0.5 md:mt-1">
                      <div 
                        className="flex items-center justify-center text-xs font-bold rounded-full w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 transition-colors"
                        style={{ 
                          backgroundColor: isSelected ? 'rgba(255,255,255,0.3)' : THEME.primary,
                          color: '#fff',
                          fontSize: '6px'
                        }}
                      >
                        {taskCount}
                      </div>
                      {completedCount > 0 && (
                        <div 
                          className="text-xs font-bold px-0.5 sm:px-1 md:px-1.5 py-0.5 rounded-full transition-colors"
                          style={{ 
                            backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'oklch(0.5 0.06 160)',
                            color: '#fff',
                            fontSize: '6px'
                          }}
                        >
                          {completedCount}✓
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Calendar Footer Legend */}
          <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t flex flex-wrap gap-2 md:gap-3 text-xs" style={{ borderColor: THEME.border }}>
            <div className="flex items-center gap-1 md:gap-1.5">
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full" style={{ backgroundColor: THEME.primary }}></div>
              <span style={{ color: THEME.text }}>Tasks</span>
            </div>
            <div className="flex items-center gap-1 md:gap-1.5">
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full" style={{ backgroundColor: THEME.primary, boxShadow: `0 0 0 1.5px ${THEME.border}` }}></div>
              <span style={{ color: THEME.text }}>Today</span>
            </div>
            <div className="flex items-center gap-1 md:gap-1.5">
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full" style={{ backgroundColor: THEME.primary }}></div>
              <span style={{ color: THEME.text }}>Selected</span>
            </div>
          </div>
        </div>

        {/* ================= TASK SIDE PANEL ================= */}
        <div className="lg:col-span-5 flex flex-col gap-6 md:gap-7">
          <TaskShow
            Icon={FiList}
            Heading={
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col min-w-0">
                    <span className="text-xs opacity-50 font-normal">
                        {selectedDate ? new Date(selectedDate.replace(/-/g, '/')).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : "General"}
                    </span>
                    <span className="text-base md:text-xl font-bold" style={{ color: 'oklch(0.15 0.06 245)' }}>Pending Tasks</span>
                </div>
                {selectedDate && (
                  <button
                    onClick={() => navigate('/dashboard/add-task', { state: { date: selectedDate } })}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md font-bold text-xs text-white transition-all hover:shadow-lg active:scale-95 flex-shrink-0 ml-2"
                    style={{ backgroundColor: THEME.primary }}
                  >
                    <FiPlus size={12} style={{ color: 'white' }} /> New
                  </button>
                )}
              </div>
            }
            Tasks={dayTasks.filter(t => t.status === "Pending")}
            footer={loading ? "Synchronizing..." : (selectedDate ? (dayTasks.filter(t => t.status === "Pending").length === 0 ? "No pending tasks! 🎯" : "") : "Select a date to view tasks")}
            handleCompleteTask={handleCompleteTask}
            handleDeleteTask={handleDeleteTask}
            navigate={navigate}
          />

          <TaskShow
            Icon={FiCheckCircle}
            Heading={<span className="text-base md:text-xl font-bold" style={{ color: 'oklch(0.15 0.06 245)' }}>Completed Tasks</span>}
            Tasks={dayTasks.filter(t => t.status === "Completed")}
            footer={selectedDate && dayTasks.filter(t => t.status === "Completed").length === 0 ? "No completed tasks yet" : ""}
            handleCompleteTask={handleCompleteTask}
            handleDeleteTask={handleDeleteTask}
            navigate={navigate}
          />
        </div>
      </div>
      </div>
      </div>
    </div>
  );
};

export default CalendarPage;