// AWS Console Navigator Content Script
console.log('AWS Console Navigator content script loaded');

let visualGuidance = {
  isActive: false,
  currentStep: null,
  overlay: null,
  cue: null
};

// Element Context Picker State
let elementPicker = {
  isActive: false,
  overlay: null,
  highlight: null,
  info: null,
  lastElement: null
};

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);

  switch (request.action) {
    case 'startVisualGuidance':
      startVisualGuidance(request.workflow, request.step);
      sendResponse({ success: true });
      break;

    case 'updateStep':
      updateStep(request.step, request.stepNumber, request.totalSteps);
      sendResponse({ success: true });
      break;

    case 'stopVisualGuidance':
      stopVisualGuidance();
      sendResponse({ success: true });
      break;

    case 'workflowCompleted':
      showWorkflowCompletion(request.message);
      sendResponse({ success: true });
      break;

    case 'toggleElementPicker':
      toggleElementPicker();
      sendResponse({ success: true });
      break;

    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

// Track page changes for workflow progress
let lastUrl = window.location.href;
setInterval(() => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    console.log('Page changed to:', lastUrl);

    // Notify background script of page change
    chrome.runtime.sendMessage({
      action: 'pageChanged',
      url: lastUrl
    });
  }
}, 1000);

// Start visual guidance
function startVisualGuidance(workflow, step) {
  console.log('Starting visual guidance for workflow:', workflow.name);

  visualGuidance.isActive = true;
  visualGuidance.currentStep = step;

  // Check if we're already on the target page for the current step
  const currentUrl = window.location.href;
  console.log('Current URL:', currentUrl);

  // If we're on EC2 page and step is about navigating to EC2, skip to next step
  if (currentUrl.includes('ec2.console.aws.amazon.com') && step.id === 1) {
    console.log('Already on EC2 page, skipping navigation step');
    // Send message to background to advance to next step
    chrome.runtime.sendMessage({
      action: 'nextStep'
    });
    return;
  }

  // Create overlay and cue
  createOverlay();
  showStep(step);
}

// Update current step
function updateStep(step, stepNumber, totalSteps) {
  console.log('updateStep called:', {
    title: step.title,
    stepNumber: stepNumber,
    totalSteps: totalSteps,
    selector: step.selector
  });

  visualGuidance.currentStep = step;

  // Clear any existing panels to prevent conflicts
  const existingPanel = document.getElementById('aws-navigator-general-panel');
  if (existingPanel) {
    existingPanel.remove();
  }

  showStep(step, stepNumber, totalSteps);
}

