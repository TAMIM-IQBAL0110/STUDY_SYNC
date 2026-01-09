import { useState, useEffect } from 'react'
import axiosInstance from '../../utilities/axiosInstance.js'
import { API_PATH } from '../../utilities/apiPath.js'
import toast from 'react-hot-toast'
import CategoryDisplay from '../../Card/CategoryDisplay.jsx'
import ProfileInfoCard from '../../Card/ProfileInfoCard.jsx'
import AccountSetting from '../../Card/AccountSetting.jsx'

const Profile = () => {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await axiosInstance.get(API_PATH.AUTH.GET_USER_INFO)
      setUserData(response.data)
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch user data'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
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

        {/* Profile Info Card Component */}
        <ProfileInfoCard 
          userData={userData}
          setUserData={setUserData}
        />

        {/* Category Management Component */}
        <CategoryDisplay />

        {/* Account Setting Component */}
        <AccountSetting 
          userData={userData}
          setUserData={setUserData}
        />
      </div>
    </div>
  )
}

export default Profile
