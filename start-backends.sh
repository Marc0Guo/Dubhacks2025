#!/bin/bash
echo "🚀 Starting AWS Tutor Backends..."

# Load environment variables
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Start Lambda backend in background
echo "Starting Lambda backend..."
cd lambda-backend
npm run offline &
LAMBDA_PID=$!

# Start Python agent in background
echo "Starting Python Bedrock Agent..."
cd ../python-agent
python3 start-agent.py &
PYTHON_PID=$!

echo "Both backends started!"
echo "Lambda Backend: http://localhost:3000/dev"
echo "Python Agent: http://localhost:5001"
echo ""
echo "Press Ctrl+C to stop both backends"

# Function to cleanup on exit
cleanup() {
    echo "Stopping backends..."
    kill $LAMBDA_PID 2>/dev/null
    kill $PYTHON_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
