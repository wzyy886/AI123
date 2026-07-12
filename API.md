# API 接口文档

## 概述

本文档描述 AI代码助手 项目的所有云函数接口。

### 基本信息

| 项目 | 说明 |
|------|------|
| 服务类型 | uniCloud 云函数 |
| 调用方式 | `uniCloud.callFunction()` |
| 数据格式 | JSON |
| 认证方式 | Token (可选，匿名用户也可访问) |

### 统一响应格式

所有接口统一返回以下格式：

```json
{
  "code": 200,
  "message": "success",
  "data": { }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | number | 状态码，200表示成功 |
| message | string | 状态描述 |
| data | object | 返回数据 |

### 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 参数错误（缺少必填参数、参数格式不正确） |
| 401 | 未授权（Token无效或已过期） |
| 429 | 请求过于频繁（限流） |
| 500 | 服务器内部错误 |

---

## 1. 用户注册

### 接口信息

| 项目 | 说明 |
|------|------|
| 云函数名 | register |
| 功能 | 新用户注册 |
| 认证 | 不需要 |

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码（明文，云函数内加密） |

### 请求示例

```javascript
uniCloud.callFunction({
  name: 'register',
  data: {
    username: 'testuser',
    password: '123456'
  }
})
```

### 响应示例

```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "userId": "668xxxxx",
    "username": "testuser",
    "token": "a1b2c3d4..."
  }
}
```

### 错误响应

```json
{
  "code": 400,
  "message": "用户名已存在",
  "data": null
}
```

---

## 2. 用户登录

### 接口信息

| 项目 | 说明 |
|------|------|
| 云函数名 | login |
| 功能 | 用户登录 |
| 认证 | 不需要 |

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |

### 请求示例

```javascript
uniCloud.callFunction({
  name: 'login',
  data: {
    username: 'testuser',
    'password': '123456'
  }
})
```

### 响应示例

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "userId": "668xxxxx",
    "username": "testuser",
    "token": "a1b2c3d4e5f6...",
    "expireAt": 1783888888000
  }
}
```

---

## 3. AI聊天

### 接口信息

| 项目 | 说明 |
|------|------|
| 云函数名 | chat |
| 功能 | 与AI对话 |
| 认证 | 可选（匿名用户标识为 anonymous） |

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| message | string | 是 | 用户消息内容 |
| token | string | 否 | 用户登录令牌 |
| history | array | 否 | 历史对话上下文 |

### 请求示例

```javascript
uniCloud.callFunction({
  name: 'chat',
  data: {
    message: '用JavaScript写一个快速排序',
    token: 'a1b2c3d4...'
  }
})
```

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "reply": "function quickSort(arr) {\n  if (arr.length <= 1) return arr;\n  // ...",
    "recordId": "668xxxxx"
  }
}
```

---

## 4. 代码生成

### 接口信息

| 项目 | 说明 |
|------|------|
| 云函数名 | generate |
| 功能 | 根据需求生成代码 |
| 认证 | 可选 |

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| prompt | string | 是 | 需求描述 |
| language | string | 否 | 编程语言，默认 JavaScript |
| token | string | 否 | 用户令牌 |

### 支持的编程语言

JavaScript, TypeScript, Python, Java, Go, Rust, C++, C#

### 请求示例

```javascript
uniCloud.callFunction({
  name: 'generate',
  data: {
    prompt: '写一个用户登录接口',
    language: 'Python'
  }
})
```

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "code": "from flask import Flask, request, jsonify\n...",
    "language": "Python",
    "recordId": "668xxxxx"
  }
}
```

---

## 5. 代码审查

### 接口信息

| 项目 | 说明 |
|------|------|
| 云函数名 | review |
| 功能 | AI审查代码并给出优化建议 |
| 认证 | 可选 |

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| code | string | 是 | 待审查的代码 |
| language | string | 否 | 编程语言 |
| token | string | 否 | 用户令牌 |

### 请求示例

