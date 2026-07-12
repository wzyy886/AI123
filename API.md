# AI助手 - 后端API接口文档

## 概述

本文档描述了AI助手项目的后端云函数API接口，所有接口均基于uniCloud云函数实现。项目采用安全的Token认证机制，支持输入验证、请求频率限制和错误处理。

---

## 基础信息

- **云函数部署位置**: `uniCloud-aliyun/cloudfunctions/`
- **调用方式**: 通过 `uniCloud.callFunction({ name: 'functionName', data: {...} })`
- **认证方式**: Token认证（用户登录后获取，默认24小时过期）
- **请求超时**: 300秒（5分钟）
- **错误码格式**: `{ code, message, data }`

---

## 接口列表

### 1. 用户注册

**云函数**: `register`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | string | 是 | 用户名，长度3-20字符，仅允许字母、数字、下划线、中文 |
| password | string | 是 | 密码，长度6-20字符 |
| email | string | 是 | 邮箱，符合邮箱格式 |

**成功响应**:

```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "userId": "xxx",
    "username": "xxx",
    "email": "xxx",
    "token": "xxx"
  }
}
```

**失败响应**:

```json
{
  "code": 400,
  "message": "用户名已存在",
  "data": null
}
```

**安全机制**:
- 用户名和邮箱唯一性校验
- 密码使用 SHA256 + 随机盐值哈希存储

---

### 2. 用户登录

**云函数**: `login`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |

**成功响应**:

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "userId": "xxx",
    "username": "xxx",
    "email": "xxx",
    "token": "xxx"
  }
}
```

**失败响应**:

```json
{
  "code": 400,
  "message": "用户名或密码错误",
  "data": null
}
```

**安全机制**:
- 密码验证使用加盐哈希比对
- 自动生成新Token（24小时过期）
- 支持旧密码格式兼容（无盐值密码自动升级）

---

### 3. AI问答

**云函数**: `chat`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| message | string | 是 | 用户提问内容，长度1-5000字符 |
| systemPrompt | string | 否 | 系统提示词，长度1-2000字符 |
| maxTokens | number | 否 | 最大响应长度，默认8192 |
| token | string | 是 | 用户登录token |

**成功响应**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "response": "AI回答内容..."
  }
}
```

**失败响应**:

```json
{
  "code": 401,
  "message": "未登录或登录已过期",
  "data": null
}
```

**安全机制**:
- Token有效性和过期时间校验
- 输入内容长度限制
- 特殊字符过滤（移除`<>`）
- 请求频率限制（每分钟30次）

---

### 4. 文件分析

**云函数**: `analyze`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| fileName | string | 是 | 文件名，长度1-200字符 |
| fileContent | string | 否 | 文件内容（文本文件），长度1-10000字符 |
| fileUrl | string | 否 | 文件URL（非文本文件），长度1-500字符 |
| requirement | string | 是 | 用户分析需求，长度1-2000字符 |
| token | string | 是 | 用户登录token |

**成功响应**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "analysis": "分析结果..."
  }
}
```

**安全机制**:
- Token有效性和过期时间校验
- 输入内容长度限制
- 文件类型识别和处理

---

### 5. 图片编辑

**云函数**: `image`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| imageUrl | string | 否 | 图片URL，长度1-500字符 |
| imageContent | string | 否 | 图片内容（base64） |
| requirement | string | 是 | 用户编辑需求，长度1-2000字符 |
| style | string | 否 | 图片风格（原图、美颜、艺术、胶片、黑白、梦幻等） |
| token | string | 是 | 用户登录token |

**成功响应**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "suggestion": "编辑建议...",
    "generatedImageUrl": ""
  }
}
```

**安全机制**:
- Token有效性和过期时间校验
- 输入内容长度限制

---

### 6. 视频通话

**云函数**: `video`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| action | string | 是 | 操作类型（start/end） |
| token | string | 是 | 用户登录token |

**成功响应**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "status": "calling",
    "callId": "xxx",
    "message": "正在连接AI助手，请稍候..."
  }
}
```

**安全机制**:
- Token有效性和过期时间校验
- 通话记录存储

---

### 7. 代码生成

**云函数**: `generate`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| description | string | 是 | 代码生成需求，长度1-2000字符 |
| language | string | 否 | 目标编程语言（JavaScript/TypeScript/Python/Java/Go/Rust/C++/C#） |
| token | string | 是 | 用户登录token |

**成功响应**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "response": "生成的代码..."
  }
}
```

**安全机制**:
- Token有效性和过期时间校验
- 编程语言白名单验证（仅允许8种支持的语言）
- 输入内容长度限制

---

### 8. 代码审查

**云函数**: `review`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| code | string | 是 | 待审查代码，长度1-10000字符 |
| language | string | 否 | 代码编程语言（JavaScript/TypeScript/Python/Java/Go/Rust/C++/C#） |
| token | string | 是 | 用户登录token |

**成功响应**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "response": "审查结果..."
  }
}
```

**安全机制**:
- Token有效性和过期时间校验
- 编程语言白名单验证
- 输入内容长度限制
- 特殊字符过滤

---

### 9. 代码解释

**云函数**: `explain`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| code | string | 是 | 待解释代码，长度1-10000字符 |
| language | string | 否 | 代码编程语言（JavaScript/TypeScript/Python/Java/Go/Rust/C++/C#） |
| token | string | 是 | 用户登录token |

**成功响应**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "response": "代码解释..."
  }
}
```

