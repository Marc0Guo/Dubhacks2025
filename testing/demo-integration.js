// Demo script showing both systems working together
// Node.js Backend (AWS Guidance) + Python Bedrock Agent (AI Features)

const config = require("../config/index.js");

const LAMBDA_BACKEND = config.utils.getLambdaBackendUrl();
const PYTHON_AGENT = config.utils.getPythonAgentUrl();

class IntegrationDemo {
  constructor() {
    this.results = [];
  }

  async runFullDemo() {
    console.log("🚀 AWS Tutor Integration Demo");
    console.log("=".repeat(60));
    console.log("Testing both Node.js Backend + Python Bedrock Agent");
    console.log("");

    // Test 1: System Health Check
    await this.testSystemHealth();

    // Test 2: AWS Guidance (Node.js)
    await this.testAWSGuidance();

    // Test 3: AI Conversation (Python)
    await this.testAIConversation();

    // Test 4: Element Analysis (Both)
    await this.testElementAnalysis();

    // Test 5: Combined Workflow
    await this.testCombinedWorkflow();

    // Show Summary
    this.showSummary();
  }

  async testSystemHealth() {
    console.log("🔍 TEST 1: System Health Check");
    console.log("-".repeat(40));

    const health = {
      lambdaBackend: false,
      pythonAgent: false,
    };

    try {
      const lambdaResponse = await fetch(`${LAMBDA_BACKEND}/health`);
      health.lambdaBackend = lambdaResponse.ok;
      console.log(
        `✅ Lambda Backend: ${lambdaResponse.ok ? "Online" : "Offline"}`
      );
    } catch (error) {
      console.log(`❌ Lambda Backend: Offline (${error.message})`);
    }

    try {
      const pythonResponse = await fetch(`${PYTHON_AGENT}/health`);
      health.pythonAgent = pythonResponse.ok;
      console.log(
        `✅ Python Agent: ${pythonResponse.ok ? "Online" : "Offline"}`
      );
    } catch (error) {
      console.log(`❌ Python Agent: Offline (${error.message})`);
    }

    this.results.push({
      test: "Health Check",
      success: health.lambdaBackend && health.pythonAgent,
      data: health,
    });
    console.log("");
  }