```javascript
uniCloud.callFunction({
  name: 'review',
  data: {
    code: 'function hello() { console.log("hi") }',
    language: 'JavaScript'
  }
})
```

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "review": "### 代码审查报告\n\n1. **代码风格**：建议使用箭头函数\n2. **性能**：无明显问题\n3. **建议**：添加JSDoc注释",
    "recordId": "668xxxxx"
  }
}
```

---

## 6. 代码解释

### 接口信息

| 项目 | 说明 |
|------|------|
| 云函数名 | explain |
| 功能 | 逐行解释代码含义 |
| 认证 | 可选 |

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| code | string | 是 | 待解释的代码 |
| language | string | 否 | 编程语言 |
| token | string | 否 | 用户令牌 |

### 请求示例

```javascript
uniCloud.callFunction({
  name: 'explain',
  data: {
    code: 'const arr = [1,2,3].map(x => x * 2)',
    language: 'JavaScript'
  }
})
```

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "explanation": "### 代码解释\n\n- `const arr = ...`：声明常量arr\n- `[1,2,3]`：原始数组\n- `.map(x => x * 2)`：map方法遍历，每个元素乘2\n\n**结果**: [2, 4, 6]",
    "recordId": "668xxxxx"
  }
}
```

---

## 7. 文件分析

### 接口信息

| 项目 | 说明 |
|------|------|
| 云函数名 | analyze |
| 功能 | 分析上传的文件内容 |
| 认证 | 可选 |

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| fileName | string | 是 | 文件名 |
| fileContent | string | 是 | 文件内容（文本） |
| fileType | string | 否 | 文件类型（code/document/data） |
| userRequest | string | 否 | 用户的分析需求 |
| token | string | 否 | 用户令牌 |

### 请求示例

```javascript
uniCloud.callFunction({
  name: 'analyze',
  data: {
    fileName: 'utils.js',
    fileContent: 'function add(a, b) { return a + b; }',
    fileType: 'code',
    userRequest: '看看这个代码有什么问题'
  }
})
```

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "analysis": "### 文件分析报告\n\n**文件名**: utils.js\n**类型**: JavaScript代码\n\n**分析结果**：\n1. 代码功能：加法函数\n2. 建议：添加参数类型校验",
    "recordId": "668xxxxx"
  }
}
```

---

## 8. 图片处理

### 接口信息

| 项目 | 说明 |
|------|------|
| 云函数名 | image |
| 功能 | AI图片生成与编辑 |
| 认证 | 可选 |

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| action | string | 是 | 操作类型：generate（生成）/ edit（编辑） |
| prompt | string | 是 | 图片描述 / 编辑需求 |
| imageUrl | string | 否 | 原图URL（编辑时需要） |
| size | string | 否 | 图片尺寸，默认 768x768 |
| token | string | 否 | 用户令牌 |

### action 说明

| 值 | 说明 |
|----|------|
| generate | 文本生成图片 |
| edit | 编辑已有图片 |

### 请求示例（生成图片）

```javascript
uniCloud.callFunction({
  name: 'image',
  data: {
    action: 'generate',
    prompt: '一只可爱的猫咪在花园里',
    size: '768x768'
  }
})
```

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "imageUrl": "https://dashscope.aliyuncs.com/.../image.png",
    "recordId": "668xxxxx"
  }
}
```

---

## 9. 视频通话

### 接口信息

| 项目 | 说明 |
|------|------|
| 云函数名 | video |
| 功能 | AI视频通话交互 |
| 认证 | 可选 |

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| action | string | 是 | 操作类型：start/chat/end |
| message | string | 否 | 对话内容 |
| sessionId | string | 否 | 会话ID |
| token | string | 否 | 用户令牌 |

### 请求示例

