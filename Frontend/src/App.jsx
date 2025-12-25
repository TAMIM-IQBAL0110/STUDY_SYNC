import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import UserProvider from './context/userContext'
import LoginPage from './pages/Auth/LoginPage'
import SignUpPage from './pages/Auth/SignUpPage'
import Verification from './pages/Auth/Verification'
import Home from './pages/Dashboard/Home'
import TaskPage from './pages/Dashboard/TaskPage'
import AddTask from './pages/Dashboard/AddTask'
import EditTask from './pages/Dashboard/EditTask'
import Analysis from './pages/Dashboard/Analysis'
import Calendar from './pages/Dashboard/Calendar'
import Profile from './pages/Dashboard/Profile'
import NotFound from './pages/NotFound'
import Navbar from './components/Navbar'

// Protected Route Layout Component
const ProtectedLayout = () => {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}

// Dashboard Layout with Navbar
const DashboardLayout = () => {
  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  )
}

const Root = () => {
  const isAuthenticated = !!localStorage.getItem('token')
  return isAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/login" replace />
  )
}

function App() {
  return (
    <UserProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>

          {/* Root redirect */}
          <Route path="/" element={<Root />} />

          {/* Auth Routes */}
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify" element={<Verification />} />

          {/* Protected Routes with Navbar */}
          <Route element={<ProtectedLayout />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Home />} />
              <Route path="/dashboard/tasks" element={<TaskPage />} />
              <Route path="/dashboard/add-task" element={<AddTask />} />
              <Route path="/dashboard/edit-task/:taskId" element={<EditTask />} />
              <Route path="/dashboard/analysis" element={<Analysis />} />
              <Route path="/dashboard/calendar" element={<Calendar />} />
              <Route path="/dashboard/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </Router>
    </UserProvider>
  )
}

export default App
