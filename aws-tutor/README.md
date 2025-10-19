# AWS Tutor - AI Console Assistant

> **An intelligent Chrome extension that transforms the AWS Console into an interactive learning experience with AI-powered explanations, step-by-step guidance, and error diagnosis.**

## 🚀 What is AWS Tutor?

AWS Tutor is a Chrome extension that acts as your personal AWS Solutions Architect, providing three powerful modes to help you navigate and understand AWS services:

- **🧠 Explain Mode**: Hover over any AWS Console element to get instant AI-powered explanations
- **🎯 Do Mode**: Get step-by-step visual guidance for complex AWS tasks
- **🔧 Error Whisperer**: Paste error messages to get instant diagnosis and solutions

## ✨ Key Features

### 🧠 Explain Mode

- **Hover explanations** on AWS Console elements
- **AI-powered insights** from Amazon Bedrock knowledge base
- **Bedrock-specific** parameter explanations (temperature, max tokens, models)
- **General AWS** service guidance for EC2, S3, Lambda, IAM, and more

### 🎯 Do Mode

- **Step-by-step guidance** with visual cues and highlights
- **Recipe-based plans** from structured YAML knowledge base
- **Visual overlays** pointing to clickable elements
- **Progress tracking** through complex multi-step workflows
- **Cost and security notes** for each task

### 🔧 Error Whisperer

- **Instant error diagnosis** with root cause analysis
- **Solution suggestions** with step-by-step fixes
- **Prevention tips** to avoid future issues
- **Common error patterns** recognition

## 🏗️ Architecture

```
Chrome Extension (Frontend)
├── Popup UI (3 modes)
├── Content Script (DOM interaction)
├── Background Script (API communication)
└── Visual Overlays (guidance & tooltips)

Node.js Backend API
├── Express Server (localhost:3001)
├── Recipe System (YAML knowledge base)
├── Documentation (Markdown docs)
└── AI Integration (Bedrock-ready)

Knowledge Base
├── recipes/ (YAML task definitions)
├── docs/ (Markdown explanations)
└── prompts/ (AI prompt templates)
```

## 📁 Project Structure

```
aws-tutor/
├── extension/                    # Chrome Extension
│   ├── manifest.json            # Extension configuration
│   ├── popup.html               # Main UI with 3 modes
│   ├── popup.js                 # Mode switching & logic
│   ├── background.js            # API communication
│   ├── content.js               # DOM interaction & AI features
│   ├── content.css              # Visual styling
│   ├── styles/
│   │   └── popup.css            # Popup styling
│   └── icons/                   # Extension icons
├── backend/                     # Node.js API Server
│   ├── server.js                # Express server
│   ├── package.json             # Dependencies
│   └── env.example              # Environment template
├── recipes/                     # YAML Knowledge Base
│   ├── bedrock_chatbot.yaml     # AI chatbot creation
│   ├── bedrock_content_generation.yaml
│   └── s3_demo_recipe.yaml
├── docs/                        # Markdown Documentation
│   ├── bedrock_temperature.md   # Temperature parameter
│   ├── bedrock_max_tokens.md    # Max tokens parameter
│   └── bedrock_model.md         # Model selection guide
├── prompts/                     # AI Prompt Templates
│   ├── explain_element.txt      # Element explanation prompts
│   ├── generate_plan.txt        # Task planning prompts
│   └── diagnose_error.txt       # Error diagnosis prompts
├── test-demo.sh                 # Quick setup script
├── test-api.sh                  # API testing script
└── README.md                    # This file
```

## 🚀 Quick Start

### 1. Setup Backend API

```bash
# Navigate to project directory
cd aws-tutor

# Install dependencies
cd backend
npm install

# Create environment file
cp env.example .env
# Edit .env with your AWS credentials

# Start the server
npm start
# Server runs on http://localhost:3001
```

### 2. Load Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `aws-tutor/extension` folder
5. The AWS Tutor icon should appear in your extensions bar

