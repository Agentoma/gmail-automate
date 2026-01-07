// Service worker for Gmail Auto-Labeler extension
// Handles scheduled checks and coordinates with content scripts

const LABEL_RULES = {
  'Banking': ['rbc', 'bank', 'account', 'transaction', 'balance'],
  'Marketing': ['unsubscribe', 'promotional', 'offer', 'sale', 'discount', 'deal'],
  'Important': ['security alert', 'password', 'verification', 'urgent', '2fa', 'two-factor']
};

// Install event - set up alarms
chrome.runtime.onInstalled.addListener(() => {
  console.log('Gmail Auto-Labeler installed');
  
  // Create alarm for hourly checks
  chrome.alarms.create('checkEmails', {
    periodInMinutes: 60
  });
  
  // Store settings
  chrome.storage.local.set({
    enabled: true,
    lastCheck: Date.now(),
    labelRules: LABEL_RULES
  });
});

// Alarm listener - trigger email check
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkEmails') {
    checkGmailTab();
  }
});

// Check if Gmail tab is open, if not notify user
async function checkGmailTab() {
  const tabs = await chrome.tabs.query({ url: '*://mail.google.com/*' });
  
  if (tabs.length > 0) {
    // Send message to content script
    chrome.tabs.sendMessage(tabs[0].id, { action: 'processEmails' });
  } else {
    console.log('Gmail tab not open');
  }
  
  // Update last check time
  chrome.storage.local.set({ lastCheck: Date.now() });
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getLabels') {
    chrome.storage.local.get(['labelRules'], (result) => {
      sendResponse({ labels: result.labelRules || LABEL_RULES });
    });
    return true;
  }
  
  if (request.action === 'logActivity') {
    console.log('Email processed:', request.data);
    sendResponse({ success: true });
  }
});

console.log('Service worker loaded');
