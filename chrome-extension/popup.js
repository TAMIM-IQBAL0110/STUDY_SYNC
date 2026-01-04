// Configuration
const API_URL = 'https://study-sync-mv99.onrender.com'; // Production backend
const AUTH_TOKEN_KEY = 'studySync_authToken';
const RECENT_TASKS_KEY = 'recentTasks';

// DOM Elements
const taskForm = document.getElementById('taskForm');
const taskNameInput = document.getElementById('taskName');
const descriptionInput = document.getElementById('description');
const dueDateInput = document.getElementById('dueDate');
const categoryInput = document.getElementById('category');
const captureUrlCheckbox = document.getElementById('captureUrl');
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

// Set default due date to tomorrow
function setDefaultDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dueDateInput.valueAsDate = tomorrow;
}

// Load stored auth token
function loadAuthToken() {
  chrome.storage.sync.get([AUTH_TOKEN_KEY], (result) => {
    if (!result[AUTH_TOKEN_KEY]) {
      showStatus('⚠️ Not logged in. Please log in to STUDY_SYNC first.', 'warning');
    }
  });
}

// Open STUDY_SYNC app
openAppBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://studysynch.netlify.app' }); // Frontend app
});

// Handle form submission
taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (!taskNameInput.value.trim()) {
    showStatus('❌ Please enter a task name', 'error');
    return;
  }

  // Get auth token
  chrome.storage.sync.get([AUTH_TOKEN_KEY], async (result) => {
    const token = result[AUTH_TOKEN_KEY];
    
    if (!token) {
      showStatus('❌ Please log in to STUDY_SYNC first', 'error');
      return;
    }

    // Get current page URL if checkbox is selected
    let pageUrl = null;
    if (captureUrlCheckbox.checked) {
      const tab = await chrome.tabs.query({ active: true, currentWindow: true });
      pageUrl = tab[0].url;
    }

    // Prepare task data matching backend schema
    // Convert due date to start time (default to 9:00 AM if no time set)
    const startTimeMinutes = 9 * 60; // 9:00 AM in minutes from midnight
    
    const taskData = {
      name: taskNameInput.value.trim(),
      description: descriptionInput.value.trim() || '',
      date: dueDateInput.value || new Date().toISOString().split('T')[0],
      startTime: startTimeMinutes,
      category: categoryInput.value.trim() || 'Others',
      reminder: false
    };

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
        body: JSON.stringify(taskData)
      });

      if (response.ok) {
        const newTask = await response.json();
        
        // Show success message
        showStatus('✅ Task created successfully!', 'success');
        
        // Add to recent tasks
        addToRecentTasks(taskData);
        
        // Reset form
        taskForm.reset();
        setDefaultDate();
        captureUrlCheckbox.checked = false;
        
        // Reset button
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }, 2000);
      } else {
        const error = await response.json();
        showStatus(`❌ Error: ${error.message || 'Failed to create task'}`, 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    } catch (error) {
      console.error('Error:', error);
      showStatus(`❌ Error: ${error.message}`, 'error');
      const submitBtn = taskForm.querySelector('button[type="submit"]');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span class="btn-icon">➕</span> Create Task';
    }
  });
});

// Reset form
resetBtn.addEventListener('click', () => {
  taskForm.reset();
  setDefaultDate();
  captureUrlCheckbox.checked = false;
  statusMessage.textContent = '';
});

// Show status message
function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
  
  if (type === 'success') {
    setTimeout(() => {
      statusMessage.textContent = '';
    }, 3000);
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

// Context Menu Integration (optional)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'createFromSelection') {
    taskNameInput.value = request.selectedText;
    taskNameInput.focus();
    sendResponse({ success: true });
  }
});
