// Context menu setup
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'create-task',
    title: 'Create STUDY_SYNC Task',
    contexts: ['selection']
  });
});

// Handle context menu selection
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'create-task' && info.selectionText) {
    chrome.storage.local.set({
      selectedText: info.selectionText,
      pageUrl: tab.url,
      pageTitle: tab.title
    });
    chrome.action.openPopup();
  }
});
