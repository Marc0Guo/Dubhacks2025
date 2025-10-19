// Simple Amazon Bedrock Titan Integration for AWS Tutor
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
 * Generate dynamic explanations using Amazon Bedrock Titan
 */
export async function generateBedrockExplanation(question, context = {}) {
  const prompt = `Explain this AWS concept in a clear, structured way:

Question: ${question}

Please provide:
1. A brief title
2. What it is (1-2 sentences)
3. Why it matters (1-2 sentences)
4. Common pitfalls to avoid (1-2 sentences)
5. A practical example

Keep it beginner-friendly but technically accurate.`;

  try {
    const response = await makeTitanRequest(prompt, 800, 0.3);

    // Parse the response into structured format
    const lines = response.split("\n").filter((line) => line.trim());
    const title =
      lines.find((line) => line.match(/^\d*\.?\s*[A-Z]/)) || "AWS Concept";
    const what =
      lines.find(
        (line) =>
          line.toLowerCase().includes("what") ||
          line.toLowerCase().includes("is")
      ) ||
      lines[0] ||
      "AWS service or concept";
    const why =
      lines.find(
        (line) =>
          line.toLowerCase().includes("why") ||
          line.toLowerCase().includes("important")
      ) || "Important for AWS development";
    const pitfalls =
      lines.find(
        (line) =>
          line.toLowerCase().includes("pitfall") ||
          line.toLowerCase().includes("avoid") ||
          line.toLowerCase().includes("mistake")
      ) || "Follow AWS best practices";
    const example =
      lines.find(
        (line) =>
          line.toLowerCase().includes("example") ||
          line.toLowerCase().includes("for instance")
      ) || "Check AWS documentation";

    return {
      success: true,
      data: {
        title: title.replace(/^\d*\.?\s*/, "").trim(),
        what: what.replace(/^\d*\.?\s*/, "").trim(),
        why: why.replace(/^\d*\.?\s*/, "").trim(),
        pitfalls: pitfalls.replace(/^\d*\.?\s*/, "").trim(),
        examples: [example.replace(/^\d*\.?\s*/, "").trim()],
      },
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
  const prompt = `Help troubleshoot this AWS error:

Error: ${errorMessage}
Service: ${service}

Please provide:
1. Error type/title
2. Root cause explanation
3. Step-by-step solution
4. How to prevent this in the future
5. Related AWS documentation links

Be specific and actionable.`;

  try {
    const response = await makeTitanRequest(prompt, 800, 0.2);

    // Parse the response into structured format
    const lines = response.split("\n").filter((line) => line.trim());
    const title =
      lines.find((line) => line.match(/^\d*\.?\s*[A-Z]/)) || "AWS Error";
    const cause =
      lines.find(
        (line) =>
          line.toLowerCase().includes("cause") ||
          line.toLowerCase().includes("because")
      ) || "Configuration or permission issue";
    const solution =
      lines.find(
        (line) =>
          line.toLowerCase().includes("solution") ||
          line.toLowerCase().includes("step")
      ) || "Check AWS configuration and permissions";
    const prevention =
      lines.find(
        (line) =>
          line.toLowerCase().includes("prevent") ||
          line.toLowerCase().includes("avoid")
      ) || "Follow AWS best practices";

    return {
      success: true,
      data: {
        title: title.replace(/^\d*\.?\s*/, "").trim(),
        cause: cause.replace(/^\d*\.?\s*/, "").trim(),
        solution: solution.replace(/^\d*\.?\s*/, "").trim(),
        prevention: prevention.replace(/^\d*\.?\s*/, "").trim(),
        related_docs: ["AWS Documentation", "AWS Support"],
      },
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
  const prompt = `Create a step-by-step plan for this AWS task:

Goal: ${goal}
Service: ${service}

Please provide:
1. A brief summary of the goal
2. 4-6 specific, actionable steps
3. Important notes or considerations
4. Estimated time to complete
5. Difficulty level (beginner/intermediate/advanced)
6. Prerequisites needed

Make it practical and easy to follow.`;

  try {
    const response = await makeTitanRequest(prompt, 1200, 0.4);

    // Parse the response into structured format
    const lines = response.split("\n").filter((line) => line.trim());
    const summary =
      lines.find(
        (line) =>
          line.toLowerCase().includes("summary") ||
          line.toLowerCase().includes("goal")
      ) || `Complete your ${service} task: ${goal}`;
    const steps = lines
      .filter(
        (line) => line.match(/^\d+\./) || line.toLowerCase().includes("step")
      )
      .map((line) => line.replace(/^\d+\.\s*/, "").trim());
    const notes = lines
      .filter(
        (line) =>
          line.toLowerCase().includes("note") ||
          line.toLowerCase().includes("important")
      )
      .map((line) => line.replace(/^\d+\.\s*/, "").trim());
    const time =
      lines.find(
        (line) =>
          line.toLowerCase().includes("time") ||
          line.toLowerCase().includes("minute") ||
          line.toLowerCase().includes("hour")
      ) || "30-60 minutes";
    const difficulty =
      lines.find(
        (line) =>
          line.toLowerCase().includes("difficulty") ||
          line.toLowerCase().includes("beginner") ||
          line.toLowerCase().includes("intermediate") ||
          line.toLowerCase().includes("advanced")
      ) || "intermediate";
    const prerequisites = lines
      .filter(
        (line) =>
          line.toLowerCase().includes("prerequisite") ||
          line.toLowerCase().includes("need")
      )
      .map((line) => line.replace(/^\d+\.\s*/, "").trim());

    return {
      success: true,
      data: {
        summary: summary.replace(/^\d+\.\s*/, "").trim(),
        steps:
          steps.length > 0
            ? steps
            : [
                "Navigate to the AWS Console",
                "Select the appropriate service",
                "Configure your settings",
                "Test and verify",
              ],
        notes:
          notes.length > 0
            ? notes
            : ["Follow AWS best practices", "Monitor costs"],
        estimated_time: time.replace(/^\d+\.\s*/, "").trim(),
        difficulty: difficulty.replace(/^\d+\.\s*/, "").trim(),
        prerequisites:
          prerequisites.length > 0
            ? prerequisites
            : ["AWS account", "Basic AWS knowledge"],
      },
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
