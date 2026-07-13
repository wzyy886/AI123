# AI代码助手

一个基于 **uni-app x + uniCloud + 阿里云通义千问API** 开发的AI多功能助手应用，支持AI问答、代码生成、代码审查、代码解释、文件分析、AI P图、视频通话等七大核心功能。

## 目录

- [项目介绍](#项目介绍)
- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [云函数列表](#云函数列表)
- [数据库设计](#数据库设计)
- [API文档](#api文档)
- [安全机制](#安全机制)
- [工程化建设](#工程化建设)
- [部署指南](#部署指南)
- [常见问题](#常见问题)

---

## 项目介绍

本项目是一个完整的AI辅助编程实训项目，旨在展示如何使用AI工具（Trae AI）辅助开发完整的Web应用。项目包含前后端完整代码、数据库设计、API文档、代码审查报告等全套交付物。

**主要目标：**
- 提供完整的AI代码助手服务
- 展示AI辅助编程的最佳实践
- 实现工程化开发流程（CI/CD、单元测试、配置管理）

---

## 功能特性

### 核心功能

| 功能模块 | 说明 | 页面路径 |
|----------|------|----------|
| AI问答 | 智能对话问答，支持上下文 | `pages/index/index.uvue` |
| 代码生成 | 根据需求生成多语言代码（JS/TS/Python/Java/Go/Rust/C++/C#） | `pages/generate/index.uvue` |
| 代码审查 | AI自动审查代码，给出优化建议和评分 | `pages/review/index.uvue` |
| 代码解释 | 逐行解释代码逻辑和实现原理 | `pages/explain/index.uvue` |
| 文件分析 | 上传代码/文档/数据文件，AI分析解读 | `pages/upload/index.uvue` |
| AI P图 | 上传图片，AI智能编辑美化 | `pages/pimage/index.uvue` |
| 视频通话 | AI视频通话交互 | `pages/video/index.uvue` |

### 辅助功能

| 功能 | 说明 |
|------|------|
| 用户系统 | 注册、登录、Token认证、密码加密（SHA256+salt） |
| 历史记录 | 分类保存聊天和使用记录（Q&A/生成/审查/解释） |
| 收藏功能 | 收藏常用内容，支持查看和删除 |
| 个人中心 | 用户信息管理、统计数据展示 |

---

## 技术栈

### 前端

| 技术 | 说明 |
|------|------|
| uni-app x | Vue 3 + UTS，跨端框架 |
| 原生组件 | 自定义UI组件，支持磨砂玻璃效果、渐变背景 |
| 多端适配 | H5 / 微信小程序 / App |

### 后端

| 技术 | 说明 |
|------|------|
| uniCloud | 阿里云版云服务空间 |
| 云函数 | 9个独立云函数，处理业务逻辑 |
| 云数据库 | NoSQL数据库，5张数据表 |

### AI能力

| 服务 | 说明 |
|------|------|
| 通义千问 qwen-turbo | 对话大模型 |
| 万象 AI wanxiang-v1 | 图片生成模型 |
| 阿里云 DashScope API | AI服务提供方 |

---

## 快速开始

### 环境要求

| 工具/服务 | 版本要求 | 说明 |
|-----------|----------|------|
| HBuilderX | 3.8+ | 前端开发IDE |
| uniCloud | - | 阿里云版云服务空间 |
| 阿里云 DashScope | - | AI API 服务 |
| Node.js | 16+ | 本地开发（运行单元测试） |

### 安装步骤

#### 1. 克隆项目

```bash
git clone https://github.com/wzyy886/AI123.git
cd AI123
```

#### 2. 导入项目到 HBuilderX

```
HBuilderX → 文件 → 打开目录 → 选择项目根目录
```

#### 3. 配置云服务空间

```
右键 uniCloud-aliyun → 关联云服务空间
选择或创建你的阿里云服务空间
```

#### 4. 配置 API Key

打开配置文件：`uniCloud-aliyun/cloudfunctions/common/uni-config-center/ai-config/index.js`

修改配置内容：

```javascript
module.exports = {
  api: {
    key: '你的阿里云DashScope API Key',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    imagePath: '/api/v1/services/aigc/text2image/sync'
  },
  model: {
    text: 'qwen-turbo',
    image: 'wanxiang-v1'
  },
  defaults: {
    maxTokens: 2000,
    temperature: 0.7,
    imageSize: '768x768',
    imageCount: 1
  },
  security: {
    maxInputLength: 1000,
    supportedLanguages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'C#']
  }
};
```

> **获取 API Key**: 登录 [阿里云 DashScope 控制台](https://dashscope.console.aliyun.com/) → API Key 管理 → 创建新 API Key

#### 5. 上传云函数

```
右键 uniCloud-aliyun/cloudfunctions 目录
→ 上传所有云函数及公共模块
→ 选择「上传并部署：云端安装依赖」
等待所有云函数部署完成
```

#### 6. 初始化数据库

在 uniCloud 控制台创建以下数据表：

| 表名 | 说明 |
|------|------|
| `users` | 用户表 |
| `chat_history` | 聊天历史表 |
| `file_history` | 文件分析历史表 |
| `image_history` | 图片历史表 |
| `video_calls` | 视频通话表 |

或在 HBuilderX 中右键云数据库 → 新建数据表，使用 `uniCloud-aliyun/database/schema/` 目录下的 schema 文件。

#### 7. 运行项目

```
HBuilderX → 运行 → 运行到浏览器 → Chrome
或：运行 → 运行到小程序模拟器 → 微信开发者工具
```

### 验证部署

部署完成后，按以下步骤验证：

1. ✅ 打开应用 → 显示登录页面
2. ✅ 注册账号 → 提示注册成功，users 表新增数据
3. ✅ AI 问答 → 发送消息收到 AI 回复，chat_history 表新增数据
4. ✅ 代码生成 → 输入需求生成代码
5. ✅ 文件分析 → 上传文件正常分析
6. ✅ AI P图 → 上传图片生成美化结果

---

## 项目结构

```
AI123/
├── pages/                      # 前端页面（12个）
│   ├── index/                  # 首页 - AI问答
│   ├── generate/               # 代码生成
│   ├── review/                 # 代码审查
│   ├── explain/                # 代码解释
│   ├── upload/                 # 文件分析
│   ├── pimage/                 # AI P图
│   ├── video/                  # 视频通话
│   ├── login/                  # 登录
│   ├── register/               # 注册
│   ├── history/                # 历史记录
│   ├── favorites/              # 收藏
│   └── mine/                   # 个人中心
├── uniCloud-aliyun/            # 云服务
│   ├── cloudfunctions/         # 云函数（9个）
│   │   ├── chat/               # AI聊天
│   │   ├── login/              # 用户登录
│   │   ├── register/           # 用户注册
│   │   ├── generate/           # 代码生成
│   │   ├── review/             # 代码审查
│   │   ├── explain/            # 代码解释
│   │   ├── analyze/            # 文件分析
│   │   ├── image/              # 图片处理
│   │   ├── video/              # 视频通话
│   │   └── common/             # 公共模块
│   │       ├── uni-config-center/   # 配置中心
│   │       └── utils/          # 工具函数
│   └── database/               # 数据库配置
│       └── schema/             # 表结构定义
├── utils/                      # 前端工具
│   └── ai.js                   # AI调用封装
├── test/                       # 单元测试（Jest）
├── .github/workflows/          # CI/CD 配置
├── static/                     # 静态资源
├── API.md                      # API 接口文档
├── code_review.md              # AI 代码审查报告
├── prompt_log.md               # Prompt 日志
├── summary.md                  # 个人实训总结报告
├── 个人总结报告.docx           # 个人总结报告（Word格式）
├── README.md                   # 项目说明文档
└── package.json                # 项目依赖
```

---

## 云函数列表

| 云函数 | 功能 | 入口文件 |
|--------|------|----------|
| chat | AI聊天问答 | `uniCloud-aliyun/cloudfunctions/chat/index.js` |
| login | 用户登录 | `uniCloud-aliyun/cloudfunctions/login/index.js` |
| register | 用户注册 | `uniCloud-aliyun/cloudfunctions/register/index.js` |
| generate | 代码生成 | `uniCloud-aliyun/cloudfunctions/generate/index.js` |
| review | 代码审查 | `uniCloud-aliyun/cloudfunctions/review/index.js` |
| explain | 代码解释 | `uniCloud-aliyun/cloudfunctions/explain/index.js` |
| analyze | 文件分析 | `uniCloud-aliyun/cloudfunctions/analyze/index.js` |
| image | 图片处理 | `uniCloud-aliyun/cloudfunctions/image/index.js` |
| video | 视频通话 | `uniCloud-aliyun/cloudfunctions/video/index.js` |

---

## 数据库设计

项目使用 uniCloud 云数据库（NoSQL），共 5 张数据表。

### users 用户表

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | string | 主键ID（自动生成） |
| username | string | 用户名，唯一 |
| password | string | 密码哈希（SHA256 + salt） |
| salt | string | 密码盐值 |
| token | string | 当前登录令牌 |
| token_expire | number | 令牌过期时间戳 |
| create_time | number | 注册时间戳 |

### chat_history 聊天历史表

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | string | 主键ID |
| userId | string | 用户ID（匿名为 anonymous） |
| message | string | 用户消息内容 |
| reply | string | AI回复内容 |
| status | string | 状态（success/failed） |
| startedAt | number | 请求开始时间戳 |
| endedAt | number | 请求结束时间戳 |

### file_history 文件分析历史表

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | string | 主键ID |
| userId | string | 用户ID |
| fileName | string | 文件名 |
| fileType | string | 文件类型 |
| userRequest | string | 用户分析需求 |
| result | string | 分析结果 |
| status | string | 状态 |
| startedAt | number | 开始时间戳 |

### image_history 图片历史表

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | string | 主键ID |
| userId | string | 用户ID |
| action | string | 操作类型（generate/edit） |
| prompt | string | 提示词 |
| imageUrl | string | 生成的图片URL |
| status | string | 状态 |
| startedAt | number | 开始时间戳 |

### video_calls 视频通话表

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | string | 主键ID |
| userId | string | 用户ID |
| sessionId | string | 会话ID |
| message | string | 用户消息 |
| reply | string | AI回复 |
| status | string | 状态 |
| startedAt | number | 开始时间戳 |

---

## API文档

详细接口文档请查看：[API.md](API.md)

### 接口概览

| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| /register | POST | 用户注册 | ❌ |
| /login | POST | 用户登录 | ❌ |
| /chat | POST | AI 聊天问答 | ✅ |
| /generate | POST | 代码生成 | ✅ |
| /review | POST | 代码审查 | ✅ |
| /explain | POST | 代码解释 | ✅ |
| /analyze | POST | 文件分析 | ✅ |
| /image | POST | 图片生成/编辑 | ✅ |
| /video | POST | 视频通话 | ✅ |

### 统一响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

### 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 参数错误 |
| 401 | 未授权 |
| 403 | 权限不足 |
| 500 | 服务器错误 |

---

## 安全机制

- **密码加密**: SHA256 + salt 加盐哈希存储，密码不可逆
- **Token认证**: 随机64位令牌，支持过期失效机制
- **输入验证**: 所有接口参数校验，过滤 XSS 特殊字符、script 关键词
- **API保护**: API Key 存储在云函数配置中心，前端完全不持有
- **匿名支持**: 未登录用户也可使用，记录为 anonymous
- **频率限制**: 接口调用限流，防止恶意请求

---

## 工程化建设

### CI/CD 持续集成

项目使用 GitHub Actions 实现自动化构建和测试：

- **配置文件**: `.github/workflows/ci.yml`
- **触发条件**: 每次 push 到 main 分支
- **执行步骤**: 安装依赖 → 运行单元测试

### 单元测试

使用 Jest 框架进行单元测试：

- **测试文件**: `test/utils.test.js`
- **测试用例**: 覆盖 sanitizeInput、hashPassword、validateLanguage 等核心函数
- **运行命令**: `npm test`

### 配置中心

使用 uniCloud 配置中心管理敏感信息：

- **配置文件**: `uniCloud-aliyun/cloudfunctions/common/uni-config-center/ai-config/index.js`
- **管理内容**: API Key、模型配置、业务参数
- **优势**: 配置与代码分离，敏感信息不入库

---

## 部署指南

### H5 端部署

1. **云打包方式**
   ```
   HBuilderX → 发行 → 原生App-云打包 → 选择 H5
   ```

2. **部署到服务器**
   - 将打包后的静态文件上传到服务器
   - 配置 Nginx / Apache 等 Web 服务器
   - 配置 HTTPS（推荐）

### 小程序端部署

1. 配置小程序 AppID（在 manifest.json 中）
2. 微信开发者工具导入项目
3. 上传代码并提交审核

### App 端部署

1. 使用 HBuilderX 云打包
2. 选择 Android / iOS 平台
3. 配置签名证书
4. 提交应用市场

---

## 常见问题

### Q: 云函数调用失败怎么办？

A: 检查以下几点：
1. 云函数是否已上传部署
2. 云服务空间是否关联正确
3. API Key 是否配置正确
4. 查看 uniCloud 控制台的错误日志

### Q: 数据库没有记录怎么办？

A: 检查以下几点：
1. 数据表是否已创建
2. 表字段是否与代码中一致（schema 验证）
3. 数据库权限是否正确设置
4. 查看云函数日志是否有报错

### Q: AI 接口调用失败怎么办？

A: 检查以下几点：
1. API Key 是否正确
2. 账户余额是否充足
3. 网络是否通畅
4. 查看返回的具体错误信息

### Q: 如何更换 AI 模型？

A: 修改配置文件 `ai-config/index.js` 中的模型名称，支持通义千问系列所有模型。

---

## 相关文档

| 文档 | 说明 |
|------|------|
| [API.md](API.md) | API 接口文档 |
| [code_review.md](code_review.md) | AI 代码审查报告 |
| [prompt_log.md](prompt_log.md) | Prompt 日志（12条完整记录） |
| [summary.md](summary.md) | 个人实训总结报告 |
| [个人总结报告.docx](个人总结报告.docx) | 个人总结报告（Word格式） |

---

## 开发工具

| 工具 | 用途 |
|------|------|
| Trae AI | 代码审查、重构建议、问题排查、文档生成 |
| HBuilderX | 前端开发、云函数部署、云打包 |
| uniCloud 控制台 | 数据库管理、日志查看、云函数管理 |
| Jest | 单元测试框架 |
| GitHub Actions | CI/CD 持续集成 |

---

<p align="center">
  本项目基于 <a href="https://uniapp.dcloud.net.cn/">uni-app x</a> + 
  <a href="https://unicloud.dcloud.net.cn/">uniCloud</a> + 
  <a href="https://dashscope.aliyun.com/">阿里云 DashScope</a> 开发
</p>