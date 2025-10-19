# AWS Console Navigator

An intelligent Chrome extension that guides users through AWS Console workflows using visual navigation cues and natural language input.

## 🚀 Features

### Core Functionality
- **Natural Language Input**: Describe your AWS goals in plain English
- **Visual Navigation Cues**: Red pulsing borders and guidance panels highlight target elements
- **Step-by-Step Guidance**: Break down complex AWS workflows into manageable steps
- **Smart Page Detection**: Automatically detects page changes and advances workflow
- **Clickable Navigation**: Direct links to AWS services with automatic page tracking

### Supported Workflows
- **EC2 Instance Launch**: Complete 12-step workflow for launching EC2 instances
- **S3 Static Website Hosting**: Guide for hosting static websites
- **RDS Database Setup**: Database creation and configuration
- **Lambda API Creation**: Serverless API development
- **General AWS Navigation**: Flexible guidance for any AWS service

## 📁 Project Structure

```
extension/
├── manifest.json          # Chrome extension configuration
├── popup.html             # Extension popup interface
├── popup.js               # Popup functionality
├── popup.css              # Popup styling
├── background.js          # Service worker and workflow management
├── content.js             # DOM manipulation and visual cues
├── content.css            # Visual cue styling
├── icons/                 # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── test-ec2-workflow.html # Testing page for EC2 workflow
└── styles/
    └── popup.css          # Additional popup styles
```

## 🛠️ Installation

### Prerequisites
- Chrome browser (Manifest V3 compatible)
- AWS Console access

### Setup
1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `extension/` folder
5. The AWS Console Navigator extension should appear in your extensions list

## 🎯 Usage

### Starting a Workflow
1. Navigate to the AWS Console (`console.aws.amazon.com`)
2. Click the AWS Console Navigator extension icon
3. Choose from quick start options or enter your goal in natural language:
   - "I want to launch an EC2 instance"
   - "Set up a database for my app"
   - "Create a serverless API"
   - "Host a static website"

### Following Visual Guidance
- **Red Pulsing Border**: Highlights the element you need to click
- **Guidance Panel**: Shows step instructions and navigation controls
- **Clickable Links**: Direct navigation to AWS services
- **Auto-Advancement**: Automatically moves to next step when page changes

### Navigation Controls
- **Previous**: Go back to the previous step
- **Next**: Advance to the next step
- **Stop**: End the current workflow
- **×**: Close the guidance panel

## 🔧 Technical Implementation

### Architecture
- **Manifest V3**: Modern Chrome extension architecture
- **Service Worker**: Background script for workflow management
- **Content Scripts**: DOM manipulation and visual cues
- **Web Scraping Techniques**: Robust element detection using multiple strategies

### Element Detection Strategies
The extension uses 11 different strategies to find elements:

1. **Direct CSS Selector**: Standard `document.querySelector()`
2. **Data-testid Fallback**: `[data-testid="element"]`
3. **Aria-label Search**: `[aria-label*="text"]`
4. **Title Attribute**: `[title*="text"]`
5. **Exact Text Match**: Find elements with exact text content
6. **Partial Text Match**: Find elements containing text
7. **AWS Console Specific**: Special handling for AWS UI elements
8. **EC2 Service Detection**: Text-based EC2 service finding
9. **Launch Instance Button**: Multiple approaches for AWS buttons
10. **Error State Detection**: Identifies page loading issues
11. **Comprehensive Search**: Scans all elements with multiple criteria

### Visual Cue System
- **Overlay**: Full-screen transparent overlay for visual cues
- **Pulsing Animation**: CSS keyframes for attention-grabbing effects
- **Z-index Management**: Ensures cues appear above all content
- **Responsive Design**: Adapts to different screen sizes

## 🧪 Testing

### Test Page
Use `test-ec2-workflow.html` to test the extension without accessing AWS Console:

1. Open the test page in your browser
2. Click "Start Workflow" to begin testing
3. Test individual steps with the step buttons
4. Simulate page navigation with "Simulate EC2 Navigation"

### Debug Information
The extension provides detailed console logging:
- Element search strategies and results
- Page structure analysis
- Error state detection
- Workflow progress tracking

## 📋 Current Workflows

### EC2 Instance Launch (12 Steps)
1. Navigate to EC2 Console
2. Launch Instance
3. Enter Instance Name
4. Choose Operating System
5. Select Free Tier AMI
6. Choose Instance Type
7. Create Key Pair
8. Configure Network Settings
9. Configure Storage
10. Review and Launch
11. Monitor Instance Status
12. Check Instance State

### S3 Static Website Hosting (4 Steps)
1. Navigate to S3
2. Create Bucket
3. Configure Bucket
4. Enable Static Hosting

### RDS Database Setup (2 Steps)
1. Navigate to RDS
2. Create Database

### Lambda API Creation (2 Steps)
1. Navigate to Lambda
2. Create Function

## 🔍 Troubleshooting

### Common Issues

**Extension not detecting elements:**
- Ensure you're on the correct AWS Console page
- Check browser console for debug information
- Try refreshing the page

**Page loading errors:**
- The extension detects "Unable to load content" errors
- Refresh the page or check your network connection
- Clear browser cache if issues persist

**Visual cues not appearing:**
- Check if the extension is enabled
- Ensure you're on an AWS Console page
- Look for console error messages

### Debug Mode
Enable detailed logging by opening browser DevTools and checking the Console tab for:
- `🔍 Web scraping approach: Searching for element...`
- `✅ Found element with strategy:`
- `⚠️ AWS Console error detected`

## 🚧 Development Status

### Completed Features
- ✅ Basic extension structure (Manifest V3)
- ✅ Visual cue system with pulsing animations
- ✅ Natural language input processing
- ✅ Step-by-step workflow guidance
- ✅ Page change detection and auto-advancement
- ✅ Clickable navigation links
- ✅ Error state detection
- ✅ Comprehensive element finding strategies
- ✅ EC2 instance launch workflow (12 steps)
- ✅ Test page for development

### In Progress
- 🔄 Additional AWS service workflows
- 🔄 Enhanced error handling
- 🔄 User preference settings

### Planned Features
- 📋 AI-powered workflow generation
- 📋 Voice input support
- 📋 Multi-service workflows
- 📋 Workflow templates
- 📋 Progress persistence
- 📋 Customizable visual cues

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Make changes in the `extension/` directory
3. Test using the provided test page
4. Submit a pull request with detailed description

### Code Style
- Use modern JavaScript (ES6+)
- Follow Chrome extension best practices
- Include comprehensive error handling
- Add detailed console logging for debugging

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- AWS Console UI patterns and element structures
- Chrome Extension development best practices
- Web scraping techniques inspired by Beautiful Soup and Selenium
- Community feedback and testing

## 📞 Support

For issues, questions, or contributions:
- Check the troubleshooting section above
- Review console logs for debug information
- Test with the provided test page
- Submit issues with detailed reproduction steps

---

**AWS Console Navigator** - Making AWS accessible through intelligent guidance 🚀