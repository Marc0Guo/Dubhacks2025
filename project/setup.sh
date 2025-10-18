#!/bin/bash

# Hackathon Template Setup Script
echo "🚀 Setting up Hackathon Template..."

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists. Skipping environment setup."
else
    echo "📝 Creating .env.local from template..."
    cp env.template .env.local
    echo "✅ Environment file created. Please edit .env.local with your actual values."
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Install dependencies (in case they're missing)
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your Google OAuth credentials"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "For Google OAuth setup, visit: https://console.cloud.google.com/"
echo "Add redirect URI: http://localhost:3000/api/auth/callback/google"
