// AWS Console Navigator Background Service Worker
console.log('AWS Console Navigator background script loaded');

// AWS Bedrock Configuration
const AWS_BEDROCK_CONFIG = {
  region: 'us-east-1', // Change to your preferred region
  modelId: 'anthropic.claude-3-sonnet-20240229-v1:0', // Claude 3 Sonnet
  // You'll need to configure these via popup settings
  accessKeyId: null,
  secretAccessKey: null
};

// Store for workflow state
let currentWorkflow = null;
let workflowState = {
  isActive: false,
  currentStep: 0,
  totalSteps: 0,
  goal: '',
  steps: []
};

// AWS Bedrock API Integration
async function callBedrockAPI(elementData) {
  try {
    // Check if credentials are configured
    if (!AWS_BEDROCK_CONFIG.accessKeyId || !AWS_BEDROCK_CONFIG.secretAccessKey) {
      throw new Error('AWS credentials not configured. Please set them in the extension popup.');
    }

    // Prepare the prompt for Bedrock
    const prompt = `You are an AI assistant that analyzes web page elements.

    Here is the context of a clicked element:

    Page: ${elementData.page.title}
    URL: ${elementData.page.url}

    Element Details:
    - Text: ${elementData.element.text || 'No text'}
    - Tag: ${elementData.element.tagName}
    - CSS Path: ${elementData.element.cssPath}
    - HTML: ${elementData.element.htmlSnippet}

    Context:
    - Nearest Heading: ${elementData.context.nearestHeading || 'None'}
    - Previous Block: ${elementData.context.previousBlock || 'None'}
    - Next Block: ${elementData.context.nextBlock || 'None'}
    - Ancestor Summary: ${elementData.context.ancestorSummary || 'None'}

    Please analyze this element and tell me:
    1. What type of element this is (button, link, input, etc.)
    2. What it does or its purpose
    3. Any important information about it
    4. Suggestions for interacting with it

    Keep your response concise and helpful.`;

    const requestBody = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    };

    // Make the API call to AWS Bedrock
    const response = await fetch(`https://bedrock-runtime.${AWS_BEDROCK_CONFIG.region}.amazonaws.com/model/${AWS_BEDROCK_CONFIG.modelId}/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `AWS4-HMAC-SHA256 Credential=${AWS_BEDROCK_CONFIG.accessKeyId}/${new Date().toISOString().split('T')[0]}/${AWS_BEDROCK_CONFIG.region}/bedrock/aws4_request`,
        'X-Amz-Date': new Date().toISOString().replace(/[:\-]|\.\d{3}/g, ''),
        'X-Amz-Target': `bedrock.${AWS_BEDROCK_CONFIG.modelId}.invoke`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Bedrock API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.content[0].text;

  } catch (error) {
    console.error('Error calling Bedrock API:', error);
    return `Error analyzing element: ${error.message}`;
  }
}

// Listen for messages from popup and content scripts
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

    case 'elementCaptured':
      handleElementCaptured(request.data, sendResponse);
      break;

    case 'setAWSCredentials':
      AWS_BEDROCK_CONFIG.accessKeyId = request.accessKeyId;
      AWS_BEDROCK_CONFIG.secretAccessKey = request.secretAccessKey;
      AWS_BEDROCK_CONFIG.region = request.region || 'us-east-1';

      // Store credentials securely
      chrome.storage.local.set({
        awsCredentials: {
          accessKeyId: request.accessKeyId,
          secretAccessKey: request.secretAccessKey,
          region: request.region || 'us-east-1'
        }
      });

      sendResponse({ success: true });
      break;

    case 'getAWSCredentials':
      chrome.storage.local.get(['awsCredentials'], (result) => {
        sendResponse({ success: true, credentials: result.awsCredentials });
      });
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

// Handle element capture from content script
function handleElementCaptured(elementData, sendResponse) {
  console.log('Element captured:', elementData);

  // Store the captured element data
  chrome.storage.local.set({
    lastCapturedElement: elementData,
    capturedAt: Date.now()
  });

  // Call AWS Bedrock to analyze the element
  callBedrockAPI(elementData).then(analysis => {
    console.log('Bedrock analysis:', analysis);

    // Store the analysis result
    chrome.storage.local.set({
      lastElementAnalysis: analysis,
      analyzedAt: Date.now()
    });

    // Send analysis to content script to display
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'showElementAnalysis',
          elementData: elementData,
          analysis: analysis
        });
      }
    });
  });

  sendResponse({ success: true });
}

// Listen for keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  console.log('Command triggered:', command);

  if (command === 'toggle-element-picker') {
    // Get the active tab and send message to content script
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'toggleElementPicker'
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending message to content script:', chrome.runtime.lastError);
          } else {
            console.log('Element picker toggled successfully');
          }
        });
      }
    });
  }
});

// Initialize
loadWorkflowState();

// Load AWS credentials on startup
chrome.storage.local.get(['awsCredentials'], (result) => {
  if (result.awsCredentials) {
    AWS_BEDROCK_CONFIG.accessKeyId = result.awsCredentials.accessKeyId;
    AWS_BEDROCK_CONFIG.secretAccessKey = result.awsCredentials.secretAccessKey;
    AWS_BEDROCK_CONFIG.region = result.awsCredentials.region || 'us-east-1';
    console.log('AWS credentials loaded from storage');
  }
});
