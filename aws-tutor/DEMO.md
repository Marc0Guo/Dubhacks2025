# AWS Tutor Demo Guide

## 🎯 Demo Overview

**Duration**: 3-5 minutes  
**Target**: Amazon Bedrock Console  
**Goal**: Show AI explaining AI tools

## 🚀 Pre-Demo Setup

### 1. Start Backend API

```bash
cd aws-tutor/backend
cp env.example .env
# Edit .env with your AWS credentials:
# AWS_ACCESS_KEY_ID=AKIAV4HSAUF5FSBY2U4C
# AWS_SECRET_ACCESS_KEY=fkFuE+lH70McIn7zjoLUqCe8O1CYCbsuYIJK5f7x
# AWS_REGION=us-west-2

npm install
npm start
```

### 2. Load Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select the `aws-tutor/extension` folder
5. Verify extension is loaded and enabled

### 3. Open Bedrock Console

1. Go to [AWS Bedrock Console](https://us-west-2.console.aws.amazon.com/bedrock/)
2. Sign in with your AWS account
3. Look for the "🧠 AWS Tutor" button in the top right

## 🎬 Demo Script

### Opening Hook (10 seconds)

_"What if I told you we built an AI that explains AI? Let me show you AWS Tutor helping you understand Amazon Bedrock..."_

### Explain Mode Demo (45 seconds)

1. **Hover over Temperature parameter**

   - _"I'll hover over this Temperature parameter..."_
   - Show tooltip with explanation
   - _"Temperature controls creativity. 0.7 is perfect for chatbots - creative but not random."_

2. **Hover over Max Tokens**

   - _"Max tokens controls response length. Each token costs money, so this prevents runaway costs."_

3. **Hover over Model Selector**
   - _"Model selection affects quality and cost. Claude 3.5 Sonnet is best for general tasks but more expensive."_

### Do Mode Demo (90 seconds)

1. **Click AWS Tutor sidebar**

   - _"Now let's build something real. I'll click the AWS Tutor sidebar..."_

2. **Type goal and generate plan**

   - _"I'll type 'Create an AI chatbot'..."_
   - Click "Generate Plan"
   - _"Tutor gives me a complete plan with explanations for each step."_

3. **Show plan details**
   - _"Notice how it explains WHY each step matters, not just WHAT to do."_
   - _"It includes cost estimates, security notes, and cleanup instructions."_

### Error Whisperer Demo (30 seconds)

1. **Switch to Error tab**

   - _"Finally, let's see Error Whisperer in action..."_

2. **Paste error message**

   - _"I'll paste this common error: 'AccessDenied: User is not authorized to perform bedrock:InvokeModel'..."_
   - Click "Diagnose Error"

3. **Show diagnosis**
   - _"Tutor diagnoses: 'Missing IAM permissions. Add the bedrock:InvokeModel permission to your policy.'"_
   - _"It even suggests using the AmazonBedrockFullAccess policy for testing."_

### Closing (10 seconds)

_"AWS Tutor: AI that makes AI accessible to everyone. No more guessing what parameters do or how to fix errors."_

## 🎯 Key Demo Points

### What Makes This Impressive

1. **Meta-intelligence**: AI explaining AI tools
2. **Real-time help**: Instant explanations without leaving the console
3. **Practical value**: Solves real problems developers face
4. **Educational**: Users learn while using the tool

### Technical Highlights

1. **Chrome extension**: Works directly in AWS console
2. **Structured knowledge**: YAML recipes + Markdown docs
3. **Cost awareness**: Explains financial implications
4. **Error diagnosis**: Practical problem-solving

### Demo Tips

1. **Keep it fast**: Don't get bogged down in details
2. **Show the problem**: Explain why this tool is needed
3. **Demonstrate value**: Show practical benefits
4. **Be confident**: This is genuinely useful technology

## 🚨 Troubleshooting

### Backend Issues

- Check AWS credentials in `.env`
- Verify port 3001 is available
- Check console for error messages

### Extension Issues

- Reload extension if changes made
- Check browser console for errors
- Verify extension has correct permissions

### Bedrock Console Issues

- Make sure you're in the right region (us-west-2)
- Check if you have Bedrock access
- Try refreshing the page

## 📊 Success Metrics

### What Judges Should See

1. **Working tooltip**: Hover explanations work
2. **Functional sidebar**: Do Mode generates plans
3. **Error diagnosis**: Error Whisperer provides solutions
4. **Professional UI**: Clean, polished interface

### What to Emphasize

1. **Real problem solved**: Bedrock console is complex
2. **Immediate value**: Works right now
3. **Scalable approach**: Can expand to other AWS services
4. **Educational impact**: Users learn while using

## 🎉 Demo Success!

If everything works smoothly, you'll have demonstrated:

- A working Chrome extension
- Real-time AI explanations
- Practical problem-solving
- Professional implementation

**Remember**: The goal is to show that this tool solves a real problem and works reliably. Keep the demo focused and fast!
