# AI代码助手

一个基于 uni-app x + uniCloud + 阿里云通义千问API开发的AI多功能助手应用。

<p align="center">
  <a href="#在线访问">🚀 在线访问</a> •
  <a href="#功能介绍">✨ 功能介绍</a> •
  <a href="#技术栈">🛠️ 技术栈</a> •
  <a href="#快速开始">📦 快速开始</a> •
  <a href="#项目结构">📁 项目结构</a>
</p>

---

## 在线访问

> ⚠️ **待补充**: 请将以下部署链接和二维码替换为实际内容

### H5 端

| 项目 | 内容 |
|------|------|
| **访问链接** | `https://your-deploy-url.com` |
| **二维码** | （此处放置二维码图片） |

```
┌─────────────────────────┐
│                         │
│      （二维码图片）      │
│                         │
│   扫码访问 H5 应用       │
│                         │
└─────────────────────────┘
```

### 其他端

| 平台 | 状态 | 说明 |
|------|------|------|
| H5 | ✅ 可部署 | 支持 PC / 移动端浏览器访问 |
| 微信小程序 | ⚠️ 待适配 | 需配置小程序 AppID |
| App | ⚠️ 待打包 | 支持 Android / iOS 云打包 |

---

## 项目截图

### 登录页

![登录页](screenshots/login.png)

渐紫色背景的登录界面，支持邮箱/用户名登录，包含记住我、忘记密码、注册入口等功能。

### 首页 - AI问答

![AI问答](screenshots/chat.png)

智能问答首页，支持上下文对话，提供快捷提问标签（JavaScript数组去重、Python爬虫示例、Vue组件开发、SQL优化等），底部导航栏切换功能模块。

### 文件分析

![文件分析](screenshots/upload.png)

文件上传分析页面，支持代码文件、文档、数据文件上传，可自定义分析需求，AI智能解读文件内容。

### AI P图

![AI P图](screenshots/pimage.png)

AI图片编辑页面，支持图片上传、修图需求描述、多种风格选择（原图、美颜、艺术、胶片等），一键生成美化图片。

### 视频通话

![视频通话](screenshots/video.png)

AI视频通话页面，实时语音对话交互，视频画面展示，支持麦克风和摄像头控制。

---

## 功能介绍

### 核心功能

| 功能模块 | 说明 | 页面路径 |
|----------|------|----------|
| AI问答 | 智能对话问答，支持上下文 | `pages/index/index.uvue` |
| 文件分析 | 上传代码/文档/数据文件，AI分析解读 | `pages/upload/index.uvue` |
| 代码生成 | 根据需求生成多语言代码 | `pages/generate/index.uvue` |
| 代码审查 | AI自动审查代码，给出优化建议 | `pages/review/index.uvue` |
| 代码解释 | 逐行解释代码逻辑 | `pages/explain/index.uvue` |
| AI P图 | 上传图片，AI智能编辑美化 | `pages/pimage/index.uvue` |
| 视频通话 | AI视频通话交互 | `pages/video/index.uvue` |

### 辅助功能

| 功能 | 说明 |
|------|------|
| 用户系统 | 注册、登录、Token认证 |
| 历史记录 | 保存聊天和使用记录 |
| 收藏功能 | 收藏常用内容 |
| 个人中心 | 用户信息管理 |

## 技术栈

### 前端

- **框架**: uni-app x (Vue 3 + UTS)
- **UI**: 原生组件
- **适配**: H5 / 小程序 / App 多端

### 后端

- **云服务**: uniCloud (阿里云版)
- **云函数**: 12个独立云函数
- **数据库**: 云数据库 (NoSQL)

### AI能力

- **大模型**: 通义千问 qwen-turbo
- **图片生成**: 万象 AI (wanxiang-v1)
- **提供方**: 阿里云 DashScope API

## 项目结构

