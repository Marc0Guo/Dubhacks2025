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

// Store for explain mode state
let explainModeState = {
  isActive: false,
  currentTab: null
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

    case 'pageChanged':
      handlePageChange(request.url, sendResponse);
      break;

    case 'navigateToUrl':
      handleNavigation(request.url, sendResponse);
      return true;

    case 'openPopup':
      handleOpenPopup(sendResponse);
      break;

    case 'startExplainMode':
      handleStartExplainMode(sendResponse);
      return true;

    case 'stopExplainMode':
      handleStopExplainMode(sendResponse);
      break;

    case 'explainElement':
      handleExplainElement(request.elementData, sendResponse);
      return true;

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

  // Detailed EC2 Instance Launch Workflow
  if (goalLower.includes('launch') && goalLower.includes('instance')) {
    return {
      name: 'Launch EC2 Instance',
      service: 'EC2',
      steps: [
        {
          id: 1,
          title: 'Navigate to EC2 Console',
          description: 'Open the Amazon EC2 console at <a href="https://console.aws.amazon.com/ec2/" target="_blank" style="color: #ff4444; text-decoration: underline;">https://console.aws.amazon.com/ec2/</a>',
          selector: '[data-testid="ec2"]',
          action: 'click',
          page: 'console.aws.amazon.com',
          targetPage: 'ec2.console.aws.amazon.com',
          navigationUrl: 'https://console.aws.amazon.com/ec2/'
        },
        {
          id: 2,
          title: 'Launch Instance',
          description: 'From the EC2 console dashboard, in the Launch instance pane, choose Launch instance',
          selector: 'a[data-analytics="launch-an-instance-button"]',
          action: 'click',
          page: 'ec2.console.aws.amazon.com'
        },
        {
          id: 3,
          title: 'Enter Instance Name',
          description: 'Under Name and tags, for Name, enter a descriptive name for your instance',
          selector: '[data-testid="instance-name"]',
          action: 'fill',
          page: 'ec2.console.aws.amazon.com'
        },
        {
          id: 4,
          title: 'Choose Operating System',
          description: 'Under Application and OS Images, choose Quick Start, and then choose the operating system (OS) for your instance. For your first Linux instance, we recommend Amazon Linux',
          selector: '[data-testid="ami-quick-start"]',
          action: 'click',
          page: 'ec2.console.aws.amazon.com'
        },
        {
          id: 5,
          title: 'Select Free Tier AMI',
          description: 'From Amazon Machine Image (AMI), select an AMI that is marked Free Tier eligible',
          selector: '[data-testid="free-tier-ami"]',
          action: 'click',
          page: 'ec2.console.aws.amazon.com'
        },
        {
          id: 6,
          title: 'Choose Instance Type',
          description: 'Under Instance type, for Instance type, select an instance type that is marked Free Tier eligible',
          selector: '[data-testid="instance-type"]',
          action: 'click',
          page: 'ec2.console.aws.amazon.com'
        },
        {
          id: 7,
          title: 'Create Key Pair',
          description: 'Under Key pair (login), for Key pair name, choose an existing key pair or choose Create new key pair to create your first key pair',
          selector: '[data-testid="key-pair"]',
          action: 'click',
          page: 'ec2.console.aws.amazon.com'
        },
        {
          id: 8,
          title: 'Configure Network Settings',
          description: 'Under Network settings, notice that we selected your default VPC and configured a security group. For your first instance, we recommend that you use the default settings',
          selector: '[data-testid="network-settings"]',
          action: 'click',
          page: 'ec2.console.aws.amazon.com'
        },
        {
          id: 9,
          title: 'Configure Storage',
          description: 'Under Configure storage, notice that we configured a root volume but no data volumes. This is sufficient for test purposes',
          selector: '[data-testid="storage-config"]',
          action: 'click',
          page: 'ec2.console.aws.amazon.com'
        },
        {
          id: 10,
          title: 'Review and Launch',
          description: 'Review a summary of your instance configuration in the Summary panel, and when you\'re ready, choose Launch instance',
          selector: '[data-testid="launch-instance-button"]',
          action: 'click',
          page: 'ec2.console.aws.amazon.com'
        },
        {
          id: 11,
          title: 'Monitor Instance Status',
          description: 'If the launch is successful, choose the ID of the instance from the Success notification to open the Instances page and monitor the status of the launch',
          selector: '[data-testid="instance-id"]',
          action: 'click',
          page: 'ec2.console.aws.amazon.com'
        },
        {
          id: 12,
          title: 'Check Instance State',
          description: 'Select the checkbox for the instance. The initial instance state is pending. After the instance starts, its state changes to running. Choose the Status and alarms tab',
          selector: '[data-testid="instance-checkbox"]',
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
  console.log('handleNextStep called - workflowState:', {
    isActive: workflowState.isActive,
    currentStep: workflowState.currentStep,
    totalSteps: workflowState.totalSteps,
    stepsLength: workflowState.steps ? workflowState.steps.length : 'undefined'
  });

  // Check if workflow state is properly initialized
  if (!workflowState || !workflowState.steps || workflowState.steps.length === 0) {
    console.error('Workflow state not properly initialized');
    sendResponse({ success: false, error: 'Workflow not initialized' });
    return;
  }

  if (workflowState.isActive && workflowState.currentStep < workflowState.totalSteps - 1) {
    workflowState.currentStep++;
    console.log('Advancing to step:', workflowState.currentStep + 1, 'of', workflowState.totalSteps);

    // Validate step exists
    if (!workflowState.steps[workflowState.currentStep]) {
      console.error('Step not found at index:', workflowState.currentStep);
      sendResponse({ success: false, error: 'Step not found' });
      return;
    }

    // Send updated step to content script
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        console.log('Sending updateStep message to content script');
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'updateStep',
          step: workflowState.steps[workflowState.currentStep],
          stepNumber: workflowState.currentStep + 1,
          totalSteps: workflowState.totalSteps
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending updateStep to content script:', chrome.runtime.lastError);
          } else {
            console.log('updateStep sent successfully:', response);
          }
        });
      } else {
        console.error('No active tab found');
      }
    });

    sendResponse({
      success: true,
      step: workflowState.steps[workflowState.currentStep],
      stepNumber: workflowState.currentStep + 1,
      totalSteps: workflowState.totalSteps
    });
  } else if (workflowState.isActive && workflowState.currentStep >= workflowState.totalSteps - 1) {
    // Workflow completed
    console.log('Workflow completed!');
    workflowState.isActive = false;

    // Send completion message to content script
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'workflowCompleted',
          message: 'Congratulations! You have completed the workflow.'
        });
      }
    });

    sendResponse({ success: true, completed: true, message: 'Workflow completed successfully!' });
  } else {
    console.error('Cannot advance step - workflow not active or invalid state');
    sendResponse({ success: false, error: 'No active workflow or invalid state' });
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

// Handle page change detection
function handlePageChange(url, sendResponse) {
  console.log('Page changed to:', url);

  if (workflowState.isActive && currentWorkflow) {
    const currentStepData = workflowState.steps[workflowState.currentStep];

    // Check if the page change matches the expected target page for current step
    if (currentStepData && currentStepData.targetPage && url.includes(currentStepData.targetPage)) {
      console.log('Page change matches expected target, advancing to next step');

      // Auto-advance to next step
      if (workflowState.currentStep < workflowState.totalSteps - 1) {
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

        sendResponse({ success: true, advanced: true, step: workflowState.steps[workflowState.currentStep] });
      } else {
        sendResponse({ success: true, advanced: false, message: 'Workflow completed' });
      }
    } else {
      sendResponse({ success: true, advanced: false, message: 'Page change detected but no auto-advance' });
    }
  } else {
    sendResponse({ success: true, advanced: false, message: 'No active workflow' });
  }
}

// Handle navigation to specific URL
function handleNavigation(url, sendResponse) {
  console.log('Navigating to:', url);

  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.update(tabs[0].id, { url: url }, (updatedTab) => {
        if (chrome.runtime.lastError) {
          console.error('Navigation error:', chrome.runtime.lastError);
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          console.log('Navigation successful to:', url);
          sendResponse({ success: true, url: url });
        }
      });
    } else {
      sendResponse({ success: false, error: 'No active tab found' });
    }
  });
}

