#!/bin/bash

echo "🚀 AWS Tutor Demo Test Script"
echo "=============================="

# Check if we're in the right directory
if [ ! -f "backend/server.js" ]; then
    echo "❌ Please run this from the project root directory"
    exit 1
fi

echo "📦 Setting up backend..."
cd backend

# Install dependencies
echo "Installing backend dependencies..."
npm install

# Create .env file with your credentials
echo "📝 Creating .env file..."
cat > .env << EOF
# AWS Credentials
AWS_ACCESS_KEY_ID=AKIAV4HSAUF5FSBY2U4C
AWS_SECRET_ACCESS_KEY=fkFuE+lH70McIn7zjoLUqCe8O1CYCbsuYIJK5f7x
AWS_REGION=us-west-2

# Backend Configuration
PORT=3001
NODE_ENV=development
EOF

echo "✅ Environment configured with your AWS credentials"

# Start the backend server
echo "🚀 Starting backend server..."
echo "Backend will run on http://localhost:3001"
echo ""
echo "To test the API endpoints:"
echo "1. Health check: curl http://localhost:3001/health"
echo "2. Explain element: curl -X POST http://localhost:3001/explain-element -H 'Content-Type: application/json' -d '{\"service\":\"bedrock\",\"element\":{\"type\":\"temperature\"},\"url\":\"test\"}'"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
node server.js
