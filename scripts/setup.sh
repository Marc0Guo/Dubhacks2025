#!/bin/bash

# AWS Tutor - Project Setup Script
# Sets up the entire project with centralized configuration

set -e

echo "🚀 AWS Tutor - Project Setup"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env exists, if not create from example
if [ ! -f ".env" ]; then
    print_status "Creating .env file from template..."
    if [ -f "env.example" ]; then
        cp env.example .env
        print_success ".env file created from template"
        print_warning "Please edit .env file with your actual API keys"
    else
        print_error "env.example file not found"
        exit 1
    fi
else
    print_success ".env file already exists"
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Install Node.js dependencies
print_status "Installing Node.js dependencies..."
cd lambda-backend
if [ -f "package.json" ]; then
    npm install
    print_success "Node.js dependencies installed"
else
    print_error "package.json not found in lambda-backend directory"
    exit 1
fi

# Install Python dependencies
print_status "Installing Python dependencies..."
cd ../python-agent
if [ -f "requirements.txt" ]; then
    pip3 install -r requirements.txt
    print_success "Python dependencies installed"
else
    print_warning "requirements.txt not found in python-agent directory"
fi

# Go back to root
cd ..

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs
mkdir -p temp
print_success "Directories created"

# Set up Chrome extension
print_status "Setting up Chrome extension..."
if [ -d "extension" ]; then
    print_success "Chrome extension directory found"
    print_status "To load the extension:"
    echo "  1. Open Chrome → Extensions → Developer mode"
    echo "  2. Click 'Load unpacked' → Select 'extension' folder"
else
    print_error "Extension directory not found"
fi

# Validate configuration
print_status "Validating configuration..."
if [ -f ".env" ]; then
    # Check if required variables are set
    if grep -q "your-bedrock-api-key-here" .env; then
        print_warning "Please update .env file with your actual API keys"
    else
        print_success "Configuration looks good"
    fi
fi

# Create start scripts
print_status "Creating start scripts..."

# Start both backends script
cat > start-backends.sh << 'EOF'
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
echo "Node.js Backend: http://localhost:3000/dev"
echo "Python Agent: http://localhost:5001"
echo ""
echo "Press Ctrl+C to stop both backends"

# Function to cleanup on exit
cleanup() {
    echo "Stopping backends..."
    kill $NODE_PID 2>/dev/null
    kill $PYTHON_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
EOF

chmod +x start-backends.sh
print_success "start-backends.sh created"

# Test integration script
cat > test-integration.sh << 'EOF'
#!/bin/bash
echo "🧪 Testing AWS Tutor Integration..."

# Load environment variables
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Run integration test
node demo-integration.js
EOF

chmod +x test-integration.sh
print_success "test-integration.sh created"

print_success "Setup complete! 🎉"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your API keys"
echo "2. Run ./start-backends.sh to start both backends"
echo "3. Load the Chrome extension in your browser"
echo "4. Run ./test-integration.sh to test everything"
echo ""
echo "For more information, see README.md"
