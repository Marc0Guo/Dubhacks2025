# AWS Tutor - Intelligent Cloud Guidance System

An advanced Chrome extension that provides intelligent guidance for AWS Console workflows, combining traditional step-by-step instructions with AI-powered assistance. Built for Dubhacks 2025, this system makes AWS accessible to beginners while offering advanced AI capabilities for experienced users.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+ and pip
- Chrome browser (Manifest V3 compatible)
- AWS Account with Bedrock access
- AWS API Key (Bearer Token)

### One-Command Setup

```bash
# Clone and setup everything
git clone <repository-url>
cd Dubhacks2025
./scripts/setup.sh

# Start both backends
./quick-start.sh

# Load Chrome extension and test!
```

### Manual Setup

```bash
# 1. Install dependencies
cd lambda-backend && npm install
cd ../python-agent && pip install -r requirements.txt

# 2. Configure environment
cp env.example .env
# Edit .env with your API keys

# 3. Start backends
cd lambda-backend && npm run offline  # Terminal 1
cd ../python-agent && python3 start-agent.py  # Terminal 2

# 4. Load Chrome extension
# Open Chrome → Extensions → Developer mode → Load unpacked → Select 'extension' folder
```

## 🚀 Features

### Core Functionality

- **Dual Backend System**: Node.js Lambda backend for AWS guidance + Python Bedrock Agent for AI features
- **Natural Language Input**: Describe your AWS goals in plain English
- **Visual Navigation Cues**: Red pulsing borders and guidance panels highlight target elements
- **Step-by-Step Guidance**: Break down complex AWS workflows into manageable steps
- **AI-Powered Analysis**: Advanced element analysis and conversational AI
- **Smart Page Detection**: Automatically detects page changes and advances workflow
- **Clickable Navigation**: Direct links to AWS services with automatic page tracking
- **Multi-Mode Interface**: Explain, Do, Error Whisperer, and AI Chat modes

### AI Capabilities

- **Conversational AI**: Ask questions and get intelligent responses
- **Advanced Element Analysis**: AI-powered analysis of AWS Console elements
- **Tool Calling**: AI can use tools like time, calculator, and element explanation
- **AWS Expertise**: Specialized knowledge about AWS services and best practices
- **Error Troubleshooting**: AI-powered error diagnosis and solutions

### Supported Workflows

- **EC2 Instance Launch**: Complete 12-step workflow for launching EC2 instances
- **S3 Static Website Hosting**: Guide for hosting static websites
- **RDS Database Setup**: Database creation and configuration
- **Lambda API Creation**: Serverless API development
- **Bedrock AI Integration**: AI model invocation and analysis
- **General AWS Navigation**: Flexible guidance for any AWS service

## 🏗️ Architecture

### Dual Backend System

#### Lambda Backend (AWS Guidance)

- **Purpose**: Traditional AWS guidance and step-by-step instructions
- **Technology**: Express.js, Serverless Framework, AWS Lambda
- **Features**:
  - AWS workflow plans
  - Element explanations
  - Error help
  - Bedrock integration for content generation

#### Python Agent (AI Features)

- **Purpose**: Advanced AI capabilities and conversational interface
- **Technology**: Flask, boto3, AWS Bedrock
- **Features**:
  - AI conversation
  - Advanced element analysis
  - Tool calling capabilities
  - AWS expertise

#### Chrome Extension (Frontend)

- **Purpose**: User interface and AWS Console integration
- **Technology**: Manifest V3, Service Workers, Content Scripts
- **Features**:
  - Visual guidance cues
  - Multi-mode interface
  - Smart backend selection
  - Real-time status monitoring

## 📁 Project Structure

```
Dubhacks2025/
├── README.md                    # This comprehensive guide
├── LICENSE                      # License file
├── .env                         # Environment configuration
├── .gitignore                   # Git ignore rules
├── package.json                 # Root package configuration
├── quick-start.sh               # Quick start script
├── start-backends.sh            # Start both backends
│
├── lambda-backend/              # Node.js Lambda Backend
│   ├── index.mjs                # Main Express application
│   ├── bedrock-*.mjs            # Bedrock integration files
│   ├── package.json             # Dependencies
│   ├── serverless.yml           # Serverless configuration
│   └── test-*.js                # Test scripts
│
├── python-agent/                # Python Bedrock Agent
│   ├── src/
│   │   ├── app.py               # Main application logic
│   │   └── app_with_bearer.py   # Bearer token authentication
│   ├── start-agent.py           # Agent startup script
│   ├── template.yaml            # AWS SAM template
│   └── requirements.txt         # Python dependencies
│
├── extension/                   # Chrome Extension
│   ├── manifest.json            # Extension configuration
│   ├── popup.html               # Main popup interface
│   ├── popup.js                 # Popup functionality
│   ├── background.js            # Service worker
│   ├── content.js               # Content script
│   ├── enhanced-api.js          # Smart API integration
│   ├── enhanced-popup-integrated.html # Enhanced popup
│   └── icons/                   # Extension icons
│
├── cloudflare/                  # Cloudflare Worker (Proxy)
│   ├── worker.js                # Worker script
│   └── wrangler.toml            # Cloudflare configuration
│
├── config/                      # Configuration
│   ├── index.js                 # Centralized configuration
│   └── env.js                   # Environment configuration
│
├── testing/                     # Testing Suite
│   ├── run-all-tests.js         # Comprehensive test runner
│   ├── check-config.js          # Configuration validation
│   ├── demo-integration.js      # Integration testing
│   ├── test-both-systems.js     # System testing
│   └── README.md                # Testing documentation
│
├── scripts/                     # Utility scripts
│   └── setup.sh                 # Project setup
│
└── docs/                        # Additional documentation
```

