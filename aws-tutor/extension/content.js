// AWS Tutor Content Script - Integrated AI Assistant
console.log("AWS Tutor content script loaded");

let awsTutor = {
  isActive: false,
  currentMode: null,
  currentService: null,
  tooltip: null,
  sidebar: null,
  overlay: null,
  cue: null,
  apiBaseUrl: "http://localhost:3001",
};

// Initialize AWS Tutor
function init() {
  createSidebar();
  setupSidebarEvents();
  setupEventListeners();
  injectStyles();
  console.log("AWS Tutor initialized");
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Content script received message:", request);

  switch (request.action) {
    case "startExplainMode":
      startExplainMode(request.input, request.service);
      sendResponse({ success: true });
      break;

    case "startDoMode":
      startDoMode(request.plan, request.service);
      sendResponse({ success: true });
      break;

    case "startErrorMode":
      startErrorMode(request.diagnosis, request.service);
      sendResponse({ success: true });
      break;

    case "startBasicGuidance":
      startBasicGuidance(request.input, request.service);
      sendResponse({ success: true });
      break;

    case "startBasicErrorHelp":
      startBasicErrorHelp(request.input, request.service);
      sendResponse({ success: true });
      break;

    default:
      sendResponse({ success: false, error: "Unknown action" });
  }

  return true;
});

// Start Explain Mode
function startExplainMode(input, service) {
  console.log("Starting Explain Mode for:", input);
  awsTutor.isActive = true;
  awsTutor.currentMode = "explain";
  awsTutor.currentService = service;

  // Show sidebar with explanation
  showSidebar();
  updateSidebarContent("explain", input);

  // Enable hover explanations
  enableHoverExplanations();
}

// Start Do Mode
function startDoMode(plan, service) {
  console.log("Starting Do Mode with plan:", plan);
  awsTutor.isActive = true;
  awsTutor.currentMode = "do";
  awsTutor.currentService = service;

  // Show sidebar with plan
  showSidebar();
  updateSidebarContent("do", plan);

  // Enable visual guidance
  enableVisualGuidance(plan);
}

// Start Error Mode
function startErrorMode(diagnosis, service) {
  console.log("Starting Error Mode with diagnosis:", diagnosis);
  awsTutor.isActive = true;
  awsTutor.currentMode = "error";
  awsTutor.currentService = service;

  // Show sidebar with diagnosis
  showSidebar();
  updateSidebarContent("error", diagnosis);

  // Highlight error elements if any
  highlightErrorElements(diagnosis);
}

// Start Basic Guidance (fallback)
function startBasicGuidance(input, service) {
  console.log("Starting Basic Guidance for:", input);
  awsTutor.isActive = true;
  awsTutor.currentMode = "do";
  awsTutor.currentService = service;

  // Show sidebar with basic guidance
  showSidebar();
  updateSidebarContent("basic", input);
}

// Start Basic Error Help (fallback)
function startBasicErrorHelp(input, service) {
  console.log("Starting Basic Error Help for:", input);
  awsTutor.isActive = true;
  awsTutor.currentMode = "error";
  awsTutor.currentService = service;

  // Show sidebar with basic error help
  showSidebar();
  updateSidebarContent("basic-error", input);
}

// Create sidebar
function createSidebar() {
  if (awsTutor.sidebar) return;

  const sidebar = document.createElement("div");
  sidebar.id = "aws-tutor-sidebar";
  sidebar.className = "aws-tutor-sidebar";
  sidebar.innerHTML = `
    <div class="aws-tutor-header">
      <h3>AWS Tutor</h3>
      <button id="aws-tutor-close" class="aws-tutor-close">×</button>
    </div>
    <div class="aws-tutor-content" id="aws-tutor-content">
      <p>Welcome to AWS Tutor! Choose a mode from the popup to get started.</p>
    </div>
    <div class="aws-tutor-footer">
      <button id="aws-tutor-toggle" class="aws-tutor-toggle">Toggle Sidebar</button>
    </div>
  `;

  document.body.appendChild(sidebar);
  awsTutor.sidebar = sidebar;
}

