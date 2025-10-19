#!/bin/bash

# AWS Tutor - Quick Start Script
# This script will start both backends using the .env file

echo "🚀 AWS Tutor - Quick Start"
echo "=========================="

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Please run ./scripts/setup.sh first"
    exit 1
fi

# Load environment variables
echo "📋 Loading environment variables..."
export $(cat .env | grep -v '^#' | xargs)

# Check if API key is set
if [ -z "$AWS_BEARER_TOKEN_BEDROCK" ]; then
    echo "❌ AWS_BEARER_TOKEN_BEDROCK not set in .env file!"
    exit 1
fi

echo "✅ Environment loaded successfully"
echo "🔑 API Key: ${AWS_BEARER_TOKEN_BEDROCK:0:20}..."
echo "🌍 Region: $AWS_DEFAULT_REGION"
echo ""

# Kill any existing processes on ports 3000 and 5001
echo "🧹 Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5001 | xargs kill -9 2>/dev/null || true
echo "✅ Ports cleared"

# Start Lambda backend
echo "🟢 Starting Lambda backend..."
cd lambda-backend
npm run offline &
LAMBDA_PID=$!
cd ..

# Wait a moment for Lambda to start
sleep 3

# Start Python Bedrock Agent
echo "🐍 Starting Python Bedrock Agent..."
cd python-agent
python3 start-agent.py &
PYTHON_PID=$!
cd ..

# Wait a moment for Python to start
sleep 3

echo ""
echo "🎉 Both backends started successfully!"
echo ""
echo "📡 Backend URLs:"
echo "   Lambda Backend: http://localhost:3000/dev"
echo "   Python Agent: http://localhost:5001"
echo ""
echo "🧪 Test the integration:"
echo "   node demo-integration.js"
echo ""
echo "🌐 Load Chrome Extension:"
echo "   1. Open Chrome → Extensions → Developer mode"
echo "   2. Click 'Load unpacked' → Select 'extension' folder"
echo ""
echo "Press Ctrl+C to stop both backends"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping backends..."
    kill $LAMBDA_PID 2>/dev/null
    kill $PYTHON_PID 2>/dev/null
    echo "✅ Backends stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