// Handle opening popup
function handleOpenPopup(sendResponse) {
  try {
    chrome.action.openPopup();
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error opening popup:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Initialize
loadWorkflowState();

// Explain Mode Functions
function handleStartExplainMode(sendResponse) {
  console.log('Starting explain mode');

  try {
    // Get current active tab
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        explainModeState.isActive = true;
        explainModeState.currentTab = tabs[0].id;

        // Send message to content script to activate explain mode
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'startExplainMode'
        });

        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'No active tab found' });
      }
    });
  } catch (error) {
    console.error('Error starting explain mode:', error);
    sendResponse({ success: false, error: error.message });
  }
}

function handleStopExplainMode(sendResponse) {
  console.log('Stopping explain mode');

  try {
    explainModeState.isActive = false;

    if (explainModeState.currentTab) {
      // Send message to content script to deactivate explain mode
      chrome.tabs.sendMessage(explainModeState.currentTab, {
        action: 'stopExplainMode'
      });

      explainModeState.currentTab = null;
    }

    sendResponse({ success: true });
  } catch (error) {
    console.error('Error stopping explain mode:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleExplainElement(elementData, sendResponse) {
  console.log('Handling element explanation:', elementData);

  try {
    // First try to use the existing API
    console.log('Trying API explanation...');
    const explanation = await getElementExplanationFromAPI(elementData);

    if (explanation) {
      console.log('API explanation successful:', explanation);
      sendResponse({ success: true, explanation: explanation });
      return;
    }

    console.log('API explanation failed, trying Bedrock...');
    // Fallback to Bedrock integration
    const bedrockExplanation = await getElementExplanationFromBedrock(elementData);

    if (bedrockExplanation) {
      console.log('Bedrock explanation successful:', bedrockExplanation);
      sendResponse({ success: true, explanation: bedrockExplanation });
    } else {
      console.log('All explanations failed, using mock...');
      // Generate mock explanation as final fallback
      const mockExplanation = generateMockExplanation(elementData);
      sendResponse({ success: true, explanation: mockExplanation });
    }

  } catch (error) {
    console.error('Error explaining element:', error);

    // Generate mock explanation on error
    const mockExplanation = generateMockExplanation(elementData);
    sendResponse({ success: true, explanation: mockExplanation });
  }
}

async function getElementExplanationFromAPI(elementData) {
  try {
    // Use the correct Bedrock Agent API format
    const response = await fetch('http://localhost:5000/explain-element', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        element: {
          tagName: elementData.tagName,
          id: elementData.id,
          className: elementData.className,
          textContent: elementData.textContent,
          attributes: elementData.attributes,
          parentContext: elementData.parentContext,
          siblingContext: elementData.siblingContext,
          url: elementData.url
        }
      }),
      timeout: 10000
    });

    if (response.ok) {
      const data = await response.json();
      console.log('API response:', data);

      if (data.success && data.explanation) {
        // Parse the explanation from Bedrock Agent
        const explanation = data.explanation;

        // Return the AI explanation directly from Bedrock Agent
        return explanation;
      }
    }

    return null;
  } catch (error) {
    console.warn('API explanation failed:', error);
    return null;
  }
}

