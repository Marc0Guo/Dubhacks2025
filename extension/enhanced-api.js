// Enhanced API Integration for AWS Tutor Extension
// Uses both Node.js backend (AWS guidance) and Python Bedrock Agent (AI features)

// Configuration - these will be set by the extension
const NODE_BACKEND = "https://api.thishurtyougave.select"; // Production backend
const PYTHON_AGENT = "http://localhost:5001"; // Local Python agent

/**
 * Smart API that intelligently uses both backends
 */
export class EnhancedAPI {
  constructor() {
    this.nodeBackendAvailable = false;
    this.pythonAgentAvailable = false;
    this.checkAvailability();
  }

  /**
   * Check which backends are available
   */
  async checkAvailability() {
    try {
      // Check Node.js backend (your current system)
      const nodeResponse = await fetch(`${NODE_BACKEND}/health`, {
        method: "GET",
        timeout: 5000,
      });
      this.nodeBackendAvailable = nodeResponse.ok;
    } catch (error) {
      console.warn("Node.js backend unavailable:", error);
    }

    try {
      // Check Python Bedrock Agent
      const pythonResponse = await fetch(`${PYTHON_AGENT}/health`, {
        method: "GET",
        timeout: 5000,
      });
      this.pythonAgentAvailable = pythonResponse.ok;
    } catch (error) {
      console.warn("Python agent unavailable:", error);
    }

    console.log("Backend availability:", {
      nodeBackend: this.nodeBackendAvailable,
      pythonAgent: this.pythonAgentAvailable,
    });
  }

  /**
   * Get AWS guidance (Node.js backend)
   */
  async getAWSGuidance(goal, service = "bedrock") {
    if (!this.nodeBackendAvailable) {
      throw new Error("AWS guidance service unavailable");
    }

    try {
      const response = await fetch(`${NODE_BACKEND}/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service, goal }),
      });
      return await response.json();
    } catch (error) {
      console.error("AWS guidance error:", error);
      throw error;
    }
  }

  /**
   * Get AI conversation (Python Bedrock Agent)
   */
  async getAIConversation(message) {
    if (!this.pythonAgentAvailable) {
      throw new Error("AI conversation service unavailable");
    }

    try {
      const response = await fetch(`${PYTHON_AGENT}/agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      return data.reply || "AI conversation unavailable";
    } catch (error) {
      console.error("AI conversation error:", error);
      throw error;
    }
  }

  /**
   * Smart element analysis - tries both backends
   */
  async analyzeElement(element, preferAdvanced = true) {
    // Try advanced analysis first (Python agent)
    if (preferAdvanced && this.pythonAgentAvailable) {
      try {
        const elementData = this.extractElementData(element);
        const response = await fetch(`${PYTHON_AGENT}/explain-element`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ element: elementData }),
        });
        const data = await response.json();

        if (data.success) {
          return {
            source: "python-agent",
            type: "advanced",
            explanation: data.explanation,
            element: elementData,
          };
        }
      } catch (error) {
        console.warn("Advanced analysis failed, falling back to basic:", error);
      }
    }

    // Fallback to basic analysis (Node.js backend)
    if (this.nodeBackendAvailable) {
      try {
        const elementData = this.extractElementData(element);
        const response = await fetch(`${NODE_BACKEND}/explain-element`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service: "bedrock",
            element: {
              type: elementData.tagName?.toLowerCase(),
              label: elementData.textContent || elementData.id,
            },
          }),
        });
        const data = await response.json();

        return {
          source: "node-backend",
          type: "basic",
          explanation: data,
          element: elementData,
        };
      } catch (error) {
        console.error("Basic analysis failed:", error);
      }
    }

    // Final fallback
    return {
      source: "fallback",
      type: "static",
      explanation: {
        title: "Element Analysis",
        what: "This is a web element in the AWS Console",
        why: "It helps you interact with AWS services",
        pitfalls: "Be careful with destructive actions",
      },
    };
  }

  /**
   * Extract element data for analysis
   */
  extractElementData(element) {
    const data = {
      tagName: element.tagName?.toLowerCase(),
      id: element.id,
      className: element.className,
      textContent: element.textContent?.trim(),
      attributes: {},
    };

    // Extract attributes
    if (element.attributes) {
      for (let attr of element.attributes) {
        data.attributes[attr.name] = attr.value;
      }
    }

    return data;
  }

  /**
   * Get error help (Node.js backend)
   */
  async getErrorHelp(errorText, service = "bedrock") {
    if (!this.nodeBackendAvailable) {
      throw new Error("Error help service unavailable");
    }

    try {
      const response = await fetch(`${NODE_BACKEND}/error-help`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service, error: errorText }),
      });
      return await response.json();
    } catch (error) {
      console.error("Error help error:", error);
      throw error;
    }
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      nodeBackend: this.nodeBackendAvailable,
      pythonAgent: this.pythonAgentAvailable,
      bothAvailable: this.nodeBackendAvailable && this.pythonAgentAvailable,
    };
  }
}

// Export singleton instance
export const enhancedAPI = new EnhancedAPI();
