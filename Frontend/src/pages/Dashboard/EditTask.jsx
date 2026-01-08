import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axiosInstance from '../../utilities/axiosInstance.js'
import { API_PATH } from '../../utilities/apiPath.js'
import toast from 'react-hot-toast'
import { FiEdit2, FiArrowLeft } from 'react-icons/fi'

const EditTask = () => {
  const navigate = useNavigate()
  const { taskId } = useParams()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    description: '',
    status: 'Pending',
    reminder: false
  })

  const THEME = {
    bg: 'oklch(0.96 0.03 245)',       // Page Background - Light blue-gray
    card: 'oklch(1 0.03 245)',         // Edit Box - White with slight tint
    primary: 'oklch(0.4 0.1 245)',     // Purple Action Color
    textHeading: 'oklch(0.15 0.06 245)', // Dark text for headings
    textSecondary: 'oklch(0.4 0.06 245)', // Medium gray text
    inputField: 'oklch(0.97 0.02 245)' // Lightly tinted inputs
  }

  const inputBaseStyle = {
    backgroundColor: THEME.inputField,
    color: 'oklch(0.15 0.06 245)', // Dark text for inputs
    border: 'none',
    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.02), 0 2px 4px rgba(0, 0, 0, 0.03)',
    outline: 'none'
  }

  useEffect(() => {
    const fetchCategoriesAndTask = async () => {
      try {
        // Fetch categories first
        const categoriesResponse = await axiosInstance.get(API_PATH.CATEGORY.GET_ALL)
        if (categoriesResponse.data.categories) {
          setCategories(categoriesResponse.data.categories)
        }

        // Fetch task details
        const response = await axiosInstance.get(`${API_PATH.TASK.GET_ALL_TASK}`)
        const tasks = response.data.tasks
        const task = tasks.find(t => t._id === taskId)
        
        if (task) {
          const timeInMinutes = task.startTime
          const hours = Math.floor(timeInMinutes / 60)
          const minutes = timeInMinutes % 60
          const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`

          setFormData({
            name: task.taskName || '',
            category: task.category || '',
            date: task.date ? new Date(task.date).toISOString().split('T')[0] : '',
            startTime: timeString,
            description: task.description || '',
            status: task.status || 'Pending',
            reminder: !!task.reminder
          })
        } else {
          toast.error('Task not found')
          navigate(-1)
        }
      } catch (err) {
        toast.error('Failed to fetch data')
        navigate(-1)
      } finally {
        setFetching(false)
      }
    }
    fetchCategoriesAndTask()
  }, [taskId, navigate])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const convertTimeToMinutes = (timeStr) => {
    if (!timeStr) return null
    const [hours, minutes] = timeStr.split(':').map(Number)
    return hours * 60 + minutes
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return toast.error('Task name is required')
    
    // Validate date - prevent past dates
    const today = new Date().toISOString().split('T')[0]
    if (formData.date < today) {
      toast.error('Cannot save task with past date')
      return
    }

    setLoading(true)
    try {
      const timeInMinutes = convertTimeToMinutes(formData.startTime)
      await axiosInstance.put(`${API_PATH.TASK.UPDATE_TASK(taskId)}`, {
        name: formData.name,
        category: formData.category,
        date: formData.date,
        startTime: timeInMinutes,
        description: formData.description,
        status: formData.status,
        reminder: formData.reminder
      })
      toast.success('Task updated successfully!')
      navigate(-1) 
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div style={{ backgroundColor: THEME.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: THEME.textSecondary }}>Loading task details...</p>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: THEME.bg, minHeight: '100vh', padding: '15px 20px' }}>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-4 px-4 py-1 rounded-lg font-bold transition-all hover:opacity-70"
        style={{ color: THEME.primary }}
      >
        <FiArrowLeft size={18} /> Back
      </button>

      <div 
        className="max-w-2xl mx-auto rounded-3xl p-6 md:p-8 shadow-xl shadow-indigo-900/5" 
        style={{ backgroundColor: THEME.card }}
      >
        <h1 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: THEME.textHeading }}>
          <FiEdit2 size={22} style={{ color: THEME.primary }} /> Edit Task
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Name */}
          <div>
            <label className="block text-xs font-bold mb-1 ml-1" style={{ color: THEME.textHeading }}>Task Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 rounded-lg transition-all focus:shadow-md"
              style={inputBaseStyle}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold mb-1 ml-1" style={{ color: THEME.textHeading }}>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-3 rounded-lg cursor-pointer appearance-none"
                style={inputBaseStyle}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Status */}
            <div>
              <label className="block text-xs font-bold mb-1 ml-1" style={{ color: THEME.textHeading }}>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-3 rounded-lg cursor-pointer appearance-none"
                style={inputBaseStyle}
              >
                <option>Pending</option><option>Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-bold mb-1 ml-1" style={{ color: THEME.textHeading }}>Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 rounded-lg"
                style={inputBaseStyle}
              />
            </div>
            {/* Time */}
            <div>
              <label className="block text-xs font-bold mb-1 ml-1" style={{ color: THEME.textHeading }}>Start Time</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full p-3 rounded-lg"
                style={inputBaseStyle}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold mb-1 ml-1" style={{ color: THEME.textHeading }}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full p-3 rounded-lg resize-none"
              style={inputBaseStyle}
            ></textarea>
          </div>

          {/* Reminder */}
          <div className="flex items-center gap-3 py-1 ml-1">
            <input
              type="checkbox"
              name="reminder"
              checked={formData.reminder}
              onChange={handleChange}
              className="w-4 h-4 cursor-pointer accent-purple-600"
            />
            <label className="text-xs font-bold cursor-pointer" style={{ color: THEME.textHeading }}>Notify me before task starts</label>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3 rounded-xl font-bold transition-all hover:shadow-md active:scale-95"
              style={{ backgroundColor: 'oklch(0.92 0.02 245)', color: THEME.textSecondary }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-bold text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: THEME.primary }}
            >
              {loading ? 'Updating...' : 'Update Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditTask