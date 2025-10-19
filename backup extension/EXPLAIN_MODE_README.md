# AWS Console Navigator - Explain Mode

## Overview

The Explain Mode is a new feature that allows users to click on any element in the AWS Console to get AI-powered explanations of what it does and how to use it. This mode removes the need for a chatbox interface and provides instant, contextual help.

## Features

### 🧠 Explain Mode
- **Click-to-Explain**: Click any element in the AWS Console to get instant explanations
- **AI-Powered**: Uses Amazon Bedrock for intelligent analysis of AWS Console elements
- **Contextual Help**: Provides relevant information based on the element's context and surrounding content
- **No Chatbox**: Clean interface without text input - just click and learn

### Key Components

1. **Element Detection**: Automatically detects clickable elements and skips irrelevant ones
2. **Context Analysis**: Analyzes element attributes, text content, and surrounding context
3. **AI Integration**: Sends element data to Amazon Bedrock for intelligent explanations
4. **Visual Feedback**: Shows loading indicators and displays explanations in modal panels

## How It Works

### 1. Activation
- Open the extension popup
- Select "🧠 Explain Mode"
- Click "Start Explain Mode"
- Extension activates and shows an indicator

### 2. Usage
- Click any element in the AWS Console
- Extension captures element data and context
- Sends data to Amazon Bedrock for analysis
- Displays explanation in a modal panel

### 3. Element Data Collected
- Tag name and attributes
- Text content and labels
- CSS classes and IDs
- Parent element context
- Page URL and timestamp

## Technical Implementation

### Files Modified/Created

1. **popup.html** - Updated explain mode UI (removed chatbox)
2. **popup.js** - Simplified explain mode activation
3. **background.js** - Added explain mode handlers and mock AI responses
4. **content.js** - Added element click detection and explanation display
5. **aws-bedrock.js** - AWS Bedrock integration client (placeholder)
6. **manifest.json** - Added necessary permissions

### Message Flow

```
Popup → Background → Content Script
  ↓         ↓            ↓
Start → Activate → Click Handler
  ↓         ↓            ↓
Mode    Explain    Element Data
  ↓         ↓            ↓
Active   Process    Show Result
```

## AWS Bedrock Integration

The extension is designed to integrate with Amazon Bedrock for AI-powered explanations. Currently, it uses mock responses, but the structure is ready for real Bedrock integration.

### Required Setup (for production)
1. AWS credentials configuration
2. Bedrock model selection (Claude 3 Sonnet recommended)
3. Proper error handling and rate limiting

## Testing

Use the provided `test-explain-mode.html` file to test the explain mode functionality:

1. Load the extension in Chrome
2. Open the test HTML file
3. Activate Explain Mode from the extension popup
4. Click on various elements to see explanations

## Future Enhancements

- Real Amazon Bedrock integration
- Element highlighting before explanation
- Explanation history and favorites
- Customizable explanation styles
- Integration with AWS documentation

## Security Considerations

- Element data is processed locally before sending to AI
- Sensitive information is filtered out
- No persistent storage of user interactions
- Respects AWS Console's existing security model
