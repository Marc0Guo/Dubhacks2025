# AWS Tutor – Bedrock Edition

## Cursor Brief (Backend + Frontend integration)

### 0) TL;DR

Public API base: https://api.thishurtyougave.select (Cloudflare Worker → AWS API Gateway → Lambda).

Backend runtime: Node.js + Express wrapped with serverless-http (AWS Lambda).

Frontend: Chrome extension content script + sidebar that calls the API over HTTPS.

Cursor: keep the Worker as a thin proxy (CORS, routing). All feature logic lives in the Lambda Express app.

### 1) Current Infra (what's already working)

**Network path**
```
Chrome Extension
   → https://api.thishurtyougave.select/*       (Cloudflare DNS + Worker Route)
      → Cloudflare Worker (proxy + CORS)
         → https://{api-gw-id}.execute-api.us-east-1.amazonaws.com/default/*
            → AWS Lambda (Express + serverless-http)
```

**Repo layout (target)**
```
.
├─ backend/                 # Lambda code
│  ├─ index.mjs             # Express app (serverless-http)
│  └─ package.json          # "type":"module", express/cors/serverless-http
├─ cloudflare/
│  ├─ worker.js             # Cloudflare Worker proxy
│  └─ wrangler.toml         # routes = ["api.thishurtyougave.select/*"]
├─ extension/
│  ├─ content.js            # DOM detection, tooltips, API calls
│  ├─ api.js                # API integration functions
│  ├─ popup.js              # Enhanced with API calls
│  └─ manifest.json         # include host_permissions for the API domain
├─ config/
│  └─ env.js                # export const API_BASE = "https://api.thishurtyougave.select";
└─ docs/
   └─ CURSOR_BRIEF.md       # this file
```

**Deployed endpoints (Lambda/Express)**
- `GET /health` → `{"status":"healthy"}`
- `POST /plan` → returns a basic Bedrock "how-to" checklist
- `POST /explain-element` → returns element explanations
- `POST /error-help` → returns error diagnosis and solutions

### 2) What we implemented (Backend)

Added two more JSON endpoints to `backend/index.mjs`:

**POST /explain-element**
```json
Input: { "service": "bedrock", "element": { "type": "temperature", "label": "Temperature" } }
Output: {
  "title": "Temperature",
  "what": "Controls randomness/creativity of the model.",
  "why": "Higher = more creative; lower = more deterministic.",
  "pitfalls": "Too high can be incoherent; too low can be repetitive."
}
```

**POST /error-help**
```json
Input: { "service": "bedrock", "error": "AccessDeniedException ..." }
Output: {
  "title": "Access Denied Error",
  "cause": "Missing IAM permission for bedrock:InvokeModel",
  "solution": "Attach AmazonBedrockFullAccess to the role for testing",
  "prevention": "Use least-privilege policies; test in dev first."
}
```

**Logic:**
- If element.type in a small local map, return the canned explanation.
- Else return a generic "Unknown element (coming soon)" response.
- Lowercase the message; match simple substrings: "accessdenied", "validation", "throttling".
- Return a structured remediation object.

### 3) Cloudflare Worker (thin proxy)

**cloudflare/worker.js**
- Handles CORS preflight requests
- Proxies requests to AWS Lambda
- Adds debugging headers
- Error handling with 502 responses

**cloudflare/wrangler.toml**
- Routes configuration for custom domain
- Environment variables setup

**Deploy:**
```bash
cd cloudflare
wrangler login
wrangler deploy
```

### 4) Frontend integration (Chrome Extension)

**config/env.js**
- Centralized API configuration
- Endpoint definitions
- Timeout settings

**extension/api.js**
- API integration functions
- Error handling and timeouts
- Tooltip display functions

**extension/popup.js**
- Enhanced with API calls
- Fallback to original methods if API unavailable
- Health check on startup

**extension/manifest.json**
- Added host_permissions for API domain

### 5) Local + Prod Testing

**Smoke tests:**
```bash
# Run the test script
./test-api.sh
```

**Test endpoints:**
```bash
BASE="https://api.thishurtyougave.select"

# Health check
curl -s "$BASE/health" | jq .

# Plan generation
curl -s -X POST "$BASE/plan" \
  -H 'content-type: application/json' \
  -d '{"goal":"Create a chatbot"}' | jq .

# Element explanation
curl -s -X POST "$BASE/explain-element" \
  -H 'content-type: application/json' \
  -d '{"element":{"type":"temperature"}}' | jq .

# Error help
curl -s -X POST "$BASE/error-help" \
  -H 'content-type: application/json' \
  -d '{"error":"AccessDeniedException"}' | jq .
```

### 6) Definition of Done ✅

**Backend:**
- ✅ GET /health returns 200 JSON
- ✅ POST /plan returns 200 JSON with steps (no external calls)
- ✅ POST /explain-element returns 200 JSON (covers temperature, max_tokens, model, etc.)
- ✅ POST /error-help returns 200 JSON with 3+ patterns + default fallback
- ✅ Code is side-effect free and deployable as a Lambda handler

**Integration:**
- ✅ All 4 endpoints return 200 JSON via https://api.thishurtyougave.select/*
- ✅ Extension calls use API_BASE and succeed in Chrome DevTools
- ✅ No mixed-content or CORS errors in the console
- ✅ Fallback mechanisms work when API is unavailable

### 7) Future Enhancements (optional)

- Add Bedrock runtime calls (Claude/Nova) for dynamic explanations
- Add auth (temporary shared token in Worker → verify header)
- Add analytics (count endpoint usage via CloudWatch metrics)
- Add more AWS services beyond Bedrock
- Add voice input support
- Add workflow templates

### 8) Architecture Benefits

1. **Scalable**: Cloudflare Worker handles CORS and routing, Lambda scales automatically
2. **Fast**: Edge caching and serverless execution
3. **Reliable**: Fallback mechanisms ensure extension works even if API is down
4. **Maintainable**: Clear separation of concerns between proxy and business logic
5. **Extensible**: Easy to add new endpoints and services

### 9) Usage

1. **Explain Mode**: Hover over AWS console elements to get explanations
2. **Do Mode**: Get step-by-step guidance for AWS tasks
3. **Error Whisperer**: Paste error messages to get diagnosis and solutions

The extension automatically detects if the API is available and falls back to the original guidance system if needed.
