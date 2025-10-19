// AWS Tutor Backend - Lambda Express app
import express from "express";
import serverless from "serverless-http";
import cors from "cors";
import config from "../config/index.js";
import {
  generateBedrockExplanation,
  generateBedrockErrorHelp,
  generateBedrockPlan,
} from "./bedrock-simple-titan.mjs";

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    service: "AWS Tutor Lambda",
    timestamp: new Date().toISOString(),
    version: config.extension.version,
    environment: config.development.nodeEnv,
    debug: config.development.debug,
  });
});

// Plan generation endpoint with Bedrock integration
app.post("/plan", async (req, res) => {
  const { service = "bedrock", goal = "Run a text prompt in Playground" } =
    req.body || {};

  try {
    // Try Bedrock first
    const bedrockResult = await generateBedrockPlan(goal, service);

    if (bedrockResult.success) {
      res.json({
        ...bedrockResult.data,
        service: service,
        goal: goal,
        source: "bedrock",
      });
    } else {
      // Fallback to static response
      console.warn("Bedrock failed, using fallback:", bedrockResult.error);
      res.json({
        summary: `Complete your ${service} task: ${goal}`,
        steps: [
          "Select model (e.g., Claude Sonnet / Nova)",
          "Set temperature & max_tokens",
          "Write a clear system prompt",
          "Run a short test prompt and iterate",
        ],
        notes: ["Watch token costs", "Prefer lower temperature for analysis"],
        service: service,
        goal: goal,
        source: "static",
      });
    }
  } catch (error) {
    console.error("Plan generation error:", error);
    res.status(500).json({
      error: "Plan generation failed",
      message: error.message,
      service: service,
      goal: goal,
    });
  }
});

// Element explanation knowledge base
const EXPLAINS = {
  temperature: {
    title: "Temperature",
    what: "Controls randomness/creativity of the model.",
    why: "Higher → more diverse outputs; lower → deterministic.",
    pitfalls: "Too high can be incoherent; too low can be repetitive.",
  },
  max_tokens: {
    title: "Max Tokens",
    what: "Upper bound on response length (token ≈ 0.75 words).",
    why: "Controls cost/latency and truncation risk.",
    pitfalls: "Too low truncates; too high can waste budget.",
  },
  model: {
    title: "Model Selector",
    what: "Choose the foundation model for your task.",
    why: "Affects quality, speed, cost, and capabilities.",
    pitfalls: "Use fit-for-purpose; don't overpay.",
  },
  system_prompt: {
    title: "System Prompt",
    what: "Instructions that guide the model's behavior and responses.",
    why: "Sets context, tone, and constraints for consistent outputs.",
    pitfalls: "Too vague = inconsistent; too specific = rigid.",
  },
  top_p: {
    title: "Top-P (Nucleus Sampling)",
    what: "Controls diversity by limiting token selection to top P probability mass.",
    why: "Balances creativity with coherence.",
    pitfalls: "Too low = repetitive; too high = incoherent.",
  },
  top_k: {
    title: "Top-K Sampling",
    what: "Limits token selection to top K most likely tokens.",
    why: "Reduces randomness while maintaining quality.",
    pitfalls: "Too low = limited vocabulary; too high = too random.",
  },
  stop_sequences: {
    title: "Stop Sequences",
    what: "Text patterns that signal the model to stop generating.",
    why: "Prevents runaway generation and controls output length.",
    pitfalls: "Missing sequences = long outputs; too many = premature stops.",
  },
};

// Element explanation endpoint with Bedrock integration
app.post("/explain-element", async (req, res) => {
  const { service = "bedrock", element = {} } = req.body || {};
  const key = String(element.type || "").toLowerCase();
  const question = element.label || element.type || "Unknown AWS concept";

  try {
    // Try Bedrock first for dynamic explanations
    const bedrockResult = await generateBedrockExplanation(question, {
      service,
      elementType: key,
      context: element,
    });

    if (bedrockResult.success) {
      res.json({
        service,
        element_type: key,
        ...bedrockResult.data,
        source: "bedrock",
      });
    } else {
      // Fallback to static knowledge base
      console.warn(
        "Bedrock failed, using static fallback:",
        bedrockResult.error
      );
      const data = EXPLAINS[key] || {
        title: element.label || element.type || "Unknown",
        what: "UI element not yet in the knowledge map.",
        why: "We're adding coverage for more Bedrock console fields.",
        pitfalls: "Double-check docs/tooltips in the console.",
      };

      res.json({
        service,
        element_type: key,
        ...data,
        source: "static",
      });
    }
  } catch (error) {
    console.error("Explain element error:", error);
    res.status(500).json({
      error: "Explanation generation failed",
      message: error.message,
      service,
      element_type: key,
    });
  }
});

