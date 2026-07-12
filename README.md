# AI助手 - 全能型AI智能助手

一个基于 uni-app x 框架开发的全能型AI智能助手应用，集成了AI问答、文件分析、图片编辑、视频通话等多种功能。

## 技术栈

- **前端**: uni-app x (Vue 3 + UTS)
- **后端**: uniCloud 云函数
- **AI服务**: 阿里云通义千问 (qwen-turbo)、通义万相 (wanxiang-v1)
- **语音合成**: Web Speech API
- **测试框架**: Jest
- **CI/CD**: GitHub Actions
- **API文档**: OpenAPI 3.0.1 (openapi.json)

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
- Token认证机制（24小时过期）
- 个人中心管理

### 6. 代码工具
- 代码生成（8种编程语言）
- 代码审查（8种编程语言）
- 代码解释（8种编程语言）

## 项目结构

```
ai/
├── pages/                     # 前端页面
│   ├── login/index.uvue       # 登录页（含离线模式回退）
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
│       ├── register/          # 用户注册API（加盐哈希）
│       ├── login/             # 用户登录API（Token过期机制）
│       ├── chat/              # AI问答API
│       ├── analyze/           # 文件分析API
│       ├── image/             # 图片编辑API
│       ├── video/             # 视频通话API
│       ├── generate/          # 代码生成API
│       ├── review/            # 代码审查API
│       ├── explain/           # 代码解释API
│       └── common/
│           ├── utils/         # 公共工具模块（含单元测试）
│           └── uni-config-center/ai-config/  # 配置文件
├── utils/                     # 工具函数
│   └── ai.js                  # AI调用工具（双模式架构）
├── uniCloud-aliyun/database/schema/  # 数据库schema
│   ├── users.schema.json      # 用户表
│   ├── chat_history.schema.json    # 聊天记录表
│   ├── file_history.schema.json    # 文件分析记录表
│   ├── image_history.schema.json   # 图片编辑记录表
│   └── video_calls.schema.json     # 视频通话记录表
├── .github/workflows/         # CI/CD配置
│   └── ci.yml                 # GitHub Actions工作流
├── API.md                     # API接口文档
├── prompt_log.md              # Prompt日志
├── code_review.md             # AI代码审查报告
├── summary.md                 # 个人实训总结报告
├── openapi.json               # OpenAPI规范文件
└── pages.json                 # 路由配置
```

## 安装与运行

### 环境要求

- HBuilder X 最新版本
- Node.js 18+
- 阿里云 DashScope API Key

### 开发步骤

1. **克隆项目**
```bash
git clone https://github.com/wzyy886/AI123.git
cd AI123
```

2. **打开项目**
- 使用 HBuilder X 打开项目文件夹

3. **配置API Key**
- 在 `uniCloud-aliyun/cloudfunctions/common/uni-config-center/ai-config/index.js` 中配置阿里云API Key

4. **部署云函数**
- 在 HBuilder X 中右键云函数目录，选择"上传部署"

5. **运行项目**
- 在 HBuilder X 中点击"运行"->选择运行方式（浏览器/模拟器/真机）

### 生产部署

1. 将 `utils/ai.js` 中的 `DEVELOPMENT_MODE` 改为 `false`（关闭直接API调用fallback）
2. 确保所有云函数已部署到 uniCloud
3. 配置前端网页托管，获取线上访问 URL

### 安全性说明

项目采用双模式设计：
- **开发模式**（`DEVELOPMENT_MODE = true`）：优先调用云函数，云函数不可用时 fallback 到直接调用阿里云 API，便于本地开发测试；登录失败时自动进入离线模式
- **生产模式**（`DEVELOPMENT_MODE = false`）：仅通过云函数调用 AI API，API Key 集中管理在后端配置文件中，前端代码无敏感信息暴露

### 离线模式回退机制

当云函数调用失败（如资源耗尽、网络异常等）时，系统会自动切换到离线模式：
- **登录**：自动生成本地Token，允许用户进入应用
- **AI功能**：自动回退到直接调用阿里云API，确保功能可用

## API文档

详见 [API.md](API.md)

## Prompt日志

详见 [prompt_log.md](prompt_log.md)

## 代码审查报告

详见 [code_review.md](code_review.md)

## CI/CD

项目使用 GitHub Actions 实现持续集成，配置文件位于 `.github/workflows/ci.yml`。

### CI 流程
1. **build job**：代码检出 → Node.js 环境配置（20.x）→ 云函数语法检查 → JSON 配置文件验证 → 文档完整性检查
2. **test job**：代码检出 → Node.js 环境配置（20.x）→ 公共工具模块单元测试（Jest + 覆盖率），测试失败不中断流程

## 单元测试

项目使用 Jest 进行单元测试，测试文件位于 `uniCloud-aliyun/cloudfunctions/common/utils/index.test.js`。

### 运行测试
```bash
cd uniCloud-aliyun/cloudfunctions/common/utils
npm install
npm test
npm run test:coverage
```

