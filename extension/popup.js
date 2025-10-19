// AWS Console Navigator Popup Script
document.addEventListener('DOMContentLoaded', function() {
  const goalInput = document.getElementById('goal-input');
  const startButton = document.getElementById('start-guide');
  const quickGoalButtons = document.querySelectorAll('.quick-goal-btn');
  const statusSection = document.getElementById('status-section');
  const settingsButton = document.getElementById('settings-btn');
  const helpButton = document.getElementById('help-btn');
  const elementPickerButton = document.getElementById('element-picker-btn');

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

  // Handle element picker button
  elementPickerButton.addEventListener('click', function() {
    console.log('Element picker clicked');

    // Send message to content script to toggle element picker
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (!tabs[0]) {
        console.error('No active tab found');
        return;
      }

      // Check if the tab URL supports content scripts
      const url = tabs[0].url;
      if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('moz-extension://')) {
        console.log('Cannot inject into system pages:', url);
        alert('Element picker cannot be used on system pages. Please navigate to a regular website.');
        return;
      }

      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'toggleElementPicker'
      }, function(response) {
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
              }, function(response) {
                if (response && response.success) {
                  console.log('Element picker toggled successfully');
                  // Close popup after activating element picker
                  window.close();
                } else {
                  console.error('Failed to toggle element picker after injection');
                }
              });
            }, 100);
          }).catch((error) => {
            console.error('Failed to inject content script:', error);
            alert('Failed to activate element picker. Please refresh the page and try again.');
          });
        } else if (response && response.success) {
          console.log('Element picker toggled successfully');
          // Close popup after activating element picker
          window.close();
        } else {
          console.error('Failed to toggle element picker');
        }
      });
    });
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