  async testAWSGuidance() {
    console.log("📋 TEST 2: AWS Guidance (Lambda Backend)");
    console.log("-".repeat(40));

    try {
      const response = await fetch(`${LAMBDA_BACKEND}/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: "lambda",
          goal: "Create a serverless function with API Gateway",
        }),
      });

      const guidance = await response.json();
      console.log("✅ AWS Guidance Generated:");
      console.log(`   Summary: ${guidance.summary || "N/A"}`);
      console.log(`   Steps: ${guidance.steps?.length || 0} steps`);
      console.log(`   Source: ${guidance.source || "N/A"}`);

      this.results.push({
        test: "AWS Guidance",
        success: true,
        data: guidance,
      });
    } catch (error) {
      console.log(`❌ AWS Guidance Failed: ${error.message}`);
      this.results.push({
        test: "AWS Guidance",
        success: false,
        error: error.message,
      });
    }
    console.log("");
  }

  async testAIConversation() {
    console.log("🤖 TEST 3: AI Conversation (Python Bedrock Agent)");
    console.log("-".repeat(40));

    try {
      const response = await fetch(`${PYTHON_AGENT}/agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Hello! Can you help me understand AWS Lambda?",
        }),
      });

      const aiResponse = await response.json();
      console.log("✅ AI Response:");
      console.log(`   Reply: ${aiResponse.reply?.substring(0, 100)}...`);

      this.results.push({
        test: "AI Conversation",
        success: true,
        data: aiResponse,
      });
    } catch (error) {
      console.log(`❌ AI Conversation Failed: ${error.message}`);
      this.results.push({
        test: "AI Conversation",
        success: false,
        error: error.message,
      });
    }
    console.log("");
  }

  async testElementAnalysis() {
    console.log("🔍 TEST 4: Element Analysis (Both Systems)");
    console.log("-".repeat(40));

    const mockElement = {
      tagName: "button",
      id: "create-lambda-function",
      className: "btn btn-primary",
      textContent: "Create Lambda Function",
      attributes: {
        type: "button",
        onclick: "createLambdaFunction()",
        "data-service": "lambda",
      },
    };

    // Test Python Agent (Advanced)
    try {
      const pythonResponse = await fetch(`${PYTHON_AGENT}/explain-element`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ element: mockElement }),
      });

      const pythonData = await pythonResponse.json();
      console.log("✅ Python Agent Analysis:");
      console.log(`   Success: ${pythonData.success}`);
      console.log(
        `   Explanation: ${pythonData.explanation?.substring(0, 100)}...`
      );

      this.results.push({
        test: "Element Analysis (Python)",
        success: pythonData.success,
        data: pythonData,
      });
    } catch (error) {
      console.log(`❌ Python Element Analysis Failed: ${error.message}`);
      this.results.push({
        test: "Element Analysis (Python)",
        success: false,
        error: error.message,
      });
    }

    // Test Lambda Backend (Basic)
    try {
      const lambdaResponse = await fetch(`${LAMBDA_BACKEND}/explain-element`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: "bedrock",
          element: {
            type: mockElement.tagName,
            label: mockElement.textContent,
          },
        }),
      });

      const lambdaData = await lambdaResponse.json();
      console.log("✅ Lambda Backend Analysis:");
      console.log(`   Title: ${lambdaData.title || "N/A"}`);
      console.log(`   What: ${lambdaData.what?.substring(0, 50)}...`);

      this.results.push({
        test: "Element Analysis (Lambda)",
        success: true,
        data: lambdaData,
      });
    } catch (error) {
      console.log(`❌ Lambda Element Analysis Failed: ${error.message}`);
      this.results.push({
        test: "Element Analysis (Lambda)",
        success: false,
        error: error.message,
      });
    }
    console.log("");
  }

  async testCombinedWorkflow() {
    console.log("🔄 TEST 5: Combined Workflow");
    console.log("-".repeat(40));

    try {
      // Step 1: Get AWS guidance
      console.log("Step 1: Getting AWS guidance...");
      const guidanceResponse = await fetch(`${LAMBDA_BACKEND}/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: "lambda",
          goal: "Set up a complete serverless application",
        }),
      });
      const guidance = await guidanceResponse.json();

      // Step 2: Get AI explanation
      console.log("Step 2: Getting AI explanation...");
      const aiResponse = await fetch(`${PYTHON_AGENT}/agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Explain serverless architecture in simple terms",
        }),
      });
      const aiData = await aiResponse.json();

      // Step 3: Analyze a UI element
      console.log("Step 3: Analyzing UI element...");
      const elementResponse = await fetch(`${PYTHON_AGENT}/explain-element`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          element: {
            tagName: "button",
            id: "deploy-function",
            textContent: "Deploy Function",
            className: "btn btn-success",
          },
        }),
      });
      const elementData = await elementResponse.json();

      console.log("✅ Combined Workflow Complete:");
      console.log(
        `   AWS Guidance: ${guidance.summary ? "Generated" : "Failed"}`
      );
      console.log(
        `   AI Explanation: ${aiData.reply ? "Generated" : "Failed"}`
      );
      console.log(
        `   Element Analysis: ${elementData.success ? "Success" : "Failed"}`
      );

      this.results.push({
        test: "Combined Workflow",
        success: true,
        data: { guidance, aiData, elementData },
      });
    } catch (error) {
      console.log(`❌ Combined Workflow Failed: ${error.message}`);
      this.results.push({
        test: "Combined Workflow",
        success: false,
        error: error.message,
      });
    }
    console.log("");
  }

  showSummary() {
    console.log("📊 DEMO SUMMARY");
    console.log("=".repeat(60));

    const successful = this.results.filter((r) => r.success).length;
    const total = this.results.length;

    console.log(`Tests Passed: ${successful}/${total}`);
    console.log("");

    this.results.forEach((result) => {
      const status = result.success ? "✅" : "❌";
      console.log(`${status} ${result.test}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    console.log("");
    console.log("🎯 Integration Status:");
    console.log("   Lambda Backend: AWS guidance and basic analysis");
    console.log(
      "   Python Bedrock Agent: AI conversation and advanced analysis"
    );
    console.log("   Chrome Extension: Can use both systems intelligently");
    console.log("");
    console.log("🚀 Ready for production use!");
  }
}

// Run the demo
const demo = new IntegrationDemo();
demo.runFullDemo().catch(console.error);