// Stop visual guidance
function stopVisualGuidance() {
  try {
    console.log('Stopping visual guidance');

    visualGuidance.isActive = false;
    visualGuidance.currentStep = null;

    // Remove overlay
    if (visualGuidance.overlay) {
      visualGuidance.overlay.remove();
      visualGuidance.overlay = null;
    }

    // Remove cue
    if (visualGuidance.cue) {
      visualGuidance.cue.remove();
      visualGuidance.cue = null;
    }

    // Remove any existing panels
    const existingPanel = document.getElementById('aws-navigator-panel');
    if (existingPanel) {
      existingPanel.remove();
    }

    const existingGeneralPanel = document.getElementById('aws-navigator-general-panel');
    if (existingGeneralPanel) {
      existingGeneralPanel.remove();
    }

    // Remove any existing cues
    const existingCue = document.getElementById('aws-navigator-cue');
    if (existingCue) {
      existingCue.remove();
    }

    // Remove overlay if it exists
    const existingOverlay = document.getElementById('aws-navigator-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }

    console.log('Visual guidance stopped successfully');
  } catch (e) {
    console.error('Error stopping visual guidance:', e);
  }
}

// Create the main overlay
function createOverlay() {
  try {
    if (visualGuidance.overlay) {
      visualGuidance.overlay.remove();
    }

    const overlay = document.createElement('div');
    overlay.id = 'aws-navigator-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    document.body.appendChild(overlay);
    visualGuidance.overlay = overlay;
  } catch (e) {
    console.error('Error creating overlay:', e);
  }
}

// Show current step with visual cues
function showStep(step, stepNumber = 1, totalSteps = 1) {
  console.log('showStep called:', {
    title: step.title,
    stepNumber: stepNumber,
    totalSteps: totalSteps,
    selector: step.selector
  });

  if (!visualGuidance.overlay) {
    createOverlay();
  }

  // Clear existing cues and panels
  if (visualGuidance.cue) {
    visualGuidance.cue.remove();
  }

  const existingPanel = document.getElementById('aws-navigator-general-panel');
  if (existingPanel) {
    existingPanel.remove();
  }

  // Find target element
  const targetElement = findTargetElement(step.selector);
  console.log('Target element found:', targetElement ? 'YES' : 'NO');

  if (targetElement) {
    // Create visual cue
    console.log('Creating visual cue for found element');
    createVisualCue(targetElement, step, stepNumber, totalSteps);
  } else {
    // Show general guidance if element not found
    console.log('Element not found, showing general guidance');
    showGeneralGuidance(step, stepNumber, totalSteps);

    // Auto-advance after 10 seconds if user doesn't interact
    setTimeout(() => {
      const panel = document.getElementById('aws-navigator-general-panel');
      if (panel && panel.parentNode) {
        console.log('Auto-advancing step after timeout');
        chrome.runtime.sendMessage({ action: 'nextStep' }, (response) => {
          if (response && response.success) {
            console.log('Auto-advance successful');
          }
        });
      }
    }, 10000);
  }
}

// Find target element on the page using web scraping techniques
function findTargetElement(selector) {
  if (!selector) {
    console.warn('No selector provided');
    return null;
  }

  console.log('🔍 Web scraping approach: Searching for element with selector:', selector);

  // Try different selector strategies (inspired by Beautiful Soup and Selenium)
  const strategies = [
    () => {
      try {
        return document.querySelector(selector);
      } catch (e) {
        console.warn('Direct selector failed:', e);
        return null;
      }
    },
    () => {
      try {
        // Only process if it's a data-testid selector
        if (selector.startsWith('[data-testid="') && selector.endsWith('"]')) {
          return document.querySelector(selector);
        }
        return null;
      } catch (e) {
        console.warn('Data-testid selector failed:', e);
        return null;
      }
    },
    () => {
      try {
        // Only process if it's a data-testid selector
        if (selector.startsWith('[data-testid="') && selector.endsWith('"]')) {
          const cleanSelector = selector.replace(/^\[data-testid="/, '').replace(/"\]$/, '');
          return document.querySelector(`[aria-label*="${cleanSelector}"]`);
        }
        return null;
      } catch (e) {
        console.warn('Aria-label selector failed:', e);
        return null;
      }
    },
    () => {
      try {
        // Only process if it's a data-testid selector
        if (selector.startsWith('[data-testid="') && selector.endsWith('"]')) {
          const cleanSelector = selector.replace(/^\[data-testid="/, '').replace(/"\]$/, '');
          return document.querySelector(`[title*="${cleanSelector}"]`);
        }
        return null;
      } catch (e) {
        console.warn('Title selector failed:', e);
        return null;
      }
    },
    () => {
      try {
        // Text-based search for exact matches
        return Array.from(document.querySelectorAll('*')).find(el =>
          el.textContent && el.textContent.trim() === selector
        );
      } catch (e) {
        console.warn('Exact text content search failed:', e);
        return null;
      }
    },
    () => {
      try {
        // Text-based search for partial matches
        return Array.from(document.querySelectorAll('*')).find(el =>
          el.textContent && el.textContent.toLowerCase().includes(selector.toLowerCase())
        );
      } catch (e) {
        console.warn('Partial text content search failed:', e);
        return null;
      }
    },
    () => {
      try {
        // Special handling for AWS Console Launch instance button
        if (selector === 'Launch instance') {
          console.log('Searching for Launch instance button...');
          const spans = Array.from(document.querySelectorAll('span'));
          console.log('Found spans:', spans.length);

          const launchButton = spans.find(el => {
            const text = el.textContent && el.textContent.trim();
            console.log('Checking span text:', text);
            return text === 'Launch instance';
          });

          if (launchButton) {
            console.log('Found Launch instance button:', launchButton);
          } else {
            console.log('Launch instance button not found in spans');
            // Try other elements too
            const allElements = Array.from(document.querySelectorAll('*'));
            const found = allElements.find(el => {
              const text = el.textContent && el.textContent.trim();
              return text === 'Launch instance';
            });
            if (found) {
              console.log('Found Launch instance in other element:', found);
              return found;
            }
          }

          return launchButton;
        }
        return null;
      } catch (e) {
        console.warn('AWS Console specific search failed:', e);
        return null;
      }
    },
    () => {
      try {
        // Special handling for EC2 service detection
        if (selector === '[data-testid="ec2"]') {
          console.log('Searching for EC2 service...');
          // Look for elements containing "EC2" text
          const ec2Elements = Array.from(document.querySelectorAll('*')).filter(el => {
            const text = el.textContent && el.textContent.trim();
            return text === 'EC2' || text.includes('EC2');
          });
          console.log('Found EC2 elements:', ec2Elements.length);
          return ec2Elements[0] || null;
        }
        return null;
      } catch (e) {
        console.warn('EC2 service search failed:', e);
        return null;
      }
    },
    () => {
      try {
        // Special handling for instance name input field
        if (selector === '[data-testid="instance-name"]') {
          console.log('Searching for instance name input...');

          // Look for input fields that might be for instance name
          const inputSelectors = [
            'input[placeholder*="name" i]',
            'input[placeholder*="instance" i]',
            'input[aria-label*="name" i]',
            'input[aria-label*="instance" i]',
            'input[type="text"]',
            'input:not([type="hidden"])'
          ];

          for (const inputSelector of inputSelectors) {
            const inputs = Array.from(document.querySelectorAll(inputSelector));
            const nameInput = inputs.find(input => {
              const placeholder = input.placeholder ? input.placeholder.toLowerCase() : '';
              const ariaLabel = input.getAttribute('aria-label') ? input.getAttribute('aria-label').toLowerCase() : '';
              return placeholder.includes('name') || placeholder.includes('instance') ||
                     ariaLabel.includes('name') || ariaLabel.includes('instance');
            });
            if (nameInput) {
              console.log('Found instance name input:', nameInput);
              return nameInput;
            }
          }

          // Fallback: look for any text input in the main form area
          const mainForm = document.querySelector('form') || document.querySelector('[role="main"]') || document.body;
          const textInputs = Array.from(mainForm.querySelectorAll('input[type="text"]'));
          if (textInputs.length > 0) {
            console.log('Found text input as fallback:', textInputs[0]);
            return textInputs[0];
          }

          return null;
        }
        return null;
      } catch (e) {
        console.warn('Instance name input search failed:', e);
        return null;
      }
    },
    () => {
      try {
        // Special handling for AWS Console Launch instance button with data-analytics
        if (selector === 'a[data-analytics="launch-an-instance-button"]') {
          console.log('🔍 Strategy 9: AWS Console Launch instance button search...');

          // Multiple approaches like a web scraper would use
          const approaches = [
            // Approach 1: Direct attribute selector (like Beautiful Soup's find)
            () => document.querySelector('a[data-analytics="launch-an-instance-button"]'),

            // Approach 2: Look for any element with this data-analytics value
            () => document.querySelector('[data-analytics="launch-an-instance-button"]'),

            // Approach 3: Look for links containing "Launch instance" text (like Beautiful Soup's find_all)
            () => {
              const links = Array.from(document.querySelectorAll('a'));
              return links.find(link => {
                const text = link.textContent && link.textContent.trim();
                return text === 'Launch instance';
              });
            },

            // Approach 4: Look for any element containing "Launch instance" text
            () => {
              const allElements = Array.from(document.querySelectorAll('*'));
              return allElements.find(el => {
                const text = el.textContent && el.textContent.trim();
                return text === 'Launch instance';
              });
            },

            // Approach 5: Look for buttons or links with AWS UI classes (Selenium-style)
            () => {
              const awsElements = Array.from(document.querySelectorAll('a.awsui_button_vjswe_gmc8h_157, button.awsui_button_vjswe_gmc8h_157'));
              return awsElements.find(el => {
                const text = el.textContent && el.textContent.trim();
                return text === 'Launch instance';
              });
            },

            // Approach 6: Look for elements with specific AWS UI patterns
            () => {
              const awsPatterns = [
                'a[class*="awsui_button"]',
                'button[class*="awsui_button"]',
                'a[class*="awsui_link"]',
                'span[class*="awsui_content"]'
              ];

              for (const pattern of awsPatterns) {
                const elements = Array.from(document.querySelectorAll(pattern));
                const found = elements.find(el => {
                  const text = el.textContent && el.textContent.trim();
                  return text === 'Launch instance';
                });
                if (found) return found;
              }
              return null;
            }
          ];

          for (let i = 0; i < approaches.length; i++) {
            try {
              const element = approaches[i]();
              if (element) {
                console.log(`✅ Found Launch instance button with approach ${i + 1}:`, element);
                return element;
              }
            } catch (e) {
              console.warn(`Approach ${i + 1} failed:`, e);
            }
          }

          console.log('❌ All approaches failed to find Launch instance button');
          return null;
        }
        return null;
      } catch (e) {
        console.warn('Launch instance button search failed:', e);
        return null;
      }
    },

    () => {
      try {
        // Check for AWS Console error states
        console.log('🔍 Strategy 10: Checking for AWS Console error states...');

        // Check if page failed to load content
        const errorMessages = [
          'Unable to load content',
          'We could not load the content for the page',
          'This might be due to your firewall or proxy server',
          'contact AWS Support'
        ];

        const hasError = errorMessages.some(msg =>
          document.body.textContent.includes(msg)
        );

        if (hasError) {
          console.log('⚠️ AWS Console error detected - page content failed to load');
          console.log('💡 Suggestion: Refresh the page or check your network connection');
          return null;
        }

        return null;
      } catch (e) {
        console.warn('Error state check failed:', e);
        return null;
      }
    },

    () => {
      try {
        // Special handling for AMI selection elements
        if (selector === '[data-testid="ami-quick-start"]' || selector === '[data-testid="free-tier-ami"]') {
          console.log('Searching for AMI selection...');

          // Look for elements containing "AMI" or "Amazon Machine Image"
          const amiElements = Array.from(document.querySelectorAll('*')).filter(el => {
            const text = el.textContent && el.textContent.trim().toLowerCase();
            return text.includes('ami') || text.includes('amazon machine image') ||
                   text.includes('quick start') || text.includes('free tier');
          });

          if (amiElements.length > 0) {
            console.log('Found AMI-related elements:', amiElements.length);
            return amiElements[0];
          }

          return null;
        }
        return null;
      } catch (e) {
        console.warn('AMI selection search failed:', e);
        return null;
      }
    },
    () => {
      try {
        // Special handling for instance type selection
        if (selector === '[data-testid="instance-type"]') {
          console.log('Searching for instance type selection...');

          // Look for elements containing "instance type" or "t2.micro"
          const instanceTypeElements = Array.from(document.querySelectorAll('*')).filter(el => {
            const text = el.textContent && el.textContent.trim().toLowerCase();
            return text.includes('instance type') || text.includes('t2.micro') ||
                   text.includes('free tier') || text.includes('select instance');
          });

          if (instanceTypeElements.length > 0) {
            console.log('Found instance type elements:', instanceTypeElements.length);
            return instanceTypeElements[0];
          }

          return null;
        }
        return null;
      } catch (e) {
        console.warn('Instance type search failed:', e);
        return null;
      }
    },
    () => {
      try {
        // Special handling for key pair selection
        if (selector === '[data-testid="key-pair"]') {
          console.log('Searching for key pair selection...');

          // Look for elements containing "key pair" or "create new key pair"
          const keyPairElements = Array.from(document.querySelectorAll('*')).filter(el => {
            const text = el.textContent && el.textContent.trim().toLowerCase();
            return text.includes('key pair') || text.includes('create new key pair') ||
                   text.includes('login') || text.includes('ssh');
          });

          if (keyPairElements.length > 0) {
            console.log('Found key pair elements:', keyPairElements.length);
            return keyPairElements[0];
          }

          return null;
        }
        return null;
      } catch (e) {
        console.warn('Key pair search failed:', e);
        return null;
      }
    },
    () => {
      try {
        // Comprehensive element search (like Beautiful Soup's find_all)
        console.log('🔍 Strategy 11: Comprehensive element search...');

        // Get all elements on the page
        const allElements = Array.from(document.querySelectorAll('*'));
        console.log(`📊 Total elements on page: ${allElements.length}`);

        // Try to find element by various attributes and text content
        const searchCriteria = [
          // By exact text content
          (el) => el.textContent && el.textContent.trim() === selector,

          // By partial text content
          (el) => el.textContent && el.textContent.toLowerCase().includes(selector.toLowerCase()),

          // By data attributes
          (el) => {
            for (let attr of el.attributes) {
              if (attr.value && attr.value.includes(selector)) {
                return true;
              }
            }
            return false;
          },

          // By class names containing selector
          (el) => el.className && el.className.includes(selector),

          // By id containing selector
          (el) => el.id && el.id.includes(selector)
        ];

        for (let criteria of searchCriteria) {
          const found = allElements.find(criteria);
          if (found) {
            console.log('✅ Found element with comprehensive search:', found);
            return found;
          }
        }

        console.log('❌ Comprehensive search found no matches');
        return null;
      } catch (e) {
        console.warn('Comprehensive search failed:', e);
        return null;
      }
    }
  ];

  for (const strategy of strategies) {
    try {
      const element = strategy();
      if (element && isElementVisible(element)) {
        console.log('Found element with strategy:', strategy.name);
        return element;
      }
    } catch (e) {
      console.warn('Selector strategy failed:', e);
    }
  }

  console.warn('No element found for selector:', selector);

  // Debug: Show page structure like a web scraper would
  debugPageStructure(selector);

  return null;
}

// Debug function to analyze page structure (inspired by web scraping techniques)
function debugPageStructure(targetSelector) {
  console.log('🔍 DEBUG: Analyzing page structure for selector:', targetSelector);

  // Get all elements with text content
  const elementsWithText = Array.from(document.querySelectorAll('*')).filter(el =>
    el.textContent && el.textContent.trim().length > 0
  );

  console.log(`📊 Elements with text content: ${elementsWithText.length}`);

  // Look for elements that might contain our target
  const potentialMatches = elementsWithText.filter(el => {
    const text = el.textContent.trim().toLowerCase();
    const selectorLower = targetSelector.toLowerCase();
    return text.includes(selectorLower) ||
           (selectorLower.includes('launch') && text.includes('launch')) ||
           (selectorLower.includes('instance') && text.includes('instance')) ||
           (selectorLower.includes('ec2') && text.includes('ec2'));
  });

  if (potentialMatches.length > 0) {
    console.log('🎯 Potential matches found:');
    potentialMatches.slice(0, 5).forEach((el, i) => {
      console.log(`${i + 1}. ${el.tagName} - "${el.textContent.trim()}" - Classes: ${el.className}`);
    });
  }

  // Look for elements with data-analytics attributes
  const analyticsElements = Array.from(document.querySelectorAll('[data-analytics]'));
  if (analyticsElements.length > 0) {
    console.log(`📈 Elements with data-analytics: ${analyticsElements.length}`);
    analyticsElements.slice(0, 3).forEach((el, i) => {
      console.log(`${i + 1}. ${el.tagName} - data-analytics="${el.getAttribute('data-analytics')}" - Text: "${el.textContent.trim()}"`);
    });
  }

  // Look for AWS UI elements (only show if relevant)
  const awsElements = Array.from(document.querySelectorAll('[class*="awsui"]'));
  if (awsElements.length > 0 && potentialMatches.length === 0) {
    console.log(`☁️ AWS UI elements found: ${awsElements.length} (showing first 3)`);
    awsElements.slice(0, 3).forEach((el, i) => {
      console.log(`${i + 1}. ${el.tagName} - Classes: ${el.className} - Text: "${el.textContent.trim()}"`);
    });
  }
}

// Check if element is visible and suitable for visual cue
function isElementVisible(element) {
  try {
    if (!element || !element.getBoundingClientRect) {
      return false;
    }

    const rect = element.getBoundingClientRect();

    // Basic visibility check
    if (rect.width <= 0 || rect.height <= 0) {
      return false;
    }

    // Check if element is too large (likely a container element)
    if (rect.width > window.innerWidth * 0.8 || rect.height > window.innerHeight * 0.8) {
      console.log('Element too large, skipping:', element.tagName, rect.width, rect.height);
      return false;
    }

    // Check if element is too small (likely not interactive)
    if (rect.width < 20 || rect.height < 20) {
      console.log('Element too small, skipping:', element.tagName, rect.width, rect.height);
      return false;
    }

    // Check if element is outside viewport
    if (rect.top < 0 || rect.left < 0 || rect.bottom > window.innerHeight || rect.right > window.innerWidth) {
      console.log('Element outside viewport, skipping:', element.tagName);
      return false;
    }

    return true;
  } catch (e) {
    console.warn('Error checking element visibility:', e);
    return false;
  }
}

// Create visual cue around target element
function createVisualCue(targetElement, step, stepNumber, totalSteps) {
  try {
    if (!targetElement || !targetElement.getBoundingClientRect) {
      console.warn('Invalid target element for visual cue');
      showGeneralGuidance(step, stepNumber, totalSteps);
      return;
    }

    const rect = targetElement.getBoundingClientRect();

    // Validate element size - if too large, show general guidance instead
    if (rect.width > window.innerWidth * 0.8 || rect.height > window.innerHeight * 0.8) {
      console.warn('Element too large for visual cue, showing general guidance instead');
      showGeneralGuidance(step, stepNumber, totalSteps);
      return;
    }

    // Validate element position
    if (rect.left < 0 || rect.top < 0 || rect.right > window.innerWidth || rect.bottom > window.innerHeight) {
      console.warn('Element outside viewport, showing general guidance instead');
      showGeneralGuidance(step, stepNumber, totalSteps);
      return;
    }

    console.log('Creating visual cue for element:', {
      width: rect.width,
      height: rect.height,
      left: rect.left,
      top: rect.top
    });

    // Create cue element
    const cue = document.createElement('div');
    cue.id = 'aws-navigator-cue';
    cue.style.cssText = `
      position: fixed;
      left: ${Math.max(0, rect.left - 20)}px;
      top: ${Math.max(0, rect.top - 20)}px;
      width: ${Math.min(rect.width + 40, window.innerWidth - Math.max(0, rect.left - 20))}px;
      height: ${Math.min(rect.height + 40, window.innerHeight - Math.max(0, rect.top - 20))}px;
      border: 3px solid #ff4444;
      border-radius: 8px;
      background: rgba(255, 68, 68, 0.1);
      pointer-events: none;
      animation: pulse 2s infinite;
      z-index: 1000000;
      box-sizing: border-box;
    `;

    // Add pulse animation
    if (!document.getElementById('aws-navigator-styles')) {
      const style = document.createElement('style');
      style.id = 'aws-navigator-styles';
      style.textContent = `
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(255, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 68, 68, 0); }
        }
      `;
      document.head.appendChild(style);
    }

    visualGuidance.overlay.appendChild(cue);
    visualGuidance.cue = cue;

    // Create guidance panel
    createGuidancePanel(step, stepNumber, totalSteps, rect);
  } catch (e) {
    console.error('Error creating visual cue:', e);
    showGeneralGuidance(step, stepNumber, totalSteps);
  }
}

// Create guidance panel with instructions
function createGuidancePanel(step, stepNumber, totalSteps, targetRect) {
  try {
    const panel = document.createElement('div');
    panel.id = 'aws-navigator-panel';
    panel.style.cssText = `
      position: absolute;
      background: white;
      border: 2px solid #ff4444;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      max-width: 300px;
      z-index: 1000001;
      font-size: 14px;
      line-height: 1.4;
    `;

    // Position panel near target element
    const panelLeft = Math.min(targetRect.right + 20, window.innerWidth - 320);
    const panelTop = Math.max(targetRect.top - 10, 10);

    panel.style.left = `${panelLeft}px`;
    panel.style.top = `${panelTop}px`;

    // Panel content
    panel.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span style="font-weight: 600; color: #ff4444;">Step ${stepNumber} of ${totalSteps}</span>
        <button id="aws-navigator-close" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #666;">×</button>
      </div>
      <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333;">${step.title}</h3>
      <div style="margin: 0 0 12px 0; color: #666;">${step.description}</div>
      <div style="display: flex; gap: 8px;">
        <button id="aws-navigator-prev" style="padding: 6px 12px; background: #f0f0f0; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; font-size: 12px;">Previous</button>
        <button id="aws-navigator-next" style="padding: 6px 12px; background: #ff4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Next</button>
        <button id="aws-navigator-stop" style="padding: 6px 12px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Stop</button>
      </div>
    `;

    visualGuidance.overlay.appendChild(panel);

    // Handle clickable links in the description
    const links = panel.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const url = link.href;
        console.log('Navigation link clicked:', url);

        // Send navigation request to background script
        chrome.runtime.sendMessage({
          action: 'navigateToUrl',
          url: url
        }, (response) => {
          if (response && response.success) {
            console.log('Navigation successful');
          } else {
            console.error('Navigation failed:', response);
          }
        });
      });
    });

    // Add event listeners with error handling
    const closeBtn = document.getElementById('aws-navigator-close');
    const prevBtn = document.getElementById('aws-navigator-prev');
    const nextBtn = document.getElementById('aws-navigator-next');
    const stopBtn = document.getElementById('aws-navigator-stop');

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        stopVisualGuidance();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          chrome.runtime.sendMessage({ action: 'previousStep' });
        } catch (error) {
          console.error('Error sending previous step message:', error);
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          chrome.runtime.sendMessage({ action: 'nextStep' });
        } catch (error) {
          console.error('Error sending next step message:', error);
        }
      });
    }

    if (stopBtn) {
      stopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        stopVisualGuidance();
      });
    }
  } catch (e) {
    console.error('Error creating guidance panel:', e);
    showGeneralGuidance(step, stepNumber, totalSteps);
  }
}

// Show general guidance when target element not found
function showGeneralGuidance(step, stepNumber, totalSteps) {
  console.log('showGeneralGuidance called:', {
    title: step.title,
    stepNumber: stepNumber,
    totalSteps: totalSteps
  });

  try {
    // Remove any existing general guidance panel
    const existingPanel = document.getElementById('aws-navigator-general-panel');
    if (existingPanel) {
      existingPanel.remove();
    }

    // Check if page has loading errors
    const hasError = document.body.textContent.includes('Unable to load content') ||
                    document.body.textContent.includes('We could not load the content for the page');

    const panel = document.createElement('div');
    panel.id = 'aws-navigator-general-panel';
    panel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border: 2px solid #ff4444;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      max-width: 350px;
      z-index: 1000001;
      font-size: 14px;
      line-height: 1.4;
    `;

    // Determine if this is the last step
    const isLastStep = stepNumber >= totalSteps;
    const nextButtonText = isLastStep ? 'Complete' : 'Next';
    const nextButtonStyle = isLastStep ?
      'padding: 6px 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;' :
      'padding: 6px 12px; background: #ff4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;';

    const errorMessage = hasError ?
      '⚠️ AWS Console failed to load content. Please refresh the page and try again.' :
      '⚠️ Target element not found. Please complete this step manually and click Next to continue.';

    panel.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span style="font-weight: 600; color: #ff4444;">Step ${stepNumber} of ${totalSteps}</span>
        <button id="aws-navigator-general-close" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #666;">×</button>
      </div>
      <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333;">${step.title}</h3>
      <div style="margin: 0 0 12px 0; color: #666;">${step.description}</div>
      <p style="margin: 0 0 12px 0; color: #ff4444; font-size: 12px;">${errorMessage}</p>
      ${hasError ? '<p style="margin: 0 0 12px 0; color: #666; font-size: 12px;">💡 Try refreshing the page or check your network connection.</p>' : ''}
      ${!hasError ? '<p style="margin: 0 0 12px 0; color: #666; font-size: 12px;">💡 Look for the element described above and complete the action manually, then click Next to continue.</p>' : ''}
      <div style="display: flex; gap: 8px;">
        <button id="aws-navigator-general-prev" style="padding: 6px 12px; background: #f0f0f0; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; font-size: 12px;">Previous</button>
        <button id="aws-navigator-general-next" style="${nextButtonStyle}">${nextButtonText}</button>
        <button id="aws-navigator-general-stop" style="padding: 6px 12px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Stop</button>
      </div>
    `;

    document.body.appendChild(panel);

    // Handle clickable links in the description
    const links = panel.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const url = link.href;
        console.log('Navigation link clicked:', url);

        // Send navigation request to background script
        chrome.runtime.sendMessage({
          action: 'navigateToUrl',
          url: url
        }, (response) => {
          if (response && response.success) {
            console.log('Navigation successful');
          } else {
            console.error('Navigation failed:', response);
          }
        });
      });
    });

    // Add event listeners with error handling
    const closeBtn = document.getElementById('aws-navigator-general-close');
    const prevBtn = document.getElementById('aws-navigator-general-prev');
    const nextBtn = document.getElementById('aws-navigator-general-next');
    const stopBtn = document.getElementById('aws-navigator-general-stop');

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        stopVisualGuidance();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          chrome.runtime.sendMessage({ action: 'previousStep' });
        } catch (error) {
          console.error('Error sending previous step message:', error);
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Next button clicked in general guidance panel');

        // Disable button temporarily to prevent double-clicks
        nextBtn.disabled = true;
        nextBtn.textContent = 'Loading...';

        try {
          chrome.runtime.sendMessage({ action: 'nextStep' }, (response) => {
            console.log('Next step response:', response);
            if (chrome.runtime.lastError) {
              console.error('Error in next step:', chrome.runtime.lastError);
              // Re-enable button on error
              nextBtn.disabled = false;
              nextBtn.textContent = isLastStep ? 'Complete' : 'Next';
            } else if (response && response.success) {
              console.log('Step advanced successfully to step:', response.stepNumber);
              // Don't re-enable button - let the new step take over
            } else if (!response || !response.success) {
              console.error('Next step failed:', response);
              // Re-enable button on failure
              nextBtn.disabled = false;
              nextBtn.textContent = isLastStep ? 'Complete' : 'Next';
            } else {
              console.warn('Unexpected response format:', response);
              // Re-enable button on unexpected response
              nextBtn.disabled = false;
              nextBtn.textContent = isLastStep ? 'Complete' : 'Next';
            }
          });

          // Timeout fallback - re-enable button after 3 seconds
          setTimeout(() => {
            if (nextBtn.disabled) {
              console.warn('Next step timeout - re-enabling button');
              nextBtn.disabled = false;
              nextBtn.textContent = isLastStep ? 'Complete' : 'Next';
            }
          }, 3000);

        } catch (error) {
          console.error('Error sending next step message:', error);
          // Re-enable button on error
          nextBtn.disabled = false;
          nextBtn.textContent = isLastStep ? 'Complete' : 'Next';
        }
      });
    }

    if (stopBtn) {
      stopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        stopVisualGuidance();
      });
    }
  } catch (e) {
    console.error('Error creating general guidance panel:', e);
    // Fallback: just stop the guidance
    stopVisualGuidance();
  }
}

// Show workflow completion message
function showWorkflowCompletion(message) {
  try {
    // Remove any existing panels
    stopVisualGuidance();

    const panel = document.createElement('div');
    panel.id = 'aws-navigator-completion-panel';
    panel.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border: 3px solid #28a745;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      max-width: 400px;
      z-index: 1000002;
      font-size: 16px;
      line-height: 1.5;
      text-align: center;
    `;

    panel.innerHTML = `
      <div style="margin-bottom: 16px;">
        <div style="font-size: 48px; color: #28a745; margin-bottom: 16px;">🎉</div>
        <h2 style="margin: 0 0 12px 0; color: #28a745; font-size: 24px;">Workflow Complete!</h2>
        <p style="margin: 0 0 20px 0; color: #666;">${message}</p>
        <p style="margin: 0 0 20px 0; color: #666; font-size: 14px;">You have successfully completed all the steps in your AWS workflow.</p>
      </div>
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button id="aws-navigator-completion-close" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600;">Close</button>
        <button id="aws-navigator-completion-restart" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600;">Start New Workflow</button>
      </div>
    `;

    document.body.appendChild(panel);

    // Add event listeners
    const closeBtn = document.getElementById('aws-navigator-completion-close');
    const restartBtn = document.getElementById('aws-navigator-completion-restart');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        panel.remove();
      });
    }

    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        panel.remove();
        // Open the extension popup to start a new workflow
        chrome.runtime.sendMessage({ action: 'openPopup' });
      });
    }

    // Auto-close after 10 seconds
    setTimeout(() => {
      if (panel.parentNode) {
        panel.remove();
      }
    }, 10000);

  } catch (e) {
    console.error('Error showing workflow completion:', e);
  }
}

