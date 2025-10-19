// AWS Console Navigator Background Service Worker
console.log('AWS Console Navigator background script loaded');

// Load AWS SDK
try {
  importScripts('aws-sdk.min.js');
  console.log('✅ AWS SDK loaded successfully');

  if (typeof AWS !== 'undefined') {
    console.log('✅ AWS object is available');
    console.log('AWS version:', AWS.VERSION);

    // Test if BedrockRuntime is available
    if (AWS.BedrockRuntime) {
      console.log('✅ BedrockRuntime service is available');
    } else {
      console.log('❌ BedrockRuntime service not available');
      console.log('Available services:', Object.keys(AWS).filter(key => key.includes('Bedrock')));
    }
  } else {
    console.log('❌ AWS object not available');
  }
} catch (error) {
  console.error('❌ Failed to load AWS SDK:', error);
}

// AWS Bedrock Configuration
const BEDROCK_CONFIG = {
  region: 'us-west-2', // Default region (Oregon), can be configured
  modelId: 'amazon.titan-text-lite-v1', // Amazon Titan Text Lite
  maxTokens: 1000,
  temperature: 0.1
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

// Listen for keyboard commands
chrome.commands.onCommand.addListener((command) => {
  console.log('Command received:', command);

  if (command === 'toggle-element-picker') {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        // Check if the tab URL supports content scripts
        const url = tabs[0].url;
        if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('moz-extension://')) {
          console.log('Cannot inject into system pages:', url);
          return;
        }

        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'toggleElementPicker'
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.log('Content script not available, injecting...');
            // Try to inject the content script
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              files: ['content.js']
            }).then(() => {
              console.log('Content script injected successfully');
              // Retry sending the message
              setTimeout(() => {
                chrome.tabs.sendMessage(tabs[0].id, {
                  action: 'toggleElementPicker'
                });
              }, 100);
            }).catch((error) => {
              console.error('Failed to inject content script:', error);
            });
          }
        });
      }
    });
  }
});

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

    case 'elementCaptured':
      handleElementCaptured(request.data, sendResponse);
      return true; // Keep message channel open for async response

    case 'testBedrockConnection':
      handleTestBedrockConnection(request.credentials, sendResponse);
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
          }, (response) => {
            if (chrome.runtime.lastError) {
              console.log('Content script not available for visual guidance');
            }
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
            console.log('Content script not available for updateStep:', chrome.runtime.lastError.message);
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
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.log('Content script not available for workflowCompleted:', chrome.runtime.lastError.message);
          }
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
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.log('Content script not available for previousStep:', chrome.runtime.lastError.message);
          }
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
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('Content script not available for stopVisualGuidance:', chrome.runtime.lastError.message);
        }
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
            }, (response) => {
              if (chrome.runtime.lastError) {
                console.log('Content script not available for page change updateStep:', chrome.runtime.lastError.message);
              }
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

// Handle element captured from content script
function handleElementCaptured(elementData, sendResponse) {
  console.log('Element captured:', elementData);

  // Store the captured element data
  chrome.storage.local.set({
    lastCapturedElement: elementData,
    capturedAt: new Date().toISOString()
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('Error saving captured element:', chrome.runtime.lastError);
      sendResponse({ success: false, error: chrome.runtime.lastError.message });
    } else {
      console.log('Element data saved successfully');

      // Analyze element with AWS Bedrock
      analyzeElementWithBedrock(elementData)
        .then(analysis => {
          console.log('Bedrock analysis completed:', analysis);
          sendResponse({ success: true, analysis: analysis });
        })
        .catch(error => {
          console.error('Bedrock analysis failed:', error);
          sendResponse({ success: true, analysis: null, error: error.message });
        });
    }
  });
}

