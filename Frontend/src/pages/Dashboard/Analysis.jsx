import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utilities/axiosInstance.js';
import { API_PATH } from '../../utilities/apiPath.js';
import { parseDateOnlyLocal } from '../../utilities/dateUtils.js';
import { FiActivity, FiCalendar, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';
import PerformanceGraph from '../../AnalysisGraph/PerformanceGraph.jsx';
import CategoryPieChart from '../../AnalysisGraph/CategoryPieChart.jsx';
import DailyBarChart from '../../AnalysisGraph/DailyBarChart.jsx';

const Analysis = () => {
  const [nDays, setNDays] = useState(30);
  const [data, setData] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalysisData = async () => {
    setLoading(true);
    try {
      const [dashboardRes, tasksRes] = await Promise.all([
        axiosInstance.get(API_PATH.DASHBOARD.GET_DATA),
        axiosInstance.get(API_PATH.TASK.GET_ALL_TASK)
      ]);
      
      if (dashboardRes.data.success) {
        setData(dashboardRes.data);
      }
      
      if (tasksRes.data.tasks) {
        setAllTasks(tasksRes.data.tasks);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysisData();
  }, []);

  const filterTasks = (tasks) => {
    if (!tasks || !Array.isArray(tasks)) return [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - nDays);
    return tasks.filter(task => {
      if (!task.date) return false;
      const taskDate = parseDateOnlyLocal(task.date);
      if (!taskDate) return false;
      taskDate.setHours(0, 0, 0, 0);
      return taskDate >= cutoff;
    });
  };

  // Improved UI for the Timeframe Selector
  const TimeFilter = () => (
    <div className="flex items-center gap-2 px-4 py-2 rounded-xl border transition-all" style={{ backgroundColor: 'oklch(1 0.03 245)', borderColor: 'oklch(0.85 0.03 245)' }}>
      <FiCalendar size={14} style={{ color: 'oklch(0.4 0.1 245)' }} />
      <select 
        value={nDays} 
        onChange={(e) => setNDays(Number(e.target.value))}
        className="outline-none bg-transparent text-xs font-bold cursor-pointer appearance-none pr-1"
        style={{ color: 'oklch(0.15 0.06 245)' }}
      >
        <option value={7}>Last 7 Days</option>
        <option value={30}>Last 30 Days</option>
        <option value={90}>Last 3 Months</option>
      </select>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: 'oklch(0.96 0.03 245)' }}>
      {/* Header Section */}
      <div className="max-w-7xl mx-auto flex flex-col gap-4 mb-8 md:mb-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3" style={{ color: 'oklch(0.15 0.06 245)' }}>
            <span className="p-2 rounded-lg text-white shadow-lg" style={{ backgroundColor: 'oklch(0.4 0.1 245)' }}>
                <FiActivity size={24} />
            </span>
            <span>Analytics</span>
          </h1>
          <p className="mt-1 ml-12 font-medium text-sm" style={{ color: 'oklch(0.4 0.06 245)' }}>Tracking your productivity trends</p>
        </div>
        <div className="flex justify-start">
          <TimeFilter />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: 'oklch(0.85 0.03 245)', borderTopColor: 'oklch(0.4 0.1 245)' }}></div>
          <p className="font-semibold animate-pulse text-lg" style={{ color: 'oklch(0.4 0.06 245)' }}>Generating Insights...</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
          
          {/* Top Row: Pie Charts (Categories) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            <div className="group transition-transform duration-300 hover:-translate-y-1">
                <CategoryPieChart 
                  title="Completed Tasks by Category" 
                  tasks={filterTasks(allTasks.filter(t => t.status === 'Completed'))} 
                  colorScheme="greens"
                />
            </div>
            <div className="group transition-transform duration-300 hover:-translate-y-1">
                <CategoryPieChart 
                  title="Pending Tasks by Category" 
                  tasks={filterTasks(allTasks.filter(t => t.status === 'Pending'))} 
                  colorScheme="oranges"
                />
            </div>
          </div>

          {/* Middle Row: Performance Graph (Full Width Card) */}
          <div className="rounded-2xl shadow-lg" style={{ backgroundColor: 'oklch(1 0.03 245)' }}>
            <div className="p-4 sm:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg text-white" style={{ backgroundColor: 'oklch(0.4 0.1 245)' }}>
                    <FiTrendingUp size={20} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold" style={{ color: 'oklch(0.15 0.06 245)' }}>
                    {nDays === 7 ? '7-Day' : nDays === 30 ? '30-Day' : '90-Day'} Performance
                  </h3>
                </div>
                {/* Legend */}
                <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm p-2 sm:p-3 rounded-lg flex-wrap" style={{ backgroundColor: 'white' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: 'oklch(0.5 0.06 160)' }}></div>
                    <span style={{ color: 'oklch(0.4 0.06 245)' }}>Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: 'oklch(0.5 0.06 100)' }}></div>
                    <span style={{ color: 'oklch(0.4 0.06 245)' }}>Pending</span>
                  </div>
                </div>
              </div>
              <div className="h-80 sm:h-96 md:h-[28rem] w-full">
                {data?.last30DaysPerformance && data.last30DaysPerformance.length > 0 ? (
                  <PerformanceGraph 
                    Performance={data?.last30DaysPerformance || []} 
                    nDays={nDays} 
                  />
                ) : (
                  <div className="rounded-xl p-6 flex items-center justify-center h-full" style={{ backgroundColor: 'oklch(0.96 0.03 245)' }}>
                    <p style={{ color: 'oklch(0.4 0.06 245)' }} className="italic">No performance data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          

          {/* Bottom Row: Bar Chart */}
          <div className="rounded-2xl shadow-lg overflow-hidden" style={{ backgroundColor: 'oklch(1 0.03 245)' }}>
             <div className="p-4 sm:p-6">
               <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg text-white" style={{ backgroundColor: 'oklch(0.5 0.06 160)' }}><FiCheckCircle size={20} /></div>
                      <h3 className="text-lg sm:text-xl font-bold" style={{ color: 'oklch(0.15 0.06 245)' }}>Daily Volume</h3>
                  </div>
                  {/* Legend - Parallel to title */}
                  <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm p-2 sm:p-3 rounded-lg flex-wrap" style={{ backgroundColor: 'white' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: 'oklch(0.5 0.06 160)' }}></div>
                      <span style={{ color: 'oklch(0.4 0.06 245)' }}>Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: '#f97316' }}></div>
                      <span style={{ color: 'oklch(0.4 0.06 245)' }}>Pending</span>
                    </div>
                  </div>
               </div>
               <div className="h-64 sm:h-80 md:h-96 w-full">
                  {data?.last30DaysPerformance && data.last30DaysPerformance.length > 0 ? (
                    <DailyBarChart 
                      data={data.last30DaysPerformance.slice(-nDays)} 
                      title="Daily Completion Volume"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full rounded-xl" style={{ backgroundColor: 'oklch(0.96 0.03 245)' }}>
                      <p style={{ color: 'oklch(0.4 0.06 245)' }} className="italic">No performance data available</p>
                    </div>
                  )}
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analysis;