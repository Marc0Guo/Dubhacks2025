# AWS Tutor Backend API Documentation

## 🚀 Quick Start

1. **Start the backend:**

   ```bash
   cd aws-tutor
   ./test-demo.sh
   ```

2. **Backend runs on:** `http://localhost:3001`

## 📡 API Endpoints

### 1. Health Check

```bash
GET http://localhost:3001/health
```

**Response:**

```json
{
  "status": "healthy",
  "recipes": 4,
  "docs": 3
}
```

### 2. Explain Element

```bash
POST http://localhost:3001/explain-element
Content-Type: application/json

{
  "service": "bedrock",
  "element": {
    "type": "temperature",
    "value": "0.7",
    "context": {
      "label": "Temperature",
      "parentText": "Set the temperature for creativity"
    }
  },
  "url": "https://us-west-2.console.aws.amazon.com/bedrock/"
}
```

**Response:**

```json
{
  "title": "Temperature Parameter",
  "what": "Controls randomness and creativity in AI responses",
  "why": "Lower values (0.1-0.3) are more focused, higher values (0.7-1.0) are more creative",
  "pitfalls": "Too low = repetitive, too high = incoherent"
}
```

### 3. Generate Plan

```bash
POST http://localhost:3001/plan
Content-Type: application/json

{
  "service": "bedrock",
  "goal": "Create an AI chatbot",
  "url": "https://us-west-2.console.aws.amazon.com/bedrock/"
}
```

**Response:**

```json
{
  "summary": "Create AI Chatbot with Bedrock",
  "checklist": [
    {
      "ui": "Select 'Claude 3.5 Sonnet' from model dropdown",
      "why": "Best general-purpose model for conversational AI"
    },
    {
      "ui": "Set temperature to 0.7",
      "why": "Balances creativity with consistency"
    }
  ],
  "cost_note": "Typical conversation: $0.01-0.05 per exchange"
}
```

### 4. Diagnose Error

```bash
POST http://localhost:3001/error-help
Content-Type: application/json

{
  "service": "bedrock",
  "error": "AccessDenied: User is not authorized to perform bedrock:InvokeModel",
  "url": "https://us-west-2.console.aws.amazon.com/bedrock/"
}
```

**Response:**

```json
{
  "title": "Access Denied Error",
  "cause": "Missing IAM permissions for Bedrock model invocation",
  "solution": "Add the bedrock:InvokeModel permission to your IAM policy",
  "prevention": "Always test permissions in a development environment first"
}
```

## 🔧 For Chrome Extension Team

### What You Need to Build:

1. **Content Script** that detects Bedrock elements
2. **Popup/Sidebar** with 3 tabs: Explain, Do, Error
3. **API calls** to the above endpoints
4. **UI components** to display responses

### Example API Call from JavaScript:

```javascript
// Explain element
const response = await fetch("http://localhost:3001/explain-element", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    service: "bedrock",
    element: { type: "temperature" },
    url: window.location.href,
  }),
});
const explanation = await response.json();
```

### CORS Note:

The backend has CORS enabled, so Chrome extension can call it directly.

## 🎯 Demo Flow

1. User hovers over Bedrock parameter → Call `/explain-element`
2. User types goal → Call `/plan`
3. User pastes error → Call `/error-help`
4. Display responses in nice UI

## 📁 Backend Files

- `server.js` - Main API server
- `package.json` - Dependencies
- `recipes/` - YAML knowledge base
- `docs/` - Markdown documentation
- `test-demo.sh` - Start script
