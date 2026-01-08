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
        console.log(`✅ Content script found token in key: ${key}`);
        console.log(`   Token length: ${token.length}`);
        break;
      }
    }
    
    if (token) {
      // Store in chrome.storage so extension can access it
      chrome.storage.sync.set({ 
        'studySync_authToken': token 
      }, () => {
        console.log('✅ Content script: Auth token synced to chrome.storage.sync');
      });
      
      // Also try chrome.storage.local (more reliable)
      chrome.storage.local.set({
        'studySync_authToken': token
      }, () => {
        console.log('✅ Content script: Auth token synced to chrome.storage.local');
      });
    } else {
      console.log('⚠️ Content script: No auth token found in localStorage');
    }
  } catch (error) {
    console.log('⚠️ Content script error accessing localStorage:', error);
  }
}

// Listen for messages from extension popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Content script received message:', request.action);
  if (request.action === 'getToken') {
    const possibleKeys = ['token', 'authToken', 'studySync_authToken', 'auth_token'];
    let token = null;
    
    for (let key of possibleKeys) {
      token = localStorage.getItem(key);
      if (token) {
        console.log(`✅ Content script sending token from key: ${key}`);
        sendResponse({ token: token });
        return true;
      }
    }
    
    // No token found in localStorage
    console.log('⚠️ Content script: No token to send');
    sendResponse({ token: null });
  }
});

// Capture token immediately
console.log('🚀 Content script loaded on:', window.location.href);
captureAuthToken();

// Capture token on page load/DOM ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 Content script: DOM loaded, recapturing token');
  captureAuthToken();
});

// Also capture when storage changes (user logs in)
window.addEventListener('storage', (e) => {
  if (e.key && (e.key.includes('token') || e.key.includes('auth'))) {
    console.log('💾 Content script: Storage changed (' + e.key + '), re-capturing token');
    setTimeout(captureAuthToken, 100);
  }
});

// Periodic re-capture (every 5 seconds) to ensure token stays synced
setInterval(() => {
  captureAuthToken();
}, 5000);

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

