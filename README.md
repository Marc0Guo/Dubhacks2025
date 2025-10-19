# AWS Tutor - AI-Powered AWS Console Assistant

AWS Tutor is an intelligent Chrome extension that transforms the AWS Console into a guided learning experience. It provides AI-powered explanations, step-by-step guidance, and error diagnosis to help users master AWS services.

## 🚀 Features

### 🧠 Explain Mode

- **Hover Explanations**: Hover over any AWS Console element to get instant AI-powered explanations
- **Context-Aware**: Understands what you're looking at and provides relevant information
- **Learning Focus**: Designed to help you understand AWS concepts, not just complete tasks

### 🎯 Do Mode

- **Step-by-Step Guidance**: Get personalized plans for complex AWS tasks
- **Visual Cues**: See exactly where to click and what to configure
- **Best Practices**: Learn the right way to use AWS services

### 🔧 Error Whisperer

- **Smart Diagnosis**: Paste any AWS error and get instant diagnosis
- **Solution Steps**: Clear, actionable steps to fix the problem
- **Prevention Tips**: Learn how to avoid similar issues in the future

## 📁 Current Project Structure

```
aws-tutor/
├── extension/                 # Chrome Extension (MV3)
│   ├── manifest.json         # Extension configuration
│   ├── popup.html            # Main popup interface
│   ├── popup.js              # Popup logic and mode switching
│   ├── background.js         # Service worker for API communication
│   ├── content.js            # Content script for AWS Console interaction
│   ├── content.css           # Styles for in-page overlays
│   ├── icons/                # Extension icons (16px, 32px, 48px, 128px)
│   └── styles/
│       └── popup.css         # Popup styling
├── backend/                  # Node.js API Server
│   ├── server.js             # Express server with AWS integration
│   └── package.json          # Dependencies and scripts
├── recipes/                  # YAML Knowledge Base
│   └── bedrock_chatbot.yaml  # AI chatbot creation recipe
├── docs/                     # Markdown Documentation
│   └── bedrock_temperature.md # Temperature parameter explanation
├── test-demo.sh              # Quick demo setup script
├── test-api.sh               # API testing script
└── README.md                 # This file
```

## 🛠️ Quick Start

### 1. Start the Backend API

```bash
# Make scripts executable
chmod +x test-demo.sh test-api.sh

# Start the backend server (includes dependency installation)
./test-demo.sh
```

### 2. Load the Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `extension/` folder
4. The AWS Tutor icon should appear in your extensions toolbar

### 3. Test the Extension

1. Navigate to [AWS Bedrock Console](https://console.aws.amazon.com/bedrock/)
2. Click the AWS Tutor extension icon
3. Choose a mode and start exploring!

## 🧪 Testing

### Test Backend API

```bash
# Run API tests (requires backend to be running)
./test-api.sh
```

### Manual API Testing

```bash
# Health check
curl http://localhost:3001/health

# Explain element
curl -X POST http://localhost:3001/explain-element \
  -H "Content-Type: application/json" \
  -d '{"service":"bedrock","element":{"type":"temperature"},"url":"test"}'

# Generate plan
curl -X POST http://localhost:3001/plan \
  -H "Content-Type: application/json" \
  -d '{"service":"bedrock","goal":"Create an AI chatbot","url":"test"}'

# Error help
curl -X POST http://localhost:3001/error-help \
  -H "Content-Type: application/json" \
  -d '{"service":"bedrock","error":"AccessDenied: User is not authorized","url":"test"}'
```

## 🎯 Demo Focus: Amazon Bedrock

This demo is specifically optimized for the **Amazon Bedrock Console**, making it perfect for showcasing AI explaining AI. The extension provides:

- **Temperature Parameter**: Understand how creativity vs. consistency works
- **Model Selection**: Learn about different foundation models
- **Token Limits**: Understand cost control and response length
- **Prompt Engineering**: Best practices for AI interactions

## 🔧 Technical Architecture

### Frontend (Chrome Extension)

- **Manifest V3**: Modern Chrome extension architecture
- **Content Scripts**: Inject AI assistance into AWS Console pages
- **Background Service Worker**: Handle API communication and state management
- **Popup Interface**: Three-mode UI for user interaction

### Backend (Node.js API)

- **Express Server**: RESTful API for AI features
- **AWS SDK Integration**: Direct integration with Amazon Bedrock
- **Knowledge Base**: YAML recipes and Markdown docs for grounding
- **CORS Support**: Enable extension-to-backend communication

### Knowledge Base

- **YAML Recipes**: Structured, step-by-step guides for AWS tasks
- **Markdown Docs**: Detailed explanations of AWS concepts
- **Prompt Templates**: Reusable AI prompts for consistent responses

## 🚀 Development

### Adding New Services

1. Create new YAML recipe in `recipes/`
2. Add service-specific docs in `docs/`
3. Update content script element detection
4. Test with the new service

### Adding New Modes

1. Update popup HTML and CSS
2. Add mode logic to popup.js
3. Implement mode handling in background.js
4. Create content script features

## 📝 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-west-2
PORT=3001
NODE_ENV=development
```

## 🎉 Demo Script

1. **Start Backend**: `./test-demo.sh`
2. **Load Extension**: Load `extension/` folder in Chrome
3. **Navigate to Bedrock**: Go to AWS Bedrock Console
4. **Show Explain Mode**: Hover over temperature parameter
5. **Show Do Mode**: Click "Create AI Chatbot" quick goal
6. **Show Error Mode**: Click "Access Denied" quick goal

## 🤝 Contributing

This is a hackathon project! Feel free to:

- Add new AWS service support
- Improve the AI explanations
- Enhance the visual guidance
- Add more recipes and docs

## 📄 License

MIT License - see LICENSE file for details.

---

**Built for DubHacks 2025** 🚀

## 📋 Current Status

✅ **Completed:**

- Unified project structure with main components at root level
- Chrome extension with three modes (Explain, Do, Error)
- Backend API server with AWS integration
- Knowledge base with recipes and docs
- Testing scripts and setup automation

🔄 **In Progress:**

- Final cleanup of nested `aws-tutor/` folder
- Complete file consolidation

📝 **Next Steps:**

- Remove the old nested `aws-tutor/` folder
- Ensure all essential files are in the root-level folders
- Test the complete unified project
