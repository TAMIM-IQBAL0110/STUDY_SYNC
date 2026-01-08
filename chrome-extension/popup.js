// Configuration
const API_URL = 'https://study-sync-mv99.onrender.com'; // Production backend
const AUTH_TOKEN_KEY = 'studySync_authToken';
const RECENT_TASKS_KEY = 'recentTasks';
const CATEGORIES_CACHE_KEY = 'studySync_categories';
const CATEGORIES_CACHE_TIME_KEY = 'studySync_categoriesCacheTime';
const CACHE_DURATION = 300000; // 5 minutes in milliseconds

// Default categories fallback
const DEFAULT_CATEGORIES = [
  'Class',
  'Exam',
  'Assignment',
  'Others'
];

// DOM Elements
const taskForm = document.getElementById('taskForm');
const taskNameInput = document.getElementById('taskName');
const descriptionInput = document.getElementById('description');
const dueDateInput = document.getElementById('dueDate');
const startTimeInput = document.getElementById('startTime');
const categoryInput = document.getElementById('category');
const resetBtn = document.getElementById('resetBtn');
const statusMessage = document.getElementById('statusMessage');
const openAppBtn = document.getElementById('openApp');
const recentTasksList = document.getElementById('recentTasks');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadRecentTasks();
  setDefaultDate();
  loadAuthToken();
  loadContextMenuData();
  loadCategories();
});

// Load data from context menu
function loadContextMenuData() {
  chrome.storage.local.get(['selectedText', 'pageUrl'], (result) => {
    if (result.selectedText) {
      taskNameInput.value = result.selectedText;
      chrome.storage.local.remove(['selectedText', 'pageUrl']);
    }
  });
}

// Set default due date to today and block previous dates
function setDefaultDate() {
  const today = new Date();
  
  // Format as YYYY-MM-DD to avoid timezone issues
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;
  
  // Set default value and minimum allowed date
  dueDateInput.value = dateString;
  dueDateInput.min = dateString;
}

// Load auth token
function loadAuthToken() {
  // First try chrome.storage.sync
  chrome.storage.sync.get([AUTH_TOKEN_KEY], (result) => {
    if (result[AUTH_TOKEN_KEY]) {
      console.log('✅ Token found in sync storage');
      return;
    }
    
    // If not found, try chrome.storage.local
    chrome.storage.local.get([AUTH_TOKEN_KEY], (localResult) => {
      if (localResult[AUTH_TOKEN_KEY]) {
        console.log('✅ Token found in local storage');
        return;
      }
      // If still not found, show warning
      console.log('⚠️ No token found, user needs to log in');
      showStatus('⚠️ Please log in to STUDY_SYNC first.', 'warning');
    });
  });
}

// Load categories dynamically from backend
function loadCategories() {
  // Get auth token
  chrome.storage.sync.get([AUTH_TOKEN_KEY], async (tokenResult) => {
    let token = tokenResult[AUTH_TOKEN_KEY];
    
    if (!token) {
      const localResult = await new Promise(resolve => {
        chrome.storage.local.get([AUTH_TOKEN_KEY], resolve);
      });
      token = localResult[AUTH_TOKEN_KEY];
    }
    
    if (!token) {
      console.log('⚠️ No token, using default categories');
      populateCategoryDropdown(DEFAULT_CATEGORIES);
      return;
    }
    
    // Fetch categories directly
    console.log('🔄 Fetching categories with token...');
    fetchCategoriesWithToken(token);
  });
}

// Fetch categories with token
async function fetchCategoriesWithToken(token) {
  try {
    console.log('🔄 Fetching categories...');
    
    const response = await fetch(`${API_URL}/api/v1/category`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });
    
    console.log('📊 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      const allCategories = data.categories || [];
      
      if (allCategories && allCategories.length > 0) {
        console.log('✅ Categories loaded:', allCategories.length);
        populateCategoryDropdown(allCategories);
      } else {
        console.log('⚠️ No categories found, using defaults');
        populateCategoryDropdown(DEFAULT_CATEGORIES);
      }
    } else {
      console.log('⚠️ Failed to fetch categories, status:', response.status);
      const errorText = await response.text();
      console.log('Error:', errorText);
      
      // Fallback to default categories if token is invalid
      console.log('📋 Falling back to default categories');
      populateCategoryDropdown(DEFAULT_CATEGORIES);
    }
      populateCategoryDropdown(DEFAULT_CATEGORIES);
      showStatus('Failed to load categories', 'error');
    }
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    populateCategoryDropdown(DEFAULT_CATEGORIES);
    showStatus('Error loading categories', 'error');
  }
}

