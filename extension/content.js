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
  console.log('Updating to step:', step.title);

  visualGuidance.currentStep = step;
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
  if (!visualGuidance.overlay) {
    createOverlay();
  }

  // Clear existing cues
  if (visualGuidance.cue) {
    visualGuidance.cue.remove();
  }

  // Find target element
  const targetElement = findTargetElement(step.selector);

  if (targetElement) {
    // Create visual cue
    createVisualCue(targetElement, step, stepNumber, totalSteps);
  } else {
    // Show general guidance if element not found
    showGeneralGuidance(step, stepNumber, totalSteps);
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
  console.log('🔍 DEBUG: Analyzing page structure...');

  // Get all elements with text content
  const elementsWithText = Array.from(document.querySelectorAll('*')).filter(el =>
    el.textContent && el.textContent.trim().length > 0
  );

  console.log(`📊 Elements with text content: ${elementsWithText.length}`);

  // Look for elements that might contain our target
  const potentialMatches = elementsWithText.filter(el => {
    const text = el.textContent.trim().toLowerCase();
    return text.includes('launch') || text.includes('instance') || text.includes('ec2');
  });

  console.log('🎯 Potential matches found:');
  potentialMatches.slice(0, 10).forEach((el, i) => {
    console.log(`${i + 1}. ${el.tagName} - "${el.textContent.trim()}" - Classes: ${el.className}`);
  });

  // Look for elements with data-analytics attributes
  const analyticsElements = Array.from(document.querySelectorAll('[data-analytics]'));
  console.log(`📈 Elements with data-analytics: ${analyticsElements.length}`);
  analyticsElements.slice(0, 5).forEach((el, i) => {
    console.log(`${i + 1}. ${el.tagName} - data-analytics="${el.getAttribute('data-analytics')}" - Text: "${el.textContent.trim()}"`);
  });

  // Look for AWS UI elements
  const awsElements = Array.from(document.querySelectorAll('[class*="awsui"]'));
  console.log(`☁️ AWS UI elements: ${awsElements.length}`);
  awsElements.slice(0, 5).forEach((el, i) => {
    console.log(`${i + 1}. ${el.tagName} - Classes: ${el.className} - Text: "${el.textContent.trim()}"`);
  });
}

// Check if element is visible
function isElementVisible(element) {
  try {
    if (!element || !element.getBoundingClientRect) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 &&
           rect.top >= 0 && rect.left >= 0 &&
           rect.bottom <= window.innerHeight && rect.right <= window.innerWidth;
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

    // Create cue element
    const cue = document.createElement('div');
    cue.id = 'aws-navigator-cue';
    cue.style.cssText = `
      position: absolute;
      left: ${rect.left - 20}px;
      top: ${rect.top - 20}px;
      width: ${rect.width + 40}px;
      height: ${rect.height + 40}px;
      border: 3px solid #ff4444;
      border-radius: 8px;
      background: rgba(255, 68, 68, 0.1);
      pointer-events: none;
      animation: pulse 2s infinite;
      z-index: 1000000;
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
  try {
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
      max-width: 300px;
      z-index: 1000001;
      font-size: 14px;
      line-height: 1.4;
    `;

    const errorMessage = hasError ?
      '⚠️ AWS Console failed to load content. Please refresh the page and try again.' :
      '⚠️ Target element not found. Please navigate manually.';

    panel.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span style="font-weight: 600; color: #ff4444;">Step ${stepNumber} of ${totalSteps}</span>
        <button id="aws-navigator-general-close" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #666;">×</button>
      </div>
      <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333;">${step.title}</h3>
      <div style="margin: 0 0 12px 0; color: #666;">${step.description}</div>
      <p style="margin: 0 0 12px 0; color: #ff4444; font-size: 12px;">${errorMessage}</p>
      ${hasError ? '<p style="margin: 0 0 12px 0; color: #666; font-size: 12px;">💡 Try refreshing the page or check your network connection.</p>' : ''}
      <div style="display: flex; gap: 8px;">
        <button id="aws-navigator-general-prev" style="padding: 6px 12px; background: #f0f0f0; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; font-size: 12px;">Previous</button>
        <button id="aws-navigator-general-next" style="padding: 6px 12px; background: #ff4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Next</button>
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
    console.error('Error creating general guidance panel:', e);
    // Fallback: just stop the guidance
    stopVisualGuidance();
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

// Helper functions from inject.js
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

// Global function to activate element picker (same as Command+E)
window.pick = function() {
  console.log('🎯 Activating element picker via pick() function');
  toggleElementPicker();
};

// Also add it to the global scope for easy access
window.__toggleElementPicker = toggleElementPicker;

// Debug: Log that the extension has loaded and functions are available
console.log('🚀 Universal Element Context Picker loaded!');
console.log('📝 Available functions: pick(), __toggleElementPicker()');
console.log('⌨️  Keyboard shortcut: Command+E (Mac) or Ctrl+E (Windows/Linux)');

// Fallback: Also add the function to document for extra safety
document.pick = window.pick;

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  stopVisualGuidance();
  stopElementPicker("Page unload");
});
