// Gmail content script - Injects automation into Gmail interface
// Analyzes emails and applies labels based on content

console.log('Gmail Auto-Labeler content script loaded');

let labelRules = {};
let processingInProgress = false;

// Initialize - get label rules from service worker
chrome.runtime.sendMessage({ action: 'getLabels' }, (response) => {
  if (response && response.labels) {
    labelRules = response.labels;
    console.log('Label rules loaded:', labelRules);
  }
});

// Listen for messages from service worker
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'processEmails') {
    processInboxEmails();
    sendResponse({ status: 'processing' });
  }
});

// Main processing function
async function processInboxEmails() {
  if (processingInProgress) {
    console.log('Processing already in progress');
    return;
  }
  
  processingInProgress = true;
  console.log('Starting email processing...');
  
  try {
    // Wait for Gmail to load
    await waitForGmailLoad();
    
    // Get all email rows in the inbox
    const emailRows = document.querySelectorAll('tr.zA');
    console.log(`Found ${emailRows.length} emails to process`);
    
    for (const row of emailRows) {
      await processEmailRow(row);
      // Small delay to avoid overwhelming Gmail
      await sleep(200);
    }
    
    console.log('Email processing complete');
  } catch (error) {
    console.error('Error processing emails:', error);
  } finally {
    processingInProgress = false;
  }
}

// Process individual email row
async function processEmailRow(row) {
  try {
    // Extract email information
    const senderElement = row.querySelector('.yW span');
    const subjectElement = row.querySelector('.y6 span');
    const snippetElement = row.querySelector('.y2');
    
    if (!senderElement || !subjectElement) return;
    
    const sender = senderElement.textContent.toLowerCase();
    const subject = subjectElement.textContent.toLowerCase();
    const snippet = snippetElement ? snippetElement.textContent.toLowerCase() : '';
    
    const content = `${sender} ${subject} ${snippet}`;
    
    // Determine appropriate label
    const label = determineLabel(content);
    
    if (label) {
      // Apply label by clicking on the row and using Gmail's label menu
      await applyLabelToEmail(row, label);
      
      // Log activity
      chrome.runtime.sendMessage({
        action: 'logActivity',
        data: { sender, subject, label }
      });
    }
  } catch (error) {
    console.error('Error processing email row:', error);
  }
}

// Determine which label to apply based on content
function determineLabel(content) {
  for (const [label, keywords] of Object.entries(labelRules)) {
    for (const keyword of keywords) {
      if (content.includes(keyword.toLowerCase())) {
        return label;
      }
    }
  }
  return null;
}

// Apply label using Gmail UI
async function applyLabelToEmail(row, labelName) {
  try {
    // Check if already labeled
    const existingLabels = row.querySelectorAll('.at');
    for (const label of existingLabels) {
      if (label.textContent.includes(labelName)) {
        console.log(`Email already has label: ${labelName}`);
        return;
      }
    }
    
    // Select the email
    const checkbox = row.querySelector('div[role="checkbox"]');
    if (checkbox) {
      checkbox.click();
      await sleep(100);
      
      // Open label menu
      const labelButton = document.querySelector('div[data-tooltip="Labels"]');
      if (labelButton) {
        labelButton.click();
        await sleep(300);
        
        // Find and click the label
        const labelMenuItems = document.querySelectorAll('div[role="menuitemcheckbox"]');
        for (const item of labelMenuItems) {
          if (item.textContent.includes(labelName)) {
            item.click();
            await sleep(100);
            break;
          }
        }
        
        // Close menu by pressing Escape
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27 }));
        await sleep(100);
        
        // Deselect email
        checkbox.click();
      }
    }
  } catch (error) {
    console.error('Error applying label:', error);
  }
}

// Wait for Gmail interface to load
function waitForGmailLoad() {
  return new Promise((resolve) => {
    const checkLoad = setInterval(() => {
      if (document.querySelector('tr.zA')) {
        clearInterval(checkLoad);
        resolve();
      }
    }, 500);
    
    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkLoad);
      resolve();
    }, 10000);
  });
}

// Utility sleep function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Auto-process on page load if in inbox
if (window.location.hash.includes('#inbox')) {
  setTimeout(() => {
    processInboxEmails();
  }, 2000);
}