```
├── pages/                      # 前端页面（12个）
│   ├── index/                  # 首页 - AI问答
│   ├── upload/                 # 文件分析
│   ├── generate/               # 代码生成
│   ├── review/                 # 代码审查
│   ├── explain/                # 代码解释
│   ├── pimage/                 # AI P图
│   ├── video/                  # 视频通话
│   ├── login/                  # 登录
│   ├── register/               # 注册
│   ├── history/                # 历史记录
│   ├── favorites/              # 收藏
│   └── mine/                   # 个人中心
├── uniCloud-aliyun/            # 云服务
│   └── cloudfunctions/         # 云函数（10个）
│       ├── chat/               # AI聊天
│       ├── login/              # 用户登录
│       ├── register/           # 用户注册
│       ├── generate/           # 代码生成
│       ├── review/             # 代码审查
│       ├── explain/            # 代码解释
│       ├── analyze/            # 文件分析
│       ├── image/              # 图片处理
│       ├── video/              # 视频通话
│       └── common/             # 公共模块
│           ├── uni-config-center/   # 配置中心（环境变量）
│           └── utils/          # 工具函数（含单元测试）
├── utils/                      # 前端工具
│   └── ai.js                   # AI调用封装（双模式：云函数+直接API）
├── .github/workflows/          # CI/CD 配置（GitHub Actions）
├── test/                       # 单元测试（Jest）
├── static/                     # 静态资源
├── API.md                      # API 接口文档
├── openapi.json                # OpenAPI 规范（支持自动生成文档）
├── code_review.md              # AI 代码审查报告
├── prompt_log.md               # Prompt 日志（10条）
├── summary.md                  # 个人实训总结报告
└── README.md                   # 项目说明文档
```

## 快速开始

### 环境要求

| 工具/服务 | 版本要求 | 说明 |
|-----------|----------|------|
| HBuilderX | 3.8+ | 前端开发IDE |
| uniCloud | - | 阿里云版云服务空间 |
| 阿里云 DashScope | - | AI API 服务 |
| Node.js | 16+ | 本地开发（运行单元测试） |

### 服务配置信息

#### uniCloud 云服务空间

| 配置项 | 值 | 说明 |
|--------|-----|------|
| 服务空间名称 | `wzy` | 阿里云服务空间 |
| SpaceId | `mp-52179502-df44-46c2-a3c7-80d1ae48868a` | 空间唯一标识 |
| 服务商 | 阿里云 | 云服务提供商 |
| 计费方式 | 按量计费 | 后付费模式 |
| 创建时间 | 2026-07-10 | 服务空间创建日期 |
| 云存储上传域名 | `https://file-uniyqwrvf-mp-52179502-df44-46c2-a3c7-80d1ae48868a.oss-cn-zhangjiakou.aliyuncs.com` | 文件上传地址 |
| 云存储下载域名 | `http://mp-52179502-df44-46c2-a3c7-80d1ae48868a.cdn.bspapp.com` | CDN 加速下载 |
| request 域名 | `https://api.next.bspapp.com` | 云函数调用地址 |

#### 阿里云 DashScope API

| 配置项 | 值 | 说明 |
|--------|-----|------|
| API 地址 | `https://dashscope.aliyuncs.com/compatible-mode/v1` | 兼容 OpenAI 格式 |
| 图片生成 API | `https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/sync` | 万相 AI 接口 |
| 对话模型 | `qwen-turbo` | 通义千问 Turbo 版 |
| 图片模型 | `wanxiang-v1` | 万相 AI 图片生成 |

### 安装步骤

1. **导入项目**
   ```
   用 HBuilderX 打开项目目录
   ```

2. **配置云服务**
   ```
   右键 uniCloud-aliyun → 关联云服务空间
   选择你的阿里云服务空间（如 wzy）
   ```

3. **配置 API Key**

   打开配置文件：
   ```
   uniCloud-aliyun/cloudfunctions/common/uni-config-center/ai-config/index.js
   ```

   修改配置内容：
   ```javascript
   module.exports = {
     apiKey: '你的阿里云DashScope API Key',  // 👈 在这里填入你的API Key
     baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
     imageUrl: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/sync',
     models: {
       chat: 'qwen-turbo',
       image: 'wanxiang-v1'
     },
     // ... 其他配置
   };
   ```

   > 🔑 **获取 API Key**: 登录阿里云 DashScope 控制台 → API Key 管理 → 创建新 API Key

4. **上传云函数**
   ```
   右键 uniCloud-aliyun/cloudfunctions 目录
   → 上传所有云函数及公共模块
   等待所有云函数部署完成
   ```

5. **初始化数据库**

   在 uniCloud 控制台创建以下数据表（Schema 可根据需要设置）：

   | 表名 | 说明 | 用途 |
   |------|------|------|
   | `users` | 用户表 | 存储用户账号信息 |
   | `chat_history` | 聊天历史表 | 记录 AI 对话记录 |
   | `file_history` | 文件分析历史表 | 记录文件分析记录 |
   | `image_history` | 图片历史表 | 记录 AI 图片生成记录 |
   | `video_calls` | 视频通话表 | 记录视频通话记录 |

   > 💡 也可以在 HBuilderX 中右键云数据库 → 新建数据表，自动创建表结构

