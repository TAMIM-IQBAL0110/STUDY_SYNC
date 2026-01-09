import React, { useState } from 'react'
import { FiEdit2, FiCheck, FiX } from 'react-icons/fi'
import axiosInstance from '../utilities/axiosInstance.js'
import { API_PATH, baseUrl } from '../utilities/apiPath.js'
import toast from 'react-hot-toast'

const ProfileInfoCard = ({ userData, setUserData }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: userData?.name || '',
    userBio: userData?.bio || userData?.userBio || ''
  })
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const [imageLoadError, setImageLoadError] = useState(false)

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
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
    }
  }

  const handleCancel = () => {
    setEditData({
      name: userData?.name || '',
      userBio: userData?.bio || userData?.userBio || ''
    })
    setIsEditing(false)
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
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleCancelUpload = () => {
    setPreviewImage(null)
    const fileInput = document.querySelector('input[type="file"]')
    if (fileInput) fileInput.value = ''
  }

  return (
    <div>
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
    </div>
  )
}

export default ProfileInfoCard
