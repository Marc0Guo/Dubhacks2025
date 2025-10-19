# AWS Console Navigator - Amazon Bedrock Integration

## 🎉 真正的 AI 集成已完成！

现在你的扩展已经集成了真正的 Amazon Bedrock AI 服务，不再使用硬编码的解释。

## 🚀 新功能

### ✅ 真正的 AI 解释
- 使用 Amazon Bedrock Claude 3 Sonnet 模型
- 智能分析 AWS Console 元素
- 提供上下文相关的解释

### ✅ AWS 凭证配置
- 专门的设置页面 (`settings.html`)
- 安全的凭证存储
- 实时连接测试

### ✅ 智能回退机制
- Bedrock 不可用时自动使用回退解释
- 清晰的错误提示和配置引导
- 无缝的用户体验

## 📋 设置步骤

### 1. 获取 AWS 凭证
1. 登录 AWS Console
2. 进入 IAM → Users → 你的用户 → Security Credentials
3. 创建新的 Access Key
4. 确保用户有以下权限：
   - `bedrock:InvokeModel`
   - `bedrock:InvokeModelWithResponseStream`

### 2. 配置扩展
1. 打开扩展弹窗
2. 点击 "Settings" 按钮
3. 输入你的 AWS 凭证：
   - Access Key ID
   - Secret Access Key
   - 选择区域（推荐 us-east-1）
4. 点击 "Save & Test"

### 3. 开始使用
1. 在扩展弹窗中选择 "🧠 Explain Mode"
2. 点击 "Start Explain Mode"
3. 在 AWS Console 中点击任何元素
4. 获得 AI 驱动的智能解释！

## 🔧 技术实现

### AWS Bedrock 集成
- **模型**: Claude 3 Sonnet (anthropic.claude-3-sonnet-20240229-v1:0)
- **认证**: AWS Signature Version 4
- **区域**: 可配置（默认 us-east-1）
- **API**: Bedrock Runtime API

### 安全特性
- 凭证本地存储（Chrome storage）
- HTTPS 加密传输
- 最小权限原则
- 无持久化用户数据

### 错误处理
- 网络错误自动重试
- 凭证错误清晰提示
- 回退到预定义解释
- 用户友好的错误消息

## 🧪 测试

### 测试页面
使用 `test-explain-mode.html` 测试功能：
1. 加载扩展
2. 打开测试页面
3. 激活 Explain Mode
4. 点击各种元素测试

### 真实 AWS Console
1. 访问 https://console.aws.amazon.com
2. 激活 Explain Mode
3. 点击 EC2、S3、Lambda 等服务元素
4. 查看 AI 生成的解释

## 📁 文件结构

```
extension/
├── aws-bedrock.js          # AWS Bedrock 客户端
├── background.js           # 后台脚本（处理 Bedrock 调用）
├── content.js             # 内容脚本（元素检测和显示）
├── settings.html          # AWS 凭证配置页面
├── popup.html             # 扩展弹窗
├── popup.js               # 弹窗脚本
├── manifest.json          # 扩展配置
└── test-explain-mode.html # 测试页面
```

## 🔍 调试

### 查看日志
1. 打开 Chrome DevTools
2. 进入 Console 标签
3. 查看扩展日志：
   - `AWS Bedrock client initialized`
   - `Handling element explanation request`
   - `Bedrock API error` (如果有错误)

### 常见问题

**Q: 显示 "Failed to initialize AWS Bedrock client"**
A: 检查 AWS 凭证是否正确配置，确保有 Bedrock 权限

**Q: 显示 "Bedrock API error: 403"**
A: 检查 IAM 权限，确保有 `bedrock:InvokeModel` 权限

**Q: 显示 "Bedrock API error: 400"**
A: 检查区域设置，确保 Bedrock 在该区域可用

**Q: 显示回退解释**
A: 正常行为，表示 Bedrock 不可用但扩展仍能工作

## 🎯 下一步

现在你可以：
1. 配置你的 AWS 凭证
2. 在真实的 AWS Console 中测试
3. 享受 AI 驱动的智能解释！

扩展现在完全集成了 Amazon Bedrock，提供真正的 AI 智能解释，而不是硬编码的模板。
