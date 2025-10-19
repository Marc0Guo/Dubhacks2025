// Amazon Bedrock Integration for AWS Tutor
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

// Configure Bedrock client with bearer token authentication
const bedrockClient = new BedrockRuntimeClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: "dummy", // Required but not used with bearer token
    secretAccessKey: "dummy", // Required but not used with bearer token
  },
});

/**
 * Generate dynamic explanations using Amazon Bedrock
 */
export async function generateBedrockExplanation(question, context = {}) {
  const prompt = `You are an AWS expert. Explain this AWS concept clearly and concisely:

Question: ${question}
Context: ${JSON.stringify(context, null, 2)}

Provide a structured response in JSON format:
{
  "title": "Brief title",
  "what": "What it is (1-2 sentences)",
  "why": "Why it matters (1-2 sentences)", 
  "pitfalls": "Common mistakes to avoid (1-2 sentences)",
  "examples": ["practical example 1", "practical example 2"]
}

Keep explanations beginner-friendly but technically accurate.`;

  try {
    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1000,
        temperature: 0.3,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    return {
      success: true,
      data: JSON.parse(responseBody.content[0].text),
    };
  } catch (error) {
    console.error("Bedrock error:", error);
    return {
      success: false,
      error: error.message,
      fallback: getStaticExplanation(question),
    };
  }
}

/**
 * Generate error diagnosis using Amazon Bedrock
 */
export async function generateBedrockErrorHelp(
  errorMessage,
  service = "bedrock"
) {
  const prompt = `You are an AWS troubleshooting expert. Analyze this error and provide help:

Error: ${errorMessage}
Service: ${service}

Provide a structured response in JSON format:
{
  "title": "Error type",
  "cause": "Root cause explanation",
  "solution": "Step-by-step solution",
  "prevention": "How to prevent this",
  "related_docs": ["AWS doc link 1", "AWS doc link 2"]
}

Be specific and actionable. Include AWS documentation links when relevant.`;

  try {
    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1000,
        temperature: 0.2,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    return {
      success: true,
      data: JSON.parse(responseBody.content[0].text),
    };
  } catch (error) {
    console.error("Bedrock error:", error);
    return {
      success: false,
      error: error.message,
      fallback: getStaticErrorHelp(errorMessage),
    };
  }
}

/**
 * Generate dynamic workflow plans using Amazon Bedrock
 */
export async function generateBedrockPlan(goal, service = "bedrock") {
  const prompt = `You are an AWS solutions architect. Create a step-by-step plan for this goal:

Goal: ${goal}
Service: ${service}

Provide a structured response in JSON format:
{
  "summary": "Brief summary of the goal",
  "steps": ["step 1", "step 2", "step 3", "step 4"],
  "notes": ["important note 1", "important note 2"],
  "estimated_time": "X minutes",
  "difficulty": "beginner|intermediate|advanced",
  "prerequisites": ["prerequisite 1", "prerequisite 2"]
}

Make steps specific and actionable. Include time estimates and difficulty level.`;

  try {
    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1500,
        temperature: 0.4,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    return {
      success: true,
      data: JSON.parse(responseBody.content[0].text),
    };
  } catch (error) {
    console.error("Bedrock error:", error);
    return {
      success: false,
      error: error.message,
      fallback: getStaticPlan(goal, service),
    };
  }
}

// Fallback functions (current static implementation)
function getStaticExplanation(question) {
  // Return current static explanation logic
  return {
    title: "AWS Concept",
    what: "This is a core AWS service or concept.",
    why: "It's important for building scalable cloud applications.",
    pitfalls: "Common mistakes include misconfiguration and cost overruns.",
  };
}

function getStaticErrorHelp(errorMessage) {
  // Return current static error help logic
  return {
    title: "AWS Error",
    cause: "This error typically occurs due to configuration issues.",
    solution: "Check your AWS configuration and permissions.",
    prevention: "Always test in a development environment first.",
  };
}

function getStaticPlan(goal, service) {
  // Return current static plan logic
  return {
    summary: `Complete your ${service} task: ${goal}`,
    steps: [
      "Navigate to the AWS Console",
      "Select the appropriate service",
      "Configure your settings",
      "Test and verify",
    ],
    notes: ["Follow AWS best practices", "Monitor costs"],
  };
}
