// Centralized configuration loader for AWS Tutor
// Loads environment variables and provides configuration objects

const path = require("path");
const fs = require("fs");

// Load .env file if it exists
function loadEnvFile() {
  const envPath = path.join(__dirname, "..", ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    const lines = envContent.split("\n");

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith("#")) {
        const [key, ...valueParts] = trimmedLine.split("=");
        const value = valueParts.join("=").trim();
        if (key && value) {
          process.env[key] = value;
        }
      }
    });
  }
}

// Load environment variables
loadEnvFile();

// Configuration object
const config = {
  // AWS Configuration
  aws: {
    bearerToken: process.env.AWS_BEARER_TOKEN_BEDROCK || "",
    region: process.env.AWS_DEFAULT_REGION || "us-east-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },

  // Backend URLs
  backends: {
    lambda: {
      production:
        process.env.NODE_BACKEND_URL || "https://api.thishurtyougave.select",
      local: process.env.NODE_BACKEND_LOCAL || "http://localhost:3000/dev",
    },
    python: {
      production:
        process.env.PYTHON_AGENT_PRODUCTION ||
        "https://your-python-agent-url.com",
      local: process.env.PYTHON_AGENT_URL || "http://localhost:5001",
    },
  },

  // Development Configuration
  development: {
    nodeEnv: process.env.NODE_ENV || "development",
    debug: process.env.DEBUG === "true",
    logLevel: process.env.LOG_LEVEL || "info",
  },

  // Chrome Extension Configuration
  extension: {
    id: process.env.EXTENSION_ID || "aws-tutor-extension",
    version: process.env.EXTENSION_VERSION || "1.0.0",
  },

  // Bedrock Model Configuration
  bedrock: {
    modelId: process.env.BEDROCK_MODEL_ID || "amazon.titan-text-express-v1",
    maxTokens: parseInt(process.env.BEDROCK_MAX_TOKENS) || 1000,
    temperature: parseFloat(process.env.BEDROCK_TEMPERATURE) || 0.7,
  },

  // API Configuration
  api: {
    timeout: parseInt(process.env.API_TIMEOUT) || 30000,
    retryAttempts: parseInt(process.env.API_RETRY_ATTEMPTS) || 3,
    corsOrigins: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(",")
      : ["http://localhost:3000", "http://localhost:5001"],
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || "",
    redisUrl: process.env.REDIS_URL || "",
  },

  // Monitoring & Analytics
  monitoring: {
    sentryDsn: process.env.SENTRY_DSN || "",
    analyticsId: process.env.ANALYTICS_ID || "",
  },

  // Utility functions
  utils: {
    isProduction: () => config.development.nodeEnv === "production",
    isDevelopment: () => config.development.nodeEnv === "development",
    getLambdaBackendUrl: () =>
      config.utils.isProduction()
        ? config.backends.lambda.production
        : config.backends.lambda.local,
    getPythonAgentUrl: () =>
      config.utils.isProduction()
        ? config.backends.python.production
        : config.backends.python.local,
  },
};

// Validation
function validateConfig() {
  const errors = [];

  if (!config.aws.bearerToken) {
    errors.push("AWS_BEARER_TOKEN_BEDROCK is required");
  }

  if (!config.aws.region) {
    errors.push("AWS_DEFAULT_REGION is required");
  }

  if (errors.length > 0) {
    console.warn("Configuration validation warnings:");
    errors.forEach((error) => console.warn(`  - ${error}`));
    console.warn("Please check your .env file or environment variables.");
  }
}

// Validate configuration on load
validateConfig();

module.exports = config;
