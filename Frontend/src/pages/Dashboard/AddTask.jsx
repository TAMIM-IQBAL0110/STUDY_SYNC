import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom' // Added useLocation
import axiosInstance from '../../utilities/axiosInstance.js'
import { API_PATH } from '../../utilities/apiPath.js'
import toast from 'react-hot-toast'
import { FiPlus, FiArrowLeft } from 'react-icons/fi'

const AddTask = () => {
  const navigate = useNavigate()
  const location = useLocation() // Capture the navigation state
  
  // Get date from navigation state (passed from Calendar) or default to today
  const passedDate = location.state?.date 
  const today = new Date().toISOString().split('T')[0]

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: 'Others',
    date: passedDate || today, // Use the passed date immediately
    startTime: '09:00',
    description: '',
    reminder: false
  })

  // Determine where to go back to
  // If we have state from calendar, go back to calendar, otherwise go to home
  const goBackPath = passedDate ? '/dashboard/calendar' : '/dashboard'

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
    if (!formData.name.trim()) {
      toast.error('Task name is required')
      return
    }

    setLoading(true)
    try {
      const timeInMinutes = convertTimeToMinutes(formData.startTime)

      await axiosInstance.post(API_PATH.TASK.ADD, {
        name: formData.name,
        category: formData.category,
        date: formData.date,
        startTime: timeInMinutes,
        description: formData.description,
        reminder: formData.reminder
      })

      toast.success('Task added successfully!')
      
      // Navigate back to where we came from
      navigate(goBackPath) 
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add task')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ backgroundColor: 'oklch(0.96 0.03 245)', minHeight: '100vh', padding: '20px' }}>
      <button
        onClick={() => navigate(goBackPath)} // Use dynamic path
        className="flex items-center gap-2 mb-6 px-4 py-2 rounded-lg transition-all"
        style={{ color: 'oklch(0.4 0.1 245)' }}
      >
        <FiArrowLeft size={20} />
        Back
      </button>

      <div
        className="max-w-2xl mx-auto rounded-xl p-8 shadow-lg"
        style={{ backgroundColor: 'oklch(1 0.03 245)' }}
      >
        <h1
          className="text-3xl font-bold mb-8 flex items-center gap-2"
          style={{ color: 'oklch(0.15 0.06 245)' }}
        >
          <FiPlus size={28} />
          Create New Task
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ... all your input fields remain exactly the same ... */}
          {/* Task Name */}
          <div>
            <label className="block font-semibold mb-2" style={{ color: 'oklch(0.15 0.06 245)' }}>
              Task Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter task name"
              className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-all"
              style={{
                borderColor: 'oklch(0.85 0.03 245)',
                color: 'oklch(0.15 0.06 245)',
                backgroundColor: 'oklch(0.96 0.03 245)'
              }}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block font-semibold mb-2" style={{ color: 'oklch(0.15 0.06 245)' }}>
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-all"
              style={{
                borderColor: 'oklch(0.85 0.03 245)',
                color: 'oklch(0.15 0.06 245)',
                backgroundColor: 'oklch(0.96 0.03 245)'
              }}
            >
              <option>Class</option>
              <option>Exam</option>
              <option>Assignment</option>
              <option>Exam Prep</option>
              <option>Project</option>
              <option>Lab</option>
              <option>extraCurriculam</option>
              <option>Others</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block font-semibold mb-2" style={{ color: 'oklch(0.15 0.06 245)' }}>
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={today}
              className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-all"
              style={{
                borderColor: 'oklch(0.85 0.03 245)',
                color: 'oklch(0.15 0.06 245)',
                backgroundColor: 'oklch(0.96 0.03 245)'
              }}
            />
          </div>

          {/* Start Time */}
          <div>
            <label className="block font-semibold mb-2" style={{ color: 'oklch(0.15 0.06 245)' }}>
              Start Time *
            </label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-all"
              style={{
                borderColor: 'oklch(0.85 0.03 245)',
                color: 'oklch(0.15 0.06 245)',
                backgroundColor: 'oklch(0.96 0.03 245)'
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold mb-2" style={{ color: 'oklch(0.15 0.06 245)' }}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-all resize-none"
              style={{
                borderColor: 'oklch(0.85 0.03 245)',
                color: 'oklch(0.15 0.06 245)',
                backgroundColor: 'oklch(0.96 0.03 245)'
              }}
            />
          </div>

          {/* Reminder */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="reminder"
              checked={formData.reminder}
              onChange={handleChange}
              className="w-5 h-5 cursor-pointer"
              style={{ accentColor: 'oklch(0.4 0.1 245)' }}
            />
            <label className="font-medium cursor-pointer" style={{ color: 'oklch(0.15 0.06 245)' }}>
              Set reminder for this task
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(goBackPath)} // Use dynamic path
              className="flex-1 py-3 rounded-lg font-semibold transition-all"
              style={{
                backgroundColor: 'oklch(0.85 0.03 245)',
                color: 'oklch(0.4 0.06 245)'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105 disabled:opacity-50"
              style={{ backgroundColor: 'oklch(0.4 0.1 245)' }}
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddTask