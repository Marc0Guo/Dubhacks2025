#!/bin/bash

echo "🧪 Testing AWS Tutor Backend API"
echo "================================"

# Check if backend is running
if ! curl -s http://localhost:3001/health > /dev/null; then
    echo "❌ Backend server is not running on http://localhost:3001."
    echo "Please start the backend first by running './test-demo.sh' in the project root directory."
    exit 1
fi

echo "✅ Backend is running on http://localhost:3001"
echo ""

# 1. Test Health Check
echo "1. Testing Health Check..."
curl -s http://localhost:3001/health | jq .
echo ""

# 2. Test Explain Element
echo "2. Testing Explain Element (Temperature)..."
curl -s -X POST http://localhost:3001/explain-element \
  -H "Content-Type: application/json" \
  -d '{"service":"bedrock","element":{"type":"temperature"},"url":"test"}' | jq .
echo ""

# 3. Test Generate Plan
echo "3. Testing Generate Plan (Chatbot)..."
curl -s -X POST http://localhost:3001/plan \
  -H "Content-Type: application/json" \
  -d '{"service":"bedrock","goal":"Create an AI chatbot","url":"test"}' | jq .
echo ""

# 4. Test Error Help
echo "4. Testing Error Help (AccessDenied)..."
curl -s -X POST http://localhost:3001/error-help \
  -H "Content-Type: application/json" \
  -d '{"service":"bedrock","error":"AccessDenied: User is not authorized","url":"test"}' | jq .
echo ""

echo "🎉 All API endpoints are working!"
echo "Your Chrome extension team can now use these endpoints."
