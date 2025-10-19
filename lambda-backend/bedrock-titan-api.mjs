// Amazon Bedrock Titan Integration for AWS Tutor
// Using bearer token authentication with Amazon Titan models

const BEDROCK_API_BASE = "https://bedrock-runtime.us-east-1.amazonaws.com";
const BEDROCK_API_KEY = process.env.AWS_BEARER_TOKEN_BEDROCK;

/**
 * Make a request to Bedrock API using Titan models
 */
async function makeTitanRequest(prompt, maxTokens = 1000, temperature = 0.3) {
  if (!BEDROCK_API_KEY) {
    throw new Error("AWS_BEARER_TOKEN_BEDROCK environment variable not set");
  }

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
        inputText: prompt,
        textGenerationConfig: {
          maxTokenCount: maxTokens,
          temperature: temperature,
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
  return result.results[0].outputText;
}

/**
 * Parse JSON response from Titan model
 */
function parseTitanResponse(text) {
  try {
    // Try to find JSON in the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr);

      // Handle different response formats
      if (parsed.rows && Array.isArray(parsed.rows) && parsed.rows.length > 0) {
        // Handle rows format
        const firstRow = parsed.rows[0];
        return {
          title: firstRow.title || firstRow.Step || "AWS Concept",
          what:
            firstRow.what ||
            firstRow.Description ||
            firstRow.Step ||
            text.substring(0, 200),
          why:
            firstRow.why ||
            firstRow.Description ||
            "This is important for AWS development.",
          pitfalls: firstRow.pitfalls || "Always follow AWS best practices.",
          examples: firstRow.examples || [
            "Check AWS documentation for examples",
          ],
          // Additional fields for plans
          steps: parsed.rows
            .map((row) => row.Step || row.Description)
            .filter(Boolean),
          estimated_time: firstRow["Time Estimate"] || "N/A",
          difficulty: firstRow.Difficulty || "N/A",
          prerequisites: firstRow.Prerequisites ? [firstRow.Prerequisites] : [],
        };
      } else if (parsed.title || parsed.what) {
        // Handle direct format
        return parsed;
      }
    }

    // If no JSON found, create a structured response from the text
    const lines = text.split("\n").filter((line) => line.trim());
    const firstLine = lines[0] || text.substring(0, 100);

    return {
      title: firstLine.includes("AWS") ? firstLine : "AWS Concept",
      what: lines[0] || text.substring(0, 200) + "...",
      why: lines[1] || "This is important for AWS development.",
      pitfalls:
        lines[2] || "Always follow AWS best practices and security guidelines.",
      examples: lines.slice(3, 5).filter((line) => line.trim()) || [
        "Check AWS documentation for specific examples",
      ],
    };
  } catch (error) {
    console.warn("Failed to parse JSON response:", error);
    return {
      title: "AWS Concept",
      what: text.substring(0, 200) + "...",
      why: "This is important for AWS development.",
      pitfalls: "Always follow AWS best practices.",
      examples: ["Check AWS documentation for examples"],
    };
  }
}

/**
 * Generate dynamic explanations using Amazon Bedrock Titan
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
    const response = await makeTitanRequest(prompt, 1000, 0.3);
    const parsedData = parseTitanResponse(response);

    return {
      success: true,
      data: parsedData,
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
 * Generate error diagnosis using Amazon Bedrock Titan
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
    const response = await makeTitanRequest(prompt, 1000, 0.2);
    const parsedData = parseTitanResponse(response);

    return {
      success: true,
      data: parsedData,
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
 * Generate dynamic workflow plans using Amazon Bedrock Titan
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
    const response = await makeTitanRequest(prompt, 1500, 0.4);
    const parsedData = parseTitanResponse(response);

    return {
      success: true,
      data: parsedData,
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