// ===== ELEMENT CONTEXT PICKER FUNCTIONALITY =====

// Toggle element picker on/off
function toggleElementPicker() {
  if (elementPicker.isActive) {
    stopElementPicker();
  } else {
    startElementPicker();
  }
}

// Start the element context picker
function startElementPicker() {
  if (elementPicker.isActive) {
    console.log("Element picker is already active");
    return;
  }

  elementPicker.isActive = true;
  console.log("Starting element context picker");

  // Create overlay
  elementPicker.overlay = document.createElement("div");
  Object.assign(elementPicker.overlay.style, {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2147483647,
    pointerEvents: "none"
  });
  document.documentElement.appendChild(elementPicker.overlay);

  // Create highlight element
  elementPicker.highlight = document.createElement("div");
  Object.assign(elementPicker.highlight.style, {
    position: "absolute",
    background: "rgba(0,120,215,0.12)",
    outline: "2px solid rgba(0,120,215,0.9)",
    pointerEvents: "none"
  });
  elementPicker.overlay.appendChild(elementPicker.highlight);

  // Create info panel
  elementPicker.info = document.createElement("div");
  Object.assign(elementPicker.info.style, {
    position: "fixed",
    right: "12px",
    bottom: "12px",
    padding: "8px 10px",
    background: "rgba(0,0,0,0.75)",
    color: "white",
    fontSize: "12px",
    borderRadius: "6px",
    zIndex: 2147483648,
    pointerEvents: "auto"
  });
  elementPicker.info.textContent = "Hover and click to capture element context for LLM. Press ESC to exit.";
  document.body.appendChild(elementPicker.info);

  // Add event listeners
  document.addEventListener("mousemove", handleElementPickerMove, true);
  document.addEventListener("click", handleElementPickerClick, true);
  document.addEventListener("keydown", handleElementPickerKey, true);

  console.log("Element context picker started. Hover and click any element to capture its structured context. Press ESC to stop.");
}

