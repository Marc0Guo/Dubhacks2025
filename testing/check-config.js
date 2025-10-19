// AWS Tutor - Configuration Checker
// Shows what's configured in your .env file

const config = require("../config/index.js");

console.log("🔧 AWS Tutor - Configuration Status");
console.log("=".repeat(50));

console.log("\n📋 AWS Configuration:");
console.log(
  `   Bearer Token: ${config.aws.bearerToken ? "✅ Set" : "❌ Missing"}`
);
console.log(`   Region: ${config.aws.region}`);
console.log(
  `   Access Key: ${config.aws.accessKeyId ? "✅ Set" : "❌ Missing"}`
);
console.log(
  `   Secret Key: ${config.aws.secretAccessKey ? "✅ Set" : "❌ Missing"}`
);

console.log("\n🌐 Backend URLs:");
console.log(`   Lambda (Local): ${config.backends.lambda.local}`);
console.log(`   Lambda (Production): ${config.backends.lambda.production}`);
console.log(`   Python (Local): ${config.backends.python.local}`);
console.log(`   Python (Production): ${config.backends.python.production}`);

console.log("\n⚙️ Development Settings:");
console.log(`   Environment: ${config.development.nodeEnv}`);
console.log(
  `   Debug Mode: ${config.development.debug ? "✅ Enabled" : "❌ Disabled"}`
);
console.log(`   Log Level: ${config.development.logLevel}`);

console.log("\n🤖 Bedrock Configuration:");
console.log(`   Model ID: ${config.bedrock.modelId}`);
console.log(`   Max Tokens: ${config.bedrock.maxTokens}`);
console.log(`   Temperature: ${config.bedrock.temperature}`);

console.log("\n🔌 API Settings:");
console.log(`   Timeout: ${config.api.timeout}ms`);
console.log(`   Retry Attempts: ${config.api.retryAttempts}`);
console.log(`   CORS Origins: ${config.api.corsOrigins.join(", ")}`);

console.log("\n📊 Status Summary:");
const hasApiKey = !!config.aws.bearerToken;
const hasRegion = !!config.aws.region;
const isConfigured = hasApiKey && hasRegion;

console.log(
  `   Configuration: ${isConfigured ? "✅ Complete" : "❌ Incomplete"}`
);
console.log(`   Ready to run: ${isConfigured ? "✅ Yes" : "❌ No"}`);

if (isConfigured) {
  console.log("\n🚀 Next Steps:");
  console.log("   1. Run: ./quick-start.sh");
  console.log("   2. Load Chrome extension");
  console.log("   3. Test: node demo-integration.js");
} else {
  console.log("\n⚠️  Missing Configuration:");
  if (!hasApiKey) console.log("   - AWS_BEARER_TOKEN_BEDROCK");
  if (!hasRegion) console.log("   - AWS_DEFAULT_REGION");
  console.log("\n   Please check your .env file");
}

console.log("\n" + "=".repeat(50));
