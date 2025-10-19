// Amazon Bedrock REST API Integration for AWS Tutor
// Using bearer token authentication

const BEDROCK_API_BASE = "https://bedrock-runtime.us-east-1.amazonaws.com";
const BEDROCK_API_KEY = process.env.AWS_BEARER_TOKEN_BEDROCK;

/**
 * Make a request to Bedrock API using bearer token
 */
async function makeBedrockRequest(modelId, body) {
  if (!BEDROCK_API_KEY) {
    throw new Error("AWS_BEARER_TOKEN_BEDROCK environment variable not set");
  }

  const response = await fetch(`${BEDROCK_API_BASE}/model/${modelId}/invoke`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${BEDROCK_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Bedrock API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

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
    const response = await makeBedrockRequest(
      "anthropic.claude-3-sonnet-20240229-v1:0",
      {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1000,
        temperature: 0.3,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }
    );

    return {
      success: true,
      data: JSON.parse(response.content[0].text),
    };
  } catch (error) {
    console.error("Bedrock explanation error:", error);
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
    const response = await makeBedrockRequest(
      "anthropic.claude-3-sonnet-20240229-v1:0",
      {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1000,
        temperature: 0.2,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }
    );

    return {
      success: true,
      data: JSON.parse(response.content[0].text),
    };
  } catch (error) {
    console.error("Bedrock error help error:", error);
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
    const response = await makeBedrockRequest(
      "anthropic.claude-3-sonnet-20240229-v1:0",
      {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1500,
        temperature: 0.4,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }
    );

    return {
      success: true,
      data: JSON.parse(response.content[0].text),
    };
  } catch (error) {
    console.error("Bedrock plan error:", error);
    return {
      success: false,
      error: error.message,
      fallback: getStaticPlan(goal, service),
    };
  }
}

// Fallback functions (current static implementation)
function getStaticExplanation(question) {
  return {
    title: "AWS Concept",
    what: "This is a core AWS service or concept.",
    why: "It's important for building scalable cloud applications.",
    pitfalls: "Common mistakes include misconfiguration and cost overruns.",
  };
}

function getStaticErrorHelp(errorMessage) {
  return {
    title: "AWS Error",
    cause: "This error typically occurs due to configuration issues.",
    solution: "Check your AWS configuration and permissions.",
    prevention: "Always test in a development environment first.",
  };
}

function getStaticPlan(goal, service) {
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