// Stop the element context picker
function stopElementPicker(reason = "User stopped picker") {
  if (!elementPicker.isActive) return;

  elementPicker.isActive = false;

  // Remove event listeners
  document.removeEventListener("mousemove", handleElementPickerMove, true);
  document.removeEventListener("click", handleElementPickerClick, true);
  document.removeEventListener("keydown", handleElementPickerKey, true);

  // Remove DOM elements
  if (elementPicker.overlay) {
    elementPicker.overlay.remove();
    elementPicker.overlay = null;
  }

  if (elementPicker.info) {
    elementPicker.info.remove();
    elementPicker.info = null;
  }

  elementPicker.highlight = null;
  elementPicker.lastElement = null;

  console.log("Element context picker stopped:", reason);
}

// Handle mouse movement for element highlighting
function handleElementPickerMove(e) {
  const el = document.elementFromPoint(e.clientX, e.clientY);

  if (!el || elementPicker.overlay.contains(el) || el === elementPicker.info || el === elementPicker.highlight) {
    elementPicker.highlight.style.width = "0px";
    elementPicker.highlight.style.height = "0px";
    elementPicker.lastElement = null;
    return;
  }

  if (el !== elementPicker.lastElement) {
    elementPicker.lastElement = el;
  }

  const r = el.getBoundingClientRect();
  Object.assign(elementPicker.highlight.style, {
    left: (r.left + window.scrollX) + "px",
    top: (r.top + window.scrollY) + "px",
    width: r.width + "px",
    height: r.height + "px"
  });
}

