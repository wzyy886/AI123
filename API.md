# API 文档

---

## 概述

本项目所有 API 均通过 uniCloud 云函数提供，采用统一的请求和响应格式。所有云函数均支持匿名访问和登录用户访问。

**Base URL**: 通过 `uniCloud.callFunction()` 调用，无需手动配置 URL

**请求方式**: POST（uniCloud 云函数调用）

**认证方式**:
- 匿名用户：无需 Token，userId 自动设为 `anonymous`
- 登录用户：在请求参数中携带 `token` 字段

---

## 统一响应格式

所有接口返回统一的 JSON 格式：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

---

## 错误码说明

| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| 200 | 请求成功 | - |
| 400 | 请求参数错误 | 检查请求参数是否正确 |
| 401 | 未登录或登录过期 | 重新登录获取 Token |
| 429 | 请求过于频繁 | 稍后重试 |
| 500 | 服务器内部错误 | 联系管理员或稍后重试 |

---

## 云函数接口列表

| 接口名称 | 描述 | 对应数据表 | 支持匿名访问 |
|----------|------|------------|-------------|
| `login` | 用户登录/Token验证 | users | 是 |
| `register` | 用户注册 | users | 是 |
| `chat` | AI聊天问答 | chat_history | 是 |
| `generate` | 代码生成 | chat_history | 是 |
| `review` | 代码审查 | chat_history | 是 |
| `explain` | 代码解释 | chat_history | 是 |
| `analyze` | 文件分析 | file_history | 是 |
| `image` | 图片处理建议 | image_history | 是 |
| `video` | 视频通话 | video_calls, chat_history | 是 |
| `saveRecord` | 保存操作记录 | - | 是 |

---

## 接口详细说明

### 1. 用户登录

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名（3-20位，支持字母、数字、下划线、中文） |
| password | string | 是 | 密码（至少6位） |
| token | string | 否 | 已有的登录Token（用于续期） |

**成功响应**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "userId": "5f8d0b2c6e3a1b0d2c6e3a1b",
    "username": "张三",
    "email": "zhangsan@example.com",
    "token": "abc123def456..."
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

---

### 2. 用户注册

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名（3-20位） |
| password | string | 是 | 密码（至少6位） |
| email | string | 否 | 邮箱地址 |

**成功响应**:
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "userId": "5f8d0b2c6e3a1b0d2c6e3a1b",
    "username": "张三",
    "token": "abc123def456..."
  }
}
```

---

### 3. AI聊天问答

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| message | string | 是 | 用户消息（最大5000字符） |
| systemPrompt | string | 否 | 系统提示词（默认使用通用提示词） |
| maxTokens | number | 否 | 最大响应长度（默认8192） |
| token | string | 否 | 用户登录Token |

**成功响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "response": "这是AI的回答内容..."
  }
}
```

---

### 4. 代码生成

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| language | string | 是 | 编程语言（JavaScript/TypeScript/Python/Java/Go/Rust/C++/C#） |
| description | string | 是 | 功能描述（最大2000字符） |
| token | string | 否 | 用户登录Token |

**成功响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "code": "生成的代码内容...",
    "response": "生成的代码内容..."
  }
}
```

---

### 5. 代码审查

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| language | string | 是 | 编程语言 |
| code | string | 是 | 待审查代码（最大10000字符） |
| token | string | 否 | 用户登录Token |

**成功响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "review": "审查结果...",
    "response": "审查结果..."
  }
}
```

---

### 6. 代码解释

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| language | string | 是 | 编程语言 |
| code | string | 是 | 待解释代码（最大10000字符） |
| token | string | 否 | 用户登录Token |

**成功响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "explanation": "代码解释...",
    "response": "代码解释..."
  }
}
```

---

### 7. 文件分析

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| fileName | string | 是 | 文件名 |
| fileContent | string | 否 | 文件内容 |
| requirement | string | 是 | 用户需求 |
| token | string | 否 | 用户登录Token |

**成功响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "analysis": "分析结果...",
    "response": "分析结果..."
  }
}
```

---

### 8. 图片处理

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| imageUrl | string | 否 | 图片URL |
| style | string | 否 | 处理风格 |
| requirement | string | 是 | 用户需求 |
| prompt | string | 否 | 图片描述（与requirement二选一） |
| token | string | 否 | 用户登录Token |

**成功响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "suggestion": "处理方案...",
    "response": "处理方案...",
    "generatedImageUrl": ""
  }
}
```

---

### 9. 视频通话消息

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| action | string | 是 | 操作类型（start/end/message） |
| message | string | 否 | 消息内容（action=message时必填） |
| token | string | 否 | 用户登录Token |

**成功响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "response": "AI回复内容...",
    "status": "calling/ended",
    "callId": "1234567890"
  }
}
```

---

### 10. 保存操作记录

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 是 | 记录类型（chat/generate/review/explain/analyze/image/video） |
| data | object | 是 | 记录数据 |
| token | string | 否 | 用户登录Token |

**成功响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

## 数据库表结构

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
| type | string | 否 | 类型（chat/generate/review/explain/video） |
| language | string | 否 | 编程语言 |
| createdAt | long | 是 | 创建时间 |

### 文件分析表 (file_history)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| _id | string | 是 | 记录ID |
| userId | string | 是 | 用户ID |
| username | string | 是 | 用户名 |
| fileName | string | 是 | 文件名 |
| fileType | string | 是 | 文件类型 |
| requirement | string | 是 | 用户需求 |
| content | string | 否 | 文件内容 |
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
| suggestion | string | 是 | 处理建议 |
| result | string | 是 | 处理结果 |
| createdAt | long | 是 | 创建时间 |

### 视频通话表 (video_calls)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| _id | string | 是 | 记录ID |
| userId | string | 是 | 用户ID |
| username | string | 是 | 用户名 |
| status | string | 是 | 状态（started/ended） |
| startedAt | long | 是 | 开始时间 |
| endedAt | long | 否 | 结束时间 |
| duration | number | 否 | 通话时长（秒） |
| createdAt | long | 是 | 创建时间 |

---

## 安全机制

### 认证方式
- Token 认证：登录后获取随机64位十六进制字符串Token
- Token有效期：24小时
- 匿名访问：所有接口支持匿名用户（userId=anonymous）

### 输入验证
- 用户名：3-20位，支持字母、数字、下划线、中文
- 密码：6-50位
- 消息内容：最大5000字符，过滤特殊字符（<>&"'`;）
- 代码内容：最大10000字符，过滤脚本注入

### 加密方式
- 密码哈希：SHA256 + 随机16位盐值
- Token存储：数据库明文存储（Token本身为随机字符串）
