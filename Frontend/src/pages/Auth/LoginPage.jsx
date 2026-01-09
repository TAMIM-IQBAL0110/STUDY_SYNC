import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMail, FiLock, FiEye, FiEyeOff, FiBook } from 'react-icons/fi'
import toast from 'react-hot-toast'
import axiosInstance from '../../utilities/axiosInstance.js'
import { API_PATH } from '../../utilities/apiPath.js'
import { validateEmail } from '../../utilities/helper.js'

const LoginPage = () => {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!email.includes('@')) {
      setError("Please enter a valid email address.")
      setLoading(false)
      return
    }

    if (!password) {
      setError("Password cannot be empty.")
      setLoading(false)
      return
    }
    else if (!validateEmail(email)) {
      setError("Please enter a valid email address.")
      setLoading(false)
      return
    }
    else if (password.length < 8) {
      setError("Password must be at least 8 characters long.")
      setLoading(false)
      return
    }

    try {
      const response = await axiosInstance.post(API_PATH.AUTH.LOGIN, {
        email,
        password
      })

      if (response.data.success) {
        toast.success(response.data.message)
        localStorage.setItem('token', response.data.token)
        navigate('/dashboard')
      } else {
        toast.error(response.data.message)
        setError(response.data.message)
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "An error occurred during login. Please try again."
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: 'oklch(0.96 0.03 245)',
        backgroundImage: 'linear-gradient(135deg, oklch(0.92 0.03 245) 0%, oklch(1 0.03 245) 100%)'
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div 
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold shadow-lg"
            style={{ backgroundColor: 'oklch(0.4 0.1 245)' }}
          >
            <FiBook size={32} color="white" />
          </div>
          <h1 
            className="text-4xl font-bold mb-2"
            style={{ color: 'oklch(0.15 0.06 245)' }}
          >
            StudySync
          </h1>
          <p style={{ color: 'oklch(0.4 0.06 245)' }}>Sign in to continue learning</p>
        </div>

        {/* Card */}
        <div 
          className="rounded-xl p-8 shadow-2xl"
          style={{ 
            backgroundColor: 'oklch(1 0.03 245)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
          }}
        >
          <form onSubmit={handleLogin} className="space-y-5" autoComplete="off">
            {/* Email Input */}
            <div>
              <label 
                className="block text-sm font-semibold mb-2"
                style={{ color: 'oklch(0.15 0.06 245)' }}
              >
                Email Address
              </label>
              <div 
                className="flex items-center gap-3 px-4 py-3 rounded-lg border transition-all shadow-sm focus-within:shadow-md"
                style={{ 
                  backgroundColor: 'oklch(0.96 0.03 245)',
                  borderColor: 'oklch(0.85 0.03 245)',
                  borderWidth: '1px'
                }}
              >
                <FiMail size={20} style={{ color: 'oklch(0.4 0.06 245)' }} />
                <input
                  type="email"
                  placeholder="your@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent outline-none placeholder-gray-400"
                  style={{ color: 'oklch(0.15 0.06 245)' }}
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label 
                className="block text-sm font-semibold mb-2"
                style={{ color: 'oklch(0.15 0.06 245)' }}
              >
                Password
              </label>
              <div 
                className="flex items-center gap-3 px-4 py-3 rounded-lg border transition-all shadow-sm focus-within:shadow-md"
                style={{ 
                  backgroundColor: 'oklch(0.96 0.03 245)',
                  borderColor: 'oklch(0.85 0.03 245)',
                  borderWidth: '1px'
                }}
              >
                <FiLock size={20} style={{ color: 'oklch(0.4 0.06 245)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent outline-none placeholder-gray-400"
                  style={{ color: 'oklch(0.15 0.06 245)' }}
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ color: 'oklch(0.4 0.06 245)' }}
                  className="hover:opacity-70"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link 
                to="#"
                style={{ color: 'oklch(0.4 0.1 65)' }}
                className="text-sm font-medium hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            {/* Error Message */}
            {error && (
              <div 
                className="p-3 rounded-lg shadow-sm"
                style={{ 
                  backgroundColor: 'oklch(0.96 0.03 245)',
                  borderLeft: '4px solid oklch(0.5 0.06 30)',
                  color: 'oklch(0.5 0.06 30)'
                }}
              >
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-white"
              style={{
                backgroundColor: 'oklch(0.4 0.1 245)'
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div 
              className="flex-1 h-px"
              style={{ backgroundColor: 'oklch(0.85 0.03 245)' }}
            ></div>
            <span style={{ color: 'oklch(0.4 0.06 245)' }} className="text-xs font-medium">OR</span>
            <div 
              className="flex-1 h-px"
              style={{ backgroundColor: 'oklch(0.85 0.03 245)' }}
            ></div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p style={{ color: 'oklch(0.4 0.06 245)' }} className="text-sm">
              Don't have an account?{' '}
              <Link 
                to="/signup"
                style={{ color: 'oklch(0.4 0.1 65)' }}
                className="font-semibold hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p style={{ color: 'oklch(0.4 0.06 245)' }} className="text-xs">
            © 2025 StudySync. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
export default LoginPage
