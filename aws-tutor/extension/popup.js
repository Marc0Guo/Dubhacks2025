// AWS Tutor Popup Script
document.addEventListener('DOMContentLoaded', function() {
  const modeButtons = document.querySelectorAll('.mode-btn');
  const modeContents = document.querySelectorAll('.mode-content');
  const goalInput = document.getElementById('goal-input');
  const taskInput = document.getElementById('task-input');
  const errorInput = document.getElementById('error-input');
  const startExplain = document.getElementById('start-explain');
  const startDo = document.getElementById('start-do');
  const startErrorHelp = document.getElementById('start-error-help');
  const quickGoalButtons = document.querySelectorAll('.quick-goal-btn');
  const statusSection = document.getElementById('status-section');
  const settingsButton = document.getElementById('settings-btn');
  const helpButton = document.getElementById('help-btn');

  let currentMode = 'explain';

  // Mode switching
  modeButtons.forEach(button => {
    button.addEventListener('click', function() {
      const mode = this.dataset.mode;
      switchMode(mode);
    });
  });

  function switchMode(mode) {
    // Update active button
    modeButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');

    // Show/hide content
    modeContents.forEach(content => {
      content.style.display = 'none';
    });
    document.getElementById(`${mode}-mode`).style.display = 'block';

    currentMode = mode;
    updateInputHandlers();
  }

  function updateInputHandlers() {
    // Remove existing listeners
    goalInput.removeEventListener('input', handleExplainInput);
    taskInput.removeEventListener('input', handleDoInput);
    errorInput.removeEventListener('input', handleErrorInput);

    // Add appropriate listeners based on mode
    if (currentMode === 'explain') {
      goalInput.addEventListener('input', handleExplainInput);
      startExplain.addEventListener('click', () => startGuidance(goalInput.value.trim(), 'explain'));
    } else if (currentMode === 'do') {
      taskInput.addEventListener('input', handleDoInput);
      startDo.addEventListener('click', () => startGuidance(taskInput.value.trim(), 'do'));
    } else if (currentMode === 'error') {
      errorInput.addEventListener('input', handleErrorInput);
      startErrorHelp.addEventListener('click', () => startGuidance(errorInput.value.trim(), 'error'));
    }
  }

  // Input handlers
  function handleExplainInput() {
    const hasText = this.value.trim().length > 0;
    startExplain.disabled = !hasText;
  }

  function handleDoInput() {
    const hasText = this.value.trim().length > 0;
    startDo.disabled = !hasText;
  }

  function handleErrorInput() {
    const hasText = this.value.trim().length > 0;
    startErrorHelp.disabled = !hasText;
  }

  // Handle quick goal buttons
  quickGoalButtons.forEach(button => {
    button.addEventListener('click', function() {
      const goal = this.dataset.goal;
      const goalText = getGoalText(goal);
      
      if (currentMode === 'explain') {
        goalInput.value = goalText;
        startExplain.disabled = false;
        startGuidance(goalText, 'explain');
      } else if (currentMode === 'do') {
        taskInput.value = goalText;
        startDo.disabled = false;
        startGuidance(goalText, 'do');
      } else if (currentMode === 'error') {
        errorInput.value = goalText;
        startErrorHelp.disabled = false;
        startGuidance(goalText, 'error');
      }
    });
  });

  // Handle settings button
  settingsButton.addEventListener('click', function() {
    console.log('Settings clicked');
  });

  // Handle help button
  helpButton.addEventListener('click', function() {
    console.log('Help clicked');
  });

  // Function to start guidance process
  function startGuidance(input, mode) {
    if (!input) return;
    
    console.log(`Starting ${mode} mode for:`, input);
    
    // Show status
    statusSection.style.display = 'block';
    statusSection.querySelector('.status-text').textContent = `Analyzing your ${mode} request...`;
    
    // Send message to background script
    chrome.runtime.sendMessage({
      action: 'startGuidance',
      mode: mode,
      input: input
    }, function(response) {
      if (response && response.success) {
        statusSection.querySelector('.status-text').textContent = `${mode} mode started! Check the AWS Console.`;
        
        // Close popup after a short delay
        setTimeout(() => {
          window.close();
        }, 1500);
      } else {
        statusSection.querySelector('.status-text').textContent = `Error starting ${mode} mode. Please try again.`;
      }
    });
  }

  // Function to get predefined goal text
  function getGoalText(goalType) {
    const goals = {
      // Explain Mode
      'bedrock-temperature': 'What does temperature do in Bedrock?',
      'bedrock-models': 'What are the different Bedrock models?',
      'ec2-basics': 'How do I launch an EC2 instance?',
      's3-basics': 'How do I create an S3 bucket?',
      'iam-roles': 'What are IAM roles and how do I use them?',
      
      // Do Mode
      'bedrock-chatbot': 'Create an AI chatbot with Bedrock',
      'deploy-web-app': 'I want to deploy a web application',
      'setup-database': 'Set up a database for my app',
      'create-api': 'Create a serverless API',
      'host-static-site': 'I want to host a static website',
      
      // Error Mode
      'access-denied': 'AccessDenied: User is not authorized to perform this action',
      'validation-error': 'ValidationException: Invalid parameter value',
      'throttling': 'ThrottlingException: Rate exceeded',
      'permissions': 'User is not authorized to perform iam:PassRole',
      'billing': 'Billing error: Payment method required'
    };
    return goals[goalType] || '';
  }

  // Check if we're on AWS Console
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentTab = tabs[0];
    const isAWSConsole = currentTab.url.includes('console.aws.amazon.com');
    
    if (!isAWSConsole) {
      statusSection.style.display = 'block';
      statusSection.querySelector('.status-text').textContent = 'Please navigate to AWS Console first.';
      
      // Disable all inputs and buttons
      [goalInput, taskInput, errorInput].forEach(input => {
        if (input) input.disabled = true;
      });
      [startExplain, startDo, startErrorHelp].forEach(button => {
        if (button) button.disabled = true;
      });
      quickGoalButtons.forEach(btn => btn.disabled = true);
    }
  });

  // Initialize
  updateInputHandlers();
});