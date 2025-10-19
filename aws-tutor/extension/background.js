// AWS Tutor Background Script
console.log('AWS Tutor background script loaded');

// Listen for messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  switch (request.action) {
    case 'startGuidance':
      handleStartGuidance(request, sendResponse);
      break;
      
    case 'pageChanged':
      handlePageChanged(request, sendResponse);
      break;
      
    case 'nextStep':
      handleNextStep(request, sendResponse);
      break;
      
    case 'previousStep':
      handlePreviousStep(request, sendResponse);
      break;
      
    case 'navigateToUrl':
      handleNavigateToUrl(request, sendResponse);
      break;
      
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
  
  return true; // Keep message channel open for async responses
});

// Handle start guidance request
async function handleStartGuidance(request, sendResponse) {
  try {
    const { mode, input } = request;
    
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('console.aws.amazon.com')) {
      sendResponse({ success: false, error: 'Not on AWS Console' });
      return;
    }
    
    // Determine service from URL
    const service = getServiceFromUrl(tab.url);
    
    if (mode === 'explain') {
      // Start explain mode - show tooltips and explanations
      await startExplainMode(tab, input, service);
    } else if (mode === 'do') {
      // Start do mode - show step-by-step guidance
      await startDoMode(tab, input, service);
    } else if (mode === 'error') {
      // Start error whisperer - diagnose and fix errors
      await startErrorMode(tab, input, service);
    }
    
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error starting guidance:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Start explain mode
async function startExplainMode(tab, input, service) {
  // Send message to content script to start explain mode
  await chrome.tabs.sendMessage(tab.id, {
    action: 'startExplainMode',
    input: input,
    service: service
  });
}

// Start do mode
async function startDoMode(tab, input, service) {
  // Get plan from backend API
  const plan = await getPlanFromBackend(input, service);
  
  if (plan) {
    // Send plan to content script
    await chrome.tabs.sendMessage(tab.id, {
      action: 'startDoMode',
      plan: plan,
      service: service
    });
  } else {
    // Fallback to basic guidance
    await chrome.tabs.sendMessage(tab.id, {
      action: 'startBasicGuidance',
      input: input,
      service: service
    });
  }
}

// Start error mode
async function startErrorMode(tab, input, service) {
  // Get error diagnosis from backend API
  const diagnosis = await getErrorDiagnosisFromBackend(input, service);
  
  if (diagnosis) {
    // Send diagnosis to content script
    await chrome.tabs.sendMessage(tab.id, {
      action: 'startErrorMode',
      diagnosis: diagnosis,
      service: service
    });
  } else {
    // Fallback to basic error help
    await chrome.tabs.sendMessage(tab.id, {
      action: 'startBasicErrorHelp',
      input: input,
      service: service
    });
  }
}

// Get plan from backend API
async function getPlanFromBackend(input, service) {
  try {
    const response = await fetch('http://localhost:3001/plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service: service,
        goal: input,
        url: 'current'
      })
    });
    
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error getting plan from backend:', error);
  }
  
  return null;
}

// Get error diagnosis from backend API
async function getErrorDiagnosisFromBackend(input, service) {
  try {
    const response = await fetch('http://localhost:3001/error-help', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service: service,
        error: input,
        url: 'current'
      })
    });
    
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error getting error diagnosis from backend:', error);
  }
  
  return null;
}

// Get service from URL
function getServiceFromUrl(url) {
  if (url.includes('/bedrock/')) return 'bedrock';
  if (url.includes('/ec2/')) return 'ec2';
  if (url.includes('/s3/')) return 's3';
  if (url.includes('/lambda/')) return 'lambda';
  if (url.includes('/iam/')) return 'iam';
  if (url.includes('/rds/')) return 'rds';
  return 'general';
}

// Handle page changes
function handlePageChanged(request, sendResponse) {
  console.log('Page changed to:', request.url);
  sendResponse({ success: true });
}

// Handle next step
function handleNextStep(request, sendResponse) {
  console.log('Next step requested');
  sendResponse({ success: true });
}

// Handle previous step
function handlePreviousStep(request, sendResponse) {
  console.log('Previous step requested');
  sendResponse({ success: true });
}

// Handle navigation to URL
function handleNavigateToUrl(request, sendResponse) {
  console.log('Navigation requested to:', request.url);
  
  chrome.tabs.update({ url: request.url }, (tab) => {
    if (chrome.runtime.lastError) {
      sendResponse({ success: false, error: chrome.runtime.lastError.message });
    } else {
      sendResponse({ success: true });
    }
  });
}