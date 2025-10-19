#!/usr/bin/env node

// AWS Tutor - Comprehensive Testing Suite
// Runs all tests and provides a complete status report

const { execSync } = require("child_process");
const path = require("path");

console.log("🧪 AWS Tutor - Comprehensive Testing Suite");
console.log("=".repeat(60));
console.log("");

// Test configuration
const tests = [
  {
    name: "Configuration Check",
    file: "check-config.js",
    description: "Validates environment configuration",
  },
  {
    name: "Integration Test",
    file: "demo-integration.js",
    description: "Tests both backends working together",
  },
  {
    name: "Both Systems Test",
    file: "test-both-systems.js",
    description: "Tests individual system components",
  },
];

// Run individual test
function runTest(test) {
  console.log(`🔍 Running ${test.name}...`);
  console.log(`   ${test.description}`);

  try {
    const result = execSync(`node ${test.file}`, {
      cwd: __dirname,
      encoding: "utf8",
      stdio: "pipe",
    });

    console.log(`   ✅ ${test.name} - PASSED`);
    return { name: test.name, status: "PASSED", output: result };
  } catch (error) {
    console.log(`   ❌ ${test.name} - FAILED`);
    console.log(`   Error: ${error.message}`);
    return { name: test.name, status: "FAILED", error: error.message };
  }
}

// Main test runner
async function runAllTests() {
  const results = [];

  console.log("Starting comprehensive testing...");
  console.log("");

  // Run each test
  for (const test of tests) {
    const result = runTest(test);
    results.push(result);
    console.log("");
  }

  // Summary
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(60));

  const passed = results.filter((r) => r.status === "PASSED").length;
  const total = results.length;

  console.log(`Tests Passed: ${passed}/${total}`);
  console.log("");

  results.forEach((result) => {
    const status = result.status === "PASSED" ? "✅" : "❌";
    console.log(`${status} ${result.name}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log("");
  console.log("🎯 Next Steps:");
  if (passed === total) {
    console.log("   🚀 All tests passed! Your system is ready to use.");
    console.log("   📖 See README.md for usage instructions.");
  } else {
    console.log("   🔧 Some tests failed. Check the errors above.");
    console.log("   📖 See README.md troubleshooting section.");
  }

  console.log("");
  console.log("💡 Individual test commands:");
  console.log("   node testing/check-config.js");
  console.log("   node testing/demo-integration.js");
  console.log("   node testing/test-both-systems.js");
}

// Run the tests
runAllTests().catch(console.error);