// Setup sidebar events
function setupSidebarEvents() {
  const closeBtn = document.getElementById("aws-tutor-close");
  const toggleBtn = document.getElementById("aws-tutor-toggle");

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      hideSidebar();
    });
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      toggleSidebar();
    });
  }
}

// Show sidebar
function showSidebar() {
  if (awsTutor.sidebar) {
    awsTutor.sidebar.classList.add("open");
  }
}

// Hide sidebar
function hideSidebar() {
  if (awsTutor.sidebar) {
    awsTutor.sidebar.classList.remove("open");
  }
}

// Toggle sidebar
function toggleSidebar() {
  if (awsTutor.sidebar) {
    awsTutor.sidebar.classList.toggle("open");
  }
}

// Update sidebar content
function updateSidebarContent(mode, content) {
  const contentDiv = document.getElementById("aws-tutor-content");
  if (!contentDiv) return;

  if (mode === "explain") {
    contentDiv.innerHTML = `
      <div class="aws-tutor-mode">🧠 Explain Mode</div>
      <h4>Understanding: ${content}</h4>
      <p>Hover over elements in the AWS Console to get explanations!</p>
      <div class="aws-tutor-status">Ready to explain</div>
    `;
  } else if (mode === "do") {
    if (content.checklist) {
      contentDiv.innerHTML = `
        <div class="aws-tutor-mode">🎯 Do Mode</div>
        <h4>${content.summary}</h4>
        <div class="aws-tutor-checklist">
          ${content.checklist
            .map(
              (item, index) => `
            <div class="aws-tutor-step">
              <span class="step-number">${index + 1}</span>
              <div class="step-content">
                <div class="step-ui">${item.ui}</div>
                <div class="step-why">${item.why}</div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
        <div class="aws-tutor-notes">
          <strong>Cost Note:</strong> ${
            content.cost_note || "Monitor your usage"
          }
        </div>
      `;
    } else {
      contentDiv.innerHTML = `
        <div class="aws-tutor-mode">🎯 Do Mode</div>
        <h4>Building: ${content}</h4>
        <p>Follow the visual cues to complete your task!</p>
        <div class="aws-tutor-status">Ready to guide</div>
      `;
    }
  } else if (mode === "error") {
    if (content.title) {
      contentDiv.innerHTML = `
        <div class="aws-tutor-mode">🔧 Error Whisperer</div>
        <h4>${content.title}</h4>
        <div class="aws-tutor-error-diagnosis">
          <div class="error-cause">
            <strong>Cause:</strong> ${content.cause}
          </div>
          <div class="error-solution">
            <strong>Solution:</strong> ${content.solution}
          </div>
          <div class="error-prevention">
            <strong>Prevention:</strong> ${content.prevention}
          </div>
        </div>
      `;
    } else {
      contentDiv.innerHTML = `
        <div class="aws-tutor-mode">🔧 Error Whisperer</div>
        <h4>Error: ${content}</h4>
        <p>Analyzing your error...</p>
        <div class="aws-tutor-status">Diagnosing</div>
      `;
    }
  } else if (mode === "basic") {
    contentDiv.innerHTML = `
      <div class="aws-tutor-mode">🎯 Basic Guidance</div>
      <h4>Goal: ${content}</h4>
      <p>Basic guidance mode activated. Look for visual cues on the page.</p>
      <div class="aws-tutor-status">Guiding</div>
    `;
  } else if (mode === "basic-error") {
    contentDiv.innerHTML = `
      <div class="aws-tutor-mode">🔧 Basic Error Help</div>
      <h4>Error: ${content}</h4>
      <p>Basic error help mode activated. Check the console for common solutions.</p>
      <div class="aws-tutor-status">Helping</div>
    `;
  }
}

// Enable hover explanations
function enableHoverExplanations() {
  document.addEventListener("mouseover", handleHover);
  document.addEventListener("mouseout", handleMouseOut);
}

// Handle hover events
function handleHover(e) {
  if (!awsTutor.isActive || awsTutor.currentMode !== "explain") return;

  const element = identifyElement(e.target);
  if (element) {
    showTooltip(e, element);
  }
}

// Handle mouse out
function handleMouseOut(e) {
  hideTooltip();
}

// Identify element type
function identifyElement(target) {
  // Bedrock-specific elements
  if (awsTutor.currentService === "bedrock") {
    return identifyBedrockElement(target);
  }

  // General AWS elements
  return identifyGeneralElement(target);
}

// Identify Bedrock elements
function identifyBedrockElement(target) {
  const selectors = [
    '[data-testid*="temperature"]',
    '[data-testid*="max_tokens"]',
    '[data-testid*="model"]',
    'button[aria-label*="invoke"]',
    'textarea[placeholder*="prompt"]',
    'textarea[placeholder*="message"]',
  ];

  for (const selector of selectors) {
    const element = target.closest(selector);
    if (element) {
      return {
        css: selector,
        outer_html: element.outerHTML,
        text: element.textContent,
        type: getElementType(selector),
        selector: selector,
        value: element.value || element.textContent || "",
        context: getElementContext(element),
      };
    }
  }
  return null;
}

// Identify general AWS elements
function identifyGeneralElement(target) {
  // Look for common AWS UI patterns
  const patterns = [
    { selector: 'button[class*="awsui_button"]', type: "button" },
    { selector: 'a[class*="awsui_link"]', type: "link" },
    { selector: 'input[type="text"]', type: "input" },
    { selector: "select", type: "select" },
    { selector: "textarea", type: "textarea" },
  ];

  for (const pattern of patterns) {
    const element = target.closest(pattern.selector);
    if (element) {
      return {
        css: pattern.selector,
        outer_html: element.outerHTML,
        text: element.textContent,
        type: pattern.type,
        selector: pattern.selector,
        value: element.value || element.textContent || "",
        context: getElementContext(element),
      };
    }
  }
  return null;
}

// Get element type
function getElementType(selector) {
  if (selector.includes("temperature")) return "temperature";
  if (selector.includes("max_tokens")) return "max_tokens";
  if (selector.includes("model")) return "model";
  if (selector.includes("invoke")) return "invoke_button";
  if (selector.includes("prompt") || selector.includes("message"))
    return "prompt";
  return "unknown";
}

// Get element context
function getElementContext(element) {
  const parent = element.parentElement;
  if (parent) {
    return parent.textContent.substring(0, 100);
  }
  return "";
}

// Show tooltip
function showTooltip(event, element) {
  hideTooltip();

  const tooltip = document.createElement("div");
  tooltip.id = "aws-tutor-tooltip";
  tooltip.className = "aws-tutor-tooltip";
  tooltip.innerHTML = `
    <div class="tooltip-content">
      <div class="tooltip-title">${element.type}</div>
      <div class="tooltip-text">Loading explanation...</div>
    </div>
  `;

  document.body.appendChild(tooltip);
  awsTutor.tooltip = tooltip;

  // Position tooltip
  positionTooltip(event, tooltip);

  // Get explanation from backend
  getExplanation(element);
}

// Hide tooltip
function hideTooltip() {
  if (awsTutor.tooltip) {
    awsTutor.tooltip.remove();
    awsTutor.tooltip = null;
  }
}

// Position tooltip
function positionTooltip(event, tooltip) {
  const rect = tooltip.getBoundingClientRect();
  const x = event.clientX + 10;
  const y = event.clientY - rect.height - 10;

  tooltip.style.left = `${Math.min(x, window.innerWidth - rect.width - 10)}px`;
  tooltip.style.top = `${Math.max(y, 10)}px`;
}

// Get explanation from backend
async function getExplanation(element) {
  try {
    const response = await fetch(`${awsTutor.apiBaseUrl}/explain-element`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service: awsTutor.currentService,
        element: element,
        url: window.location.href,
      }),
    });

    if (response.ok) {
      const explanation = await response.json();
      updateTooltip(explanation);
    } else {
      updateTooltip({
        title: element.type,
        what: `This is a ${element.type} element`,
        why: "It's part of the AWS Console interface",
        pitfalls: "Be careful with the values you set",
      });
    }
  } catch (error) {
    console.error("Error getting explanation:", error);
    updateTooltip({
      title: element.type,
      what: `This is a ${element.type} element`,
      why: "It's part of the AWS Console interface",
      pitfalls: "Be careful with the values you set",
    });
  }
}

// Update tooltip content
function updateTooltip(explanation) {
  if (!awsTutor.tooltip) return;

  const tooltipText = awsTutor.tooltip.querySelector(".tooltip-text");
  if (tooltipText) {
    tooltipText.innerHTML = `
      <div class="explanation-what"><strong>What:</strong> ${explanation.what}</div>
      <div class="explanation-why"><strong>Why:</strong> ${explanation.why}</div>
      <div class="explanation-pitfalls"><strong>Pitfalls:</strong> ${explanation.pitfalls}</div>
    `;
  }
}

// Enable visual guidance
function enableVisualGuidance(plan) {
  if (!plan || !plan.checklist) return;

  // Create visual cues for each step
  plan.checklist.forEach((step, index) => {
    setTimeout(() => {
      createVisualCue(step, index + 1, plan.checklist.length);
    }, index * 1000);
  });
}

// Create visual cue
function createVisualCue(step, stepNumber, totalSteps) {
  // This would integrate with the visual guidance system from the original extension
  console.log(`Creating visual cue for step ${stepNumber}: ${step.ui}`);
}

// Highlight error elements
function highlightErrorElements(diagnosis) {
  // This would highlight elements related to the error
  console.log("Highlighting error elements:", diagnosis);
}

// Setup event listeners
function setupEventListeners() {
  // Additional event listeners can be added here
}

// Inject styles
function injectStyles() {
  if (document.getElementById("aws-tutor-styles")) return;

  const style = document.createElement("style");
  style.id = "aws-tutor-styles";
  style.textContent = `
    .aws-tutor-sidebar {
      position: fixed;
      top: 0;
      right: -400px;
      width: 400px;
      height: 100vh;
      background: white;
      border-left: 2px solid #4f46e5;
      box-shadow: -2px 0 10px rgba(0,0,0,0.1);
      z-index: 10000;
      transition: right 0.3s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .aws-tutor-sidebar.open {
      right: 0;
    }
    
    .aws-tutor-header {
      padding: 20px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .aws-tutor-header h3 {
      margin: 0;
      color: #4f46e5;
    }
    
    .aws-tutor-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #6b7280;
    }
    
    .aws-tutor-content {
      padding: 20px;
      height: calc(100vh - 120px);
      overflow-y: auto;
    }
    
    .aws-tutor-footer {
      padding: 20px;
      border-top: 1px solid #e5e7eb;
    }
    
    .aws-tutor-toggle {
      width: 100%;
      padding: 10px;
      background: #4f46e5;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    
    .aws-tutor-mode {
      font-weight: 600;
      color: #4f46e5;
      margin-bottom: 10px;
    }
    
    .aws-tutor-checklist {
      margin: 20px 0;
    }
    
    .aws-tutor-step {
      display: flex;
      margin-bottom: 15px;
      padding: 10px;
      background: #f9fafb;
      border-radius: 6px;
    }
    
    .step-number {
      background: #4f46e5;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      margin-right: 10px;
      flex-shrink: 0;
    }
    
    .step-content {
      flex: 1;
    }
    
    .step-ui {
      font-weight: 600;
      margin-bottom: 5px;
    }
    
    .step-why {
      font-size: 14px;
      color: #6b7280;
    }
    
    .aws-tutor-tooltip {
      position: absolute;
      background: white;
      border: 2px solid #4f46e5;
      border-radius: 8px;
      padding: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10001;
      max-width: 300px;
      font-size: 14px;
    }
    
    .tooltip-title {
      font-weight: 600;
      color: #4f46e5;
      margin-bottom: 8px;
    }
    
    .explanation-what,
    .explanation-why,
    .explanation-pitfalls {
      margin-bottom: 6px;
    }
    
    .aws-tutor-status {
      padding: 8px 12px;
      background: #d1fae5;
      color: #065f46;
      border-radius: 6px;
      font-size: 14px;
      margin-top: 10px;
    }
  `;

  document.head.appendChild(style);
}

// Initialize when page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// Show sidebar toggle button
const toggleButton = document.createElement("button");
toggleButton.innerHTML = "🧠 AWS Tutor";
toggleButton.style.cssText = `
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #4f46e5;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  z-index: 10000;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
`;
toggleButton.addEventListener("click", () => {
  toggleSidebar();
});
document.body.appendChild(toggleButton);