// AWS Bedrock Service Functions
async function analyzeElementWithBedrock(elementData) {
  try {
    console.log('Starting Bedrock analysis for element:', elementData.element.tagName);

    // Get AWS credentials from storage (user needs to configure these)
    const credentials = await getBedrockCredentials();
    if (!credentials) {
      throw new Error('AWS credentials not configured. Please set up AWS access key and secret key in extension settings.');
    }

    // Prepare the prompt for Claude
    const prompt = createAnalysisPrompt(elementData);

    // Call Bedrock API
    const response = await callBedrockAPI(prompt, credentials);

    return {
      success: true,
      analysis: response,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Bedrock analysis error:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

function createAnalysisPrompt(elementData) {
  const { page, element, context } = elementData;

  return `You are an expert web developer and UX analyst. Analyze this clicked element from an AWS Console page and provide insights.

PAGE CONTEXT:
- URL: ${page.url}
- Title: ${page.title}

ELEMENT DETAILS:
- Tag: ${element.tagName}
- Text: ${element.text || 'No text content'}
- ID: ${element.id || 'No ID'}
- Classes: ${element.classList.join(', ') || 'No classes'}
- CSS Path: ${element.cssPath}

CONTEXTUAL INFORMATION:
- Nearest Heading: ${context.nearestHeading || 'No heading found'}
- Previous Block: ${context.previousBlock || 'No previous context'}
- Next Block: ${context.nextBlock || 'No next context'}
- Ancestor Summary: ${context.ancestorSummary || 'No ancestor context'}

HTML SNIPPET:
${element.htmlSnippet}

Please provide a structured analysis in JSON format with the following fields:
1. elementType: What type of UI element this is (button, input, link, etc.)
2. purpose: What this element is likely used for
3. awsService: Which AWS service this element belongs to (if any)
4. action: What action this element performs when clicked
5. importance: How critical this element is (high/medium/low)
6. description: A brief description of what this element does
7. suggestions: Any suggestions for the user about this element

Respond only with valid JSON, no additional text.`;
}

async function getBedrockCredentials() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['awsAccessKey', 'awsSecretKey', 'awsRegion'], (result) => {
      if (result.awsAccessKey && result.awsSecretKey) {
        resolve({
          accessKeyId: result.awsAccessKey,
          secretAccessKey: result.awsSecretKey,
          region: result.awsRegion || BEDROCK_CONFIG.region
        });
      } else {
        resolve(null);
      }
    });
  });
}

async function callBedrockAPI(prompt, credentials) {
  try {
    // Check if AWS SDK is available
    if (typeof AWS === 'undefined') {
      throw new Error('AWS SDK not loaded. Please reload the extension.');
    }

    console.log('AWS SDK is available, checking available services...');
    console.log('All AWS services:', Object.keys(AWS).filter(key => typeof AWS[key] === 'function'));
    console.log('Bedrock-related services:', Object.keys(AWS).filter(key => key.toLowerCase().includes('bedrock')));

    // Check if BedrockRuntime is available
    if (typeof AWS.BedrockRuntime === 'function') {
      console.log('✅ BedrockRuntime is available as a constructor');
    } else {
      console.log('❌ BedrockRuntime is not available as a constructor');
      console.log('Available Bedrock services:', Object.keys(AWS).filter(key => key.toLowerCase().includes('bedrock')));
      throw new Error('BedrockRuntime service is not available in this AWS SDK version. Please use a newer version of the AWS SDK.');
    }

    // Create BedrockRuntime client
    const bedrock = new AWS.BedrockRuntime({
      region: credentials.region,
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey
    });

    const params = {
      modelId: BEDROCK_CONFIG.modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        inputText: prompt,
        textGenerationConfig: {
          maxTokenCount: BEDROCK_CONFIG.maxTokens,
          temperature: BEDROCK_CONFIG.temperature,
          topP: 0.9
        }
      })
    };

    console.log('Calling Bedrock API with params:', params);

    const response = await bedrock.invokeModel(params).promise();
    console.log('Bedrock API response:', response);

    const result = JSON.parse(response.body.toString());

    // Extract the content from Amazon Titan's response
    if (result.results && result.results[0] && result.results[0].outputText) {
      try {
        return JSON.parse(result.results[0].outputText);
      } catch (parseError) {
        console.warn('Failed to parse Bedrock response as JSON:', parseError);
        return {
          elementType: 'unknown',
          purpose: 'Could not analyze',
          awsService: 'unknown',
          action: 'unknown',
          importance: 'low',
          description: result.results[0].outputText,
          suggestions: 'Please check the raw response in console'
        };
      }
    } else {
      throw new Error('Invalid response format from Bedrock');
    }

  } catch (error) {
    console.error('Bedrock API call failed:', error);
    throw error;
  }
}


// Handle test Bedrock connection
async function handleTestBedrockConnection(credentials, sendResponse) {
  try {
    console.log('Testing Bedrock connection with credentials:', credentials.accessKeyId);

    // Create a simple test prompt
    const testPrompt = `You are a helpful assistant. Please respond with a simple "Hello, AWS Bedrock is working!" message.`;

    // Call Bedrock API
    const response = await callBedrockAPI(testPrompt, credentials);

    sendResponse({
      success: true,
      message: 'Bedrock connection successful',
      response: response
    });

  } catch (error) {
    console.error('Bedrock connection test failed:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

// Initialize
loadWorkflowState();