// Populate category dropdown with API categories
function populateCategoryDropdown(categories) {
  const categorySelect = document.getElementById('category');
  if (!categorySelect) return;
  
  console.log('🎨 Populating dropdown, received:', categories);
  console.log('🎨 Type of categories:', typeof categories);
  
  categorySelect.innerHTML = '';
  
  if (!categories || categories.length === 0) {
    console.log('⚠️ No categories provided');
    const option = document.createElement('option');
    option.textContent = 'No categories available';
    categorySelect.appendChild(option);
    return;
  }
  
  // Extract category names - handle both string and object formats
  let categoryNames = [];
  categories.forEach(cat => {
    let name;
    if (typeof cat === 'string') {
      name = cat;
    } else if (cat && cat.name) {
      name = cat.name;
    }
    if (name && name.trim()) {
      categoryNames.push(name.trim());
    }
  });
  
  console.log('📋 Final category names to display:', categoryNames);
  
  // Remove duplicates
  categoryNames = [...new Set(categoryNames)];
  
  if (categoryNames.length === 0) {
    console.log('⚠️ No valid category names extracted');
    return;
  }
  
  // Populate all categories - use NAME as both value and display text
  categoryNames.forEach((name) => {
    const option = document.createElement('option');
    option.value = name;  // IMPORTANT: Use name as value, NOT ObjectId
    option.textContent = name;
    categorySelect.appendChild(option);
    console.log('➕ Added option:', name);
  });
  
  // Cache just the category names for validation
  chrome.storage.local.set({
    'studySync_categoryNames': categoryNames
  });
  
  // Default to 'Others' if available
  const othersOption = Array.from(categorySelect.options).find(opt => opt.value === 'Others');
  if (othersOption) {
    categorySelect.value = 'Others';
  }
  
  console.log('✅ Dropdown populated with', categoryNames.length, 'categories');
}

// Handle form submission

// Open STUDY_SYNC app
openAppBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://studysynch.netlify.app' }); // Frontend app
});

