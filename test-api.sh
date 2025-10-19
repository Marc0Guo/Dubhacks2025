#!/bin/bash

# AWS Tutor API Test Script
# Tests all endpoints through the Cloudflare Worker proxy

BASE="https://api.thishurtyougave.select"

echo "🧪 Testing AWS Tutor API endpoints..."
echo "=================================="

# Test 1: Health Check
echo "1. Testing health endpoint..."
curl -s "$BASE/health" | jq .
echo ""

# Test 2: Plan Generation
echo "2. Testing plan generation..."
curl -s -X POST "$BASE/plan" \
  -H 'Content-Type: application/json' \
  -d '{"service": "bedrock", "goal": "Create a chatbot"}' | jq .
echo ""

# Test 3: Element Explanation
echo "3. Testing element explanation..."
curl -s -X POST "$BASE/explain-element" \
  -H 'Content-Type: application/json' \
  -d '{"service": "bedrock", "element": {"type": "temperature", "label": "Temperature"}}' | jq .
echo ""

# Test 4: Error Help
echo "4. Testing error help..."
curl -s -X POST "$BASE/error-help" \
  -H 'Content-Type: application/json' \
  -d '{"service": "bedrock", "error": "AccessDeniedException"}' | jq .
echo ""

# Test 5: Unknown element
echo "5. Testing unknown element..."
curl -s -X POST "$BASE/explain-element" \
  -H 'Content-Type: application/json' \
  -d '{"service": "bedrock", "element": {"type": "unknown_field", "label": "Unknown Field"}}' | jq .
echo ""

# Test 6: Unknown error
echo "6. Testing unknown error..."
curl -s -X POST "$BASE/error-help" \
  -H 'Content-Type: application/json' \
  -d '{"service": "bedrock", "error": "SomeRandomError"}' | jq .
echo ""

echo "✅ API testing complete!"
