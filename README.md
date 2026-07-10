# AI代码助手

一个基于uni-app x和阿里云通义千问API的智能代码助手应用。

## 功能特性

- **代码问答**：智能回答各种编程问题，包括语法、框架使用、调试技巧等
- **代码生成**：根据自然语言描述生成高质量代码，支持多种编程语言
- **代码审查**：对代码进行全面审查，包括质量、安全、性能等方面
- **代码解释**：用通俗易懂的语言解释代码的含义和工作原理

## 技术栈

- **前端框架**：uni-app x (Vue 3 + UTS)
- **后端服务**：uniCloud 云函数
- **AI服务**：阿里云通义千问 (Qwen)
- **开发工具**：HBuilder X

## 项目结构

```
ai/
├── pages/                    # 前端页面
│   ├── index/               # 代码问答页面
│   ├── generate/            # 代码生成页面
│   ├── review/              # 代码审查页面
│   └── explain/             # 代码解释页面
├── uniCloud-aliyun/         # 云函数
│   └── cloudfunctions/
│       ├── chat/            # 代码问答API
│       ├── generate/        # 代码生成API
│       ├── review/          # 代码审查API
│       └── explain/         # 代码解释API
├── static/                  # 静态资源
├── App.uvue                 # 应用入口
├── pages.json               # 页面路由配置
└── manifest.json            # 应用配置
```

## API接口

### 1. chat - 代码问答

**请求参数**：
```json
{
  "question": "string - 用户的编程问题"
}
```

**响应结果**：
```json
{
  "success": true,
  "data": "string - AI回答内容"
}
```

### 2. generate - 代码生成

**请求参数**：
```json
{
  "description": "string - 功能描述",
  "language": "string - 编程语言（默认JavaScript）"
}
```

**响应结果**：
```json
{
  "success": true,
  "data": "string - 生成的代码"
}
```

### 3. review - 代码审查

**请求参数**：
```json
{
  "code": "string - 待审查的代码",
  "language": "string - 编程语言（默认JavaScript）"
}
```

**响应结果**：
```json
{
  "success": true,
  "data": "string - 审查结果"
}
```

### 4. explain - 代码解释

**请求参数**：
```json
{
  "code": "string - 待解释的代码",
  "language": "string - 编程语言（默认JavaScript）"
}
```

**响应结果**：
```json
{
  "success": true,
  "data": "string - 解释结果"
}
```

## 安装与运行

### 环境要求

- HBuilder X 3.0+
- Node.js 16+ (用于云函数开发)

### 开发步骤

1. **导入项目**
   - 打开HBuilder X
   - 文件 -> 导入 -> 从本地目录导入
   - 选择项目根目录

2. **配置阿里云通义千问API**
   - 在阿里云控制台创建API Key
   - 在云函数的环境变量中配置 `DASHSCOPE_API_KEY`

3. **运行项目**
   - 点击工具栏的"运行"按钮
   - 选择运行到浏览器或小程序

## 部署

### 云函数部署

1. 在HBuilder X中右键云函数目录
2. 选择"上传并部署"
3. 配置环境变量 `DASHSCOPE_API_KEY`

### 前端部署

1. 选择"发行" -> "构建H5"
2. 将构建产物部署到Web服务器

## 支持的编程语言

- JavaScript / TypeScript
- Python
- Java
- Go
- Rust
- C++
- PHP

## License

MIT License