// Handle form submission
taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  console.log('📝 Form submitted, validating...');
  
  if (!taskNameInput.value.trim()) {
    showStatus('❌ Please enter a task name', 'error');
    return;
  }
  
  console.log('✅ Task name valid:', taskNameInput.value);

  // Get auth token from sync storage first, then local
  chrome.storage.sync.get([AUTH_TOKEN_KEY], async (result) => {
    let token = result[AUTH_TOKEN_KEY];
    
    // If not in sync, try local storage
    if (!token) {
      const localResult = await new Promise(resolve => {
        chrome.storage.local.get([AUTH_TOKEN_KEY], resolve);
      });
      token = localResult[AUTH_TOKEN_KEY];
    }
    
    if (!token) {
      showStatus('❌ Please log in to STUDY_SYNC first', 'error');
      console.log('❌ No token found in any storage');
      return;
    }
    
    console.log('✅ Token found, creating task...');

    const category = categoryInput.value.trim() || 'Others';
    console.log('📌 Selected category value:', JSON.stringify(category));
    
    // Get cached category names for validation
    const cachedNames = await new Promise(resolve => {
      chrome.storage.local.get(['studySync_categoryNames'], (result) => {
        resolve(result['studySync_categoryNames'] || []);
      });
    });
    
    console.log('📋 Available category names from cache:', cachedNames);
    
    if (cachedNames.length === 0) {
      console.error('❌ No categories available');
      showStatus('❌ No categories available. Please refresh.', 'error');
      return;
    }
    
    if (!cachedNames.includes(category)) {
      console.error('❌ Category validation failed!');
      console.error('  Selected: "' + category + '"');
      console.error('  Valid options:', cachedNames);
      showStatus(`❌ Invalid category. Select from: ${cachedNames.join(', ')}`, 'error');
      return;
    }
    
    console.log('✅ Category validation passed:', category);
    
    // Prepare task data matching backend schema
    // Convert time input to minutes from midnight
    const timeStr = startTimeInput.value || '09:00';
    const [hours, minutes] = timeStr.split(':').map(Number);
    const startTimeMinutes = hours * 60 + minutes;
    
    // Validate startTime is in valid range
    if (startTimeMinutes < 0 || startTimeMinutes >= 1440) {
      showStatus('❌ Invalid time (must be 00:00 to 23:59)', 'error');
      return;
    }
    
    // Send date as YYYY-MM-DD (same format as frontend)
    const dateValue = dueDateInput.value || new Date().toISOString().split('T')[0];
    
    const taskData = {
      name: taskNameInput.value.trim(),
      description: descriptionInput.value.trim() || '',
      date: dateValue, // Send as YYYY-MM-DD (same as frontend)
      startTime: startTimeMinutes, // in minutes from midnight (0-1440)
      category: category,
      reminder: false
    };
    
    console.log('📤 Sending task data:', JSON.stringify(taskData, null, 2));

    try {
      // Show loading state
      const submitBtn = taskForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="btn-icon">⏳</span> Creating...';

      // Send to backend
      const response = await fetch(`${API_URL}/api/v1/task/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(taskData)
      });

      if (response.ok) {
        const newTask = await response.json();
        
        // Show success message
        showStatus('✅ Task created successfully!', 'success');
        console.log('✅ Task created:', newTask);
        
        // Add to recent tasks
        addToRecentTasks(taskData);
        
        // Reset form
        taskForm.reset();
        setDefaultDate();
        startTimeInput.value = '09:00'; // Reset time to 9:00 AM
        
        // Reset button
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }, 2000);
      } else {
        const errorText = await response.text();
        console.error('❌ Server error:', response.status, errorText);
        
        try {
          const error = JSON.parse(errorText);
          showStatus(`❌ Error: ${error.message || 'Failed to create task'}`, 'error');
        } catch {
          showStatus(`❌ Server Error ${response.status}: ${errorText || 'Unknown error'}`, 'error');
        }
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      showStatus(`❌ Network Error: ${error.message}`, 'error');
      
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
});

// Reset form
resetBtn.addEventListener('click', () => {
  taskForm.reset();
  setDefaultDate();
  startTimeInput.value = '09:00'; // Reset time to 9:00 AM
  statusMessage.textContent = '';
});

// Show status message
// Show status message with visibility
function showStatus(message, type) {
  statusMessage.style.display = 'block';
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
  
  // Style based on type
  if (type === 'success') {
    statusMessage.style.backgroundColor = 'oklch(0.8 0.05 160)';
    statusMessage.style.color = 'oklch(0.25 0.06 160)';
    console.log('✅ ' + message);
    setTimeout(() => {
      statusMessage.style.display = 'none';
      statusMessage.textContent = '';
    }, 3000);
  } else if (type === 'error') {
    statusMessage.style.backgroundColor = 'oklch(0.9 0.04 30)';
    statusMessage.style.color = 'oklch(0.5 0.06 30)';
    console.log('❌ ' + message);
  } else if (type === 'warning') {
    statusMessage.style.backgroundColor = 'oklch(0.9 0.04 60)';
    statusMessage.style.color = 'oklch(0.5 0.06 60)';
    console.log('⚠️ ' + message);
  }
}

// Add task to recent tasks (local storage)
function addToRecentTasks(task) {
  chrome.storage.sync.get([RECENT_TASKS_KEY], (result) => {
    let recentTasks = result[RECENT_TASKS_KEY] || [];
    
    // Add new task to beginning
    recentTasks.unshift({
      ...task,
      timestamp: new Date().toLocaleString()
    });
    
    // Keep only last 5 tasks
    recentTasks = recentTasks.slice(0, 5);
    
    // Save to storage
    chrome.storage.sync.set({ [RECENT_TASKS_KEY]: recentTasks }, () => {
      loadRecentTasks();
    });
  });
}

// Load and display recent tasks
function loadRecentTasks() {
  chrome.storage.sync.get([RECENT_TASKS_KEY], (result) => {
    const recentTasks = result[RECENT_TASKS_KEY] || [];
    
    if (recentTasks.length === 0) {
      recentTasksList.innerHTML = '<p class="empty-state">No tasks yet</p>';
      return;
    }

    recentTasksList.innerHTML = recentTasks.map(task => `
      <div class="recent-task-item">
        <div class="task-info">
          <p class="task-name">${escapeHtml(task.name || 'Untitled')}</p>
          <p class="task-meta">
            <span class="category">${escapeHtml(task.category || 'Others')}</span>
            <span class="date">${task.date || 'No date'}</span>
          </p>
        </div>
      </div>
    `).join('');
  });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Re-login button - clear token
const reloginBtn = document.getElementById('reloginBtn');
if (reloginBtn) {
  reloginBtn.addEventListener('click', () => {
    console.log('🔐 Clearing token...');
    chrome.storage.sync.remove([AUTH_TOKEN_KEY], () => {
      chrome.storage.local.remove([AUTH_TOKEN_KEY], () => {
        showStatus('✅ Token cleared. Please refresh.', 'success');
      });
    });
  });
}

// Refresh categories button
const refreshCategoriesBtn = document.getElementById('refreshCategoriesBtn');
if (refreshCategoriesBtn) {
  refreshCategoriesBtn.addEventListener('click', () => {
    console.log('🔄 Manually refreshing categories...');
    refreshCategoriesBtn.style.opacity = '0.5';
    refreshCategoriesBtn.disabled = true;
    
    // Clear cache
    chrome.storage.local.remove([CATEGORIES_CACHE_KEY, CATEGORIES_CACHE_TIME_KEY], () => {
      // Reload categories
      loadCategories();
      showStatus('✅ Categories refreshed!', 'success');
      
      // Re-enable button after 1 second
      setTimeout(() => {
        refreshCategoriesBtn.style.opacity = '1';
        refreshCategoriesBtn.disabled = false;
      }, 1000);
    });
  });
}

// Context Menu Integration (optional)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'createFromSelection') {
    taskNameInput.value = request.selectedText;
    taskNameInput.focus();
    sendResponse({ success: true });
  }
});