## 🔧 Configuration

### Environment Variables (.env)

```bash
# AWS Configuration
AWS_BEARER_TOKEN_BEDROCK=your-bedrock-api-key-here
AWS_DEFAULT_REGION=us-east-1

# Backend URLs
NODE_BACKEND_URL=https://api.thishurtyougave.select
NODE_BACKEND_LOCAL=http://localhost:3000/dev
PYTHON_AGENT_URL=http://localhost:5001

# Development
NODE_ENV=development
DEBUG=true
LOG_LEVEL=info

# Bedrock Model Configuration
BEDROCK_MODEL_ID=amazon.titan-text-express-v1
BEDROCK_MAX_TOKENS=1000
BEDROCK_TEMPERATURE=0.7
```

### Backend Configuration

#### Lambda Backend

- **Port**: 3000 (development)
- **Endpoints**: `/health`, `/plan`, `/explain-element`, `/error-help`
- **Authentication**: Bearer token for Bedrock API

#### Python Agent

- **Port**: 5001 (development)
- **Endpoints**: `/health`, `/agent`, `/explain-element`
- **Authentication**: Bearer token for Bedrock API

## 🎯 Usage

### Chrome Extension Modes

#### 1. AWS Guidance Mode

- **Purpose**: Traditional step-by-step AWS guidance
- **Backend**: Lambda backend
- **Features**: Workflow plans, element explanations, error help

#### 2. AI Chat Mode

- **Purpose**: Conversational AI assistance
- **Backend**: Python agent
- **Features**: AI conversation, AWS expertise, tool calling

#### 3. Element Analysis Mode

- **Purpose**: Advanced element analysis
- **Backend**: Both systems (Python preferred, Lambda fallback)
- **Features**: Smart element analysis, AI-powered insights

### Demo Features

#### Live Demo Buttons

- **Test Element Analysis**: Simulate element analysis
- **Test AI Conversation**: Test AI chat functionality
- **Test AWS Guidance**: Test traditional guidance
- **Test Both Systems**: Comprehensive integration test

#### Quick Start Options

- **Lambda Setup**: Pre-configured Lambda workflow
- **EC2 Instance**: Pre-configured EC2 workflow
- **S3 Bucket**: Pre-configured S3 workflow
- **RDS Database**: Pre-configured RDS workflow

## 🧪 Testing

### Comprehensive Testing

```bash
# Run all tests
node testing/run-all-tests.js

# Run individual tests
node testing/check-config.js
node testing/demo-integration.js
node testing/test-both-systems.js

# Test individual backends
cd lambda-backend && npm run test-bedrock
cd python-agent && python3 -m pytest
```

### Chrome Extension Testing

1. Load extension in Chrome
2. Navigate to AWS Console
3. Test different modes and features
4. Check browser console for debug information

### API Testing

```bash
# Test Lambda backend
curl http://localhost:3000/dev/health

# Test Python agent
curl http://localhost:5001/health

# Test AI conversation
curl -X POST http://localhost:5001/agent \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello, what can you do?"}'
```

## 🚀 Deployment

### Development

- Both backends run locally
- Chrome extension uses localhost URLs
- Perfect for development and testing

### Production

- Deploy Lambda backend to AWS Lambda
- Deploy Python agent to AWS Lambda
- Update extension URLs to production endpoints
- Publish extension to Chrome Web Store

### AWS Deployment

```bash
# Deploy Lambda backend
cd lambda-backend && npm run deploy

# Deploy Python agent
cd python-agent && sam deploy
```

## 🔍 Troubleshooting

### Common Issues

#### Backend Connection Issues

- **Check status indicators**: Extension shows backend status
- **Verify ports**: Ensure 3000 and 5001 are available
- **Check environment variables**: Verify API keys are set

#### Chrome Extension Issues

- **Reload extension**: After making changes
- **Check console**: Look for error messages
- **Verify permissions**: Ensure extension has required permissions

#### Bedrock API Issues

- **Check API key**: Verify bearer token is correct
- **Check region**: Ensure AWS region is set
- **Check model access**: Verify Bedrock model access

### Debug Mode

Enable detailed logging by checking browser console for:

- `🔍 Backend availability:`
- `✅ Found element with strategy:`
- `⚠️ AWS Console error detected`

### Log Files

- **Lambda Backend**: Check terminal output
- **Python Agent**: Check terminal output
- **Chrome Extension**: Check browser console

## 📊 Performance

### Backend Performance

- **Lambda Backend**: ~100-200ms response time
- **Python Agent**: ~500-2000ms response time (AI processing)
- **Fallback System**: Graceful degradation when backends unavailable

### Extension Performance

- **Visual Cues**: 60fps animations
- **Element Detection**: 11 robust search strategies
- **Memory Usage**: Minimal impact on browser performance

## 🤝 Development

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make changes following the code style
4. Test thoroughly
5. Submit a pull request

### Code Style

- **JavaScript**: ES6+, modern Chrome extension practices
- **Python**: PEP 8, type hints where appropriate
- **Documentation**: Comprehensive comments and README updates

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes following the code style
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Dubhacks 2025**: Hackathon platform and community
- **AWS Bedrock**: AI model capabilities
- **Chrome Extension API**: Modern extension development
- **Community**: Testing and feedback

## 📞 Support

For issues, questions, or contributions:

- Check the troubleshooting section
- Review console logs for debug information
- Test with provided demo scripts
- Submit issues with detailed reproduction steps

---

**AWS Tutor** - Making AWS accessible through intelligent guidance and AI assistance 🚀

_Built for Dubhacks 2025 - Empowering developers to master cloud infrastructure with the power of AI_