async function getElementExplanationFromBedrock(elementData) {
  try {
    // Use the Bedrock Agent explain-element API for enhanced AI explanations
    const response = await fetch('http://localhost:5000/explain-element', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        element: {
          tagName: elementData.tagName,
          id: elementData.id,
          className: elementData.className,
          textContent: elementData.textContent,
          attributes: elementData.attributes,
          parentContext: elementData.parentContext,
          siblingContext: elementData.siblingContext,
          url: elementData.url
        }
      }),
      timeout: 15000
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Bedrock API response:', data);

      if (data.success && data.explanation) {
        // Parse the AI explanation from Bedrock Agent
        const explanation = data.explanation;

        // Return the AI explanation directly from Bedrock Agent
        return explanation;
      }
    }

    return null;
  } catch (error) {
    console.warn('Bedrock explanation failed:', error);
    return null;
  }
}

function generateMockExplanation(elementData) {
  const elementType = elementData.tagName;
  const textContent = elementData.textContent;
  const url = elementData.url;

  // Generate contextual explanations based on element type and content
  let explanation = {
    what: '',
    why: '',
    how: '',
    pitfalls: ''
  };

  // Analyze element type and content
  if (elementType === 'button') {
    explanation.what = `This is a button labeled "${textContent}" on the AWS Console.`;
    explanation.why = 'Buttons allow you to perform actions like creating resources, saving changes, or navigating to different pages.';
    explanation.how = 'Click this button to execute the action it represents.';
    explanation.pitfalls = 'Be careful with buttons that delete or modify resources, as these actions may be irreversible.';
  } else if (elementType === 'input' || elementType === 'textarea') {
    explanation.what = `This is an input field for entering "${textContent || 'data'}" on the AWS Console.`;
    explanation.why = 'Input fields allow you to configure settings, enter names, or provide parameters for AWS resources.';
    explanation.how = 'Click in this field and type your desired value or configuration.';
    explanation.pitfalls = 'Make sure to enter valid values according to AWS naming conventions and requirements.';
  } else if (elementType === 'a' || textContent.includes('Launch') || textContent.includes('Create')) {
    explanation.what = `This is a link or action button for "${textContent}" on the AWS Console.`;
    explanation.why = 'This element helps you navigate to specific AWS services or start creating new resources.';
    explanation.how = 'Click this element to navigate or start the creation process.';
    explanation.pitfalls = 'Creating resources may incur costs, so make sure you understand the pricing before proceeding.';
  } else if (elementType === 'select') {
    explanation.what = `This is a dropdown menu for selecting options on the AWS Console.`;
    explanation.why = 'Dropdown menus let you choose from predefined options for configuring AWS resources.';
    explanation.how = 'Click the dropdown to see available options and select the one you need.';
    explanation.pitfalls = 'Choose options carefully as they may affect the functionality and cost of your resources.';
  } else {
    // Generic explanation
    explanation.what = `This is a ${elementType} element containing "${textContent}" on the AWS Console.`;
    explanation.why = 'This element is part of the AWS Console interface for managing your cloud resources.';
    explanation.how = 'Interact with this element to perform actions or view information.';
    explanation.pitfalls = 'Always review your actions before confirming changes to avoid unintended consequences.';
  }

  // Add context-specific information based on URL
  if (url.includes('ec2')) {
    explanation.what += ' This element is part of the Amazon EC2 service console.';
    explanation.why += ' EC2 provides scalable virtual machines in the cloud.';
  } else if (url.includes('s3')) {
    explanation.what += ' This element is part of the Amazon S3 service console.';
    explanation.why += ' S3 provides object storage for files and data.';
  } else if (url.includes('lambda')) {
    explanation.what += ' This element is part of the AWS Lambda service console.';
    explanation.why += ' Lambda allows you to run code without managing servers.';
  } else if (url.includes('rds')) {
    explanation.what += ' This element is part of the Amazon RDS service console.';
    explanation.why += ' RDS provides managed relational databases.';
  }

  return explanation;
}