### 3. Test on AWS Console

1. Navigate to [AWS Bedrock Console](https://console.aws.amazon.com/bedrock/)
2. Click the AWS Tutor extension icon
3. Choose a mode:
   - **Explain Mode**: Hover over temperature, max tokens, or model selector
   - **Do Mode**: Try "Create an AI chatbot with Bedrock"
   - **Error Whisperer**: Paste any AWS error message

## 🧪 Testing

### Test Backend API

```bash
# Run the test script
./test-api.sh

# Or test manually
curl http://localhost:3001/health
curl -X POST http://localhost:3001/explain-element \
  -H "Content-Type: application/json" \
  -d '{"service":"bedrock","element":{"type":"temperature"},"url":"test"}'
```

### Test Chrome Extension

1. Load extension in Chrome (see Quick Start)
2. Go to AWS Bedrock Console
3. Click extension icon and try different modes
4. Check browser console for any errors

## 🔧 Configuration

### Environment Variables

Create `backend/.env`:

```bash
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-west-2
PORT=3001
NODE_ENV=development
```

### Extension Permissions

The extension requires:

- `activeTab`: To interact with AWS Console pages
- `storage`: To save user preferences
- `scripting`: To inject content scripts
- `host_permissions`: For AWS Console domains

## 📚 Knowledge Base

### Recipes (YAML)

Structured task definitions with:

- Step-by-step instructions
- UI element selectors
- Explanations for each step
- Cost and security notes
- Cleanup instructions

### Documentation (Markdown)

Detailed explanations of:

- AWS service parameters
- Best practices and pitfalls
- Use case recommendations
- Related tasks and resources

### Prompts (Text)

AI prompt templates for:

- Element explanations
- Task planning
- Error diagnosis
- Custom AI interactions

## 🎯 Supported AWS Services

### Currently Supported

- **Amazon Bedrock**: Full support with explain/do/error modes
- **General AWS Console**: Basic visual guidance

### Planned Support

- **EC2**: Instance creation and management
- **S3**: Bucket creation and configuration
- **Lambda**: Function creation and deployment
- **IAM**: Role and policy management
- **RDS**: Database setup and configuration

## 🛠️ Development

### Adding New Recipes

1. Create YAML file in `recipes/` folder
2. Follow the existing format with `id`, `title`, `steps`, etc.
3. Test with the backend API

### Adding New Documentation

1. Create Markdown file in `docs/` folder
2. Use structured format with `## What`, `## Why`, `## Pitfalls`
3. Reference in recipes or prompts

### Extending AI Features

1. Add new prompt templates in `prompts/`
2. Update backend API endpoints
3. Integrate with content script

## 🚀 Demo Scenarios

### 1. Bedrock Chatbot Creation

1. Go to Bedrock Console
2. Click AWS Tutor → Do Mode
3. Enter "Create an AI chatbot"
4. Follow visual guidance through each step

### 2. Parameter Explanation

1. Go to Bedrock Console
2. Click AWS Tutor → Explain Mode
3. Hover over temperature slider
4. See AI-powered explanation

### 3. Error Diagnosis

1. Encounter an AWS error
2. Click AWS Tutor → Error Whisperer
3. Paste error message
4. Get instant diagnosis and solution

## 🔮 Future Enhancements

### Phase 1: Enhanced AI Integration

- Real Amazon Bedrock API calls
- Dynamic prompt generation
- Context-aware responses

### Phase 2: Multi-Service Support

- EC2, S3, Lambda, IAM support
- Cross-service workflows
- Service-specific recipes

### Phase 3: Advanced Features

- Voice input support
- Video tutorials integration
- Community recipe sharing
- Export to Infrastructure as Code

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your improvements
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Amazon Web Services for Bedrock and console APIs
- Chrome Extension APIs for browser integration
- The open-source community for inspiration and tools

---

**Ready to transform your AWS Console experience? Load the extension and start learning! 🚀**
