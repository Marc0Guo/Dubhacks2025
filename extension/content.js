// AWS Console Navigator Content Script
console.log('AWS Console Navigator content script loaded');

let visualGuidance = {
  isActive: false,
  currentStep: null,
  overlay: null,
  cue: null
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
      
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

// Start visual guidance
function startVisualGuidance(workflow, step) {
  console.log('Starting visual guidance for workflow:', workflow.name);
  
  visualGuidance.isActive = true;
  visualGuidance.currentStep = step;
  
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

// Find target element on the page
function findTargetElement(selector) {
  if (!selector) {
    console.warn('No selector provided');
    return null;
  }

  // Try different selector strategies
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
        const cleanSelector = selector.replace(/^\[data-testid="/, '').replace(/"\]$/, '');
        return document.querySelector(`[data-testid="${cleanSelector}"]`);
      } catch (e) {
        console.warn('Data-testid selector failed:', e);
        return null;
      }
    },
    () => {
      try {
        const cleanSelector = selector.replace(/^\[data-testid="/, '').replace(/"\]$/, '');
        return document.querySelector(`[aria-label*="${cleanSelector}"]`);
      } catch (e) {
        console.warn('Aria-label selector failed:', e);
        return null;
      }
    },
    () => {
      try {
        const cleanSelector = selector.replace(/^\[data-testid="/, '').replace(/"\]$/, '');
        return document.querySelector(`[title*="${cleanSelector}"]`);
      } catch (e) {
        console.warn('Title selector failed:', e);
        return null;
      }
    },
    () => {
      try {
        const cleanSelector = selector.replace(/^\[data-testid="/, '').replace(/"\]$/, '');
        return Array.from(document.querySelectorAll('*')).find(el => 
          el.textContent && el.textContent.toLowerCase().includes(cleanSelector.toLowerCase())
        );
      } catch (e) {
        console.warn('Text content search failed:', e);
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
  return null;
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
      <p style="margin: 0 0 12px 0; color: #666;">${step.description}</p>
      <div style="display: flex; gap: 8px;">
        <button id="aws-navigator-prev" style="padding: 6px 12px; background: #f0f0f0; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; font-size: 12px;">Previous</button>
        <button id="aws-navigator-next" style="padding: 6px 12px; background: #ff4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Next</button>
        <button id="aws-navigator-stop" style="padding: 6px 12px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Stop</button>
      </div>
    `;
    
    visualGuidance.overlay.appendChild(panel);
    
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
    
    panel.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span style="font-weight: 600; color: #ff4444;">Step ${stepNumber} of ${totalSteps}</span>
        <button id="aws-navigator-general-close" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #666;">×</button>
      </div>
      <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333;">${step.title}</h3>
      <p style="margin: 0 0 12px 0; color: #666;">${step.description}</p>
      <p style="margin: 0 0 12px 0; color: #ff4444; font-size: 12px;">⚠️ Target element not found. Please navigate manually.</p>
      <div style="display: flex; gap: 8px;">
        <button id="aws-navigator-general-prev" style="padding: 6px 12px; background: #f0f0f0; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; font-size: 12px;">Previous</button>
        <button id="aws-navigator-general-next" style="padding: 6px 12px; background: #ff4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Next</button>
        <button id="aws-navigator-general-stop" style="padding: 6px 12px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Stop</button>
      </div>
    `;
    
    document.body.appendChild(panel);
    
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

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  stopVisualGuidance();
});
