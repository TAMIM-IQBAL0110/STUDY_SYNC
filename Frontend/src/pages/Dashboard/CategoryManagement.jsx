import { useState, useEffect } from 'react'
import axiosInstance from '../../utilities/axiosInstance.js'
import { API_PATH } from '../../utilities/apiPath.js'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiPlus, FiTrash2 } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

const CategoryManagement = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const THEME = {
    bg: 'oklch(0.96 0.03 245)',
    card: 'oklch(1 0.03 245)',
    primary: 'oklch(0.4 0.1 245)',
    textHeading: 'oklch(0.15 0.06 245)',
    textSecondary: 'oklch(0.4 0.06 245)',
    danger: '#EF4444',
    inputField: 'oklch(0.97 0.02 245)'
  }

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setFetching(true)
      const response = await axiosInstance.get(API_PATH.CATEGORY.GET_ALL)
      setCategories(response.data.categories || [])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch categories')
      console.error(error)
    } finally {
      setFetching(false)
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()

    if (!newCategoryName.trim()) {
      toast.error('Category name cannot be empty')
      return
    }

    setLoading(true)
    try {
      const response = await axiosInstance.post(API_PATH.CATEGORY.ADD, {
        name: newCategoryName.trim()
      })

      setCategories([...categories, response.data.category])
      setNewCategoryName('')
      toast.success('Category added successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add category')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return
    }

    try {
      await axiosInstance.delete(API_PATH.CATEGORY.DELETE(categoryId))
      setCategories(categories.filter(cat => cat._id !== categoryId))
      toast.success('Category deleted successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete category')
      console.error(error)
    }
  }

  if (fetching) {
    return (
      <div style={{ backgroundColor: THEME.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: THEME.textSecondary }}>Loading categories...</p>
      </div>
    )
  }

  const defaultCategories = categories.filter(cat => cat.isDefault)
  const userCategories = categories.filter(cat => !cat.isDefault)

  return (
    <div style={{ backgroundColor: THEME.bg, minHeight: '100vh', padding: '20px' }}>
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 mb-6 px-4 py-2 rounded-lg transition-all hover:opacity-70"
        style={{ color: THEME.primary }}
      >
        <FiArrowLeft size={20} />
        Back to Dashboard
      </button>

      {/* Main Card */}
      <div className="max-w-2xl mx-auto">
        <div
          className="rounded-xl p-8 shadow-lg mb-6"
          style={{ backgroundColor: THEME.card }}
        >
          <h1 className="text-3xl font-bold mb-2" style={{ color: THEME.textHeading }}>
            Manage Categories
          </h1>
          <p style={{ color: THEME.textSecondary }} className="mb-6">
            Add, remove, or manage your task categories
          </p>

          {/* Add New Category Form */}
          <form onSubmit={handleAddCategory} className="mb-8">
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter new category name"
                className="flex-1 px-4 py-3 rounded-lg border-2 focus:outline-none transition-all"
                style={{
                  borderColor: 'oklch(0.85 0.03 245)',
                  color: THEME.textHeading,
                  backgroundColor: 'oklch(0.96 0.03 245)'
                }}
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-lg font-bold text-white flex items-center gap-2 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: THEME.primary }}
              >
                <FiPlus size={20} />
                Add
              </button>
            </div>
          </form>
        </div>

        {/* Default Categories */}
        {defaultCategories.length > 0 && (
          <div
            className="rounded-xl p-6 shadow-lg mb-6"
            style={{ backgroundColor: THEME.card }}
          >
            <h2 className="text-lg font-bold mb-4" style={{ color: THEME.textHeading }}>
              Default Categories
            </h2>
            <div className="space-y-2">
              {defaultCategories.map((category) => (
                <div
                  key={category._id}
                  className="flex items-center justify-between p-4 rounded-lg"
                  style={{
                    backgroundColor: 'oklch(0.96 0.03 245)',
                    borderLeft: `4px solid ${THEME.primary}`
                  }}
                >
                  <span style={{ color: THEME.textHeading }} className="font-medium">
                    {category.name}
                  </span>
                  <span style={{ color: THEME.textSecondary }} className="text-sm">
                    (Default)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Categories */}
        {userCategories.length > 0 && (
          <div
            className="rounded-xl p-6 shadow-lg"
            style={{ backgroundColor: THEME.card }}
          >
            <h2 className="text-lg font-bold mb-4" style={{ color: THEME.textHeading }}>
              Your Categories
            </h2>
            <div className="space-y-2">
              {userCategories.map((category) => (
                <div
                  key={category._id}
                  className="flex items-center justify-between p-4 rounded-lg"
                  style={{
                    backgroundColor: 'oklch(0.96 0.03 245)'
                  }}
                >
                  <span style={{ color: THEME.textHeading }} className="font-medium">
                    {category.name}
                  </span>
                  <button
                    onClick={() => handleDeleteCategory(category._id)}
                    className="p-2 rounded-lg transition-all hover:brightness-90 active:scale-95"
                    style={{ backgroundColor: THEME.danger + '20', color: THEME.danger }}
                    title="Delete category"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {userCategories.length === 0 && defaultCategories.length > 0 && (
          <div
            className="rounded-xl p-8 text-center"
            style={{ backgroundColor: THEME.card }}
          >
            <p style={{ color: THEME.textSecondary }}>
              No custom categories yet. Add one to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoryManagement
