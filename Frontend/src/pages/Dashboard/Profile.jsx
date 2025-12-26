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

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await axiosInstance.get(API_PATH.AUTH.GET_USER_INFO)
      console.log('User data fetched:', response.data)
      setUserData(response.data)
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
    <div style={{ backgroundColor: 'oklch(0.96 0.03 245)', minHeight: '100vh', padding: '20px' }}>
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold mb-2" style={{ color: 'oklch(0.15 0.06 245)' }}>
            Profile
          </h1>
          <p style={{ color: 'oklch(0.4 0.06 245)' }}>Manage your account and personal information</p>
        </div>

        {/* Profile Card */}
        <div 
          className="rounded-2xl shadow-lg mb-8"
          style={{ backgroundColor: 'oklch(1 0.03 245)' }}
        >
          <div className="p-8">
            {/* Avatar and Name Section */}
            <div className="flex items-start justify-between gap-6 mb-8">
              <div className="flex items-center gap-6 flex-1">
                <div className="relative flex-shrink-0" style={{ width: '96px', height: '96px', display: 'block', overflow: 'hidden' }}>
                  {previewImage ? (
                    <img 
                      src={previewImage} 
                      alt="Preview"
                      style={{ 
                        width: '96px', 
                        height: '96px', 
                        maxWidth: '96px',
                        maxHeight: '96px',
                        borderRadius: '50%', 
                        objectFit: 'cover',
                        border: '4px solid oklch(0.4 0.1 245)',
                        display: 'block'
                      }}
                    />
                  ) : userData?.profileImageUrl ? (
                    <img 
                      src={`${baseUrl}${userData.profileImageUrl}`}
                      alt="Profile"
                      style={{ 
                        width: '96px', 
                        height: '96px', 
                        maxWidth: '96px',
                        maxHeight: '96px',
                        borderRadius: '50%', 
                        objectFit: 'cover',
                        border: '4px solid oklch(0.4 0.1 245)',
                        display: 'block'
                      }}
                    />
                  ) : (
                    <div 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        borderRadius: '50%', 
                        backgroundColor: 'oklch(0.4 0.1 245)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '36px',
                        fontWeight: 'bold',
                        color: 'white'
                      }}
                    >
                      {userData?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1" style={{ color: 'oklch(0.15 0.06 245)' }}>
                    {userData?.name}
                  </h2>
                  <p style={{ color: 'oklch(0.4 0.06 245)' }} className="text-sm">
                    {userData?.email}
                  </p>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105 text-sm shrink-0"
                  style={{ backgroundColor: 'oklch(0.4 0.1 65)' }}
                >
                  <FiEdit2 size={16} />
                  Edit Profile
                </button>
              )}
            </div>

            {/* Image Upload Section */}
            {isEditing && (
              <div className="mb-6 pb-6 border-b" style={{ borderColor: 'oklch(0.85 0.03 245)' }}>
                <label style={{ color: 'oklch(0.4 0.06 245)' }} className="text-xs font-semibold mb-3 tracking-wide block">
                  PROFILE IMAGE
                </label>
                <div className="flex items-center gap-4">
                  <label className="px-4 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105 cursor-pointer text-sm" style={{ backgroundColor: 'oklch(0.4 0.1 245)' }}>
                    Choose Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {previewImage && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleUploadImage}
                        disabled={isUploadingImage}
                        className="px-4 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105 text-sm disabled:opacity-50"
                        style={{ backgroundColor: 'oklch(0.5 0.06 160)' }}
                      >
                        {isUploadingImage ? 'Uploading...' : 'Upload'}
                      </button>
                      <button
                        onClick={handleCancelUpload}
                        className="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105 border-2 text-sm"
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
                  <div className="p-4 rounded-lg shadow-md" style={{ backgroundColor: 'oklch(0.96 0.03 245)' }}>
                    <p style={{ color: 'oklch(0.15 0.06 245)' }} className="text-base leading-relaxed italic font-medium">
                      {(userData?.bio || userData?.userBio) || 'No bio added yet. Click Edit Profile to add one.'}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Edit Form */}
                <div className="space-y-4 mb-6 p-4 rounded-lg shadow-md" style={{ backgroundColor: 'oklch(0.96 0.03 245)' }}>
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
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105 flex-1 justify-center text-sm"
                    style={{ backgroundColor: 'oklch(0.5 0.06 160)' }}
                  >
                    <FiCheck size={16} />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105 flex-1 justify-center border-2 text-sm"
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
          className="rounded-2xl shadow-lg p-8"
          style={{ backgroundColor: 'oklch(1 0.03 245)' }}
        >
          <h3 className="text-2xl font-bold mb-8 flex items-center gap-2" style={{ color: 'oklch(0.15 0.06 245)' }}>
            <FiUser size={24} />
            Account Settings
          </h3>

          <div className="space-y-6">
            {/* Email Change Section */}
            <div className="pb-6 border-b" style={{ borderColor: 'oklch(0.85 0.03 245)' }}>
              {!isChangingEmail ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="flex items-center gap-2 font-semibold mb-1" style={{ color: 'oklch(0.15 0.06 245)' }}>
                      <FiMail size={18} /> Email Address
                    </p>
                    <p style={{ color: 'oklch(0.4 0.06 245)' }} className="text-sm">
                      {userData?.email}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsChangingEmail(true)}
                    className="px-4 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105"
                    style={{ backgroundColor: 'oklch(0.4 0.1 65)' }}
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label style={{ color: 'oklch(0.15 0.06 245)' }} className="block font-semibold mb-2 text-sm">
                      NEW EMAIL
                    </label>
                    <input
                      type="email"
                      value={emailData.newEmail}
                      onChange={(e) => setEmailData({ newEmail: e.target.value })}
                      placeholder="Enter new email"
                      className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-all"
                      style={{
                        borderColor: 'oklch(0.85 0.03 245)',
                        color: 'oklch(0.15 0.06 245)',
                        backgroundColor: 'oklch(0.96 0.03 245)'
                      }}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleChangeEmail}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105"
                      style={{ backgroundColor: 'oklch(0.5 0.06 160)' }}
                    >
                      <FiCheck size={18} />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsChangingEmail(false)
                        setEmailData({ newEmail: '' })
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105 border-2"
                      style={{
                        borderColor: 'oklch(0.85 0.03 245)',
                        color: 'oklch(0.4 0.06 245)'
                      }}
                    >
                      <FiX size={18} />
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Password Change Section */}
            <div className="pb-6 border-b" style={{ borderColor: 'oklch(0.85 0.03 245)' }}>
              {!isChangingPassword ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="flex items-center gap-2 font-semibold mb-1" style={{ color: 'oklch(0.15 0.06 245)' }}>
                      <FiLock size={18} /> Password
                    </p>
                    <p style={{ color: 'oklch(0.4 0.06 245)' }} className="text-sm">
                      Manage your account password
                    </p>
                  </div>
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="px-4 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105"
                    style={{ backgroundColor: 'oklch(0.4 0.1 65)' }}
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label style={{ color: 'oklch(0.15 0.06 245)' }} className="block font-semibold mb-2 text-sm">
                      CURRENT PASSWORD
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        placeholder="Enter current password"
                        className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-all pr-10"
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
                        {showCurrentPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={{ color: 'oklch(0.15 0.06 245)' }} className="block font-semibold mb-2 text-sm">
                      NEW PASSWORD
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Enter new password"
                        className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-all pr-10"
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
                        {showNewPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={{ color: 'oklch(0.15 0.06 245)' }} className="block font-semibold mb-2 text-sm">
                      CONFIRM NEW PASSWORD
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
                        className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-all pr-10"
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
                        {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleChangePassword}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105"
                      style={{ backgroundColor: 'oklch(0.5 0.06 160)' }}
                    >
                      <FiCheck size={18} />
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
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105 border-2"
                      style={{
                        borderColor: 'oklch(0.85 0.03 245)',
                        color: 'oklch(0.4 0.06 245)'
                      }}
                    >
                      <FiX size={18} />
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105 w-full justify-center border-2"
              style={{ backgroundColor: 'oklch(0.5 0.06 30)', borderColor: 'oklch(0.5 0.06 30)' }}
            >
              <FiLogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
