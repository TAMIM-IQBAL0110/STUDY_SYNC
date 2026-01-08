// Content script - runs on website pages
// Transfers auth token from website localStorage to chrome.storage

function captureAuthToken() {
  try {
    // Get token from various possible localStorage keys
    const possibleKeys = ['token', 'authToken', 'studySync_authToken', 'auth_token'];
    let token = null;
    
    for (let key of possibleKeys) {
      token = localStorage.getItem(key);
      if (token) {
        console.log(`✅ Found token in key: ${key}`);
        break;
      }
    }
    
    if (token) {
      // Store in chrome.storage so extension can access it
      chrome.storage.sync.set({ 
        'studySync_authToken': token 
      }, () => {
        console.log('✅ Auth token synced to extension storage');
      });
      
      // Also try chrome.storage.local
      chrome.storage.local.set({
        'studySync_authToken': token
      });
    } else {
      console.log('⚠️ No auth token found in localStorage');
    }
  } catch (error) {
    console.log('Could not access localStorage:', error);
  }
}

// Listen for messages from extension popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getToken') {
    const possibleKeys = ['token', 'authToken', 'studySync_authToken', 'auth_token'];
    let token = null;
    
    for (let key of possibleKeys) {
      token = localStorage.getItem(key);
      if (token) {
        console.log(`✅ Token sent to popup: ${key}`);
        sendResponse({ token: token });
        return true;
      }
    }
    
    // No token found in localStorage
    sendResponse({ token: null });
  }
});

// Capture token immediately
captureAuthToken();

// Capture token on page load/DOM ready
document.addEventListener('DOMContentLoaded', captureAuthToken);

// Also capture when storage changes (user logs in)
window.addEventListener('storage', (e) => {
  if (e.key && (e.key.includes('token') || e.key.includes('auth'))) {
    console.log('Storage changed, re-capturing token');
    setTimeout(captureAuthToken, 100);
  }
});

// Listen for messages from extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getToken') {
    const possibleKeys = ['token', 'authToken', 'studySync_authToken', 'auth_token'];
    let token = null;
    
    for (let key of possibleKeys) {
      token = localStorage.getItem(key);
      if (token) break;
    }
    
    sendResponse({ token: token });
  }
});

