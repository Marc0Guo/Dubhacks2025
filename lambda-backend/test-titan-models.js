// Test Amazon Titan models (might not require use case form)
import {
  generateBedrockExplanation,
  generateBedrockErrorHelp,
  generateBedrockPlan,
} from "./bedrock-rest-api.mjs";

// Override to use Titan models
const originalMakeBedrockRequest = async (modelId, body) => {
  const BEDROCK_API_BASE = "https://bedrock-runtime.us-east-1.amazonaws.com";
  const BEDROCK_API_KEY = process.env.AWS_BEARER_TOKEN_BEDROCK;

  if (!BEDROCK_API_KEY) {
    throw new Error("AWS_BEARER_TOKEN_BEDROCK environment variable not set");
  }

  // Use Titan model instead
  const titanModelId = "amazon.titan-text-express-v1";

  const response = await fetch(
    `${BEDROCK_API_BASE}/model/${titanModelId}/invoke`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEDROCK_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        inputText: body.messages[0].content,
        textGenerationConfig: {
          maxTokenCount: 1000,
          temperature: 0.3,
          topP: 0.9,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Bedrock API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return {
    content: [{ text: result.results[0].outputText }],
  };
};

async function testTitanModels() {
  console.log("🚀 Testing Amazon Titan Models");
  console.log("=".repeat(50));

  if (!process.env.AWS_BEARER_TOKEN_BEDROCK) {
    console.log("❌ AWS_BEARER_TOKEN_BEDROCK not set");
    return;
  }

  console.log("✅ API key found");
  console.log("🤖 Testing with Amazon Titan Text Express...");

  try {
    // Test simple text generation
    const BEDROCK_API_BASE = "https://bedrock-runtime.us-east-1.amazonaws.com";
    const BEDROCK_API_KEY = process.env.AWS_BEARER_TOKEN_BEDROCK;

    const response = await fetch(
      `${BEDROCK_API_BASE}/model/amazon.titan-text-express-v1/invoke`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${BEDROCK_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          inputText: "What is AWS Lambda? Give a brief explanation.",
          textGenerationConfig: {
            maxTokenCount: 200,
            temperature: 0.3,
            topP: 0.9,
          },
        }),
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log("🎉 TITAN SUCCESS!");
      console.log("🤖 AI Response:");
      console.log(result.results[0].outputText);
    } else {
      const errorText = await response.text();
      console.log("❌ TITAN FAILED:", response.status, errorText);
    }
  } catch (error) {
    console.log("❌ ERROR:", error.message);
  }
}

testTitanModels().catch(console.error);