// Handle click to capture element context
async function handleElementPickerClick(e) {
  e.preventDefault();
  e.stopPropagation();

  const el = document.elementFromPoint(e.clientX, e.clientY);
  if (!el || elementPicker.overlay.contains(el) || el === elementPicker.info || el === elementPicker.highlight) return;

  elementPicker.info.textContent = "Collecting element context...";

  const llmData = collectElementForLLM(el);

  // Store globally for access
  window.__lastPickedElement = llmData;

  console.log("✅ Captured element context (for LLM):", llmData);
  elementPicker.info.textContent = "Captured. Check console (window.__lastPickedElement). Press ESC to exit or click another element.";

  // Send to background script for potential processing
  chrome.runtime.sendMessage({
    action: 'elementCaptured',
    data: llmData
  });
}

// Handle keyboard events
function handleElementPickerKey(e) {
  if (e.key === "Escape") {
    stopElementPicker("User pressed ESC");
  }
}

// Helper functions for element context collection
function visibleText(n) {
  return (n?.innerText || n?.textContent || "").replace(/\s+/g, " ").trim();
}

function isVisible(el) {
  if (!el || el.nodeType !== 1) return false;
  const cs = window.getComputedStyle(el);
  return !(cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0" || (el.offsetWidth === 0 && el.offsetHeight === 0));
}

function nearestHeading(el) {
  const headers = ["H1","H2","H3","H4","H5","H6"];
  let cur = el;
  while (cur) {
    if (headers.includes(cur.tagName) && isVisible(cur)) return visibleText(cur);
    cur = cur.parentElement;
  }
  const p = el.parentElement;
  if (p) {
    const kids = [...p.children], idx = kids.indexOf(el);
    for (let d = 1; d <= Math.max(idx, kids.length - idx - 1); d++) {
      const prev = kids[idx - d], next = kids[idx + d];
      if (prev && headers.includes(prev.tagName) && isVisible(prev)) return visibleText(prev);
      if (next && headers.includes(next.tagName) && isVisible(next)) return visibleText(next);
    }
  }
  return "";
}

function siblingBlocks(el, limit = 400) {
  const isBlock = (t) => /^(DIV|SECTION|ARTICLE|P|LI|MAIN|ASIDE|HEADER|FOOTER|NAV|TD|TH)$/i.test(t);
  let block = el;
  while (block && !isBlock(block.tagName)) block = block.parentElement;
  if (!block) block = el.parentElement;
  if (!block) return { prev: "", next: "" };
  const sibs = [...(block.parentElement?.children || [block])], idx = sibs.indexOf(block);
  const prev = sibs.slice(0, idx).reverse().map(visibleText).filter(Boolean).join(" ").slice(0, limit);
  const next = sibs.slice(idx+1).map(visibleText).filter(Boolean).join(" ").slice(0, limit);
  return { prev, next };
}

function ancestorText(el) {
  const out = []; let cur = el.parentElement; let depth = 0;
  while (cur && depth < 3) {
    const t = visibleText(cur);
    if (t) out.push(t.slice(0,120));
    cur = cur.parentElement;
    depth++;
  }
  return out.join(" — ");
}

function cssPath(el) {
  if (!el) return "";
  const parts = [];
  for (let cur = el; cur && cur.tagName !== "HTML"; cur = cur.parentElement) {
    let part = cur.tagName.toLowerCase();
    if (cur.id) {
      part += "#" + cur.id;
      parts.unshift(part);
      break;
    }
    const p = cur.parentElement;
    if (p) {
      const same = [...p.children].filter(c => c.tagName === cur.tagName);
      if (same.length > 1) {
        const idx = [...p.children].indexOf(cur) + 1;
        part += `:nth-child(${idx})`;
      }
    }
    parts.unshift(part);
  }
  return parts.join(" > ");
}

// Main collector function
function collectElementForLLM(el) {
  const data = {
    page: {
      title: document.title,
      url: window.location.href,
      capturedAt: new Date().toISOString()
    },
    element: {
      text: visibleText(el) || null,
      htmlSnippet: (el.outerHTML || "").trim().slice(0, 2000),
      cssPath: cssPath(el),
      tagName: el.tagName,
      id: el.id || null,
      classList: [...(el.classList || [])]
    },
    context: {
      nearestHeading: nearestHeading(el) || null,
      previousBlock: siblingBlocks(el).prev || null,
      nextBlock: siblingBlocks(el).next || null,
      ancestorSummary: ancestorText(el) || null
    }
  };
  return data;
}

// Global function to activate element picker
window.pick = function() {
  console.log('🎯 Activating element picker via pick() function');
  toggleElementPicker();
};

// Also add it to the global scope for easy access
window.__toggleElementPicker = toggleElementPicker;

// Debug: Log that the extension has loaded and functions are available
console.log('🚀 AWS Console Navigator with Element Picker loaded!');
console.log('📝 Available functions: pick(), __toggleElementPicker()');
console.log('⌨️  Keyboard shortcut: Command+E (Mac) or Ctrl+E (Windows/Linux)');

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  stopVisualGuidance();
  stopElementPicker("Page unload");
});
