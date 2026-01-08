import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../utilities/axiosInstance.js'
import { API_PATH } from '../utilities/apiPath.js'
import toast from 'react-hot-toast'
import { FiCheck, FiX, FiMail, FiLock, FiEye, FiEyeOff, FiLogOut } from 'react-icons/fi'

const AccountSetting = ({ userData, setUserData }) => {
  const navigate = useNavigate()
  const [isChangingEmail, setIsChangingEmail] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [emailData, setEmailData] = useState({
    newEmail: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChangeEmail = async () => {
    if (!emailData.newEmail) {
      toast.error('Please enter a new email')
      return
    }
    try {
      await axiosInstance.put(API_PATH.AUTH.UPDATE_PROFILE, {
        email: emailData.newEmail
      })
      toast.success('Email updated successfully!')
      setUserData({
        ...userData,
        email: emailData.newEmail
      })
      setEmailData({ newEmail: '' })
      setIsChangingEmail(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update email')
      console.error(err)
    }
  }

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill all password fields')
      return
    }
    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error('New password must be different from current password')
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    try {
      const response = await axiosInstance.put(API_PATH.AUTH.UPDATE_PROFILE, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      toast.success(response.data.message || 'Password updated successfully!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setShowCurrentPassword(false)
      setShowNewPassword(false)
      setShowConfirmPassword(false)
      setIsChangingPassword(false)
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update password'
      toast.error(errorMsg)
      console.error('Password change error:', err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <div 
      className="rounded-2xl shadow-lg p-4 md:p-8"
      style={{ backgroundColor: 'oklch(1 0.03 245)' }}
    >
      <h3 className="text-lg md:text-2xl font-bold mb-6 md:mb-8" style={{ color: 'oklch(0.15 0.06 245)' }}>
        Security Settings
      </h3>

      <div className="space-y-4 md:space-y-6">
        {/* Email Change Section */}
        <div className="p-4 md:p-6 rounded-lg shadow-md" style={{ backgroundColor: 'oklch(0.96 0.03 245)' }}>
          {!isChangingEmail ? (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
              <div>
                <p className="flex items-center gap-2 font-semibold mb-1 text-sm md:text-base" style={{ color: 'oklch(0.15 0.06 245)' }}>
                  <FiMail size={16} /> Email Address
                </p>
                <p style={{ color: 'oklch(0.4 0.06 245)' }} className="text-xs md:text-sm">
                  {userData?.email}
                </p>
              </div>
              <button
                onClick={() => setIsChangingEmail(true)}
                className="px-3 md:px-4 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105 text-xs md:text-sm"
                style={{ backgroundColor: 'oklch(0.4 0.1 65)' }}
              >
                Change
              </button>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              <div>
                <label style={{ color: 'oklch(0.15 0.06 245)' }} className="block font-semibold mb-2 text-xs md:text-sm">
                  NEW EMAIL
                </label>
                <input
                  type="email"
                  value={emailData.newEmail}
                  onChange={(e) => setEmailData({ newEmail: e.target.value })}
                  placeholder="Enter new email"
                  className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg border-2 focus:outline-none transition-all text-sm"
                  style={{
                    borderColor: 'oklch(0.85 0.03 245)',
                    color: 'oklch(0.15 0.06 245)',
                    backgroundColor: 'oklch(0.96 0.03 245)'
                  }}
                />
              </div>
              <div className="flex gap-2 md:gap-3">
                <button
                  onClick={handleChangeEmail}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105 text-xs md:text-sm"
                  style={{ backgroundColor: 'oklch(0.5 0.06 160)' }}
                >
                  <FiCheck size={16} />
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsChangingEmail(false)
                    setEmailData({ newEmail: '' })
                  }}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105 border-2 text-xs md:text-sm"
                  style={{
                    borderColor: 'oklch(0.85 0.03 245)',
                    color: 'oklch(0.4 0.06 245)'
                  }}
                >
                  <FiX size={16} />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Password Change Section */}
        <div className="p-4 md:p-6 rounded-lg shadow-md" style={{ backgroundColor: 'oklch(0.96 0.03 245)' }}>
          {!isChangingPassword ? (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
              <div>
                <p className="flex items-center gap-2 font-semibold mb-1 text-sm md:text-base" style={{ color: 'oklch(0.15 0.06 245)' }}>
                  <FiLock size={16} /> Password
                </p>
                <p style={{ color: 'oklch(0.4 0.06 245)' }} className="text-xs md:text-sm">
                  Manage your account password
                </p>
              </div>
              <button
                onClick={() => setIsChangingPassword(true)}
                className="px-3 md:px-4 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105 text-xs md:text-sm"
                style={{ backgroundColor: 'oklch(0.4 0.1 65)' }}
              >
                Change
              </button>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              <div>
                <label style={{ color: 'oklch(0.15 0.06 245)' }} className="block font-semibold mb-2 text-xs md:text-sm">
                  CURRENT PASSWORD
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg border-2 focus:outline-none transition-all pr-10 text-sm"
                    style={{
                      borderColor: 'oklch(0.85 0.03 245)',
                      color: 'oklch(0.15 0.06 245)',
                      backgroundColor: 'oklch(0.96 0.03 245)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-all hover:scale-110"
                    style={{ color: 'oklch(0.4 0.06 245)' }}
                  >
                    {showCurrentPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ color: 'oklch(0.15 0.06 245)' }} className="block font-semibold mb-2 text-xs md:text-sm">
                  NEW PASSWORD
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Enter new password"
                    className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg border-2 focus:outline-none transition-all pr-10 text-sm"
                    style={{
                      borderColor: 'oklch(0.85 0.03 245)',
                      color: 'oklch(0.15 0.06 245)',
                      backgroundColor: 'oklch(0.96 0.03 245)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-all hover:scale-110"
                    style={{ color: 'oklch(0.4 0.06 245)' }}
                  >
                    {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ color: 'oklch(0.15 0.06 245)' }} className="block font-semibold mb-2 text-xs md:text-sm">
                  CONFIRM NEW PASSWORD
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg border-2 focus:outline-none transition-all pr-10 text-sm"
                    style={{
                      borderColor: 'oklch(0.85 0.03 245)',
                      color: 'oklch(0.15 0.06 245)',
                      backgroundColor: 'oklch(0.96 0.03 245)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-all hover:scale-110"
                    style={{ color: 'oklch(0.4 0.06 245)' }}
                  >
                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>
              <div className="flex gap-2 md:gap-3">
                <button
                  onClick={handleChangePassword}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105 text-xs md:text-sm"
                  style={{ backgroundColor: 'oklch(0.5 0.06 160)' }}
                >
                  <FiCheck size={16} />
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsChangingPassword(false)
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    })
                  }}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105 border-2 text-xs md:text-sm"
                  style={{
                    borderColor: 'oklch(0.85 0.03 245)',
                    color: 'oklch(0.4 0.06 245)'
                  }}
                >
                  <FiX size={16} />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div className="flex justify-center p-4 md:p-6 rounded-lg shadow-md" style={{ backgroundColor: 'oklch(0.96 0.03 245)' }}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold text-white transition-all hover:scale-105 border-2 text-sm md:text-base"
            style={{ backgroundColor: 'oklch(0.5 0.06 30)', borderColor: 'oklch(0.5 0.06 30)' }}
          >
            <FiLogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default AccountSetting
