import { Link, useLocation } from 'react-router-dom'
import { FiHome, FiBarChart2, FiCalendar, FiUser, FiLogOut, FiTable, FiBook } from 'react-icons/fi'
import { useState } from 'react'

const Navbar = () => {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  return (
    <nav 
      className="sticky top-0 z-50 shadow-md"
      style={{ backgroundColor: 'oklch(1 0.03 245)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold"
              style={{ backgroundColor: 'oklch(0.4 0.1 245)' }}
            >
              <FiBook size={20} color="white" />
            </div>
            <span 
              className="text-xl font-bold hidden sm:inline"
              style={{ color: 'oklch(0.15 0.06 245)' }}
            >
              StudySync
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{
                backgroundColor: isActive('/dashboard') ? 'oklch(0.4 0.1 245)' : 'transparent',
                color: isActive('/dashboard') ? 'white' : 'oklch(0.4 0.06 245)'
              }}
            >
              <FiHome size={20} />
              <span className="font-medium">Home</span>
            </Link>
            <Link
              to="/dashboard/tasks"
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{
                backgroundColor: isActive('/dashboard/tasks') ? 'oklch(0.4 0.1 245)' : 'transparent',
                color: isActive('/dashboard/tasks') ? 'white' : 'oklch(0.4 0.06 245)'
              }}
            >
              <FiTable size={20} />
              <span className="font-medium">Tasks</span>
            </Link>
            <Link
              to="/dashboard/calendar"
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{
                backgroundColor: isActive('/dashboard/calendar') ? 'oklch(0.4 0.1 245)' : 'transparent',
                color: isActive('/dashboard/calendar') ? 'white' : 'oklch(0.4 0.06 245)'
              }}
            >
              <FiCalendar size={20} />
              <span className="font-medium">Calendar</span>
            </Link>

            <Link
              to="/dashboard/analysis"
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{
                backgroundColor: isActive('/dashboard/analysis') ? 'oklch(0.4 0.1 245)' : 'transparent',
                color: isActive('/dashboard/analysis') ? 'white' : 'oklch(0.4 0.06 245)'
              }}
            >
              <FiBarChart2 size={20} />
              <span className="font-medium">Analysis</span>
            </Link>
          </div>

          {/* Profile on the right */}
          <div className="hidden md:flex items-center">
            <Link
              to="/dashboard/profile"
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{
                backgroundColor: isActive('/dashboard/profile') ? 'oklch(0.4 0.1 245)' : 'transparent',
                color: isActive('/dashboard/profile') ? 'white' : 'oklch(0.4 0.06 245)'
              }}
            >
              <FiUser size={20} />
              <span className="font-medium">Profile</span>
            </Link>
          </div>

          {/* Logout Button & Mobile Menu */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg"
              style={{ backgroundColor: 'oklch(0.96 0.03 245)' }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: 'oklch(0.15 0.06 245)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div 
          className="md:hidden border-t"
          style={{ backgroundColor: 'oklch(0.96 0.03 245)', borderColor: 'oklch(0.85 0.03 245)' }}
        >
          <div className="px-4 pt-2 pb-4 space-y-2">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{
                backgroundColor: isActive('/dashboard') ? 'oklch(0.4 0.1 245)' : 'transparent',
                color: isActive('/dashboard') ? 'white' : 'oklch(0.4 0.06 245)'
              }}
              onClick={() => setIsOpen(false)}
            >
              <FiHome size={20} />
              <span className="font-medium">Home</span>
            </Link>

            <Link
              to="/dashboard/calendar"
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{
                backgroundColor: isActive('/dashboard/calendar') ? 'oklch(0.4 0.1 245)' : 'transparent',
                color: isActive('/dashboard/calendar') ? 'white' : 'oklch(0.4 0.06 245)'
              }}
              onClick={() => setIsOpen(false)}
            >
              <FiCalendar size={20} />
              <span className="font-medium">Calendar</span>
            </Link>

            <Link
              to="/dashboard/tasks"
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{
                backgroundColor: isActive('/dashboard/tasks') ? 'oklch(0.4 0.1 245)' : 'transparent',
                color: isActive('/dashboard/tasks') ? 'white' : 'oklch(0.4 0.06 245)'
              }}
              onClick={() => setIsOpen(false)}
            >
              <FiTable size={20} />
              <span className="font-medium">Tasks</span>
            </Link>

            <Link
              to="/dashboard/analysis"
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{
                backgroundColor: isActive('/dashboard/analysis') ? 'oklch(0.4 0.1 245)' : 'transparent',
                color: isActive('/dashboard/analysis') ? 'white' : 'oklch(0.4 0.06 245)'
              }}
              onClick={() => setIsOpen(false)}
            >
              <FiBarChart2 size={20} />
              <span className="font-medium">Analysis</span>
            </Link>

            <Link
              to="/dashboard/profile"
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{
                backgroundColor: isActive('/dashboard/profile') ? 'oklch(0.4 0.1 245)' : 'transparent',
                color: isActive('/dashboard/profile') ? 'white' : 'oklch(0.4 0.06 245)'
              }}
              onClick={() => setIsOpen(false)}
            >
              <FiUser size={20} />
              <span className="font-medium">Profile</span>
            </Link>

            <button
              onClick={() => {
                handleLogout()
                setIsOpen(false)
              }}
              className="w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-left"
              style={{ backgroundColor: 'oklch(0.85 0.03 245)', color: 'oklch(0.4 0.1 245)' }}
            >
              <FiLogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
