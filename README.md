# AI代码助手

一个基于 uni-app x + uniCloud + 阿里云通义千问API开发的AI多功能助手应用。

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
├── pages/                     # 前端页面
│   ├── index/                 # 首页 - AI问答
│   ├── upload/                # 文件分析
│   ├── generate/              # 代码生成
│   ├── review/                # 代码审查
│   ├── explain/               # 代码解释
│   ├── pimage/                # AI P图
│   ├── video/                 # 视频通话
│   ├── login/                 # 登录
│   ├── register/              # 注册
│   ├── history/               # 历史记录
│   ├── favorites/             # 收藏
│   └── mine/                  # 个人中心
├── uniCloud-aliyun/           # 云服务
│   └── cloudfunctions/        # 云函数
│       ├── chat/              # 聊天
│       ├── login/             # 登录
│       ├── register/          # 注册
│       ├── generate/          # 代码生成
│       ├── review/            # 代码审查
│       ├── explain/           # 代码解释
│       ├── analyze/           # 文件分析
│       ├── image/             # 图片处理
│       ├── video/             # 视频通话
│       ├── saveRecord/        # 保存记录
│       └── common/            # 公共模块
│           ├── uni-config-center/  # 配置中心
│           └── utils/         # 工具函数
├── utils/                     # 前端工具
│   └── ai.js                  # AI调用封装
├── .github/workflows/         # CI/CD配置
├── test/                      # 单元测试
├── API.md                     # API接口文档
├── code_review.md             # AI代码审查报告
├── prompt_log.md              # Prompt日志
└── summary.md                 # 个人总结
```

## 快速开始

### 环境要求

- HBuilderX 3.8+
- uniCloud 账号
- 阿里云 DashScope API Key

### 安装步骤

1. **导入项目**
   ```
   用 HBuilderX 打开项目目录
   ```

2. **配置云服务**
   ```
   右键 uniCloud-aliyun → 关联云服务空间
   ```

3. **配置 API Key**
   - 打开 `uniCloud-aliyun/cloudfunctions/common/uni-config-center/ai-config/index.js`
   - 填入你的阿里云 DashScope API Key

4. **上传云函数**
   ```
   右键每个云函数 → 上传部署
   ```

5. **初始化数据库**
   - 在 uniCloud 控制台创建以下数据表：
     - `users` - 用户表
     - `chat_history` - 聊天历史
     - `file_history` - 文件分析历史
     - `image_history` - 图片生成历史
     - `video_calls` - 视频通话记录

6. **运行项目**
   ```
   HBuilderX → 运行 → 运行到浏览器 / 运行到小程序模拟器
   ```

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

### users 用户表

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | string | 用户ID |
| username | string | 用户名 |
| password | string | 密码哈希 (SHA256 + salt) |
| salt | string | 密码盐值 |
| token | string | 登录令牌 |
| token_expire | number | 令牌过期时间戳 |
| create_time | number | 创建时间 |

### chat_history 聊天历史表

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | string | 记录ID |
| user_id | string | 用户ID |
| message | string | 用户消息 |
| reply | string | AI回复 |
| create_time | number | 创建时间 |

## 安全机制

- **密码加密**: SHA256 + salt 加盐哈希
- **Token认证**: 随机32位十六进制令牌，支持过期失效
- **输入验证**: 过滤 XSS 特殊字符、script 关键词、事件处理器
- **API保护**: API Key 存储在云函数，前端不持有
- **匿名支持**: 未登录用户也可使用，记录为 anonymous

## API文档

详细接口文档请查看 [API.md](API.md)

## 开发工具

| 工具 | 用途 |
|------|------|
| Trae AI | 代码审查、重构建议、问题排查 |
| HBuilderX | 前端开发、云函数部署 |
| uniCloud控制台 | 数据库管理、日志查看 |
| Jest | 单元测试 |
| ESLint | 代码规范检查 |

## 相关文档

- [API接口文档](API.md)
- [AI代码审查报告](code_review.md)
- [Prompt日志](prompt_log.md)
- [个人总结报告](summary.md)

## 许可证

MIT License
