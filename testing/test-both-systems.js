// Test script to demonstrate using both backend systems
// Node.js Backend (Port 3000) + Python Bedrock Agent (Port 5000)

const NODE_BACKEND = "http://localhost:3000/dev";
const PYTHON_AGENT = "http://localhost:5001";

async function testNodeBackend() {
  console.log("🔵 Testing Node.js Backend (Port 3000)");
  console.log("=".repeat(50));

  try {
    // Test health check
    const healthResponse = await fetch(`${NODE_BACKEND}/health`);
    const health = await healthResponse.json();
    console.log("✅ Health Check:", health.status);

    // Test plan generation
    const planResponse = await fetch(`${NODE_BACKEND}/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service: "lambda",
        goal: "Create a serverless function",
      }),
    });
    const plan = await planResponse.json();
    console.log("📋 Plan Generated:", plan.summary || "No summary");
    console.log("   Steps:", plan.steps?.length || 0, "steps");

    // Test element explanation
    const explainResponse = await fetch(`${NODE_BACKEND}/explain-element`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service: "bedrock",
        element: {
          type: "button",
          label: "Create Function",
        },
      }),
    });
    const explain = await explainResponse.json();
    console.log("💡 Element Explanation:", explain.title || "No title");
  } catch (error) {
    console.log("❌ Node.js Backend Error:", error.message);
  }
}

async function testPythonAgent() {
  console.log("\n🟡 Testing Python Bedrock Agent (Port 5000)");
  console.log("=".repeat(50));

  try {
    // Test health check
    const healthResponse = await fetch(`${PYTHON_AGENT}/health`);
    const health = await healthResponse.json();
    console.log("✅ Health Check:", health.status);

    // Test AI agent conversation
    const agentResponse = await fetch(`${PYTHON_AGENT}/agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "What time is it?",
      }),
    });
    const agent = await agentResponse.json();
    console.log("🤖 AI Agent Response:", agent.reply || "No reply");

    // Test web element analysis
    const elementResponse = await fetch(`${PYTHON_AGENT}/explain-element`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        element: {
          tagName: "button",
          id: "create-function-btn",
          className: "btn btn-primary",
          textContent: "Create Function",
          attributes: {
            type: "button",
            onclick: "createFunction()",
          },
        },
      }),
    });
    const element = await elementResponse.json();
    console.log("🔍 Element Analysis:", element.success ? "Success" : "Failed");
    if (element.explanation) {
      console.log(
        "   Explanation:",
        element.explanation.substring(0, 100) + "..."
      );
    }
  } catch (error) {
    console.log("❌ Python Agent Error:", error.message);
  }
}

async function testBothSystems() {
  console.log("🚀 Testing Both Backend Systems");
  console.log("=".repeat(60));

  await testNodeBackend();
  await testPythonAgent();

  console.log("\n" + "=".repeat(60));
  console.log("🏁 Test Complete!");
  console.log("\n💡 How to use both systems:");
  console.log("1. Node.js Backend: General AWS guidance and explanations");
  console.log(
    "2. Python Agent: Advanced AI conversation and web element analysis"
  );
  console.log("3. Your Chrome Extension: Currently uses Node.js backend");
  console.log("4. Integration: You can call both APIs from your extension!");
}

// Run the test
testBothSystems().catch(console.error);
