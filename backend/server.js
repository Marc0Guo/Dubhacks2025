const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const yaml = require("yaml");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Load recipes and docs
const recipesPath = path.join(__dirname, "../recipes");
const docsPath = path.join(__dirname, "../docs");

// Load all YAML recipes
function loadRecipes() {
  const recipes = {};
  try {
    const files = fs.readdirSync(recipesPath);
    files.forEach((file) => {
      if (file.endsWith(".yaml") || file.endsWith(".yml")) {
        const content = fs.readFileSync(path.join(recipesPath, file), "utf8");
        const recipe = yaml.parse(content);
        recipes[recipe.id] = recipe;
      }
    });
  } catch (error) {
    console.error("Error loading recipes:", error);
  }
  return recipes;
}

// Load all Markdown docs
function loadDocs() {
  const docs = {};
  try {
    const files = fs.readdirSync(docsPath);
    files.forEach((file) => {
      if (file.endsWith(".md")) {
        const content = fs.readFileSync(path.join(docsPath, file), "utf8");
        const name = file.replace(".md", "");
        docs[name] = content;
      }
    });
  } catch (error) {
    console.error("Error loading docs:", error);
  }
  return docs;
}

const recipes = loadRecipes();
const docs = loadDocs();

console.log(
  `Loaded ${Object.keys(recipes).length} recipes and ${
    Object.keys(docs).length
  } docs`
);

// Routes

