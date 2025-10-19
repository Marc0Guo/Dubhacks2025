// AWS Console Navigator Popup Script
document.addEventListener('DOMContentLoaded', function() {
  const goalInput = document.getElementById('goal-input');
  const startButton = document.getElementById('start-guide');
  const quickGoalButtons = document.querySelectorAll('.quick-goal-btn');
  const statusSection = document.getElementById('status-section');
  const settingsButton = document.getElementById('settings-btn');
  const helpButton = document.getElementById('help-btn');

  // Enable/disable start button based on input
  goalInput.addEventListener('input', function() {
    const hasText = this.value.trim().length > 0;
    startButton.disabled = !hasText;
  });

  // Handle start guide button click
  startButton.addEventListener('click', function() {
    const goal = goalInput.value.trim();
    if (goal) {
      startGuidance(goal);
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

  // Function to get predefined goal text
  function getGoalText(goalType) {
    const goals = {
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
