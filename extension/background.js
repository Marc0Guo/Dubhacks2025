// AWS Console Navigator Background Service Worker
console.log('AWS Console Navigator background script loaded');

// Store for workflow state
let currentWorkflow = null;
let workflowState = {
  isActive: false,
  currentStep: 0,
  totalSteps: 0,
  goal: '',
  steps: []
};

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  switch (request.action) {
    case 'startGuidance':
      handleStartGuidance(request.goal, sendResponse);
      return true; // Keep message channel open for async response
      
    case 'getWorkflowState':
      sendResponse(workflowState);
      break;
      
    case 'nextStep':
      handleNextStep(sendResponse);
      return true;
      
    case 'previousStep':
      handlePreviousStep(sendResponse);
      return true;
      
    case 'stopGuidance':
      handleStopGuidance(sendResponse);
      break;
      
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

// Handle starting guidance
function handleStartGuidance(goal, sendResponse) {
  console.log('Starting guidance for goal:', goal);
  
  try {
    // Generate workflow steps based on goal
    const workflow = generateWorkflow(goal);
    
    if (workflow && workflow.steps.length > 0) {
      workflowState = {
        isActive: true,
        currentStep: 0,
        totalSteps: workflow.steps.length,
        goal: goal,
        steps: workflow.steps
      };
      
      currentWorkflow = workflow;
      
      // Send message to content script to start visual guidance
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'startVisualGuidance',
            workflow: workflow,
            step: workflow.steps[0]
          });
        }
      });
      
      sendResponse({ success: true, workflow: workflow });
    } else {
      sendResponse({ success: false, error: 'Could not generate workflow for this goal' });
    }
  } catch (error) {
    console.error('Error starting guidance:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Generate workflow based on goal (basic keyword matching for MVP)
function generateWorkflow(goal) {
  const goalLower = goal.toLowerCase();
  
  // Static workflows for MVP
  if (goalLower.includes('static') && goalLower.includes('website')) {
    return {
      name: 'Host Static Website',
      service: 'S3',
      steps: [
        {
          id: 1,
          title: 'Navigate to S3',
          description: 'Click on S3 in the AWS Services menu',
          selector: '[data-testid="s3"]',
          action: 'click',
          page: 'console.aws.amazon.com'
        },
        {
          id: 2,
          title: 'Create Bucket',
          description: 'Click the "Create bucket" button',
          selector: '[data-testid="create-bucket"]',
          action: 'click',
          page: 's3.console.aws.amazon.com'
        },
        {
          id: 3,
          title: 'Configure Bucket',
          description: 'Enter a unique bucket name and configure settings',
          selector: '[data-testid="bucket-name"]',
          action: 'fill',
          page: 's3.console.aws.amazon.com'
        },
        {
          id: 4,
          title: 'Enable Static Hosting',
          description: 'Enable static website hosting in bucket properties',
          selector: '[data-testid="static-hosting"]',
          action: 'click',
          page: 's3.console.aws.amazon.com'
        }
      ]
    };
  }
  
  if (goalLower.includes('web') && goalLower.includes('app')) {
    return {
      name: 'Deploy Web Application',
      service: 'EC2',
      steps: [
        {
          id: 1,
          title: 'Navigate to EC2',
          description: 'Click on EC2 in the AWS Services menu',
          selector: '[data-testid="ec2"]',
          action: 'click',
          page: 'console.aws.amazon.com'
        },
        {
          id: 2,
          title: 'Launch Instance',
          description: 'Click "Launch Instance" to create a new EC2 instance',
          selector: '[data-testid="launch-instance"]',
          action: 'click',
          page: 'ec2.console.aws.amazon.com'
        },
        {
          id: 3,
          title: 'Choose AMI',
          description: 'Select an Amazon Machine Image for your application',
          selector: '[data-testid="ami-selection"]',
          action: 'click',
          page: 'ec2.console.aws.amazon.com'
        }
      ]
    };
  }
  
  if (goalLower.includes('database')) {
    return {
      name: 'Setup Database',
      service: 'RDS',
      steps: [
        {
          id: 1,
          title: 'Navigate to RDS',
          description: 'Click on RDS in the AWS Services menu',
          selector: '[data-testid="rds"]',
          action: 'click',
          page: 'console.aws.amazon.com'
        },
        {
          id: 2,
          title: 'Create Database',
          description: 'Click "Create database" to start the setup process',
          selector: '[data-testid="create-database"]',
          action: 'click',
          page: 'rds.console.aws.amazon.com'
        }
      ]
    };
  }
  
  if (goalLower.includes('api') || goalLower.includes('serverless')) {
    return {
      name: 'Create Serverless API',
      service: 'Lambda',
      steps: [
        {
          id: 1,
          title: 'Navigate to Lambda',
          description: 'Click on Lambda in the AWS Services menu',
          selector: '[data-testid="lambda"]',
          action: 'click',
          page: 'console.aws.amazon.com'
        },
        {
          id: 2,
          title: 'Create Function',
          description: 'Click "Create function" to start building your API',
          selector: '[data-testid="create-function"]',
          action: 'click',
          page: 'lambda.console.aws.amazon.com'
        }
      ]
    };
  }
  
  // Default workflow for unrecognized goals
  return {
    name: 'General AWS Guidance',
    service: 'General',
    steps: [
      {
        id: 1,
        title: 'Explore AWS Services',
        description: 'Browse available AWS services to find what you need',
        selector: '[data-testid="services-menu"]',
        action: 'click',
        page: 'console.aws.amazon.com'
      }
    ]
  };
}

// Handle next step
function handleNextStep(sendResponse) {
  if (workflowState.isActive && workflowState.currentStep < workflowState.totalSteps - 1) {
    workflowState.currentStep++;
    
    // Send updated step to content script
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'updateStep',
          step: workflowState.steps[workflowState.currentStep],
          stepNumber: workflowState.currentStep + 1,
          totalSteps: workflowState.totalSteps
        });
      }
    });
    
    sendResponse({ success: true, step: workflowState.steps[workflowState.currentStep] });
  } else {
    sendResponse({ success: false, error: 'No more steps available' });
  }
}

// Handle previous step
function handlePreviousStep(sendResponse) {
  if (workflowState.isActive && workflowState.currentStep > 0) {
    workflowState.currentStep--;
    
    // Send updated step to content script
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'updateStep',
          step: workflowState.steps[workflowState.currentStep],
          stepNumber: workflowState.currentStep + 1,
          totalSteps: workflowState.totalSteps
        });
      }
    });
    
    sendResponse({ success: true, step: workflowState.steps[workflowState.currentStep] });
  } else {
    sendResponse({ success: false, error: 'Already at first step' });
  }
}

// Handle stopping guidance
function handleStopGuidance(sendResponse) {
  workflowState.isActive = false;
  currentWorkflow = null;
  
  // Send message to content script to stop visual guidance
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'stopVisualGuidance'
      });
    }
  });
  
  sendResponse({ success: true });
}

// Store workflow state in Chrome storage
function saveWorkflowState() {
  chrome.storage.local.set({ workflowState: workflowState });
}

// Load workflow state from Chrome storage
function loadWorkflowState() {
  chrome.storage.local.get(['workflowState'], (result) => {
    if (result.workflowState) {
      workflowState = result.workflowState;
    }
  });
}

// Initialize
loadWorkflowState();