// Explain element endpoint
app.post("/explain-element", async (req, res) => {
  try {
    const { service, element, url } = req.body;

    if (service !== "bedrock") {
      return res.status(400).json({ error: "Only Bedrock service supported" });
    }

    // Get explanation from docs or generate with AI
    const elementType = element.type;
    const docKey = `bedrock_${elementType}`;

    if (docs[docKey]) {
      // Parse markdown doc for structured explanation
      const explanation = parseDocForElement(docs[docKey], element);
      return res.json(explanation);
    }

    // Fallback to basic explanation if no specific doc
    const explanation = getBasicExplanation(elementType);
    res.json(explanation);
  } catch (error) {
    console.error("Error in explain-element:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Generate plan endpoint
app.post("/plan", async (req, res) => {
  try {
    const { service, goal, url } = req.body;

    if (service !== "bedrock") {
      return res.status(400).json({ error: "Only Bedrock service supported" });
    }

    // Find matching recipe
    const matchingRecipe = findMatchingRecipe(goal, recipes);

    if (matchingRecipe) {
      return res.json(matchingRecipe);
    }

    // Fallback to basic plan if no matching recipe
    const basicPlan = generateBasicPlan(goal);
    res.json(basicPlan);
  } catch (error) {
    console.error("Error in plan generation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Error help endpoint
app.post("/error-help", async (req, res) => {
  try {
    const { service, error, url } = req.body;

    if (service !== "bedrock") {
      return res.status(400).json({ error: "Only Bedrock service supported" });
    }

    const diagnosis = diagnoseError(error);
    res.json(diagnosis);
  } catch (error) {
    console.error("Error in error-help:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Helper functions (simplified for MVP)
function parseDocForElement(docContent, element) {
  // Simple parsing - in production, use a proper markdown parser
  const lines = docContent.split("\n");
  let title = "";
  let what = "";
  let why = "";
  let pitfalls = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("# ")) {
      title = line.replace("# ", "");
    } else if (line.startsWith("## What")) {
      what = lines[i + 1] || "";
    } else if (line.startsWith("## Why")) {
      why = lines[i + 1] || "";
    } else if (line.startsWith("## Pitfalls")) {
      pitfalls = lines[i + 1] || "";
    }
  }

  return {
    title: title || element.type,
    what: what || `This is a ${element.type} parameter in Bedrock`,
    why: why || "It affects how the AI model behaves",
    pitfalls: pitfalls || "Be careful with the values you set",
  };
}

function getBasicExplanation(elementType) {
  const explanations = {
    temperature: {
      title: "Temperature",
      what: "Controls randomness and creativity in AI responses. Lower values (0.1-0.3) produce more focused responses. Higher values (0.7-1.0) generate more creative outputs.",
      why: "Temperature affects response quality and consistency. For chatbots, 0.7 is usually optimal - creative but not random.",
      pitfalls:
        "Too low: Responses become repetitive. Too high: Responses may become incoherent.",
    },
    max_tokens: {
      title: "Max Tokens",
      what: "Maximum length of the AI response in tokens. 1 token ≈ 0.75 words in English.",
      why: "Each token costs money, so setting appropriate limits prevents unexpected charges.",
      pitfalls:
        "Too low: Responses get cut off. Too high: Wastes money on unused capacity.",
    },
    model: {
      title: "Foundation Model Selection",
      what: "Choose which AI model to use for your application. Different models excel at different tasks.",
      why: "Model choice affects response quality, speed, and cost. Claude 3.5 Sonnet is best for general tasks.",
      pitfalls:
        "Don't always choose the most expensive model. Some models require approval.",
    },
  };

  return (
    explanations[elementType] || {
      title: "Unknown Element",
      what: "This element is not yet recognized by AWS Tutor.",
      why: "We're constantly adding support for more Bedrock console elements.",
      pitfalls:
        "Try hovering over temperature, max tokens, or model selector for explanations.",
    }
  );
}

function findMatchingRecipe(goal, recipes) {
  const goalLower = goal.toLowerCase();

  for (const [id, recipe] of Object.entries(recipes)) {
    if (
      goalLower.includes(id) ||
      goalLower.includes(recipe.title.toLowerCase())
    ) {
      return recipe;
    }
  }

  return null;
}

function generateBasicPlan(goal) {
  return {
    summary: `Basic plan for: ${goal}`,
    checklist: [
      {
        ui: "Select appropriate model for your task",
        why: "Different models excel at different tasks (text, analysis, coding)",
      },
      {
        ui: "Set temperature based on task type",
        why: "Creative tasks need higher temperature (0.7-0.9), analytical tasks need lower (0.1-0.3)",
      },
      {
        ui: "Set max tokens for expected response length",
        why: "Prevents runaway costs and ensures appropriate response length",
      },
      {
        ui: "Write clear, specific prompt with context",
        why: "Good prompts get better results and reduce retry costs",
      },
      {
        ui: "Test with sample input and iterate",
        why: "Refine your approach based on initial results",
      },
    ],
    cost_note:
      "Costs vary by model and usage. Monitor your spending and set up billing alerts.",
    risk_flags: ["Monitor costs", "Test thoroughly", "Validate outputs"],
    iam_actions_minimal: ["bedrock:InvokeModel"],
    cleanup: "Review results, clean up test data, monitor costs",
  };
}

function diagnoseError(error) {
  const errorLower = error.toLowerCase();

  if (errorLower.includes("accessdenied")) {
    return {
      title: "Access Denied Error",
      cause: "Missing IAM permissions for Bedrock model invocation",
      solution:
        "Add the bedrock:InvokeModel permission to your IAM policy. For testing, use the AmazonBedrockFullAccess managed policy.",
      prevention: "Always test permissions in a development environment first.",
    };
  }

  if (errorLower.includes("validation")) {
    return {
      title: "Validation Error",
      cause: "Invalid request parameters or model configuration",
      solution:
        "Check your request format, model ID, and parameter values. Ensure temperature is between 0-1 and max_tokens is positive.",
      prevention: "Validate all parameters before sending requests.",
    };
  }

  if (errorLower.includes("throttling")) {
    return {
      title: "Rate Limit Exceeded",
      cause: "Too many requests sent too quickly to Bedrock",
      solution:
        "Implement exponential backoff and retry logic. Wait before retrying failed requests.",
      prevention: "Add delays between requests in your application.",
    };
  }

  return {
    title: "Unknown Error",
    cause: "This error is not yet recognized by AWS Tutor",
    solution:
      "Check the AWS Bedrock documentation or AWS support for help with this specific error.",
    prevention:
      "Common issues include IAM permissions, invalid parameters, rate limits, and model access.",
  };
}

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    recipes: Object.keys(recipes).length,
    docs: Object.keys(docs).length,
  });
});

app.listen(port, () => {
  console.log(`AWS Tutor backend listening at http://localhost:${port}`);
  console.log(`Recipes loaded: ${Object.keys(recipes).length}`);
  console.log(`Docs loaded: ${Object.keys(docs).length}`);
});
