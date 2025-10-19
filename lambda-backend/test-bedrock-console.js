// Simple Bedrock test for console setup
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const bedrockClient = new BedrockRuntimeClient({ region: "us-east-1" });

async function testBedrockAccess() {
  console.log("🧪 Testing Bedrock Access...\n");

  try {
    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 100,
        temperature: 0.3,
        messages: [
          {
            role: "user",
            content: "What is AWS Lambda? Give a brief explanation.",
          },
        ],
      }),
    });

    console.log("📡 Calling Bedrock API...");
    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    console.log("✅ SUCCESS! Bedrock is working!");
    console.log("🤖 Response:", responseBody.content[0].text);
  } catch (error) {
    console.log("❌ ERROR:", error.message);

    if (error.name === "AccessDeniedException") {
      console.log("\n💡 Solution:");
      console.log(
        "1. Go to Bedrock Console: https://console.aws.amazon.com/bedrock/"
      );
      console.log("2. Click 'Model access' in the left sidebar");
      console.log("3. Request access to Claude 3 Sonnet");
      console.log("4. Wait for approval (usually instant)");
    } else if (error.name === "CredentialsProviderError") {
      console.log("\n💡 Solution:");
      console.log("1. Run: aws configure");
      console.log("2. Enter your access key and secret key");
      console.log("3. Set region to: us-east-1");
    } else {
      console.log("\n💡 Check the error message above for specific guidance");
    }
  }
}

testBedrockAccess();
