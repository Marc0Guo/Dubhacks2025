#!/bin/bash

# AWS Tutor Setup Script
echo "🚀 Setting up AWS Tutor..."

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    echo "❌ Please run this script from the aws-tutor directory"
    exit 1
fi

# Setup backend
echo "📦 Setting up backend..."
cd backend
if [ ! -f "package.json" ]; then
    echo "❌ Backend package.json not found"
    exit 1
fi

# Install dependencies
echo "Installing backend dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "✅ Environment file created. Please edit .env with your AWS credentials."
else
    echo "⚠️  .env already exists. Skipping environment setup."
fi

cd ..

# Check extension files
echo "🔍 Checking extension files..."
if [ ! -f "extension/public/manifest.json" ]; then
    echo "❌ Extension manifest not found"
    exit 1
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your AWS credentials"
echo "2. Run 'cd backend && npm start' to start the API server"
echo "3. Load the extension in Chrome:"
echo "   - Go to chrome://extensions/"
echo "   - Enable Developer mode"
echo "   - Click 'Load unpacked' and select the 'extension' folder"
echo "4. Go to the Bedrock console and test AWS Tutor!"
echo ""
echo "For demo:"
echo "- Hover over Bedrock parameters for explanations"
echo "- Use the sidebar for Do Mode and Error Whisperer"
echo "- Check the README.md for detailed instructions"
