#!/usr/bin/env python3
"""
Python Bedrock Agent with Bearer Token Authentication
"""
import json
import os
import sys
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS

# Load environment variables from .env file
def load_env_file():
    """Load environment variables from .env file"""
    env_path = Path(__file__).parent.parent / ".env"
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key.strip()] = value.strip()

# Load environment variables
load_env_file()

# Add src directory to path
sys.path.append('src')

# Import our modified handler
from app_with_bearer import handler, tool_explain_element

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

@app.route('/agent', methods=['POST'])
def agent_endpoint():
    """Agent API endpoint - AI conversation"""
    try:
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body must be JSON format"}), 400

        # Create mock Lambda event
        event = {
            "body": json.dumps(data)
        }

        # Call our handler function
        response = handler(event, None)

        # Return response
        if response["statusCode"] == 200:
            return jsonify(json.loads(response["body"]))
        else:
            return jsonify(json.loads(response["body"])), response["statusCode"]

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/explain-element', methods=['POST'])
def explain_element_endpoint():
    """Web element analysis endpoint"""
    try:
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body must be JSON format"}), 400

        element_json = data.get("element")
        if not element_json:
            return jsonify({"error": "Missing 'element' field"}), 400

        # Call tool function
        explanation = tool_explain_element(element_json)

        return jsonify({
            "success": True,
            "explanation": explanation,
            "element": element_json
        })

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy", 
        "message": "Python Bedrock Agent running",
        "api_key_configured": bool(os.environ.get("AWS_BEARER_TOKEN_BEDROCK"))
    })

@app.route('/', methods=['GET'])
def root():
    """Root path - API information"""
    return jsonify({
        "message": "Python Bedrock Agent API",
        "endpoints": {
            "POST /agent": "AI conversation with tool calling",
            "POST /explain-element": "Advanced web element analysis",
            "GET /health": "Health check",
            "GET /": "API information"
        },
        "features": [
            "AI conversation with Bedrock",
            "Web element analysis",
            "Tool calling (time, calculator)",
            "AWS Console expertise"
        ],
        "examples": {
            "agent": {
                "url": "POST /agent",
                "body": {"message": "What time is it?"}
            },
            "element": {
                "url": "POST /explain-element",
                "body": {
                    "element": {
                        "tagName": "button",
                        "id": "create-function",
                        "textContent": "Create Function"
                    }
                }
            }
        }
    })

if __name__ == '__main__':
    # Check environment
    api_key = os.environ.get("AWS_BEARER_TOKEN_BEDROCK")
    region = os.environ.get("AWS_DEFAULT_REGION", "us-east-1")
    
    print("🚀 Starting Python Bedrock Agent...")
    print("=" * 50)
    print(f"🔑 API Key: {'✅ Configured' if api_key else '❌ Missing'}")
    print(f"🌍 Region: {region}")
    print("📡 API Endpoints:")
    print("   POST http://localhost:5001/agent")
    print("   POST http://localhost:5001/explain-element")
    print("   GET  http://localhost:5001/health")
    print("   GET  http://localhost:5001/")
    print("")
    
    if not api_key:
        print("⚠️  WARNING: AWS_BEARER_TOKEN_BEDROCK not set!")
        print("   Set it with: export AWS_BEARER_TOKEN_BEDROCK=your-key")
        print("")
    
    print("💡 Test commands:")
    print('   curl -X POST "http://localhost:5001/agent" \\')
    print('     -H "Content-Type: application/json" \\')
    print('     -d \'{"message":"Hello, what can you do?"}\'')
    print('')
    print('   curl -X POST "http://localhost:5001/explain-element" \\')
    print('     -H "Content-Type: application/json" \\')
    print('     -d \'{"element":{"tagName":"button","id":"submit","textContent":"Submit"}}\'')
    print("")
    print("Press Ctrl+C to stop")
    print("=" * 50)

    app.run(host='0.0.0.0', port=5001, debug=False)
