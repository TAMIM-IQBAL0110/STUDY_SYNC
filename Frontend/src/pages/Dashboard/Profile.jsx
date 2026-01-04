import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../utilities/axiosInstance.js'
import { API_PATH, baseUrl } from '../../utilities/apiPath.js'
import toast from 'react-hot-toast'
import { FiUser, FiLogOut, FiEdit2, FiCheck, FiX, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'

const Profile = () => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingEmail, setIsChangingEmail] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [imageLoadError, setImageLoadError] = useState(false)
  const [editData, setEditData] = useState({
    name: '',
    userBio: ''
  })
  const [emailData, setEmailData] = useState({
    newEmail: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Helper function to get initials from name
  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
  }

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await axiosInstance.get(API_PATH.AUTH.GET_USER_INFO)
      console.log('User data fetched:', response.data)
      setUserData(response.data)
      setImageLoadError(false) // Reset image load error when fetching new data
      // Handle both 'bio' and 'userBio' field names
      const bioValue = response.data.bio || response.data.userBio || ''
      setEditData({
        name: response.data.name || '',
        userBio: bioValue
      })
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch user data'
      console.error('Fetch user data error:', {
        status: err.response?.status,
        message: errorMsg,
        fullError: err
      })
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveProfile = async () => {
    try {
      await axiosInstance.put(API_PATH.AUTH.UPDATE_PROFILE, {
        name: editData.name,
        bio: editData.userBio
      })
      toast.success('Profile updated successfully!')
      setUserData({
        ...userData,
        name: editData.name,
        bio: editData.userBio
      })
      setIsEditing(false)
    } catch (err) {
      toast.error('Failed to update profile')
      console.error(err)
    }
  }

  const handleCancel = () => {
    setEditData({
      name: userData.name || '',
      userBio: userData.bio || ''
    })
    setIsEditing(false)
  }

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

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadImage = async () => {
    if (!previewImage) {
      toast.error('Please select an image first')
      return
    }
    try {
      setIsUploadingImage(true)
      const fileInput = document.querySelector('input[type="file"]')
      const file = fileInput.files[0]
      const formData = new FormData()
      formData.append('profileImage', file)
      const response = await axiosInstance.post(API_PATH.AUTH.UPLOAD_PROFILE_IMAGE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      toast.success('Profile image uploaded successfully!')
      setUserData({
        ...userData,
        profileImageUrl: response.data.profileImageUrl
      })
      setPreviewImage(null)
      fileInput.value = ''
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload image')
      console.error(err)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleCancelUpload = () => {
    setPreviewImage(null)
    const fileInput = document.querySelector('input[type="file"]')
    if (fileInput) fileInput.value = ''
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('Logged out successfully')
    navigate('/login')
  }

  if (loading) {
    return (
      <div style={{ backgroundColor: 'oklch(0.96 0.03 245)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <p style={{ color: 'oklch(0.4 0.06 245)' }}>Loading profile...</p>
      </div>
    )
  }

  if (!userData) {
    return (
      <div style={{ backgroundColor: 'oklch(0.96 0.03 245)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <p style={{ color: 'oklch(0.4 0.06 245)' }}>No user data available</p>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: 'oklch(0.96 0.03 245)', minHeight: '100vh', padding: '16px md:20px' }}>
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-extrabold mb-1 md:mb-2" style={{ color: 'oklch(0.15 0.06 245)' }}>
            Profile
          </h1>
          <p style={{ color: 'oklch(0.4 0.06 245)' }} className="text-sm md:text-base">Manage your account and personal information</p>
        </div>

        {/* Profile Card */}
        <div 
          className="rounded-2xl shadow-lg mb-6 md:mb-8"
          style={{ backgroundColor: 'oklch(1 0.03 245)' }}
        >
          <div className="p-4 md:p-8">
            {/* Avatar and Name Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6 mb-6 md:mb-8">
              {/* Mobile: Centered vertical stack, Desktop: horizontal layout */}
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 flex-1 w-full md:w-auto">
                <div className="flex justify-center md:justify-start flex-shrink-0">
                  <div className="relative w-20 h-20 md:w-24 md:h-24" style={{ display: 'block', overflow: 'hidden' }}>
                    {previewImage ? (
                      <img 
                        src={previewImage} 
                        alt="Preview"
                        className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4"
                        style={{ 
                          borderColor: 'oklch(0.4 0.1 245)',
                          display: 'block'
                        }}
                      />
                    ) : userData?.profileImageUrl && !imageLoadError ? (
                      <img 
                        src={`${baseUrl}${userData.profileImageUrl}`}
                        alt="Profile"
                        onError={() => setImageLoadError(true)}
                        className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4"
                        style={{ 
                          borderColor: 'oklch(0.4 0.1 245)',
                          display: 'block'
                        }}
                      />
                    ) : (
                      <div 
                        className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-2xl md:text-3xl font-bold text-white"
                        style={{ 
                          backgroundColor: 'oklch(0.4 0.1 245)'
                        }}
                      >
                        {getInitials(userData?.name)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col text-center md:text-left">
                  <h2 className="text-base md:text-lg font-bold mb-1" style={{ color: 'oklch(0.15 0.06 245)' }}>
                    {userData?.name}
                  </h2>
                  <p style={{ color: 'oklch(0.4 0.06 245)' }} className="text-xs md:text-sm break-all md:break-normal">
                    {userData?.email}
                  </p>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105 text-xs md:text-sm w-full md:w-auto justify-center md:justify-start"
                  style={{ backgroundColor: 'oklch(0.4 0.1 65)' }}
                >
                  <FiEdit2 size={16} />
                  <span className="hidden md:inline">Edit Profile</span>
                  <span className="md:hidden">Edit</span>
                </button>
              )}
            </div>

            {/* Image Upload Section */}
            {isEditing && (
              <div className="mb-4 md:mb-6 pb-4 md:pb-6 border-b" style={{ borderColor: 'oklch(0.85 0.03 245)' }}>
                <label style={{ color: 'oklch(0.4 0.06 245)' }} className="text-xs font-semibold mb-2 md:mb-3 tracking-wide block">
                  PROFILE IMAGE
                </label>
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <label className="px-3 md:px-4 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105 cursor-pointer text-xs md:text-sm" style={{ backgroundColor: 'oklch(0.4 0.1 245)' }}>
                    Choose Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {previewImage && (
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={handleUploadImage}
                        disabled={isUploadingImage}
                        className="px-3 md:px-4 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105 text-xs md:text-sm disabled:opacity-50"
                        style={{ backgroundColor: 'oklch(0.5 0.06 160)' }}
                      >
                        {isUploadingImage ? 'Uploading...' : 'Upload'}
                      </button>
                      <button
                        onClick={handleCancelUpload}
                        className="px-3 md:px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105 border-2 text-xs md:text-sm"
                        style={{
                          borderColor: 'oklch(0.85 0.03 245)',
                          color: 'oklch(0.4 0.06 245)'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                {previewImage && (
                  <p style={{ color: 'oklch(0.4 0.06 245)' }} className="text-xs mt-2">
                    Preview ready - click Upload to save
                  </p>
                )}
              </div>
            )}

            {/* Bio Section */}
            {!isEditing ? (
              <>
                <div className="mb-6">
                  <label style={{ color: 'oklch(0.15 0.06 245)' }} className="block font-semibold mb-2 text-xs tracking-wide">
                    BIO
                  </label>
                  <div className="p-3 md:p-4 rounded-lg shadow-md" style={{ backgroundColor: 'oklch(0.96 0.03 245)' }}>
                    <p style={{ color: 'oklch(0.15 0.06 245)' }} className="text-sm md:text-base leading-relaxed italic font-medium">
                      {(userData?.bio || userData?.userBio) || 'No bio added yet. Click Edit Profile to add one.'}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Edit Form */}
                <div className="space-y-3 md:space-y-4 mb-6 p-3 md:p-4 rounded-lg shadow-md" style={{ backgroundColor: 'oklch(0.96 0.03 245)' }}>
                  <div>
                    <label style={{ color: 'oklch(0.15 0.06 245)' }} className="block font-semibold mb-2 text-xs tracking-wide">
                      NAME
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editData.name}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none transition-all text-sm"
                      style={{
                        borderColor: 'oklch(0.85 0.03 245)',
                        color: 'oklch(0.15 0.06 245)',
                        backgroundColor: 'oklch(0.96 0.03 245)'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: 'oklch(0.15 0.06 245)' }} className="block font-semibold mb-2 text-xs tracking-wide">
                      BIO
                    </label>
                    <textarea
                      name="userBio"
                      value={editData.userBio}
                      onChange={handleEditChange}
                      placeholder="Tell us about yourself..."
                      rows="3"
                      className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none transition-all resize-none text-sm"
                      style={{
                        borderColor: 'oklch(0.85 0.03 245)',
                        color: 'oklch(0.15 0.06 245)',
                        backgroundColor: 'oklch(0.96 0.03 245)'
                      }}
                    ></textarea>
                  </div>
                </div>

                {/* Edit Buttons */}
                <div className="flex gap-2 md:gap-3">
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105 flex-1 justify-center text-xs md:text-sm"
                    style={{ backgroundColor: 'oklch(0.5 0.06 160)' }}
                  >
                    <FiCheck size={16} />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105 flex-1 justify-center border-2 text-xs md:text-sm"
                    style={{
                      borderColor: 'oklch(0.85 0.03 245)',
                      color: 'oklch(0.4 0.06 245)',
                      backgroundColor: 'oklch(1 0.03 245)'
                    }}
                  >
                    <FiX size={16} />
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Account Section */}
        <div 
          className="rounded-2xl shadow-lg p-4 md:p-8"
          style={{ backgroundColor: 'oklch(1 0.03 245)' }}
        >
          <h3 className="text-lg md:text-2xl font-bold mb-6 md:mb-8 flex items-center gap-2" style={{ color: 'oklch(0.15 0.06 245)' }}>
            <FiUser size={20} className="md:size-24" />
            Account Settings
          </h3>

          <div className="space-y-4 md:space-y-6">
            {/* Email Change Section */}
            <div className="pb-4 md:pb-6 border-b" style={{ borderColor: 'oklch(0.85 0.03 245)' }}>
              {!isChangingEmail ? (
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
                  <div>
                    <p className="flex items-center gap-2 font-semibold mb-1 text-sm md:text-base" style={{ color: 'oklch(0.15 0.06 245)' }}>
                      <FiMail size={16} className="md:size-18" /> Email Address
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
            <div className="pb-4 md:pb-6 border-b" style={{ borderColor: 'oklch(0.85 0.03 245)' }}>
              {!isChangingPassword ? (
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
                  <div>
                    <p className="flex items-center gap-2 font-semibold mb-1 text-sm md:text-base" style={{ color: 'oklch(0.15 0.06 245)' }}>
                      <FiLock size={16} className="md:size-18" /> Password
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
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold text-white transition-all hover:scale-105 w-full justify-center border-2 text-sm md:text-base"
              style={{ backgroundColor: 'oklch(0.5 0.06 30)', borderColor: 'oklch(0.5 0.06 30)' }}
            >
              <FiLogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
