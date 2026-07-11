# AI助手 - 全能型AI智能助手

一个基于 uni-app x 框架开发的全能型AI助手应用，集成了AI问答、文件分析、图片编辑、视频通话等多种功能。

## 技术栈

- **前端**: uni-app x (Vue 3 + UTS)
- **后端**: uniCloud 云函数
- **AI服务**: 阿里云通义千问 (qwen-turbo)、通义万相 (wanxiang-v1)
- **语音合成**: Web Speech API

## 功能特性

### 1. AI问答
- 支持多种类型问题的智能回答
- 精通2026年最新技术栈
- 涵盖编程、技术、生活、学习等领域

### 2. 文件分析
- 支持文本文件上传与分析
- 代码审查、解释和优化建议
- 文档总结和数据分析

### 3. AI P图
- 图片上传与编辑建议
- AI生成新图片
- 支持多种风格选择（美颜、艺术、胶片、黑白、梦幻等）

### 4. AI视频通话
- 实时语音对话
- 少女音语音合成
- 文字聊天辅助

### 5. 用户系统
- 用户注册与登录
- Token认证机制
- 个人中心管理

### 6. 代码工具
- 代码生成
- 代码审查
- 代码解释

## 项目结构

```
ai/
├── pages/                     # 前端页面
│   ├── login/index.uvue       # 登录页
│   ├── register/index.uvue    # 注册页
│   ├── index/index.uvue       # 问答页
│   ├── upload/index.uvue      # 文件分析页
│   ├── pimage/index.uvue      # P图页
│   ├── video/index.uvue       # 视频通话页
│   ├── mine/index.uvue        # 个人中心页
│   ├── generate/index.uvue    # 代码生成页
│   ├── review/index.uvue      # 代码审查页
│   ├── explain/index.uvue     # 代码解释页
│   ├── history/index.uvue     # 历史记录页
│   └── favorites/index.uvue   # 收藏夹页
├── uniCloud-aliyun/           # 后端云函数
│   └── cloudfunctions/
│       ├── register/          # 用户注册API
│       ├── login/             # 用户登录API
│       ├── chat/              # AI问答API
│       ├── analyze/           # 文件分析API
│       ├── image/             # 图片编辑API
│       ├── video/             # 视频通话API
│       ├── generate/          # 代码生成API
│       ├── review/            # 代码审查API
│       ├── explain/           # 代码解释API
│       └── common/            # 公共配置
├── utils/                     # 工具函数
│   └── ai.js                  # AI调用工具
├── API.md                     # API接口文档
├── prompt_log.md              # Prompt日志
└── pages.json                 # 路由配置
```

## 安装与运行

### 环境要求

- HBuilder X 最新版本
- Node.js 18+

### 开发步骤

1. **克隆项目**
```bash
git clone https://github.com/wzyy886/AI123.git
```

2. **打开项目**
- 使用 HBuilder X 打开项目文件夹

3. **配置API Key**
- 在 `uniCloud-aliyun/cloudfunctions/common/uni-config-center/ai-config/index.js` 中配置阿里云API Key

4. **部署云函数**
- 在 HBuilder X 中右键云函数目录，选择"上传部署"

5. **运行项目**
- 在 HBuilder X 中点击"运行"->选择运行方式（浏览器/模拟器/真机）

## API文档

详见 [API.md](API.md)

## Prompt日志

详见 [prompt_log.md](prompt_log.md)

## 考核要求清单

### 项目功能完整度
- ✅ 前端至少3个独立路由（实际12个）
- ✅ 后端至少3个API接口（实际10个）
- ✅ 提供接口文档
- ✅ UI/UX体验优化
- ✅ 健壮性（异常场景覆盖）

### 工程规范与代码质量
- ✅ Git提交历史（多个不同日期）
- ✅ 代码目录清晰
- ✅ AI代码审查

### AI工具运用与文档
- ✅ Prompt日志
- ✅ 项目文档（README.md）
- ✅ API文档

## 异常场景覆盖

| 场景 | 处理方式 |
|------|----------|
| 网络断开 | 立即检测并提示用户 |
| 请求超时 | 自动重试（最多2次），指数退避 |
| 服务器5xx错误 | 自动重试（最多2次） |
| 参数无效 | 提前校验，友好提示 |
| AI服务错误 | 解析错误信息，明确提示 |
| 图片生成超时 | 最多轮询90秒，超时提示 |
| 语音合成失败 | 提示用户使用Chrome浏览器 |

## 作者

wzyy886