```javascript
uniCloud.callFunction({
  name: 'video',
  data: {
    action: 'chat',
    sessionId: 'sess_123',
    message: '你好，介绍一下你自己'
  }
})
```

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "reply": "你好！我是AI助手...",
    "sessionId": "sess_123",
    "recordId": "668xxxxx"
  }
}
```

---

## 10. 保存记录

### 接口信息

| 项目 | 说明 |
|------|------|
| 云函数名 | saveRecord |
| 功能 | 保存用户使用记录 |
| 认证 | 可选 |

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| type | string | 是 | 记录类型：chat/file/image/video |
| content | string | 是 | 记录内容 |
| token | string | 否 | 用户令牌 |

### type 说明

| 值 | 对应数据表 | 说明 |
|----|-----------|------|
| chat | chat_history | 聊天记录 |
| file | file_history | 文件分析记录 |
| image | image_history | 图片生成记录 |
| video | video_calls | 视频通话记录 |

### 请求示例

```javascript
uniCloud.callFunction({
  name: 'saveRecord',
  data: {
    type: 'chat',
    content: JSON.stringify({ message: '你好', reply: '你好！' }),
    token: 'a1b2c3d4...'
  }
})
```

### 响应示例

```json
{
  "code": 200,
  "message": "保存成功",
  "data": {
    "recordId": "668xxxxx"
  }
}
```

---

## 数据库表结构

### users 用户表

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _id | string | 自动 | 主键ID（自动生成） |
| username | string | 是 | 用户名，唯一 |
| password | string | 是 | 密码哈希（SHA256+salt） |
| salt | string | 是 | 密码盐值 |
| token | string | 否 | 当前登录令牌 |
| tokenExpire | number | 否 | 令牌过期时间戳 |
| status | string | 是 | 用户状态（active/disabled） |
| createdAt | number | 是 | 注册时间戳 |

### chat_history 聊天历史表

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _id | string | 自动 | 主键ID（自动生成） |
| userId | string | 是 | 用户ID（匿名为 anonymous） |
| message | string | 是 | 用户消息内容 |
| reply | string | 是 | AI回复内容 |
| status | string | 是 | 状态（success/failed） |
| startedAt | number | 是 | 请求开始时间戳 |
| endedAt | number | 是 | 请求结束时间戳 |

### file_history 文件分析历史表

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _id | string | 自动 | 主键ID（自动生成） |
| userId | string | 是 | 用户ID |
| fileName | string | 是 | 文件名 |
| fileType | string | 否 | 文件类型（code/document/data） |
| userRequest | string | 是 | 用户的分析需求 |
| result | string | 是 | 分析结果 |
| status | string | 是 | 状态（success/failed） |
| startedAt | number | 是 | 开始时间戳 |
| endedAt | number | 是 | 结束时间戳 |

### image_history 图片历史表

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _id | string | 自动 | 主键ID（自动生成） |
| userId | string | 是 | 用户ID |
| action | string | 是 | 操作类型（generate/edit） |
| prompt | string | 是 | 提示词 |
| imageUrl | string | 是 | 生成的图片URL |
| status | string | 是 | 状态（success/failed） |
| startedAt | number | 是 | 开始时间戳 |

### video_calls 视频通话表

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _id | string | 自动 | 主键ID（自动生成） |
| userId | string | 是 | 用户ID |
| sessionId | string | 是 | 会话ID |
| message | string | 是 | 用户消息 |
| reply | string | 是 | AI回复 |
| status | string | 是 | 状态（success/failed） |
| startedAt | number | 是 | 开始时间戳 |
| endedAt | number | 是 | 结束时间戳 |

---

## 安全说明

### 认证方式

- 已登录用户：请求时带上 `token` 参数
- 匿名用户：不传 token，系统自动标记为 `anonymous`

### 输入验证

所有云函数都会对输入参数进行以下验证：

1. **XSS 过滤**：移除 `< > & " ' \` ;` 等特殊字符
2. **关键词过滤**：移除 `script` 关键词
3. **事件处理器过滤**：移除 `onclick=`、`onload=` 等属性
4. **长度限制**：输入内容不超过 1000 字符（可配置）

### 密码安全

- 使用 SHA256 + 随机盐值 进行哈希
- 每个用户使用独立的 salt
- 数据库中不存储明文密码
