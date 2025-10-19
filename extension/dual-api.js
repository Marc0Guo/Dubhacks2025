// Dual API Integration for AWS Tutor Extension
// Uses both Node.js backend (general guidance) and Python Bedrock Agent (advanced analysis)

const NODE_BACKEND = "https://api.thishurtyougave.select"; // Your current backend
const PYTHON_AGENT = "http://localhost:5000"; // Local Python agent

/**
 * Enhanced API that can use both backends
 */
export class DualAPI {
  /**
   * Get general AWS guidance (Node.js backend)
   */
  async getAWSGuidance(goal, service = "bedrock") {
    try {
      const response = await fetch(`${NODE_BACKEND}/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service, goal }),
      });
      return await response.json();
    } catch (error) {
      console.error("Node.js backend error:", error);
      return { error: "Guidance service unavailable" };
    }
  }

  /**
   * Get advanced element analysis (Python Bedrock Agent)
   */
  async getAdvancedElementAnalysis(element) {
    try {
      const response = await fetch(`${PYTHON_AGENT}/explain-element`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ element }),
      });
      return await response.json();
    } catch (error) {
      console.error("Python agent error:", error);
      return { error: "Advanced analysis unavailable" };
    }
  }

  /**
   * Get AI conversation (Python Bedrock Agent)
   */
  async getAIConversation(message) {
    try {
      const response = await fetch(`${PYTHON_AGENT}/agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      return await response.json();
    } catch (error) {
      console.error("AI conversation error:", error);
      return { error: "AI conversation unavailable" };
    }
  }

  /**
   * Smart element analysis - tries both backends
   */
  async analyzeElement(element, useAdvanced = true) {
    // First try advanced analysis from Python agent
    if (useAdvanced) {
      try {
        const advanced = await this.getAdvancedElementAnalysis(element);
        if (advanced.success) {
          return {
            source: "python-agent",
            type: "advanced",
            data: advanced,
          };
        }
      } catch (error) {
        console.warn("Advanced analysis failed, falling back to basic:", error);
      }
    }

    // Fallback to basic analysis from Node.js backend
    try {
      const basic = await fetch(`${NODE_BACKEND}/explain-element`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: "bedrock",
          element: {
            type: element.tagName?.toLowerCase(),
            label: element.textContent || element.id,
          },
        }),
      });
      const basicData = await basic.json();
      return {
        source: "node-backend",
        type: "basic",
        data: basicData,
      };
    } catch (error) {
      console.error("Both analyses failed:", error);
      return {
        source: "fallback",
        type: "static",
        data: {
          title: "Element Analysis",
          what: "This is a web element in the AWS Console",
          why: "It helps you interact with AWS services",
          pitfalls: "Be careful with destructive actions",
        },
      };
    }
  }

  /**
   * Check which services are available
   */
  async checkAvailability() {
    const status = {
      nodeBackend: false,
      pythonAgent: false,
    };

    try {
      const response = await fetch(`${NODE_BACKEND}/health`);
      status.nodeBackend = response.ok;
    } catch (error) {
      console.warn("Node.js backend unavailable");
    }

    try {
      const response = await fetch(`${PYTHON_AGENT}/health`);
      status.pythonAgent = response.ok;
    } catch (error) {
      console.warn("Python agent unavailable");
    }

    return status;
  }
}

/**
 * Usage examples for your Chrome extension
 */
export const DualAPIExamples = {
  // Example 1: Basic element hover
  async onElementHover(element) {
    const api = new DualAPI();
    const analysis = await api.analyzeElement(element);

    if (analysis.source === "python-agent") {
      // Show advanced tooltip
      this.showAdvancedTooltip(element, analysis.data.explanation);
    } else {
      // Show basic tooltip
      this.showBasicTooltip(element, analysis.data);
    }
  },

  // Example 2: AI conversation in popup
  async askAI(question) {
    const api = new DualAPI();
    const response = await api.getAIConversation(question);
    return response.reply || "AI conversation unavailable";
  },

  // Example 3: Get AWS guidance
  async getGuidance(goal) {
    const api = new DualAPI();
    return await api.getAWSGuidance(goal);
  },

  // Example 4: Check what's available
  async getSystemStatus() {
    const api = new DualAPI();
    return await api.checkAvailability();
  },
};

// Export the main class
export default DualAPI;