**安全机制**:
- Token有效性和过期时间校验
- 编程语言白名单验证
- 输入内容长度限制

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未认证或token过期 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

---

## 安全机制

### 认证安全

| 机制 | 说明 |
|------|------|
| Token过期 | 默认24小时过期，过期后需重新登录 |
| Token校验 | 所有接口（register/login除外）验证Token有效性和过期时间 |
| Token刷新 | 每次登录自动生成新Token |

### 密码安全

| 机制 | 说明 |
|------|------|
| 加盐哈希 | SHA256 + 随机16字节盐值 |
| 密码升级 | 自动检测并升级旧格式密码（无盐值） |

### 输入安全

| 机制 | 说明 |
|------|------|
| 类型校验 | 所有参数进行类型检查 |
| 长度限制 | 设置合理的输入长度上限 |
| 特殊字符过滤 | 移除`<>`等潜在危险字符 |
| 编程语言白名单 | 仅允许8种支持的编程语言 |

### 请求频率限制

- 基于用户ID实现每分钟30次请求限制
- 超出限制返回429错误

---

## 异常场景覆盖

### 用户认证异常

| 场景 | 处理方式 |
|------|----------|
| token为空 | 返回401错误，提示用户登录 |
| token无效 | 返回401错误，提示重新登录 |
| token过期 | 返回401错误，提示重新登录 |

### 参数校验异常

| 场景 | 处理方式 |
|------|----------|
| 必填参数缺失 | 返回400错误，提示参数不完整 |
| 参数格式错误 | 返回400错误，提示参数格式不正确 |
| 参数长度超限 | 返回400错误，提示参数长度要求 |
| 编程语言不在白名单 | 返回400错误，提示不支持该语言 |

### 网络异常

| 场景 | 处理方式 |
|------|----------|
| 网络断开 | 返回500错误，提示网络错误 |
| 请求超时 | 返回500错误，提示请求超时 |
| AI服务不可用 | 返回500错误，提示服务暂时不可用 |

### 业务逻辑异常

| 场景 | 处理方式 |
|------|----------|
| 用户已存在 | 返回400错误，提示用户名已存在 |
| 用户名或密码错误 | 返回400错误，提示凭证错误 |
| 请求过于频繁 | 返回429错误，提示稍后重试 |

---

## 输入验证规则

### 用户相关验证

| 参数 | 验证规则 |
|------|----------|
| username | 长度3-20字符，仅允许字母、数字、下划线、中文 |
| password | 长度6-20字符 |
| email | 符合邮箱格式（xxx@xxx.xxx） |

### 内容相关验证

| 参数 | 验证规则 |
|------|----------|
| message | 长度1-5000字符 |
| code | 长度1-10000字符 |
| requirement | 长度1-2000字符 |
| description | 长度1-2000字符 |
| fileContent | 长度1-10000字符 |
| fileName | 长度1-200字符 |
| fileUrl | 长度1-500字符 |
| imageUrl | 长度1-500字符 |

### 编程语言白名单

支持的编程语言：
- JavaScript
- TypeScript
- Python
- Java
- Go
- Rust
- C++
- C#

---

## 前端路由

| 路由路径 | 页面名称 | 说明 |
|----------|----------|------|
| `/pages/login/index` | 登录页 | 用户登录（含离线模式回退） |
| `/pages/register/index` | 注册页 | 用户注册 |
| `/pages/index/index` | 问答页 | AI问答主页面 |
| `/pages/upload/index` | 文件分析页 | 文件上传与分析 |
| `/pages/pimage/index` | P图页 | AI图片编辑 |
| `/pages/video/index` | 视频通话页 | AI语音对话 |
| `/pages/mine/index` | 个人中心页 | 用户信息管理 |
| `/pages/generate/index` | 代码生成页 | AI代码生成 |
| `/pages/review/index` | 代码审查页 | AI代码审查 |
| `/pages/explain/index` | 代码解释页 | AI代码解释 |
| `/pages/history/index` | 历史记录页 | 查看历史记录 |
| `/pages/favorites/index` | 收藏夹页 | 管理收藏内容 |

---

## 后端架构

### 云函数目录结构

```
cloudfunctions/
├── register/          # 用户注册（加盐哈希、Token生成）
├── login/             # 用户登录（Token过期校验、密码验证）
├── chat/              # AI问答（输入过滤、频率限制）
├── analyze/           # 文件分析（文件类型识别）
├── image/             # 图片编辑
├── video/             # 视频通话（通话记录）
├── generate/          # 代码生成（语言白名单验证）
├── review/            # 代码审查（语言白名单验证）
├── explain/           # 代码解释（语言白名单验证）
└── common/
    ├── utils/         # 公共工具（验证、日志、错误处理）
    └── uni-config-center/ai-config/  # API Key配置
```

### 核心安全组件

| 组件 | 功能 |
|------|------|
| validateToken | Token有效性和过期时间校验 |
| hashPassword | SHA256加盐哈希密码 |
| verifyPassword | 验证密码正确性 |
| sanitizeInput | 过滤特殊字符 |
| checkRateLimit | 请求频率限制 |
| isTokenExpired | Token过期检查 |