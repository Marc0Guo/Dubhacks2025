# Bedrock Agent 使用示例

这个文件包含了各种使用 Bedrock Agent API 的示例代码。

## 📁 文件说明

- `examples/` - 各种编程语言的集成示例
- `test_requests.http` - HTTP 请求测试文件
- `web_demo.html` - 简单的网页演示

## 🚀 快速测试

### 1. 使用 curl 测试

```bash
# 启动服务器
python3 local_api_server.py

# 在另一个终端测试
curl http://localhost:5000/health
```

### 2. 使用 HTTP 文件测试

在 VS Code 中安装 "REST Client" 扩展，然后打开 `test_requests.http` 文件，点击 "Send Request" 按钮测试各个 API。

### 3. 使用网页演示

打开 `web_demo.html` 文件，在浏览器中测试网页元素分析功能。

## 📋 API 端点总结

| 端点 | 方法 | 功能 | 示例 |
|------|------|------|------|
| `/agent` | POST | AI 对话 | `{"message": "你好"}` |
| `/explain-element` | POST | 元素分析 | `{"element": {...}}` |
| `/health` | GET | 健康检查 | - |
| `/` | GET | API 信息 | - |

## 🔧 集成到您的项目

### JavaScript/Node.js
```javascript
const axios = require('axios');

async function analyzeElement(elementData) {
  try {
    const response = await axios.post('http://localhost:5000/explain-element', {
      element: elementData
    });
    return response.data.explanation;
  } catch (error) {
    console.error('分析失败:', error);
  }
}
```

### Python
```python
import requests

def analyze_element(element_data):
    response = requests.post('http://localhost:5000/explain-element',
                           json={'element': element_data})
    return response.json()['explanation']
```

### PHP
```php
<?php
function analyzeElement($elementData) {
    $url = 'http://localhost:5000/explain-element';
    $data = json_encode(['element' => $elementData]);

    $options = [
        'http' => [
            'header' => "Content-type: application/json\r\n",
            'method' => 'POST',
            'content' => $data
        ]
    ];

    $context = stream_context_create($options);
    $result = file_get_contents($url, false, $context);

    return json_decode($result, true)['explanation'];
}
?>
```

## 🎯 实际应用场景

1. **网页自动化测试** - 分析页面元素，生成测试报告
2. **可访问性检查** - 检查网页元素的可访问性
3. **文档生成** - 自动生成网页元素文档
4. **代码审查** - 分析前端代码中的元素使用
5. **用户界面分析** - 理解网页界面的结构和功能

## 📞 支持

如有问题，请查看 README.md 中的故障排除部分，或提交 Issue。
