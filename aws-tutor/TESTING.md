# AWS Tutor Testing & Demo Guide

## 🎯 How Everything Works Together

```
Chrome Extension (Bedrock Console)
           ↓
    Content Script (content.js)
           ↓
    Backend API (Node.js on port 3001)
           ↓
    Recipes + Docs (YAML/Markdown files)
           ↓
    AI Responses (Structured JSON)
```

## 🚀 Quick Start Testing

### **Step 1: Test Backend API**

```bash
# Run the test script
cd aws-tutor
./test-demo.sh
```

This will:

- Install backend dependencies
- Create .env with your AWS credentials
- Start the backend server on port 3001

### **Step 2: Test API Endpoints**

Open a new terminal and test the API:

```bash
# Health check
curl http://localhost:3001/health

# Test explain element
curl -X POST http://localhost:3001/explain-element \
  -H "Content-Type: application/json" \
  -d '{"service":"bedrock","element":{"type":"temperature"},"url":"test"}'

# Test plan generation
curl -X POST http://localhost:3001/plan \
  -H "Content-Type: application/json" \
  -d '{"service":"bedrock","goal":"Create an AI chatbot","url":"test"}'

# Test error diagnosis
curl -X POST http://localhost:3001/error-help \
  -H "Content-Type: application/json" \
  -d '{"service":"bedrock","error":"AccessDenied: User is not authorized","url":"test"}'
```

### **Step 3: Test Chrome Extension**

1. **Open Chrome** and go to `chrome://extensions/`
2. **Enable Developer mode** (top right toggle)
3. **Click "Load unpacked"**
4. **Select the `aws-tutor/extension` folder**
5. **Verify extension is loaded** (should show "AWS Tutor - Bedrock Edition")

### **Step 4: Test on Bedrock Console**

1. **Go to AWS Bedrock Console**: https://us-west-2.console.aws.amazon.com/bedrock/
2. **Sign in** with your AWS account
3. **Look for the "🧠 AWS Tutor" button** in the top right
4. **Click the button** to open the sidebar

## 🎬 Demo Testing Scenarios

### **Scenario 1: Explain Mode**

1. **Hover over any input field** in the Bedrock console
2. **Should see tooltip** with AI explanation
3. **Test different elements**: temperature, max tokens, model selector

### **Scenario 2: Do Mode**

1. **Click "Do" tab** in the sidebar
2. **Type**: "Create an AI chatbot"
3. **Click "Generate Plan"**
4. **Should see step-by-step plan** with explanations

### **Scenario 3: Error Whisperer**

1. **Click "Error" tab** in the sidebar
2. **Type**: "AccessDenied: User is not authorized to perform bedrock:InvokeModel"
3. **Click "Diagnose Error"**
4. **Should see diagnosis** with solution

## 🔧 Troubleshooting

### **Backend Issues**

```bash
# Check if server is running
curl http://localhost:3001/health

# Check logs
cd aws-tutor/backend
node server.js

# Check dependencies
npm list
```

### **Extension Issues**

1. **Reload extension** in Chrome
2. **Check browser console** for errors (F12)
3. **Verify permissions** in manifest.json
4. **Check if backend is running** on port 3001

### **Bedrock Console Issues**

1. **Make sure you're in us-west-2 region**
2. **Check if you have Bedrock access**
3. **Try refreshing the page**
4. **Check if extension is enabled**

## 📊 Expected Results

### **Backend API Responses**

**Health Check:**

```json
{
  "status": "healthy",
  "recipes": 1,
  "docs": 1
}
```

**Explain Element:**

```json
{
  "title": "Temperature Parameter",
  "what": "Controls randomness and creativity in AI responses...",
  "why": "Temperature affects response quality and consistency...",
  "pitfalls": "Too low: Responses become repetitive..."
}
```

**Plan Generation:**

```json
{
  "summary": "Create an AI chatbot using Claude 3.5 Sonnet",
  "checklist": [
    {
      "ui": "Select 'Claude 3.5 Sonnet' from model dropdown",
      "why": "Best general-purpose model for conversational AI..."
    }
  ],
  "cost_note": "Claude 3.5 Sonnet: $3/1M input + $15/1M output tokens..."
}
```

### **Chrome Extension Behavior**

1. **Sidebar appears** when clicking the AWS Tutor button
2. **Tooltips show** when hovering over Bedrock elements
3. **Plans generate** when using Do Mode
4. **Errors diagnose** when using Error Whisperer

## 🎯 Demo Flow

### **1. Opening (10 seconds)**

_"What if I told you we built an AI that explains AI? Let me show you AWS Tutor helping you understand Amazon Bedrock..."_

### **2. Explain Mode (30 seconds)**

- Hover over temperature parameter
- Show tooltip with explanation
- _"Temperature controls creativity. 0.7 is perfect for chatbots."_

### **3. Do Mode (60 seconds)**

- Click sidebar, type "Create an AI chatbot"
- Generate plan, show step-by-step instructions
- _"Notice how it explains WHY each step matters."_

### **4. Error Whisperer (30 seconds)**

- Paste error message
- Show diagnosis and solution
- _"Tutor diagnoses the problem and suggests fixes."_

### **5. Closing (10 seconds)**

_"AWS Tutor: AI that makes AI accessible to everyone."_

## ✅ Success Criteria

- [ ] Backend API responds to all endpoints
- [ ] Chrome extension loads without errors
- [ ] Tooltips appear on hover
- [ ] Sidebar opens and functions
- [ ] Plans generate correctly
- [ ] Error diagnosis works
- [ ] All modes are responsive

## 🚨 Common Issues

1. **CORS errors**: Make sure backend is running on port 3001
2. **Extension not loading**: Check manifest.json and permissions
3. **No tooltips**: Check if elements are being detected
4. **API errors**: Check backend logs and .env file
5. **Bedrock access**: Ensure you have proper AWS permissions

## 📞 Getting Help

If something doesn't work:

1. Check the browser console (F12)
2. Check backend logs
3. Verify all files are in the right place
4. Make sure ports aren't blocked
5. Check AWS credentials are correct
