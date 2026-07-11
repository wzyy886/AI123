# AI助手 - 后端API接口文档

## 概述

本文档描述了AI助手项目的后端云函数API接口，所有接口均基于uniCloud云函数实现。

---

## 基础信息

- **云函数部署位置**: `uniCloud-aliyun/cloudfunctions/`
- **调用方式**: 通过 `uniCloud.callFunction({ name: 'functionName', data: {...} })`
- **认证方式**: Token认证（用户登录后获取）

---

## 接口列表

### 1. 用户注册

**云函数**: `register`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | string | 是 | 用户名，长度3-20字符 |
| password | string | 是 | 密码，长度6-20字符 |

**成功响应**:

```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
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
    "token": "xxx",
    "username": "xxx"
  }
}
```

**失败响应**:

```json
{
  "code": 401,
  "message": "用户名或密码错误",
  "data": null
}
```

---

### 3. AI问答

**云函数**: `chat`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| message | string | 是 | 用户提问内容 |
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

---

### 4. 文件分析

**云函数**: `analyze`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| fileName | string | 是 | 文件名 |
| fileContent | string | 否 | 文件内容（文本文件） |
| fileUrl | string | 否 | 文件URL（非文本文件） |
| requirement | string | 是 | 用户分析需求 |
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

---

### 5. 图片编辑

**云函数**: `image`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| imageUrl | string | 是 | 图片URL |
| requirement | string | 是 | 用户编辑需求 |
| style | string | 否 | 图片风格 |
| token | string | 是 | 用户登录token |

**成功响应**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "suggestion": "编辑建议...",
    "generatedImageUrl": "生成图片URL"
  }
}
```

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
  "message": "通话已连接",
  "data": null
}
```

---

### 7. 代码生成

**云函数**: `generate`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| requirement | string | 是 | 代码生成需求 |
| token | string | 是 | 用户登录token |

**成功响应**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "code": "生成的代码..."
  }
}
```

---

### 8. 代码审查

**云函数**: `review`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| code | string | 是 | 待审查代码 |
| token | string | 是 | 用户登录token |

**成功响应**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "review": "审查结果..."
  }
}
```

---

### 9. 代码解释

**云函数**: `explain`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| code | string | 是 | 待解释代码 |
| token | string | 是 | 用户登录token |

**成功响应**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "explanation": "代码解释..."
  }
}
```

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未认证或token过期 |
| 500 | 服务器内部错误 |

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
| 用户名或密码错误 | 返回401错误，提示凭证错误 |
| 文件过大 | 返回400错误，提示文件大小限制 |
| 图片生成失败 | 返回500错误，提示图片生成失败 |

---

## 前端路由

| 路由路径 | 页面名称 | 说明 |
|----------|----------|------|
| `/pages/login/index` | 登录页 | 用户登录 |
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