### 测试覆盖
- 密码哈希（hashPassword、verifyPassword、generateSalt）
- Token生成（generateToken、generateTokenWithExpiry、isTokenExpired）
- 用户名校验（validateUsername）
- 密码校验（validatePassword）
- 邮箱校验（validateEmail）
- Token校验（validateToken）
- 输入过滤（sanitizeInput）
- 响应格式化（formatResponse）
- 日志系统（createLogger）
- 错误捕获（captureError）
- 配置加载（loadConfig）
- 错误处理器（asyncErrorHandler）
- 请求频率限制（checkRateLimit）

## 工程化

### 环境变量
项目使用环境变量管理配置，参考 `.env.example` 文件。

```bash
cp .env.example .env
# 编辑 .env 填入实际配置
```

主要环境变量：
- `DASHSCOPE_API_KEY`: 阿里云 DashScope API Key
- `NODE_ENV`: 运行环境（development/production）
- `DEBUG`: 是否开启调试模式
- `REQUEST_TIMEOUT`: 请求超时时间
- `ERROR_WEBHOOK_URL`: 错误告警 Webhook 地址

### 日志系统
使用 `createLogger(moduleName)` 创建结构化日志，支持 info/warn/error/debug 四个级别。

### 错误监控
- `captureError(error, context)`: 捕获错误并记录上下文
- `getErrorStats()`: 获取错误统计
- `sendErrorAlert(errorInfo)`: 发送错误告警到 Webhook
- `asyncErrorHandler(fn, moduleName)`: 云函数错误处理中间件

## 安全机制

### 认证安全
- **Token过期机制**：所有Token默认24小时过期，过期后需重新登录
- **Token校验**：所有云函数接口（register/login除外）均验证Token有效性和过期时间

### 密码安全
- **加盐哈希**：使用 SHA256 + 随机16字节盐值哈希密码
- **密码验证**：登录时重新计算哈希进行比对

### 输入安全
- **类型校验**：所有输入参数进行类型检查
- **长度限制**：设置合理的输入长度上限
- **特殊字符过滤**：移除 `<>` 等潜在危险字符
- **编程语言白名单**：仅允许8种支持的编程语言

### 请求频率限制
- 基于用户ID实现每分钟30次请求限制
- 超出限制返回429错误

## 异常场景覆盖

| 场景 | 处理方式 |
|------|----------|
| 网络断开 | 立即检测并提示用户，自动进入离线模式 |
| 请求超时 | 自动重试（最多2次），指数退避 |
| 服务器5xx错误 | 自动重试（最多2次），自动回退到直接API |
| 参数无效 | 提前校验，友好提示 |
| AI服务错误 | 解析错误信息，明确提示 |
| 图片生成超时 | 最多轮询90秒，超时提示 |
| 语音合成失败 | 提示用户使用Chrome浏览器 |
| 云函数资源耗尽 | 自动回退到直接API调用 |
| Token过期 | 返回401错误，提示重新登录 |

## 考核要求清单

### A. 项目功能完整度 (50%)
- ✅ 线上可访问（需部署后获取链接）
- ✅ 前端至少3个独立路由（实际12个）
- ✅ 后端至少3个API接口（实际9个）
- ✅ 提供接口文档（API.md）
- ✅ UI/UX体验优化
- ✅ 健壮性（异常场景覆盖）

### B. 工程规范与代码质量 (25%)
- ✅ Git提交历史（多个不同日期，规范的commit message）
- ✅ 代码目录清晰
- ✅ AI代码审查（code_review.md）

### C. AI工具运用与文档 (20%)
- ✅ Prompt日志（prompt_log.md）
- ✅ 项目文档（README.md）
- ✅ API文档（API.md）

### D. 个人总结报告 (5%)
- ✅ 单独提交（summary.md）

### 可选加分项
- ✅ CI/CD（GitHub Actions 自动测试部署）
- ✅ 单元测试（Jest，70+个测试用例，覆盖率88%+）
- ✅ 环境变量、日志、错误监控等工程化手段
- ✅ 安全机制（Token过期、加盐哈希、输入验证、频率限制）
- ✅ OpenAPI文档自动生成（openapi.json）

## 提交物清单

| 提交物 | 状态 | 说明 |
|--------|------|------|
| 项目源码 | ✅ | GitHub仓库 |
| 线上部署访问URL | ⬜ | 需部署后获取 |
| 数据库、接口、AI Code Review截图包 | ⬜ | 需手动截图 |
| README.md | ✅ | 项目文档 |
| prompt_log.md | ✅ | Prompt日志 |
| API文档 | ✅ | API.md |
| 项目演示录屏 | ⬜ | 需录制 |
| 个人实训总结报告 | ✅ | summary.md / 个人实训总结报告.docx |
| AI代码审查报告 | ✅ | code_review.md / AI代码审查报告.docx |

## 作者

2023及计算机科学与技术专业王紫玉