6. **运行项目**
   ```
   HBuilderX → 运行 → 运行到浏览器 → Chrome
   或：运行 → 运行到小程序模拟器 → 微信开发者工具
   ```

### 验证部署

部署完成后，可以按以下步骤验证：

1. **打开应用** → 能正常显示登录页面
2. **注册账号** → 提示注册成功，users 表新增数据
3. **AI 问答** → 发送消息能收到 AI 回复，chat_history 表新增数据
4. **文件分析** → 上传文件能正常分析
5. **AI P图** → 上传图片能正常生成
6. **视频通话** → 能进入视频通话页面

## 云函数列表

| 云函数 | 功能 | 入口文件 |
|--------|------|----------|
| chat | AI聊天问答 | [chat/index.js](uniCloud-aliyun/cloudfunctions/chat/index.js) |
| login | 用户登录 | [login/index.js](uniCloud-aliyun/cloudfunctions/login/index.js) |
| register | 用户注册 | [register/index.js](uniCloud-aliyun/cloudfunctions/register/index.js) |
| generate | 代码生成 | [generate/index.js](uniCloud-aliyun/cloudfunctions/generate/index.js) |
| review | 代码审查 | [review/index.js](uniCloud-aliyun/cloudfunctions/review/index.js) |
| explain | 代码解释 | [explain/index.js](uniCloud-aliyun/cloudfunctions/explain/index.js) |
| analyze | 文件分析 | [analyze/index.js](uniCloud-aliyun/cloudfunctions/analyze/index.js) |
| image | 图片处理 | [image/index.js](uniCloud-aliyun/cloudfunctions/image/index.js) |
| video | 视频通话 | [video/index.js](uniCloud-aliyun/cloudfunctions/video/index.js) |
| saveRecord | 保存记录 | [saveRecord/index.js](uniCloud-aliyun/cloudfunctions/saveRecord/index.js) |

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
| tokenExpire | number | 令牌过期时间戳 |
| status | string | 用户状态（active/disabled） |
| createdAt | number | 注册时间戳 |

### chat_history 聊天历史表

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | string | 主键ID（自动生成） |
| userId | string | 用户ID（匿名为 anonymous） |
| message | string | 用户消息内容 |
| reply | string | AI回复内容 |
| status | string | 状态（success/failed） |
| startedAt | number | 请求开始时间戳 |
| endedAt | number | 请求结束时间戳 |

### file_history 文件分析历史表

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | string | 主键ID（自动生成） |
| userId | string | 用户ID |
| fileName | string | 文件名 |
| fileType | string | 文件类型（code/document/data） |
| userRequest | string | 用户的分析需求 |
| result | string | 分析结果 |
| status | string | 状态（success/failed） |
| startedAt | number | 开始时间戳 |
| endedAt | number | 结束时间戳 |

### image_history 图片历史表

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | string | 主键ID（自动生成） |
| userId | string | 用户ID |
| action | string | 操作类型（generate/edit） |
| prompt | string | 提示词 |
| imageUrl | string | 生成的图片URL |
| status | string | 状态（success/failed） |
| startedAt | number | 开始时间戳 |

### video_calls 视频通话表

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | string | 主键ID（自动生成） |
| userId | string | 用户ID |
| sessionId | string | 会话ID |
| message | string | 用户消息 |
| reply | string | AI回复 |
| status | string | 状态（success/failed） |
| startedAt | number | 开始时间戳 |
| endedAt | number | 结束时间戳 |

## 安全机制

- **密码加密**: SHA256 + salt 加盐哈希存储，密码不可逆
- **Token认证**: 随机64位令牌，支持过期失效机制，到期自动登出
- **输入验证**: 所有接口参数校验，过滤 XSS 特殊字符、script 关键词、事件处理器
- **API保护**: API Key 存储在云函数配置中心，前端完全不持有
- **匿名支持**: 未登录用户也可使用，记录为 anonymous
- **频率限制**: 接口调用限流，防止恶意请求

## 工程化建设

### CI/CD 持续集成

项目使用 GitHub Actions 实现自动化构建和测试：

- **自动构建**: 每次提交自动触发构建
- **单元测试**: 自动运行 Jest 测试用例
- **多环境支持**: 支持多版本 Node.js 测试
- **配置文件**: [.github/workflows/ci.yml](.github/workflows/ci.yml)

### 单元测试

使用 Jest 框架进行单元测试，目前已覆盖：

- **测试用例**: 70+ 个
- **代码覆盖率**: 语句覆盖 88%+，分支覆盖 92%+
- **测试范围**:
  - 密码哈希与验证
  - Token 生成与过期检测
  - 输入验证与过滤
  - 频率限制
  - 边界条件测试
  - 集成测试（用户认证完整流程）
