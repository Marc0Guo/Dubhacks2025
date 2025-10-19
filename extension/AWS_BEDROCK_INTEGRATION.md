# AWS Bedrock Integration

This extension now includes AWS Bedrock integration for AI-powered element analysis.

## Features

- **Element Context Capture**: Click any element on a webpage to capture its structured context
- **AI Analysis**: Automatically send element data to AWS Bedrock Claude for intelligent analysis
- **Real-time Display**: View AI analysis results in a user-friendly panel
- **Secure Credentials**: Store AWS credentials securely in Chrome storage

## Setup Instructions

### 1. Configure AWS Credentials

1. Open the extension popup
2. Click "AWS Config" button
3. Enter your AWS credentials:
   - **Access Key ID**: Your AWS access key
   - **Secret Access Key**: Your AWS secret key
   - **Region**: Select your preferred AWS region (default: us-east-1)
4. Click "Save Configuration"

### 2. AWS Bedrock Setup

Make sure you have:
- AWS Bedrock access enabled in your AWS account
- Claude 3 Sonnet model access
- Proper IAM permissions for Bedrock API calls

Required IAM permissions:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeModel"
            ],
            "Resource": "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0"
        }
    ]
}
```

## Usage

### Element Analysis Workflow

1. **Activate Element Picker**: Press `Command+E` (Mac) or `Ctrl+E` (Windows/Linux)
2. **Click Element**: Click on any element you want to analyze
3. **View Analysis**: AI analysis will appear in a panel on the page
4. **Auto-close**: Panel automatically closes after 15 seconds

### What Gets Analyzed

The AI analyzes:
- **Element Type**: Button, link, input, etc.
- **Purpose**: What the element does
- **Context**: Surrounding content and structure
- **Interactions**: How to interact with the element

## Technical Details

### Data Flow

1. **Element Capture**: Content script captures element context
2. **Background Processing**: Background script sends data to AWS Bedrock
3. **AI Analysis**: Claude analyzes the element and returns insights
4. **Display**: Analysis is shown in a floating panel

### Security

- AWS credentials are stored locally in Chrome storage
- No credentials are transmitted to external servers
- All API calls are made directly to AWS Bedrock

### API Integration

- **Model**: Claude 3 Sonnet (anthropic.claude-3-sonnet-20240229-v1:0)
- **Endpoint**: `https://bedrock-runtime.{region}.amazonaws.com/model/{modelId}/invoke`
- **Authentication**: AWS Signature Version 4

## Troubleshooting

### Common Issues

1. **"AWS credentials not configured"**
   - Solution: Configure credentials in the popup

2. **"Bedrock API error"**
   - Check your AWS credentials
   - Verify Bedrock access in your AWS account
   - Ensure proper IAM permissions

3. **Analysis panel not showing**
   - Check browser console for errors
   - Verify element picker is working
   - Ensure AWS credentials are valid

### Debug Information

- Check browser console for detailed logs
- Element data is stored in `window.__lastPickedElement`
- Analysis results are stored in Chrome storage

## File Changes

The following files were modified to add AWS Bedrock integration:

- `manifest.json`: Added Bedrock API permissions
- `background.js`: Added Bedrock API integration and credential management
- `content.js`: Added analysis display functionality
- `popup.html`: Added AWS configuration UI
- `popup.js`: Added credential handling
- `styles/popup.css`: Added styling for AWS config section

## Future Enhancements

- Support for multiple AI models
- Custom analysis prompts
- Batch element analysis
- Export analysis results
- Integration with other AWS services
