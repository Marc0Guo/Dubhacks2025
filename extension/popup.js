// AWS Console Navigator Popup Script
document.addEventListener('DOMContentLoaded', function() {
  const goalInput = document.getElementById('goal-input');
  const startButton = document.getElementById('start-guide');
  const quickGoalButtons = document.querySelectorAll('.quick-goal-btn');
  const statusSection = document.getElementById('status-section');
  const settingsButton = document.getElementById('settings-btn');
  const helpButton = document.getElementById('help-btn');
  const modeButtons = document.querySelectorAll('.mode-btn');
  const modeContents = document.querySelectorAll('.mode-content');
  
  // Explain mode elements
  const explainInput = document.getElementById('explain-input');
  const startExplainButton = document.getElementById('start-explain');
  const explainStatusSection = document.getElementById('explain-status-section');
  
  // Error mode elements
  const errorInput = document.getElementById('error-input');
  const startErrorButton = document.getElementById('start-error');
  const errorStatusSection = document.getElementById('error-status-section');

  // Enable/disable start button based on input
  goalInput.addEventListener('input', function() {
    const hasText = this.value.trim().length > 0;
    startButton.disabled = !hasText;
  });

  // Enable/disable explain button based on input
  explainInput.addEventListener('input', function() {
    const hasText = this.value.trim().length > 0;
    startExplainButton.disabled = !hasText;
  });

  // Enable/disable error button based on input
  errorInput.addEventListener('input', function() {
    const hasText = this.value.trim().length > 0;
    startErrorButton.disabled = !hasText;
  });

  // Handle start guide button click
  startButton.addEventListener('click', function() {
    const goal = goalInput.value.trim();
    if (goal) {
      startGuidance(goal);
    }
  });

  // Handle explain button click
  startExplainButton.addEventListener('click', function() {
    const question = explainInput.value.trim();
    if (question) {
      startExplanation(question);
    }
  });

  // Handle error button click
  startErrorButton.addEventListener('click', function() {
    const error = errorInput.value.trim();
    if (error) {
      startErrorDiagnosis(error);
    }
  });

  // Handle quick goal buttons
  quickGoalButtons.forEach(button => {
    button.addEventListener('click', function() {
      const goal = this.dataset.goal;
      const goalText = getGoalText(goal);
      goalInput.value = goalText;
      startButton.disabled = false;
      startGuidance(goalText);
    });
  });

  // Handle settings button
  settingsButton.addEventListener('click', function() {
    // TODO: Open settings page or modal
    console.log('Settings clicked');
  });

  // Handle help button
  helpButton.addEventListener('click', function() {
    // TODO: Open help documentation
    console.log('Help clicked');
  });

  // Handle mode switching
  modeButtons.forEach(button => {
    button.addEventListener('click', function() {
      const mode = this.dataset.mode;
      switchMode(mode);
    });
  });

  // Function to switch between modes
  function switchMode(mode) {
    // Remove active class from all buttons and content
    modeButtons.forEach(btn => btn.classList.remove('active'));
    modeContents.forEach(content => content.classList.remove('active'));
    
    // Add active class to selected button and content
    const activeButton = document.querySelector(`[data-mode="${mode}"]`);
    const activeContent = document.getElementById(`${mode}-mode`);
    
    if (activeButton && activeContent) {
      activeButton.classList.add('active');
      activeContent.classList.add('active');
    }
  }

  // Function to start guidance process
  function startGuidance(goal) {
    console.log('Starting guidance for:', goal);
    
    // Show status
    statusSection.style.display = 'block';
    statusSection.querySelector('.status-text').textContent = 'Analyzing your goal...';
    
    // Send message to background script
    chrome.runtime.sendMessage({
      action: 'startGuidance',
      goal: goal
    }, function(response) {
      if (response && response.success) {
        statusSection.querySelector('.status-text').textContent = 'Guidance started! Check the AWS Console.';
        
        // Close popup after a short delay
        setTimeout(() => {
          window.close();
        }, 1500);
      } else {
        statusSection.querySelector('.status-text').textContent = 'Error starting guidance. Please try again.';
      }
    });
  }

  // Function to start explanation process
  function startExplanation(question) {
    console.log('Starting explanation for:', question);
    
    // Show status
    explainStatusSection.style.display = 'block';
    explainStatusSection.querySelector('.status-text').textContent = 'Analyzing your question...';
    
    // Send message to background script
    chrome.runtime.sendMessage({
      action: 'startExplanation',
      question: question
    }, function(response) {
      if (response && response.success) {
        explainStatusSection.querySelector('.status-text').textContent = 'Explanation started! Check the AWS Console.';
        
        // Close popup after a short delay
        setTimeout(() => {
          window.close();
        }, 1500);
      } else {
        explainStatusSection.querySelector('.status-text').textContent = 'Error starting explanation. Please try again.';
      }
    });
  }

  // Function to start error diagnosis process
  function startErrorDiagnosis(error) {
    console.log('Starting error diagnosis for:', error);
    
    // Show status
    errorStatusSection.style.display = 'block';
    errorStatusSection.querySelector('.status-text').textContent = 'Analyzing your error...';
    
    // Send message to background script
    chrome.runtime.sendMessage({
      action: 'startErrorDiagnosis',
      error: error
    }, function(response) {
      if (response && response.success) {
        errorStatusSection.querySelector('.status-text').textContent = 'Diagnosis started! Check the AWS Console.';
        
        // Close popup after a short delay
        setTimeout(() => {
          window.close();
        }, 1500);
      } else {
        errorStatusSection.querySelector('.status-text').textContent = 'Error starting diagnosis. Please try again.';
      }
    });
  }

  // Function to get predefined goal text
  function getGoalText(goalType) {
    const goals = {
      'launch-instance': 'I want to launch an EC2 instance',
      'deploy-web-app': 'I want to deploy a web application',
      'setup-database': 'Set up a database for my app',
      'create-api': 'Create a serverless API',
      'host-static-site': 'I want to host a static website'
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
      startButton.disabled = true;
      goalInput.disabled = true;
      
      // Disable quick goal buttons
      quickGoalButtons.forEach(btn => btn.disabled = true);
    }
  });
});