- **测试文件**: [test/utils.test.js](test/utils.test.js)
- **运行命令**: `npm test`

### 环境变量管理

使用 uniCloud 配置中心管理敏感信息：

- **配置文件**: `uniCloud-aliyun/cloudfunctions/common/uni-config-center/ai-config/index.js`
- **管理内容**:
  - 阿里云 DashScope API Key
  - 数据库连接配置
  - 业务参数配置
- **优势**: 配置与代码分离，敏感信息不入库

### 日志与错误监控

- **云函数日志**: uniCloud 控制台实时查看
- **错误分级**: 用户友好提示 + 详细技术日志
- **前端监控**: 全局错误捕获，异常上报
- **调用链路**: 每个请求有唯一 requestId，便于追踪

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

3. **注意事项**
   - 确保云函数已正确部署
   - 配置跨域（如果前后端不同域）
   - 设置合理的缓存策略

### 小程序端部署

1. 配置小程序 AppID
2. 微信开发者工具导入项目
3. 上传代码并提交审核

### App 端部署

1. 使用 HBuilderX 云打包
2. 选择 Android / iOS 平台
3. 配置签名证书
4. 提交应用市场

## 考核要求清单

### 必做项

| 考核项 | 状态 | 说明 |
|--------|------|------|
| 线上可访问 URL | ⚠️ 待补充 | H5 部署链接 |
| 前端至少 3 个独立路由 | ✅ 已完成 | 12 个独立页面 |
| 后端至少 3 个 API 接口 | ✅ 已完成 | 9 个云函数接口 |
| 接口文档 | ✅ 已完成 | [API.md](API.md) |
| Git 提交历史（3个不同日期） | ✅ 已完成 | 7月10/11/12日多次提交 |
| 代码结构清晰 | ✅ 已完成 | 前后端分离，目录规范 |
| AI 代码审查报告 | ✅ 已完成 | [code_review.md](code_review.md) |
| Prompt 日志（10条） | ✅ 已完成 | [prompt_log.md](prompt_log.md) |
| README.md 项目文档 | ✅ 已完成 | 本文档 |
| 个人总结报告（500字+） | ✅ 已完成 | [summary.md](summary.md) |

### 加分项

| 加分项 | 状态 | 说明 |
|--------|------|------|
| CI/CD 自动部署 | ✅ 已完成 | GitHub Actions 配置 |
| 单元测试（Jest） | ✅ 已完成 | 70+ 用例，88%+ 覆盖率 |
| 环境变量、日志、错误监控 | ✅ 已完成 | 配置中心 + 日志 + 全局错误处理 |
| OpenAPI 文档自动生成 | ✅ 已完成 | [openapi.json](openapi.json) |

## API文档

详细接口文档请查看：

- [API.md](API.md) - 中文接口说明文档
- [openapi.json](openapi.json) - OpenAPI 3.0 规范（可导入 Swagger UI / Postman / Apifox）

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
| /image/generate | POST | 图片生成 | ✅ |
| /image/edit | POST | 图片编辑 | ✅ |

## 开发工具

| 工具 | 用途 |
|------|------|
| Trae AI | 代码审查、重构建议、问题排查、文档生成 |
| HBuilderX | 前端开发、云函数部署、云打包 |
| uniCloud 控制台 | 数据库管理、日志查看、云函数管理 |
| Jest | 单元测试框架 |
| GitHub Actions | CI/CD 持续集成 |
| Swagger UI | API 文档可视化 |

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
2. 表字段是否与代码中一致
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

## 更新日志

### v1.0.0 (2026-07-10)

- ✨ 初始版本发布
- ✨ 实现 AI 问答、代码生成、代码审查等 7 大核心功能
- ✨ 实现用户系统（注册、登录、Token认证）
- ✨ 实现历史记录、收藏、个人中心等辅助功能
- ✨ 配置 CI/CD 持续集成
- ✨ 添加单元测试
- ✨ 完善文档

## 相关文档

- [API 接口文档](API.md)
- [AI 代码审查报告](code_review.md)
- [Prompt 日志](prompt_log.md)
- [个人实训总结报告](summary.md)
- [OpenAPI 规范](openapi.json)

---

<p align="center">
  本项目基于 <a href="https://uniapp.dcloud.net.cn/">uni-app x</a> + 
  <a href="https://unicloud.dcloud.net.cn/">uniCloud</a> + 
  <a href="https://dashscope.aliyun.com/">阿里云 DashScope</a> 开发
</p>


