// Test script for Bedrock integration
import {
  generateBedrockExplanation,
  generateBedrockErrorHelp,
  generateBedrockPlan,
} from "./bedrock-integration.mjs";

async function testBedrockIntegration() {
  console.log("🧪 Testing Bedrock Integration...\n");

  // Test 1: Plan Generation
  console.log("📋 Test 1: Plan Generation");
  try {
    const planResult = await generateBedrockPlan(
      "Create a serverless API with authentication",
      "lambda"
    );
    
    if (planResult.success) {
      console.log("✅ Plan generation successful:");
      console.log(JSON.stringify(planResult.data, null, 2));
    } else {
      console.log("❌ Plan generation failed:", planResult.error);
      console.log("🔄 Using fallback:", planResult.fallback);
    }
  } catch (error) {
    console.log("❌ Plan generation error:", error.message);
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Test 2: Element Explanation
  console.log("💡 Test 2: Element Explanation");
  try {
    const explainResult = await generateBedrockExplanation(
      "What is AWS Lambda cold start?",
      { service: "lambda", elementType: "cold-start" }
    );
    
    if (explainResult.success) {
      console.log("✅ Explanation successful:");
      console.log(JSON.stringify(explainResult.data, null, 2));
    } else {
      console.log("❌ Explanation failed:", explainResult.error);
      console.log("🔄 Using fallback:", explainResult.fallback);
    }
  } catch (error) {
    console.log("❌ Explanation error:", error.message);
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Test 3: Error Help
  console.log("🔧 Test 3: Error Help");
  try {
    const errorResult = await generateBedrockErrorHelp(
      "AccessDeniedException: User is not authorized to perform: lambda:InvokeFunction",
      "lambda"
    );
    
    if (errorResult.success) {
      console.log("✅ Error help successful:");
      console.log(JSON.stringify(errorResult.data, null, 2));
    } else {
      console.log("❌ Error help failed:", errorResult.error);
      console.log("🔄 Using fallback:", errorResult.fallback);
    }
  } catch (error) {
    console.log("❌ Error help error:", error.message);
  }

  console.log("\n" + "=".repeat(50) + "\n");
  console.log("🏁 Bedrock integration test complete!");
}

// Run the test
testBedrockIntegration().catch(console.error);
