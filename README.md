# AI代码助手网页应用

---

## 📖 项目介绍

AI代码助手是一款基于 uni-app x 开发的智能编程辅助应用，集成阿里云通义千问大语言模型，提供代码生成、代码审查、代码解释、文件分析、AI P图等多种功能，帮助开发者提高编程效率。

**主要功能**:
- 💬 **AI问答**: 与AI进行自然语言对话，获取编程问题解答
- 📝 **代码生成**: 根据需求描述自动生成代码（支持8种编程语言）
- 🔍 **代码审查**: 检查代码的正确性、安全性、性能问题
- 📚 **代码解释**: 详细解释代码的功能、执行流程和关键技术点
- 📁 **文件分析**: 上传文件后AI进行智能分析解答
- 🎨 **AI P图**: 上传图片后AI进行编辑处理
- 📹 **视频通话**: 与AI进行模拟视频通话交互

---

## 🛠️ 技术栈

| 分类 | 技术 | 版本 |
|------|------|------|
| 前端框架 | uni-app x | 3.x |
| 编程语言 | Vue 3 + UTS | - |
| 样式语言 | SCSS | - |
| 后端服务 | uniCloud | - |
| AI模型 | 阿里云通义千问 | qwen-turbo / wanxiang-v1 |
| CI/CD | GitHub Actions | - |

---

## 📦 安装与运行

### 环境要求

- Node.js >= 20.x
- HBuilder X >= 4.10.0
- 阿里云账号（用于获取 DashScope API Key）

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/wzyy886/AI123.git
cd AI123
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的阿里云 DashScope API Key：
```env
DASHSCOPE_API_KEY=your_api_key_here
```

4. **配置 uniCloud**
- 在 HBuilder X 中右键 `uniCloud-aliyun` 目录
- 选择 `关联云服务空间或项目`
- 选择或创建你的云服务空间

5. **上传云函数**
- 在 HBuilder X 中右键 `uniCloud-aliyun/cloudfunctions/` 目录
- 选择 `上传并部署：云端安装依赖`

6. **上传数据库 Schema**
- 在 HBuilder X 中右键 `uniCloud-aliyun/database/` 目录
- 选择 `上传所有DB Schema`

### 运行项目

**开发模式**:
- 在 HBuilder X 中点击 `运行` → `运行到浏览器` → `Chrome`

**构建生产版本**:
```bash
npm run build:h5
```

---

## 🗂️ 项目结构

```
AI123/
├── pages/                    # 页面目录
│   ├── index/               # AI问答页面
│   ├── login/               # 登录页面
│   ├── register/            # 注册页面
│   ├── generate/            # 代码生成页面
│   ├── review/              # 代码审查页面
│   ├── explain/             # 代码解释页面
│   ├── upload/              # 文件分析页面
│   ├── pimage/              # AI P图页面
│   ├── video/               # 视频通话页面
│   ├── mine/                # 个人中心页面
│   ├── history/             # 历史记录页面
│   └── favorites/           # 收藏夹页面
├── uniCloud-aliyun/         # uniCloud 云开发
│   ├── cloudfunctions/      # 云函数
│   │   ├── chat/            # AI聊天接口
│   │   ├── login/           # 用户登录接口
│   │   ├── register/        # 用户注册接口
│   │   ├── generate/        # 代码生成接口
│   │   ├── review/          # 代码审查接口
│   │   ├── explain/         # 代码解释接口
│   │   ├── analyze/         # 文件分析接口
│   │   ├── image/           # 图片处理接口
│   │   ├── video/           # 视频通话接口
│   │   └── saveRecord/      # 记录保存接口
│   └── database/            # 数据库配置
│       └── schema/          # 数据表结构
├── utils/                   # 工具函数
│   └── ai.js               # AI调用工具函数
├── static/                  # 静态资源
├── App.uvue                 # 应用入口
├── pages.json               # 页面路由配置
├── manifest.json            # 应用配置
├── uni.scss                 # 全局样式变量
└── .github/workflows/       # CI/CD配置
```

---

## 🔌 API 文档

详细的 API 文档请参考 [API.md](API.md)。

---

## 📊 数据库设计

### 用户表 (users)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| _id | string | 是 | 用户ID |
| username | string | 是 | 用户名 |
| password | string | 是 | 密码哈希 |
| salt | string | 是 | 密码盐值 |
| email | string | 否 | 邮箱 |
| token | string | 否 | 登录Token |
| tokenExpireAt | long | 否 | Token过期时间 |
| status | number | 是 | 状态（1=正常，0=禁用） |
| createdAt | long | 是 | 创建时间 |
| lastLoginAt | long | 否 | 最后登录时间 |

### 聊天记录表 (chat_history)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| _id | string | 是 | 记录ID |
| userId | string | 是 | 用户ID |
| username | string | 是 | 用户名 |
| message | string | 是 | 用户消息 |
| response | string | 是 | AI回复 |
| type | string | 否 | 类型（chat/generate/review/explain） |
| language | string | 否 | 编程语言 |
| createdAt | long | 是 | 创建时间 |

### 文件分析表 (file_history)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| _id | string | 是 | 记录ID |
| userId | string | 是 | 用户ID |
| username | string | 是 | 用户名 |
| fileName | string | 是 | 文件名 |
| fileContent | string | 否 | 文件内容 |
| requirement | string | 是 | 用户需求 |
| analysis | string | 是 | 分析结果 |
| createdAt | long | 是 | 创建时间 |

### 图片编辑表 (image_history)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| _id | string | 是 | 记录ID |
| userId | string | 是 | 用户ID |
| username | string | 是 | 用户名 |
| imageUrl | string | 是 | 图片URL |
| style | string | 否 | 处理风格 |
| requirement | string | 是 | 用户需求 |
| result | string | 是 | 处理结果 |
| createdAt | long | 是 | 创建时间 |

### 视频通话表 (video_calls)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| _id | string | 是 | 记录ID |
| userId | string | 是 | 用户ID |
| username | string | 是 | 用户名 |
| status | string | 是 | 状态（started/ended） |
| duration | number | 否 | 通话时长（秒） |
| createdAt | long | 是 | 创建时间 |

---

## 🧪 测试

### 运行单元测试

```bash
cd uniCloud-aliyun/cloudfunctions/common/utils
npm install
npx jest --coverage
```

### CI/CD 测试

项目配置了 GitHub Actions CI/CD 流水线，每次推送代码会自动执行：
1. **构建检查**: 云函数语法检查、JSON配置验证、文档完整性检查
2. **单元测试**: 运行所有测试用例，检查代码覆盖率

---

## 📝 开发规范

### Commit Message 规范

使用 Conventional Commits 规范：
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具配置

### 代码风格

- 变量命名使用 camelCase
- 组件命名使用 PascalCase
- 函数命名使用 camelCase
- 常量命名使用 UPPER_CASE_SNAKE_CASE
- 缩进使用 2 个空格

---

