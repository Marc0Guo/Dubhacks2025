// Test script for Bedrock Titan integration
import {
  generateBedrockExplanation,
  generateBedrockErrorHelp,
  generateBedrockPlan,
} from "./bedrock-titan-api.mjs";

async function testTitanIntegration() {
  console.log("🚀 AWS Tutor - Bedrock Titan Integration Test");
  console.log("=".repeat(50));

  // Check environment
  console.log("🔑 Environment Check:");
  if (process.env.AWS_BEARER_TOKEN_BEDROCK) {
    console.log("✅ AWS_BEARER_TOKEN_BEDROCK is set");
    console.log(
      `   Key: ${process.env.AWS_BEARER_TOKEN_BEDROCK.substring(0, 20)}...`
    );
  } else {
    console.log("❌ AWS_BEARER_TOKEN_BEDROCK is NOT set");
    console.log("💡 Run: export AWS_BEARER_TOKEN_BEDROCK=your-key");
    return;
  }

  console.log("\n" + "=".repeat(50));

  // Test 1: Plan Generation
  console.log("📋 TEST 1: Plan Generation");
  console.log("Goal: Create a serverless API");
  console.log("Service: lambda");
  console.log("-".repeat(30));

  try {
    const planResult = await generateBedrockPlan(
      "Create a serverless API with authentication",
      "lambda"
    );

    if (planResult.success) {
      console.log("🎉 BEDROCK SUCCESS!");
      console.log("🤖 AI-Generated Plan:");
      console.log(`   Summary: ${planResult.data.summary}`);
      console.log(
        `   Steps: ${
          planResult.data.steps ? planResult.data.steps.length : "N/A"
        } steps`
      );
      console.log(`   Time: ${planResult.data.estimated_time || "N/A"}`);
      console.log(`   Difficulty: ${planResult.data.difficulty || "N/A"}`);
      if (planResult.data.steps && planResult.data.steps.length > 0) {
        console.log("\n📝 First 3 steps:");
        planResult.data.steps.slice(0, 3).forEach((step, i) => {
          console.log(`   ${i + 1}. ${step}`);
        });
      }
    } else {
      console.log("⚠️  BEDROCK FAILED - Using Fallback");
      console.log(`   Error: ${planResult.error}`);
      console.log("🔄 Static Response:");
      console.log(`   Summary: ${planResult.fallback.summary}`);
    }
  } catch (error) {
    console.log("❌ TEST ERROR:", error.message);
  }

  console.log("\n" + "=".repeat(50));

  // Test 2: Element Explanation
  console.log("💡 TEST 2: Element Explanation");
  console.log("Question: What is AWS Lambda cold start?");
  console.log("-".repeat(30));

  try {
    const explainResult = await generateBedrockExplanation(
      "What is AWS Lambda cold start?",
      { service: "lambda", elementType: "cold-start" }
    );

    if (explainResult.success) {
      console.log("🎉 BEDROCK SUCCESS!");
      console.log("🤖 AI-Generated Explanation:");
      console.log(`   Title: ${explainResult.data.title}`);
      console.log(`   What: ${explainResult.data.what}`);
      console.log(`   Why: ${explainResult.data.why}`);
      console.log(`   Pitfalls: ${explainResult.data.pitfalls}`);
    } else {
      console.log("⚠️  BEDROCK FAILED - Using Fallback");
      console.log(`   Error: ${explainResult.error}`);
      console.log("🔄 Static Response:");
      console.log(`   Title: ${explainResult.fallback.title}`);
    }
  } catch (error) {
    console.log("❌ TEST ERROR:", error.message);
  }

  console.log("\n" + "=".repeat(50));

  // Test 3: Error Help
  console.log("🔧 TEST 3: Error Help");
  console.log("Error: AccessDeniedException");
  console.log("-".repeat(30));

  try {
    const errorResult = await generateBedrockErrorHelp(
      "AccessDeniedException: User is not authorized to perform: lambda:InvokeFunction",
      "lambda"
    );

    if (errorResult.success) {
      console.log("🎉 BEDROCK SUCCESS!");
      console.log("🤖 AI-Generated Error Help:");
      console.log(`   Title: ${errorResult.data.title}`);
      console.log(`   Cause: ${errorResult.data.cause}`);
      console.log(`   Solution: ${errorResult.data.solution}`);
    } else {
      console.log("⚠️  BEDROCK FAILED - Using Fallback");
      console.log(`   Error: ${errorResult.error}`);
      console.log("🔄 Static Response:");
      console.log(`   Title: ${errorResult.fallback.title}`);
    }
  } catch (error) {
    console.log("❌ TEST ERROR:", error.message);
  }

  console.log("\n" + "=".repeat(50));
  console.log("🏁 Test Complete!");
  console.log("\n💡 Look for '🎉 BEDROCK SUCCESS!' messages above");
  console.log("   If you see '⚠️ BEDROCK FAILED', check your API key");
}

// Run the test
testTitanIntegration().catch(console.error);