// Error help patterns
const ERROR_PATTERNS = {
  accessdenied: {
    title: "Access Denied Error",
    cause: "Missing IAM permission for Bedrock invocation",
    solution:
      "Grant bedrock:InvokeModel (AmazonBedrockFullAccess for testing).",
    prevention: "Use least-privilege roles; verify permissions in dev.",
  },
  validation: {
    title: "Validation Error",
    cause: "Invalid parameters (model id, temperature, max_tokens, etc.)",
    solution:
      "Check request schema and allowed ranges; fix parameter names/values.",
    prevention: "Validate client inputs before sending to API.",
  },
  throttling: {
    title: "Rate Limit / Throttling",
    cause: "Too many requests to Bedrock",
    solution: "Add retry with exponential backoff; slow down batch calls.",
    prevention: "Queue or debounce; respect service quotas.",
  },
  rate: {
    title: "Rate Limit / Throttling",
    cause: "Too many requests to Bedrock",
    solution: "Add retry with exponential backoff; slow down batch calls.",
    prevention: "Queue or debounce; respect service quotas.",
  },
  quota: {
    title: "Quota Exceeded",
    cause: "Exceeded service quotas or limits",
    solution:
      "Request quota increase or reduce usage; check CloudWatch metrics.",
    prevention: "Monitor usage patterns; implement rate limiting.",
  },
  timeout: {
    title: "Request Timeout",
    cause: "Request took too long to process",
    solution:
      "Reduce max_tokens or simplify prompt; check network connectivity.",
    prevention: "Set appropriate timeouts; optimize prompt complexity.",
  },
  modelnotfound: {
    title: "Model Not Found",
    cause: "Specified model ID doesn't exist or isn't available",
    solution:
      "Check model availability in your region; verify model ID spelling.",
    prevention: "Use model discovery APIs; validate model IDs before requests.",
  },
};

// Error help endpoint with Bedrock integration
app.post("/error-help", async (req, res) => {
  const { service = "bedrock", error = "" } = req.body || {};
  const errorText = String(error).toLowerCase();

  try {
    // Try Bedrock first for dynamic error analysis
    const bedrockResult = await generateBedrockErrorHelp(error, service);

    if (bedrockResult.success) {
      res.json({
        service,
        error_type: "bedrock_analyzed",
        original_error: error,
        ...bedrockResult.data,
        source: "bedrock",
      });
    } else {
      // Fallback to static error patterns
      console.warn(
        "Bedrock failed, using static fallback:",
        bedrockResult.error
      );

      // Find matching error pattern
      let matchedPattern = null;
      let matchedKey = null;

      for (const [key, pattern] of Object.entries(ERROR_PATTERNS)) {
        if (errorText.includes(key)) {
          matchedPattern = pattern;
          matchedKey = key;
          break;
        }
      }

      // Default fallback
      const result = matchedPattern || {
        title: "Unknown Error",
        cause: "Not matched by known patterns",
        solution:
          "Check CloudWatch logs and AWS docs for the exact error code/message.",
        prevention: "Validate params, confirm IAM perms, and add retries.",
      };

      res.json({
        service,
        error_type: matchedKey || "unknown",
        original_error: error,
        ...result,
        source: "static",
      });
    }
  } catch (error) {
    console.error("Error help generation failed:", error);
    res.status(500).json({
      error: "Error help generation failed",
      message: error.message,
      service,
      original_error: error,
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.path} not found`,
    available_endpoints: [
      "GET /health",
      "POST /plan",
      "POST /explain-element",
      "POST /error-help",
    ],
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message || "An unexpected error occurred",
  });
});

// Export Lambda handler
export const handler = serverless(app);

// For local development
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`AWS Tutor Backend running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}
