// Context menu for quick task creation from selected text
chrome.runtime.onInstalled.addListener(() => {
  // Create context menu item
  chrome.contextMenus.create({
    id: 'create-task',
    title: 'Create STUDY_SYNC Task',
    contexts: ['selection'],
    icons: {
      16: 'images/icon-16.png'
    }
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'create-task' && info.selectionText) {
    // Store selected text in storage to pass to popup
    chrome.storage.local.set({
      selectedText: info.selectionText,
      pageUrl: tab.url,
      pageTitle: tab.title
    });
    
    // Open popup
    chrome.action.openPopup();
  }
});

// Handle badge updates
chrome.alarms.create('checkTasks', { periodInMinutes: 5 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkTasks') {
    // Check for pending tasks and update badge
    chrome.storage.sync.get(['taskCount'], (result) => {
      const count = result.taskCount || 0;
      if (count > 0) {
        chrome.action.setBadgeText({ text: count.toString() });
        chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
      }
    });
  }
});

// Keep service worker alive
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'keepAlive') {
    sendResponse({ alive: true });
  }
});
