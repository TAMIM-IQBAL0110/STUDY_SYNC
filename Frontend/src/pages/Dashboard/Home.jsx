import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../utilities/axiosInstance.js'
import { API_PATH } from '../../utilities/apiPath.js'
import { useState, useEffect } from 'react'
import { FiCheckCircle, FiClock, FiTarget, FiPlus,FiAlertCircle, FiTrendingUp } from 'react-icons/fi'
import toast from 'react-hot-toast'
import TaskNumberCard from '../../Card/taskNumber.jsx'
import TaskShow from '../../Card/taskShow.jsx'
import PerformanceGraph from '../../AnalysisGraph/PerformanceGraph.jsx'
import CompletionSummary from '../../AnalysisGraph/CompletionSummary.jsx'

const Home = () => {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [dashboardStats, setDashboardStats] = useState(null)

  const fetchData = async () => {
    if (loading) return
    setLoading(true)

    try {
      const response = await axiosInstance.get(API_PATH.DASHBOARD.GET_DATA)
      if (response.data.success) {
        setData(response.data.data)
        setDashboardStats({
          totalTasks: response.data.totalTasks,
          completedTasks: response.data.completedTasks,
          pendingTasks: response.data.pendingTasks,
          today: response.data.today,
          overdue: response.data.overdue,
          last30DaysPerformance: response.data.last30DaysPerformance
        })
      } else {
        setError(response.data.message || "Failed to fetch data")
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
      setError("An error occurred while fetching data.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return
    
    try {
      await axiosInstance.delete(`${API_PATH.TASK.DELETE_TASK(taskId)}`)
      toast.success('Task deleted successfully')
      fetchData()
    } catch (err) {
      toast.error('Failed to delete task')
      console.error(err)
    }
  }

  const handleCompleteTask = async (taskId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending'
      await axiosInstance.put(`${API_PATH.TASK.UPDATE_TASK(taskId)}`, { status: newStatus })
      toast.success(`Task marked as ${newStatus.toLowerCase()}`)
      fetchData()
    } catch (err) {
      toast.error('Failed to update task')
      console.error(err)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div style={{ backgroundColor: 'oklch(0.96 0.03 245)', minHeight: '100vh', padding: '20px' }}>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Today Completed Tasks Card  */}
        <div>
          <TaskNumberCard
            taskCount={dashboardStats?.today?.completed || 0}
            Heading="Today Completed Tasks"
            Footer="Tasks completed today"
            Icon={FiCheckCircle}

          />
          <button
              onClick={() => navigate('/dashboard/add-task')}
              className="mt-2 w-full py-2 rounded-lg font-semibold text-sm text-white transition-all hover:scale-105"
              style={{ backgroundColor: 'oklch(0.4 0.1 245)' }}
            >
              <FiPlus className="inline mr-1" size={16} />
              Add Task
            </button>
        </div>

        {/* Pending Tasks Card today */}
        <TaskNumberCard
          taskCount={dashboardStats?.today?.pending || 0}
          Heading="Today Pending Tasks"
          Footer="Tasks pending"
          Icon={FiClock}
        />

        {/* Total Tasks Card */}
        <TaskNumberCard
          taskCount={dashboardStats?.totalTasks || 0}
          Heading="Total Tasks All Time"
          Footer="Tasks in your list"
          Icon={FiTarget}
        />

        {/* Total Overdue Tasks Card */}
        <TaskNumberCard
          taskCount={dashboardStats?.overdue?.all || 0}
          Heading="Overdue Tasks All Time"
          Footer="Tasks overdue"
          Icon={FiAlertCircle}
        />
      </div>
      {/* Main Content Grid */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"> */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Tasks */}
        <TaskShow
          Icon={FiClock}
          Heading="Today Tasks"
          Tasks={data?.pendingTasksToday}
          footer="No pending tasks today. Great job! 🎉"
          handleCompleteTask={handleCompleteTask}
          handleDeleteTask={handleDeleteTask}
          navigate={navigate}
        />

        <TaskShow
          Icon={FiAlertCircle}
          Heading="Overdue Tasks"
          Tasks={data?.overdueTasks}
          footer="No overdue tasks. Keep it up! 🚀"
          handleCompleteTask={handleCompleteTask}
          handleDeleteTask={handleDeleteTask}
          navigate={navigate}
        />

      </div>

      {/* Completion Summary */}
      <div className="mb-8">
        <CompletionSummary 
          stats={{
            totalTasks: dashboardStats?.today?.pending + dashboardStats?.today?.completed || 0,
            completedTasks: dashboardStats?.today?.completed || 0,
          }}
          label="Today's Completion"
          daysLabel=""
        />
      </div>
      
      {/* Middle Row: Performance Graph (Full Width Card) */}
          <div className="mt-8 rounded-2xl shadow-lg" style={{ backgroundColor: 'oklch(1 0.03 245)' }}>
            <div className="p-4 sm:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg text-white" style={{ backgroundColor: 'oklch(0.4 0.1 245)' }}>
                    <FiTrendingUp size={20} /> 
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold" style={{ color: 'oklch(0.15 0.06 245)' }}>
                     Performance of last 30 days
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
                {dashboardStats?.last30DaysPerformance && dashboardStats.last30DaysPerformance.length > 0 ? (
                  <PerformanceGraph 
                    Performance={dashboardStats.last30DaysPerformance} 
                    nDays={30} 
                  />
                ) : (
                  <div className="rounded-xl p-6 flex items-center justify-center h-full" style={{ backgroundColor: 'oklch(0.96 0.03 245)' }}>
                    <p style={{ color: 'oklch(0.4 0.06 245)' }} className="italic">No performance data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <p style={{ color: 'oklch(0.4 0.06 245)' }}>Loading dashboard...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div 
          className="p-4 rounded-lg mt-6"
          style={{ backgroundColor: 'oklch(0.96 0.03 245)', color: 'oklch(0.5 0.06 30)' }}
        >
          <p className="font-semibold">{error}</p>
        </div>
      )}
    </div>
  )
}

export default Home
