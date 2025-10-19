# AWS Bedrock Integration Guide

## Overview

The AWS Console Navigator extension now includes AWS Bedrock integration that allows you to analyze clicked elements using Claude 3 Sonnet. When you click on any element using the element picker, the extension will send the element's context to AWS Bedrock and display intelligent analysis results.

## Features

- **Element Analysis**: Get detailed insights about any UI element you click
- **AWS Service Detection**: Automatically identify which AWS service an element belongs to
- **Purpose Identification**: Understand what each element does and its importance
- **Smart Suggestions**: Receive actionable recommendations for using the element
- **Visual Feedback**: Beautiful analysis panel with color-coded importance levels

## Setup Instructions

### 1. Configure AWS Credentials

1. Open the extension popup
2. Click the "Settings" button
3. Enter your AWS credentials:
   - **AWS Access Key ID**: Your AWS access key (starts with AKIA)
   - **AWS Secret Access Key**: Your AWS secret key
   - **AWS Region**: Select the region where Bedrock is available
4. Click "Save Settings"
5. Test the connection using the "Test Bedrock Connection" button

### 2. AWS Permissions Required

Your AWS credentials need the following permissions:

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

### 3. Using the Element Picker

1. **Activate Element Picker**:
   - Click the "Element Picker" button in the extension popup, OR
   - Use keyboard shortcut: `Ctrl+E` (Windows/Linux) or `Cmd+E` (Mac)

2. **Analyze Elements**:
   - Hover over any element to see it highlighted
   - Click on any element to capture its context
   - Wait for AWS Bedrock analysis (usually 2-5 seconds)
   - View the analysis results in the popup panel

3. **Analysis Results Include**:
   - **Element Type**: Button, input, link, etc.
   - **AWS Service**: EC2, S3, Lambda, etc.
   - **Purpose**: What the element is used for
   - **Action**: What happens when you click it
   - **Importance**: High/Medium/Low priority
   - **Description**: Detailed explanation
   - **Suggestions**: Tips for using the element

## Analysis Panel Features

### Visual Indicators
- **High Importance**: Red badge - Critical elements
- **Medium Importance**: Yellow badge - Important elements
- **Low Importance**: Green badge - Optional elements

### Interactive Features
- **Copy Analysis**: Copy the full analysis to clipboard
- **Highlight Element**: Scroll to and highlight the analyzed element
- **Auto-close**: Panel automatically closes after 30 seconds

## Example Analysis Output

```json
{
  "elementType": "button",
  "purpose": "Launch a new EC2 instance",
  "awsService": "EC2",
  "action": "Opens the EC2 instance launch wizard",
  "importance": "high",
  "description": "This button initiates the process of creating a new virtual server in AWS EC2. It's the primary entry point for launching instances.",
  "suggestions": "Make sure you have selected the correct AMI and instance type before launching. Consider using the free tier eligible options if you're just getting started."
}
```

## Troubleshooting

### Common Issues

1. **"AWS credentials not configured"**
   - Go to Settings and enter your AWS credentials
   - Make sure both Access Key and Secret Key are provided

2. **"Bedrock connection failed"**
   - Check your AWS credentials are correct
   - Verify Bedrock is available in your selected region
   - Ensure your AWS account has Bedrock access enabled

3. **"Analysis failed"**
   - Check your internet connection
   - Verify AWS permissions include Bedrock access
   - Try testing the connection in Settings

4. **Element picker not working**
   - Make sure you're on a regular website (not chrome:// pages)
   - Refresh the page and try again
   - Check browser console for error messages

### Debug Information

- All analysis requests and responses are logged to the browser console
- Check `window.__lastPickedElement` for the raw element data
- Use browser dev tools to inspect network requests to Bedrock

## Security Notes

- **Local Storage**: AWS credentials are stored locally in your browser
- **No Third-party**: Credentials are never sent to external servers
- **Direct API**: Extension communicates directly with AWS Bedrock
- **Temporary**: Analysis data is not permanently stored

## Supported AWS Services

The analysis works best with:
- EC2 (Elastic Compute Cloud)
- S3 (Simple Storage Service)
- Lambda (Serverless Functions)
- RDS (Relational Database Service)
- VPC (Virtual Private Cloud)
- IAM (Identity and Access Management)
- CloudFormation
- And many more AWS services

## Tips for Best Results

1. **Click Specific Elements**: Click on buttons, links, and inputs rather than large containers
2. **AWS Console Pages**: Analysis works best on official AWS Console pages
3. **Clear Context**: Elements with clear text and purpose get better analysis
4. **Wait for Loading**: Let pages fully load before analyzing elements

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your AWS credentials and permissions
3. Test the Bedrock connection in Settings
4. Try refreshing the page and analyzing again

---

**Note**: This integration requires AWS Bedrock access, which may not be available in all AWS regions or accounts. Check AWS documentation for Bedrock availability in your region.