import json, os, datetime
import boto3

MODEL_ID = os.environ.get("MODEL_ID", "amazon.titan-text-express-v1")
bedrock = boto3.client("bedrock-runtime")

SYSTEM_PROMPT = """You are a web element analysis agent powered by Bedrock.
IMPORTANT: When you see JSON data describing a web element, you MUST use the explain_element tool.
If a tool is needed, respond with ONLY this JSON (no extra text):
{"tool":"<name>","args":{...}}
Available tools:
- get_time(zone?) -> returns current time, zone optional (e.g., 'UTC', 'America/Los_Angeles')
- calc(op, a, b) -> op in [add, sub, mul, div]; a and b are numbers.
- explain_element(element_json) -> explains a web page element from JSON data
If no tool is needed, just answer normally (no JSON). Be concise.
"""

def call_bedrock(user_msg: str) -> str:
    # 使用 Titan Express 模型的 API 格式
    full_message = f"{SYSTEM_PROMPT}\n\nUser: {user_msg}"
    body = {
        "inputText": full_message,
        "textGenerationConfig": {
            "maxTokenCount": 800,  # 增加token数量以支持更大的模型
            "temperature": 0.3,    # 稍微增加创造性
            "topP": 0.9
        }
    }
    resp = bedrock.invoke_model(
        modelId=MODEL_ID,
        contentType="application/json",
        accept="application/json",
        body=json.dumps(body).encode("utf-8"),
    )
    payload = json.loads(resp["body"].read())
    # Titan 格式的响应
    text = payload.get("results", [{}])[0].get("outputText", "")
    return text.strip()

def tool_get_time(zone: str | None):
    try:
        import zoneinfo
        tz = zoneinfo.ZoneInfo(zone) if zone else datetime.datetime.now().astimezone().tzinfo
    except Exception:
        tz = datetime.datetime.now().astimezone().tzinfo
    now = datetime.datetime.now(tz)
    return now.strftime("%Y-%m-%d %H:%M:%S %Z")

def tool_calc(op: str, a, b):
    try:
        x = float(a); y = float(b)
        if op == "add": return x + y
        if op == "sub": return x - y
        if op == "mul": return x * y
        if op == "div": return x / y if y != 0 else "Error: division by zero"
        return f"Unknown op: {op}"
    except Exception as e:
        return f"Calc error: {e}"

def tool_explain_element(element_json):
    """Explain AWS Console web element using AI-powered analysis"""
    try:
        # Parse JSON data
        if isinstance(element_json, str):
            element_data = json.loads(element_json)
        else:
            element_data = element_json

        # Extract element information
        element_type = element_data.get("tagName", "unknown").lower()
        element_id = element_data.get("id", "")
        element_class = element_data.get("className", "")
        element_text = element_data.get("textContent", "").strip()
        element_attributes = element_data.get("attributes", {})

        # Create a detailed prompt for AWS expert analysis
        aws_expert_prompt = f"""You are an AWS expert analyzing a web element from the AWS Console.

Element Details:
- Type: {element_type}
- ID: {element_id}
- CSS Classes: {element_class}
- Text Content: "{element_text}"
- Attributes: {element_attributes}

As an AWS expert, analyze this element and provide a comprehensive explanation focusing on:
1. What AWS service or functionality this element relates to
2. What this element does in the AWS Console context
3. Any important warnings or considerations (costs, destructive actions, etc.)
4. Best practices or tips for using this element

Provide a clear, helpful explanation that would assist someone navigating the AWS Console."""

        # Use Bedrock to generate AWS-focused explanation
        explanation = call_bedrock(aws_expert_prompt)

        # Fallback if Bedrock fails
        if not explanation or len(explanation.strip()) < 10:
            explanation = f"This is a {element_type} element"
            if element_text:
                explanation += f" displaying '{element_text}'"
            explanation += " in the AWS Console. This element is part of the AWS management interface."

            # Add basic warnings for destructive actions
            if any(word in element_text.lower() for word in ["delete", "terminate", "remove"]):
                explanation += " ⚠️ WARNING: This appears to be a destructive action - proceed with caution."

        return explanation

    except Exception as e:
        return f"AWS element analysis error: {e}"

def maybe_tool_call(text: str):
    try:
        obj = json.loads(text)
        if isinstance(obj, dict) and "tool" in obj:
            return obj
    except Exception:
        pass
    return None

def handler(event, context):
    body = json.loads(event.get("body") or "{}")
    msg = (body.get("message") or "").strip()
    if not msg:
        return {"statusCode": 400, "body": json.dumps({"error":"message required"})}

    model_reply = call_bedrock(msg)
    call = maybe_tool_call(model_reply)

    if call:
        name = call.get("tool")
        args = call.get("args", {}) or {}
        try:
            if name == "get_time":
                result = tool_get_time(args.get("zone"))
            elif name == "calc":
                result = tool_calc(args.get("op",""), args.get("a",0), args.get("b",0))
            elif name == "explain_element":
                result = tool_explain_element(args.get("element_json"))
            else:
                result = f"Unknown tool: {name}"
            final = f"{result}"
        except Exception as e:
            final = f"Tool error: {e}"
    else:
        final = model_reply or "I had trouble generating a response."

    return {
        "statusCode": 200,
        "headers": {"Content-Type":"application/json"},
        "body": json.dumps({"reply": final})
    }

