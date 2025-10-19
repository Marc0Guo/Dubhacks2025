#!/usr/bin/env python3
"""
本地 API 服务器 - 模拟部署后的 API 接口
"""
import json
import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS

# 添加 src 目录到路径
sys.path.append('src')

# 导入我们的函数
from app import handler

app = Flask(__name__)
CORS(app)  # 允许跨域请求

@app.route('/agent', methods=['POST'])
def agent_endpoint():
    """Agent API 端点 - 模拟 Lambda 函数"""
    try:
        # 获取请求数据
        data = request.get_json()
        if not data:
            return jsonify({"error": "请求体必须是 JSON 格式"}), 400

        # 创建模拟的 Lambda 事件
        event = {
            "body": json.dumps(data)
        }

        # 调用我们的 handler 函数
        response = handler(event, None)

        # 返回响应
        if response["statusCode"] == 200:
            return jsonify(json.loads(response["body"]))
        else:
            return jsonify(json.loads(response["body"])), response["statusCode"]

    except Exception as e:
        return jsonify({"error": f"服务器错误: {str(e)}"}), 500

@app.route('/explain-element', methods=['POST'])
def explain_element_endpoint():
    """专门的网页元素解释端点"""
    try:
        # 获取请求数据
        data = request.get_json()
        if not data:
            return jsonify({"error": "请求体必须是 JSON 格式"}), 400

        element_json = data.get("element")
        if not element_json:
            return jsonify({"error": "缺少 'element' 字段"}), 400

        # 导入工具函数
        from app import tool_explain_element

        # 调用工具函数
        explanation = tool_explain_element(element_json)

        return jsonify({
            "success": True,
            "explanation": explanation,
            "element": element_json
        })

    except Exception as e:
        return jsonify({"error": f"服务器错误: {str(e)}"}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """健康检查端点"""
    return jsonify({"status": "healthy", "message": "Bedrock Agent API 运行正常"})

@app.route('/', methods=['GET'])
def root():
    """根路径 - 显示 API 信息"""
    return jsonify({
        "message": "Bedrock Agent API",
        "endpoints": {
            "POST /agent": "发送消息给 AI Agent",
            "POST /explain-element": "解释网页元素",
            "GET /health": "健康检查",
            "GET /": "API 信息"
        },
        "examples": {
            "agent": {
                "url": "POST /agent",
                "body": {"message": "你好，你能做什么？"}
            },
            "element": {
                "url": "POST /explain-element",
                "body": {
                    "element": {
                        "tagName": "button",
                        "id": "submit-btn",
                        "className": "btn btn-primary",
                        "textContent": "提交表单"
                    }
                }
            }
        }
    })

if __name__ == '__main__':
    print("🚀 启动本地 Bedrock Agent API 服务器...")
    print("📡 API 端点:")
    print("   POST http://localhost:5000/agent")
    print("   POST http://localhost:5000/explain-element")
    print("   GET  http://localhost:5000/health")
    print("   GET  http://localhost:5000/")
    print("\n💡 测试命令:")
    print('   # 测试 Agent:')
    print('   curl -X POST "http://localhost:5000/agent" \\')
    print('     -H "Content-Type: application/json" \\')
    print('     -d \'{"message":"你好，你能做什么？"}\'')
    print('   # 测试元素解释:')
    print('   curl -X POST "http://localhost:5000/explain-element" \\')
    print('     -H "Content-Type: application/json" \\')
    print('     -d \'{"element":{"tagName":"button","id":"submit","textContent":"提交"}}\'')
    print("\n按 Ctrl+C 停止服务器")
    print("=" * 50)

    app.run(host='0.0.0.0', port=5000, debug=True)
