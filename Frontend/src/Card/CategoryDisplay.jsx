import { useState, useEffect } from 'react'
import axiosInstance from '../utilities/axiosInstance.js'
import { API_PATH } from '../utilities/apiPath.js'
import toast from 'react-hot-toast'
import { FiPlus, FiTrash2 } from 'react-icons/fi'

// Default categories fallback
const DEFAULT_CATEGORIES_FALLBACK = [
  { name: "Class", isDefault: true },
  { name: "Exam", isDefault: true },
  { name: "Assignment", isDefault: true },
  { name: "Others", isDefault: true }
]

const CategoryDisplay = () => {
  const [categories, setCategories] = useState([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories()
  }, [])

  const initializeDefaults = async () => {
    try {
      await axiosInstance.post(API_PATH.CATEGORY.INITIALIZE)
      await fetchCategories()
    } catch (error) {
      // If initialization fails, use fallback default categories
      setCategories(DEFAULT_CATEGORIES_FALLBACK)
    }
  }

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.get(API_PATH.CATEGORY.GET_ALL)
      const fetchedCategories = response.data.categories || []
      
      // If no categories at all, initialize defaults
      if (fetchedCategories.length === 0) {
        await initializeDefaults()
      } else {
        setCategories(fetchedCategories)
      }
    } catch (error) {
      // On error, use fallback default categories
      setCategories(DEFAULT_CATEGORIES_FALLBACK)
      toast.warning('Using default categories (backend temporarily unavailable)')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCategoryName.trim()) {
      toast.error('Category name cannot be empty')
      return
    }

    setIsAddingCategory(true)
    try {
      const response = await axiosInstance.post(API_PATH.CATEGORY.ADD, {
        name: newCategoryName.trim()
      })
      setCategories([...categories, response.data.category])
      setNewCategoryName('')
      toast.success('Category added successfully!')
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('Backend service is temporarily unavailable')
      } else {
        toast.error(error.response?.data?.message || 'Failed to add category')
      }
    } finally {
      setIsAddingCategory(false)
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
      if (error.response?.status === 404) {
        toast.error('Backend service is temporarily unavailable')
      } else {
        toast.error(error.response?.data?.message || 'Failed to delete category')
      }
    }
  }

  return (
    <div>
      {/* Category Management Card - Top Section */}
      <div 
        className="rounded-2xl shadow-lg mb-6 md:mb-8"
        style={{ backgroundColor: 'oklch(1 0.03 245)' }}
      >
        <div className="p-4 md:p-8">
          {/* Category Management Section */}
          <div>
            <h2 className="text-lg md:text-xl font-bold mb-4" style={{ color: 'oklch(0.15 0.06 245)' }}>
              Manage Categories
            </h2>

            {/* Add New Category Form */}
            <form onSubmit={handleAddCategory} className="mb-6">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter new category name"
                  className="flex-1 px-3 md:px-4 py-2 md:py-3 rounded-lg border-2 focus:outline-none transition-all text-sm"
                  style={{
                    borderColor: 'oklch(0.85 0.03 245)',
                    color: 'oklch(0.15 0.06 245)',
                    backgroundColor: 'oklch(0.96 0.03 245)'
                  }}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isAddingCategory || isLoading}
                  className="px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 text-sm md:text-base"
                  style={{ backgroundColor: 'oklch(0.4 0.1 245)' }}
                >
                  <FiPlus size={18} />
                  Add
                </button>
              </div>
            </form>

            {/* Loading State */}
            {isLoading && (
              <div className="p-6 text-center rounded-lg" style={{ backgroundColor: 'oklch(0.96 0.03 245)' }}>
                <p style={{ color: 'oklch(0.4 0.06 245)' }} className="text-sm">
                  Loading categories...
                </p>
              </div>
            )}

            {/* Categories Display */}
            {!isLoading && categories.length > 0 && (
              <div className="space-y-3">
                {/* Default Categories */}
                {categories.filter(cat => cat.isDefault).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold mb-2" style={{ color: 'oklch(0.4 0.06 245)' }}>DEFAULT CATEGORIES</p>
                    <div className="space-y-2 mb-4">
                      {categories.filter(cat => cat.isDefault).map((category) => (
                        <div
                          key={category._id}
                          className="flex items-center justify-between p-3 md:p-4 rounded-lg"
                          style={{
                            backgroundColor: 'oklch(0.96 0.03 245)',
                            borderLeft: `3px solid oklch(0.4 0.1 245)`
                          }}
                        >
                          <span style={{ color: 'oklch(0.15 0.06 245)' }} className="font-medium text-sm">
                            {category.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* User Categories */}
                {categories.filter(cat => !cat.isDefault).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold mb-2" style={{ color: 'oklch(0.4 0.06 245)' }}>YOUR CATEGORIES</p>
                    <div className="space-y-2">
                      {categories.filter(cat => !cat.isDefault).map((category) => (
                        <div
                          key={category._id}
                          className="flex items-center justify-between p-3 md:p-4 rounded-lg"
                          style={{
                            backgroundColor: 'oklch(0.96 0.03 245)'
                          }}
                        >
                          <span style={{ color: 'oklch(0.15 0.06 245)' }} className="font-medium text-sm">
                            {category.name}
                          </span>
                          <button
                            onClick={() => handleDeleteCategory(category._id)}
                            className="p-2 rounded-lg transition-all hover:scale-110"
                            style={{ backgroundColor: '#EF444420', color: '#EF4444' }}
                            title="Delete category"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {!isLoading && categories.length === 0 && (
              <div className="p-6 text-center rounded-lg" style={{ backgroundColor: 'oklch(0.96 0.03 245)' }}>
                <p style={{ color: 'oklch(0.4 0.06 245)' }} className="text-sm">
                  No categories available. Adding your first category soon!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoryDisplay
