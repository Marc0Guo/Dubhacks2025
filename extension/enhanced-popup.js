// Enhanced popup with dual backend support
import DualAPI from "./dual-api.js";

class EnhancedPopup {
  constructor() {
    this.api = new DualAPI();
    this.init();
  }

  async init() {
    // Check which backends are available
    const status = await this.api.checkAvailability();
    this.updateStatusDisplay(status);

    // Set up event listeners
    this.setupEventListeners();
  }

  updateStatusDisplay(status) {
    const statusDiv = document.getElementById("backend-status");
    if (!statusDiv) return;

    let statusHTML = "<h4>Backend Status:</h4>";

    if (status.nodeBackend) {
      statusHTML +=
        '<div class="status-item">✅ Node.js Backend (AWS Guidance)</div>';
    } else {
      statusHTML +=
        '<div class="status-item">❌ Node.js Backend (Offline)</div>';
    }

    if (status.pythonAgent) {
      statusHTML +=
        '<div class="status-item">✅ Python Agent (AI Analysis)</div>';
    } else {
      statusHTML += '<div class="status-item">❌ Python Agent (Offline)</div>';
    }

    statusDiv.innerHTML = statusHTML;
  }

  setupEventListeners() {
    // AI Chat button
    const aiChatBtn = document.getElementById("ai-chat-btn");
    if (aiChatBtn) {
      aiChatBtn.addEventListener("click", () => this.openAIChat());
    }

    // Enhanced element analysis button
    const enhancedBtn = document.getElementById("enhanced-analysis-btn");
    if (enhancedBtn) {
      enhancedBtn.addEventListener("click", () => this.startEnhancedAnalysis());
    }

    // System status button
    const statusBtn = document.getElementById("status-btn");
    if (statusBtn) {
      statusBtn.addEventListener("click", () => this.checkSystemStatus());
    }
  }

  async openAIChat() {
    const question = prompt("Ask the AI agent anything:");
    if (!question) return;

    try {
      const response = await this.api.getAIConversation(question);
      this.showAIChatModal(question, response.reply);
    } catch (error) {
      this.showError("AI Chat failed: " + error.message);
    }
  }

  async startEnhancedAnalysis() {
    try {
      // This would typically be triggered by user interaction
      // For demo purposes, we'll simulate an element
      const mockElement = {
        tagName: "button",
        id: "create-function",
        className: "btn btn-primary",
        textContent: "Create Function",
        attributes: {
          type: "button",
          onclick: "createFunction()",
        },
      };

      const analysis = await this.api.analyzeElement(mockElement, true);
      this.showAnalysisModal(analysis);
    } catch (error) {
      this.showError("Enhanced analysis failed: " + error.message);
    }
  }

  async checkSystemStatus() {
    const status = await this.api.checkAvailability();
    this.updateStatusDisplay(status);

    // Show detailed status
    let message = "System Status:\n";
    message += `Node.js Backend: ${
      status.nodeBackend ? "Online" : "Offline"
    }\n`;
    message += `Python Agent: ${status.pythonAgent ? "Online" : "Offline"}`;

    alert(message);
  }

  showAIChatModal(question, answer) {
    const modal = document.createElement("div");
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    modal.innerHTML = `
      <div style="
        background: white;
        padding: 20px;
        border-radius: 8px;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
      ">
        <h3>AI Chat Response</h3>
        <p><strong>Question:</strong> ${question}</p>
        <p><strong>Answer:</strong> ${answer}</p>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: #007bff;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        ">Close</button>
      </div>
    `;

    document.body.appendChild(modal);
  }

  showAnalysisModal(analysis) {
    const modal = document.createElement("div");
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const data = analysis.data;
    modal.innerHTML = `
      <div style="
        background: white;
        padding: 20px;
        border-radius: 8px;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
      ">
        <h3>Element Analysis (${analysis.source})</h3>
        <p><strong>Type:</strong> ${analysis.type}</p>
        ${
          data.explanation
            ? `
          <p><strong>Explanation:</strong> ${data.explanation}</p>
        `
            : `
          <p><strong>Title:</strong> ${data.title || "N/A"}</p>
          <p><strong>What:</strong> ${data.what || "N/A"}</p>
          <p><strong>Why:</strong> ${data.why || "N/A"}</p>
          <p><strong>Pitfalls:</strong> ${data.pitfalls || "N/A"}</p>
        `
        }
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: #007bff;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        ">Close</button>
      </div>
    `;

    document.body.appendChild(modal);
  }

  showError(message) {
    alert("Error: " + message);
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new EnhancedPopup();
});
