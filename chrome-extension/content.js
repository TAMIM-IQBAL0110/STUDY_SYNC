// Content script - runs on website pages
// Transfers auth token from website localStorage to chrome.storage

function captureAuthToken() {
  try {
    // Get token from website localStorage
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('authToken') || 
                  localStorage.getItem('studySync_authToken');
    
    if (token) {
      // Store in chrome.storage so extension can access it
      chrome.storage.sync.set({ 
        'studySync_authToken': token 
      }, () => {
        console.log('✅ Auth token synced to extension');
      });
    }
  } catch (error) {
    console.log('Could not access localStorage:', error);
  }
}

// Capture token on page load
captureAuthToken();

// Also capture when storage changes (user logs in)
window.addEventListener('storage', (e) => {
  if (e.key === 'token' || e.key === 'authToken' || e.key === 'studySync_authToken') {
    setTimeout(captureAuthToken, 100);
  }
});

// Listen for messages from extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getToken') {
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('authToken') || 
                  localStorage.getItem('studySync_authToken');
    sendResponse({ token: token });
  }
});
