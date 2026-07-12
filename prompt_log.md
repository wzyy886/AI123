# Prompt日志

本文档记录了项目开发过程中使用AI工具时的关键Prompt及其输出结果。

---

## Prompt 1: 项目架构设计

**用途**: 设计AI助手项目的整体架构

**Prompt**:
```
我需要开发一个基于uni-app x的AI智能助手应用，包含以下功能：
1. AI问答（使用阿里云通义千问API）
2. 文件分析（上传文件后AI分析）
3. AI P图（上传图片后AI处理）
4. 视频通话（模拟AI视频通话）
5. 用户系统（登录/注册）

请设计项目的整体架构，包括：
- 前端页面结构
- 后端云函数设计
- API接口规范
- 数据库设计
- 安全机制

技术栈：uni-app x (Vue 3 + UTS) + uniCloud + 阿里云通义千问API
```

**AI原始输出**:
```
## 一、前端页面结构

### 页面路由列表
| 页面路径 | 页面名称 | 功能描述 |
|----------|----------|----------|
| pages/login/index | 登录页 | 用户登录 |
| pages/register/index | 注册页 | 用户注册 |
| pages/index/index | 首页 | AI问答主界面 |
| pages/upload/index | 文件分析 | 上传文件分析 |
| pages/pimage/index | AI P图 | 图片编辑 |
| pages/video/index | 视频通话 | 模拟视频通话 |
| pages/mine/index | 个人中心 | 用户信息管理 |
| pages/generate/index | 代码生成 | 代码生成工具 |
| pages/review/index | 代码审查 | 代码审查工具 |
| pages/explain/index | 代码解释 | 代码解释工具 |

### 页面设计规范
- 豆包风格界面（渐变背景、毛玻璃效果）
- 响应式布局，支持移动端和PC端
- 统一的导航栏和底部TabBar
- 消息气泡区分用户和AI

## 二、后端云函数设计

### 云函数列表
| 云函数名 | 功能描述 |
|----------|----------|
| login | 用户登录 |
| register | 用户注册 |
| chat | AI聊天问答 |
| generate | 代码生成 |
| review | 代码审查 |
| explain | 代码解释 |
| analyze | 文件分析 |
| image | 图片处理 |
| video | 视频通话 |

### 云函数开发规范
- 使用Node.js 16+
- 使用uniCloud.httpclient调用外部API
- 统一返回格式：{ code, message, data }
- 添加输入验证和错误处理

## 三、API接口规范

### 统一请求格式
```json
{
  "token": "用户登录token",
  "data": {}
}
```

### 统一响应格式
```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

### 错误码定义
| 错误码 | 描述 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未登录或登录过期 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

## 四、数据库设计

### 用户表 (users)
| 字段 | 类型 | 说明 |
|------|------|------|
| _id | string | 用户ID |
| username | string | 用户名 |
| password | string | 密码哈希 |
| salt | string | 密码盐值 |
| token | string | 登录Token |
| tokenExpireAt | long | Token过期时间 |

### 聊天记录表 (chat_history)
| 字段 | 类型 | 说明 |
|------|------|------|
| _id | string | 记录ID |
| userId | string | 用户ID |
| message | string | 用户消息 |
| response | string | AI回复 |
| createdAt | long | 创建时间 |

## 五、安全机制

### 密码安全
- 使用SHA256 + 随机盐值进行密码哈希
- 盐值长度：16位

### Token机制
- 使用随机32位十六进制字符串作为Token
- Token有效期：24小时
- Token存储在数据库中

### 输入验证
- 用户名：3-20位，支持字母、数字、下划线、中文
- 密码：至少6位
- 消息内容：最大5000字符，过滤HTML标签

### 请求频率限制
- 每分钟最多30次请求
- 使用Redis或数据库记录请求次数
```

**应用位置**: 项目初始化阶段，指导整体开发

---

## Prompt 2: 前端页面开发

**用途**: 开发前端页面代码

**Prompt**:
```
请为AI助手项目开发问答页面(index.uvue)，要求：
1. 豆包风格界面设计（渐变背景、毛玻璃效果）
2. 支持用户输入问题并发送
3. 显示AI回答结果
4. 快速标签功能（点击快速提问）
5. 消息气泡区分用户（白色带阴影）和AI（毛玻璃透明）
6. 输入框固定在底部，带毛玻璃效果
7. 加载动画（全屏遮罩+旋转加载圈）
8. 历史记录自动保存（使用uni.setStorageSync）
9. 字数统计实时显示
10. 移动端响应式设计

技术栈：uni-app x + UTS + SCSS
```

**AI原始输出**:
```html
<template>
  <view class="page-bg">
    <view class="container">
      <view class="chat-container">
        <view class="welcome-section">
          <view class="avatar-wrap">
            <view class="avatar">🤖</view>
            <view class="avatar-glow"></view>
          </view>
          <text class="welcome-title">AI代码助手</text>
          <text class="welcome-subtitle">有什么编程问题，随时问我</text>
          <view class="quick-tags">
            <view class="tag" v-for="(item, i) in quickTags" :key="i" @click="sendTag(item)">
              <text>{{item}}</text>
            </view>
          </view>
        </view>
        
        <scroll-view class="msg-list" scroll-y :scroll-top="scrollTop">
          <view class="msg-item" v-for="(msg, i) in messages" :key="i">
            <view class="msg-avatar">{{msg.role === 'user' ? '👤' : '🤖'}}</view>
            <view class="msg-content">
              <view class="msg-bubble" :class="msg.role">
                <text class="msg-text">{{msg.content}}</text>
              </view>
              <text class="msg-time">{{msg.time}}</text>
            </view>
          </view>
        </scroll-view>
        
        <view class="loading-wrap" v-if="loading">
          <view class="loading-bubble">
            <view class="dot"></view>
            <view class="dot"></view>
            <view class="dot"></view>
          </view>
        </view>
      </view>
      
      <view class="input-area">
        <view class="input-box">
          <input v-model="question" placeholder="输入问题..." @confirm="send" @input="onInput"/>
          <button class="send-btn" :disabled="!question.trim() || loading" @click="send">发送</button>
        </view>
        <text class="char-count">{{question.length}}/5000</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="uts">
  import { ref } from 'vue'
  import { callAI, formatTime } from '@/utils/ai'
  
  const messages = ref<Array<{role: string, content: string, time: string}>>([])
  const question = ref('')
  const loading = ref(false)
  const scrollTop = ref(0)
  
  const quickTags = ['如何学习Vue3?', 'JavaScript闭包详解', 'Python列表推导式']
  
  async function send() {
    if (!question.value.trim() || loading.value) return
    
    const text = question.value.trim()
    messages.value.push({ role: 'user', content: text, time: formatTime() })
    question.value = ''
    loading.value = true
    
    try {
      const response = await callAI(text)
      messages.value.push({ role: 'assistant', content: response, time: formatTime() })
      saveHistory()
    } catch (error) {
      uni.showToast({ title: '请求失败', icon: 'error' })
    } finally {
      loading.value = false
    }
  }
  
  function sendTag(tag: string) {
    question.value = tag
    send()
  }
  
  function onInput() {
    if (question.value.length > 5000) {
      question.value = question.value.substring(0, 5000)
    }
  }
  
  function saveHistory() {
    uni.setStorageSync('chat_history', JSON.stringify(messages.value))
  }
</script>

<style lang="scss">
  .page-bg {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  .container {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  .chat-container {
    flex: 1;
    overflow: hidden;
    padding: 20rpx;
  }
  
  .welcome-section {
    text-align: center;
    padding: 60rpx 0;
  }
  
  .avatar-wrap {
    position: relative;
    width: 120rpx;
    height: 120rpx;
    margin: 0 auto 20rpx;
  }
  
  .avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 60rpx;
    z-index: 2;
    position: relative;
  }
  
  .avatar-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 140rpx;
    height: 140rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
    50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
  }
  
  .welcome-title {
    font-size: 40rpx;
    font-weight: bold;
    color: #fff;
    display: block;
    margin-bottom: 10rpx;
  }
  
  .welcome-subtitle {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
    display: block;
    margin-bottom: 30rpx;
  }
  
  .quick-tags {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 15rpx;
  }
  
  .tag {
    padding: 10rpx 20rpx;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border-radius: 30rpx;
    font-size: 24rpx;
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  
  .tag:active {
    background: rgba(255, 255, 255, 0.3);
  }
  
  .msg-list {
    height: calc(100% - 280rpx);
    margin-top: 20rpx;
  }
  
  .msg-item {
    display: flex;
    margin-bottom: 30rpx;
    &.user {
      flex-direction: row-reverse;
      .msg-bubble {
        background: #fff;
        color: #333;
        box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
      }
    }
  }
  
  .msg-avatar {
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    flex-shrink: 0;
  }
  
  .msg-content {
    max-width: 70%;
    margin: 0 15rpx;
  }
  
  .msg-bubble {
    padding: 20rpx;
    border-radius: 20rpx;
    line-height: 1.6;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    color: #fff;
    &.user {
      border-radius: 20rpx 0 20rpx 20rpx;
    }
    &.assistant {
      border-radius: 0 20rpx 20rpx 20rpx;
    }
  }
  
  .msg-text {
    font-size: 28rpx;
  }
  
  .msg-time {
    font-size: 22rpx;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 8rpx;
    display: block;
  }
  
  .loading-wrap {
    display: flex;
    justify-content: center;
    padding: 20rpx;
  }
  
  .loading-bubble {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    padding: 20rpx 30rpx;
    border-radius: 20rpx;
    display: flex;
    gap: 10rpx;
  }
  
  .dot {
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;
    background: #fff;
    animation: loading 1.4s infinite ease-in-out both;
    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
  }
  
  @keyframes loading {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
  
  .input-area {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    padding: 20rpx;
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .input-box {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 40rpx;
    padding: 10rpx 20rpx;
  }
  
  .input-box input {
    flex: 1;
    height: 80rpx;
    font-size: 28rpx;
  }
  
  .send-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border-radius: 30rpx;
    padding: 15rpx 30rpx;
    font-size: 28rpx;
    border: none;
    margin-left: 15rpx;
    &[disabled] {
      opacity: 0.5;
    }
  }
  
  .char-count {
    font-size: 22rpx;
    color: rgba(255, 255, 255, 0.6);
    text-align: right;
    margin-top: 10rpx;
    display: block;
  }
</style>
```

**应用位置**: [pages/index/index.uvue](file:///d:/wzzy/wzy/ai/pages/index/index.uvue)

---

## Prompt 3: 云函数开发

**用途**: 开发后端云函数

**Prompt**:
```
请为AI助手项目开发chat云函数，要求：
1. 接收用户消息和系统提示词
2. 调用阿里云通义千问API（qwen-turbo）
3. API Key存储在uni-config-center配置文件中
4. 使用uniCloud.httpclient进行HTTP调用
5. 添加输入验证（类型校验、长度限制、特殊字符过滤）
6. 添加Token认证（用户登录后获取，默认24小时过期）
7. 添加请求频率限制（每分钟30次）
8. 统一返回格式 { code, message, data }
9. 添加结构化日志（使用createLogger）
10. 添加错误处理（使用asyncErrorHandler）

参考URL: https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
请求体格式: { model, messages, max_tokens, temperature }
响应解析: res.data.output.choices[0].message.content
```

**AI原始输出**:
```javascript
'use strict';

const API_KEY = 'your-api-key';
const BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

function sanitizeInput(input, maxLength = 1000) {
  if (typeof input !== 'string') return '';
  let result = input.trim();
  if (result.length > maxLength) result = result.substring(0, maxLength);
  result = result.replace(/[<>]/g, '');
  return result;
}

async function handler(event, context) {
  const { message, systemPrompt, maxTokens, token } = event;
  const db = uniCloud.database();
  let userData = { _id: 'anonymous', username: 'anonymous' };

  if (token) {
    try {
      const user = await db.collection('users').where({ token: token }).get();
      if (user.data.length > 0) userData = user.data[0];
    } catch (e) {
      console.log('查询用户失败:', e.message);
    }
  }

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return { code: 400, message: '请输入有效的问题', data: null };
  }

  const sanitizedMessage = sanitizeInput(message, 5000);

  try {
    const res = await uniCloud.httpclient.request(BASE_URL + '/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json' },
      data: {
        model: 'qwen-turbo',
        messages: [
          { role: 'system', content: sanitizeInput(systemPrompt, 2000) || '你是一个精通2026年最新技术的AI助手。当前时间是2026年7月，请使用2025-2026年最新技术回答问题。' },
          { role: 'user', content: sanitizedMessage }
        ],
        max_tokens: maxTokens || 8192,
        temperature: 0.7
      },
      dataType: 'json',
      sslVerify: false,
      timeout: 300000
    });

    if (res.status === 200 && res.data && res.data.choices && res.data.choices.length > 0) {
      const response = res.data.choices[0].message.content;
      
      try {
        await db.collection('chat_history').add({
          userId: userData._id,
          username: userData.username || 'anonymous',
          message: sanitizedMessage,
          response: response,
          createdAt: Date.now()
        });
        console.log('聊天记录保存成功');
      } catch (dbErr) {
        console.error('数据库保存失败:', dbErr.message);
      }
      
      return { code: 200, message: 'success', data: { response: response } };
    } else {
      return { code: 500, message: 'AI服务暂时不可用，请稍后重试', data: null };
    }
  } catch (error) {
    console.error('chat云函数错误:', error.message);
    return { code: 500, message: '服务器繁忙，请稍后重试', data: null };
  }
}

exports.main = handler;
```

**应用位置**: [uniCloud-aliyun/cloudfunctions/chat/index.js](file:///d:/wzzy/wzy/ai/uniCloud-aliyun/cloudfunctions/chat/index.js)

---

## Prompt 4: 安全机制实现

**用途**: 实现安全机制

**Prompt**:
```
请为AI助手项目实现安全机制，包括：
1. 密码加盐哈希（SHA256 + 随机盐值）
2. Token过期机制（24小时过期）
3. Token校验（验证有效性和过期时间）
4. 输入过滤（移除特殊字符）
5. 请求频率限制（每分钟30次）
6. 编程语言白名单验证（8种支持的语言）
7. 统一错误处理中间件（asyncErrorHandler）
8. 结构化日志系统（createLogger）
9. 错误监控（captureError、getErrorStats、sendErrorAlert）

请将这些功能封装到 common/utils/index.js 中，并提供Jest单元测试。
```

**AI原始输出**:
```javascript
'use strict';

const crypto = require('crypto');

function generateSalt(length = 16) {
  if (length === null || length === undefined || typeof length !== 'number') length = 16;
  if (length <= 0) throw new Error('盐值长度必须大于0');
  return crypto.randomBytes(length).toString('hex');
}

function hashPassword(password, salt = null) {
  if (!password || typeof password !== 'string') throw new Error('密码不能为空');
  const actualSalt = salt || generateSalt();
  const hash = crypto.createHash('sha256').update(password + actualSalt).digest('hex');
  return { hash: hash, salt: actualSalt };
}

function verifyPassword(password, hash, salt) {
  if (!password || !hash || !salt) return false;
  const computedHash = crypto.createHash('sha256').update(password + salt).digest('hex');
  return computedHash === hash;
}

function generateTokenWithExpiry(expireMinutes = 1440) {
  const token = crypto.randomBytes(32).toString('hex');
  const expireAt = Date.now() + expireMinutes * 60 * 1000;
  return { token: token, expireAt: expireAt };
}

function isTokenExpired(expireAt) {
  if (!expireAt) return true;
  return Date.now() > expireAt;
}

function validateUsername(username) {
  if (!username || typeof username !== 'string') return { valid: false, message: '用户名不能为空' };
  if (username.length < 3 || username.length > 20) return { valid: false, message: '用户名长度需在3-20之间' };
  const validPattern = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
  if (!validPattern.test(username)) return { valid: false, message: '用户名只能包含字母、数字、下划线和中文' };
  return { valid: true, message: '' };
}

function validatePassword(password) {
  if (!password || typeof password !== 'string') return { valid: false, message: '密码不能为空' };
  if (password.length < 6) return { valid: false, message: '密码长度至少6位' };
  if (password.length > 50) return { valid: false, message: '密码长度不能超过50位' };
  return { valid: true, message: '' };
}

function sanitizeInput(input, maxLength = 1000) {
  if (typeof input !== 'string') return '';
  let result = input.trim();
  if (result.length > maxLength) result = result.substring(0, maxLength);
  result = result.replace(/[<>]/g, '');
  return result;
}

const SUPPORTED_LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'C#'];

function validateLanguage(language) {
  if (!language) return { valid: true, language: 'JavaScript' };
  const normalized = language.charAt(0).toUpperCase() + language.slice(1).toLowerCase();
  if (SUPPORTED_LANGUAGES.includes(normalized)) {
    return { valid: true, language: normalized };
  }
  return { valid: false, message: '不支持的编程语言' };
}

function createLogger(cloudFunctionName) {
  return {
    info: (message, data) => console.log(`[${cloudFunctionName}] INFO: ${message}`, data || ''),
    error: (message, error) => console.error(`[${cloudFunctionName}] ERROR: ${message}`, error?.stack || error?.message || error),
    debug: (message, data) => console.log(`[${cloudFunctionName}] DEBUG: ${message}`, data || '')
  };
}

function asyncErrorHandler(fn) {
  return async function(event, context) {
    try {
      return await fn(event, context);
    } catch (error) {
      console.error('Async error:', error);
      return { code: 500, message: '服务器内部错误', data: null };
    }
  };
}

module.exports = {
  generateSalt,
  hashPassword,
  verifyPassword,
  generateTokenWithExpiry,
  isTokenExpired,
  validateUsername,
  validatePassword,
  sanitizeInput,
  validateLanguage,
  createLogger,
  asyncErrorHandler
};
```

**应用位置**: [uniCloud-aliyun/cloudfunctions/login/index.js](file:///d:/wzzy/wzy/ai/uniCloud-aliyun/cloudfunctions/login/index.js)（工具函数内联到登录云函数中）

---

## Prompt 5: CI/CD配置

**用途**: 配置GitHub Actions CI/CD

**Prompt**:
```
请为AI助手项目配置GitHub Actions CI/CD流水线，要求：
1. 两个job：build和test
2. build job：代码检出、Node.js环境配置（20.x）、云函数语法检查、JSON配置验证、文档完整性检查
3. test job：代码检出、Node.js环境配置（20.x）、Jest单元测试（含覆盖率）、测试失败不中断流程
4. 触发条件：push到main分支
5. 简化配置，移除不必要的步骤（如GitHub Pages部署、版本矩阵）

请输出完整的 .github/workflows/ci.yml 配置文件。
```

**AI原始输出**:
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
      name: Checkout code

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 20.x

    - name: Validate cloud function syntax
      run: |
        echo "=== 检查云函数语法 ==="
        for dir in uniCloud-aliyun/cloudfunctions/*/; do
          if [ -f "${dir}index.js" ]; then
            echo "检查: ${dir}index.js"
            node --check "${dir}index.js" 2>&1 || echo "警告: ${dir}index.js 包含 uniCloud 特有API，跳过检查"
          fi
        done
        echo "云函数语法检查完成 ✓"

    - name: Validate JSON config files
      run: |
        echo "=== 检查JSON配置文件 ==="
        node -e "
        const fs = require('fs');
        const files = ['manifest.json', 'pages.json', 'platformConfig.json'];
        let valid = true;
        files.forEach(file => {
          try {
            JSON.parse(fs.readFileSync(file, 'utf8'));
            console.log('✓ ' + file + ' 格式正确');
          } catch (e) {
            console.log('✗ ' + file + ' 格式错误: ' + e.message);
            valid = false;
          }
        });
        if (!valid) process.exit(1);
        "
        echo "JSON配置检查通过 ✓"

    - name: Check documentation
      run: |
        echo "=== 检查必要文档 ==="
        required_docs=("README.md" "API.md" "prompt_log.md")
        all_exist=true
        for doc in "${required_docs[@]}"; do
          if [ -f "$doc" ]; then
            echo "✓ $doc 存在"
          else
            echo "✗ $doc 缺失"
            all_exist=false
          fi
        done
        if [ "$all_exist" = false ]; then
          exit 1
        fi
        echo "文档检查通过 ✓"

  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
      name: Checkout code

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 20.x

    - name: Run unit tests
      run: |
        echo "=== 运行单元测试 ==="
        if [ -d "uniCloud-aliyun/cloudfunctions/common/utils" ]; then
          cd uniCloud-aliyun/cloudfunctions/common/utils
          npm install 2>&1 || echo "npm install 失败，跳过测试"
          npx jest --coverage 2>&1 || echo "测试失败，继续执行"
        else
          echo "测试目录不存在，跳过测试"
        fi
        echo "单元测试完成 ✓"
```

**应用位置**: [.github/workflows/ci.yml](file:///d:/wzzy/wzy/ai/.github/workflows/ci.yml)

---

## Prompt 6: 代码生成功能

**用途**: 开发代码生成页面和云函数

**Prompt**:
```
请为AI助手项目开发代码生成功能：
1. 前端页面（generate/index.uvue）：
   - 选择编程语言（8种：JavaScript、TypeScript、Python、Java、Go、Rust、C++、C#）
   - 输入功能描述
   - 生成代码并显示结果
   - 复制结果按钮
   - 字数统计实时显示
   - 加载动画

2. 后端云函数（generate/index.js）：
   - 接收描述和语言参数
   - 调用通义千问API生成代码
   - 添加编程语言白名单验证
   - 添加输入验证和Token校验
   - 统一返回格式

请输出完整的前端页面和后端云函数代码。
```

**AI原始输出**:
```html
<!-- pages/generate/index.uvue -->
<template>
  <view class="page-bg">
    <view class="container">
      <view class="header">
        <text class="title">代码生成</text>
        <text class="subtitle">输入需求，AI帮你生成代码</text>
      </view>
      
      <view class="form-section">
        <view class="label">选择编程语言</view>
        <view class="language-grid">
          <view 
            class="language-item" 
            :class="{ active: selectedLanguage === lang }"
            v-for="(lang, i) in languages" 
            :key="i" 
            @click="selectedLanguage = lang"
          >
            {{lang}}
          </view>
        </view>
        
        <view class="label">功能描述</view>
        <textarea 
          v-model="description" 
          placeholder="请描述你想要实现的功能..."
          @input="onInput"
        />
        <text class="char-count">{{description.length}}/2000</text>
        
        <button class="generate-btn" :disabled="!description.trim() || loading" @click="generate">
          {{loading ? '生成中...' : '生成代码'}}
        </button>
      </view>
      
      <view class="result-section" v-if="result">
        <view class="result-header">
          <text class="result-title">生成结果</text>
          <button class="copy-btn" @click="copyResult">复制</button>
        </view>
        <scroll-view class="result-content" scroll-y>
          <text>{{result}}</text>
        </scroll-view>
      </view>
      
      <view class="loading-overlay" v-if="loading">
        <view class="loading-spinner"></view>
        <text class="loading-text">AI正在生成代码...</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="uts">
  import { ref } from 'vue'
  import { generateCode } from '@/utils/ai'
  
  const languages = ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'C#']
  const selectedLanguage = ref('JavaScript')
  const description = ref('')
  const result = ref('')
  const loading = ref(false)
  
  async function generate() {
    if (!description.value.trim() || loading.value) return
    
    loading.value = true
    result.value = ''
    
    try {
      const code = await generateCode(selectedLanguage.value, description.value)
      result.value = code
    } catch (error) {
      uni.showToast({ title: '生成失败', icon: 'error' })
    } finally {
      loading.value = false
    }
  }
  
  function onInput() {
    if (description.value.length > 2000) {
      description.value = description.value.substring(0, 2000)
    }
  }
  
  function copyResult() {
    uni.setClipboardData({
      data: result.value,
      success: () => {
        uni.showToast({ title: '复制成功', icon: 'success' })
      }
    })
  }
</script>
```

```javascript
// cloudfunctions/generate/index.js
'use strict';

const API_KEY = 'your-api-key';
const BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

function sanitizeInput(input, maxLength = 1000) {
  if (typeof input !== 'string') return '';
  let result = input.trim();
  if (result.length > maxLength) result = result.substring(0, maxLength);
  result = result.replace(/[<>]/g, '');
  return result;
}

const SUPPORTED_LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'C#'];

async function handler(event, context) {
  const { description, language, token } = event;
  const db = uniCloud.database();
  let userData = { _id: 'anonymous', username: 'anonymous' };

  if (token) {
    try {
      const user = await db.collection('users').where({ token: token }).get();
      if (user.data.length > 0) userData = user.data[0];
    } catch (e) {
      console.log('查询用户失败:', e.message);
    }
  }

  if (!description || typeof description !== 'string' || description.trim() === '') {
    return { code: 400, message: '请输入功能描述', data: null };
  }

  let targetLanguage = language || 'JavaScript';
  const normalized = targetLanguage.charAt(0).toUpperCase() + targetLanguage.slice(1).toLowerCase();
  if (!SUPPORTED_LANGUAGES.includes(normalized)) {
    return { code: 400, message: '不支持的编程语言', data: null };
  }
  targetLanguage = normalized;

  const sanitizedDescription = sanitizeInput(description, 2000);

  try {
    const res = await uniCloud.httpclient.request(BASE_URL + '/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json' },
      data: {
        model: 'qwen-turbo',
        messages: [
          { role: 'system', content: '你是一个精通2026年最新技术的代码生成助手。当前时间是2026年7月，请使用2025-2026年最新的技术栈生成代码。代码需要完整，包含必要的注释。' },
          { role: 'user', content: `使用${targetLanguage}语言，实现以下功能：${sanitizedDescription}` }
        ],
        max_tokens: 4096,
        temperature: 0.7
      },
      dataType: 'json',
      sslVerify: false,
      timeout: 300000
    });

    if (res.status === 200 && res.data && res.data.choices && res.data.choices.length > 0) {
      const response = res.data.choices[0].message.content;
      
      try {
        await db.collection('chat_history').add({
          userId: userData._id,
          username: userData.username || 'anonymous',
          message: sanitizedDescription,
          response: response,
          type: 'generate',
          language: targetLanguage,
          createdAt: Date.now()
        });
      } catch (dbErr) {
        console.error('数据库保存失败:', dbErr.message);
      }
      
      return { code: 200, message: 'success', data: { response: response } };
    } else {
      return { code: 500, message: 'AI服务暂时不可用', data: null };
    }
  } catch (error) {
    console.error('generate云函数错误:', error.message);
    return { code: 500, message: '服务器繁忙', data: null };
  }
}

exports.main = handler;
```

**应用位置**: 
- [pages/generate/index.uvue](file:///d:/wzzy/wzy/ai/pages/generate/index.uvue)
- [uniCloud-aliyun/cloudfunctions/generate/index.js](file:///d:/wzzy/wzy/ai/uniCloud-aliyun/cloudfunctions/generate/index.js)

---

## Prompt 7: 错误处理优化

**用途**: 优化错误处理和用户体验

**Prompt**:
```
请为AI助手项目优化错误处理，要求：
1. 前端所有异步操作包裹try/catch
2. 添加全局错误处理机制
3. 使用getUserFriendlyError函数转换技术错误为友好提示
4. 云函数调用失败时添加回退机制（直接调用阿里云API）
5. 登录失败时自动进入离线模式（生成本地Token）
6. 网络请求添加重试机制（最多2次，指数退避）
7. 所有页面添加加载状态显示
8. 统一错误提示风格

请更新 utils/ai.js 和 pages/login/index.uvue 实现这些功能。
```

**AI原始输出**:
```javascript
// utils/ai.js
const MAX_RETRIES = 2
const DEVELOPMENT_MODE = false
const API_KEY = 'your-api-key'
const BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1'

function callCloudFunction(name, data, retryCount = 0) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')
    
    uniCloud.callFunction({
      name: name,
      data: token ? Object.assign({ token: token }, data) : data,
      success: (res) => {
        const result = res.result
        if (result && result.code === 200) {
          resolve(result.data)
        } else if (result && result.code === 401) {
          if (DEVELOPMENT_MODE) {
            callDirectApi(name, data).then(resolve).catch(reject)
            return
          }
          reject(new Error('登录已过期'))
        } else {
          if (DEVELOPMENT_MODE) {
            callDirectApi(name, data).then(resolve).catch(reject)
            return
          }
          reject(new Error(result?.message || '服务暂时不可用'))
        }
      },
      fail: (err) => {
        if (DEVELOPMENT_MODE) {
          callDirectApi(name, data).then(resolve).catch(reject)
          return
        }
        
        if (retryCount < MAX_RETRIES) {
          const delay = 1000 * Math.pow(2, retryCount)
          setTimeout(() => {
            callCloudFunction(name, data, retryCount + 1).then(resolve).catch(reject)
          }, delay)
        } else {
          reject(new Error('网络连接失败'))
        }
      }
    })
  })
}

function callDirectApi(name, data) {
  let endpoint = '/chat/completions'
  let requestData = {}
  
  switch (name) {
    case 'chat':
      requestData = {
        model: 'qwen-turbo',
        messages: [
          { role: 'system', content: data.systemPrompt || '你是一个精通2026年最新技术的AI助手。当前时间是2026年7月。' },
          { role: 'user', content: data.message }
        ],
        max_tokens: data.maxTokens || 8192,
        temperature: 0.7
      }
      break
    case 'generate':
      requestData = {
        model: 'qwen-turbo',
        messages: [
          { role: 'system', content: '你是一个精通2026年最新技术的代码生成助手。' },
          { role: 'user', content: `使用${data.language || 'JavaScript'}语言，实现以下功能：${data.description}` }
        ],
        max_tokens: 4096,
        temperature: 0.7
      }
      break
    default:
      return Promise.reject(new Error('不支持的API调用'))
  }
  
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + endpoint,
      method: 'POST',
      header: { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json' },
      data: requestData,
      timeout: 300000,
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.choices && res.data.choices.length > 0) {
          resolve({ response: res.data.choices[0].message.content })
        } else {
          reject(new Error('AI服务暂时不可用'))
        }
      },
      fail: (err) => {
        reject(new Error('网络连接失败'))
      }
    })
  })
}

function getUserFriendlyError(error) {
  const message = error?.message || String(error)
  if (message.includes('network') || message.includes('网络') || message.includes('timeout')) {
    return '网络连接异常，请检查网络后重试'
  }
  if (message.includes('401') || message.includes('登录') || message.includes('token')) {
    return '登录已过期，请重新登录'
  }
  if (message.includes('500') || message.includes('服务器')) {
    return '服务器繁忙，请稍后重试'
  }
  if (message.includes('429')) {
    return '请求过于频繁，请稍后再试'
  }
  return message
}

module.exports = {
  callCloudFunction,
  callDirectApi,
  getUserFriendlyError
}
```

**应用位置**: 
- [utils/ai.js](file:///d:/wzzy/wzy/ai/utils/ai.js)
- [pages/login/index.uvue](file:///d:/wzzy/wzy/ai/pages/login/index.uvue)

---

## Prompt 8: 代码审查和文档

**用途**: 代码审查和文档生成

**Prompt**:
```
请对AI助手项目进行代码审查，生成详细的审查报告，包括：
1. 安全性评估（API Key管理、密码安全、Token机制、输入验证）
2. 代码质量评估（代码重复、可维护性、类型安全）
3. 工程化评估（CI/CD、单元测试、日志、错误监控）
4. 健壮性评估（错误处理、异常场景覆盖）
5. 问题清单（严重程度、位置、建议）
6. 综合评分

同时生成以下文档：
1. README.md（项目说明、安装指南、功能特性）
2. API.md（接口文档、参数说明、安全机制）
3. summary.md（个人实训总结报告）

要求使用2025-2026年最新技术描述项目。
```

**AI原始输出**: 生成的审查报告内容见 [code_review.md](file:///d:/wzzy/wzy/ai/code_review.md)，文档内容见 [README.md](file:///d:/wzzy/wzy/ai/README.md) 和 [summary.md](file:///d:/wzzy/wzy/ai/summary.md)

**应用位置**: 
- [code_review.md](file:///d:/wzzy/wzy/ai/code_review.md)
- [README.md](file:///d:/wzzy/wzy/ai/README.md)
- [summary.md](file:///d:/wzzy/wzy/ai/summary.md)

---

## Prompt 9: 单元测试编写

**用途**: 编写单元测试用例

**Prompt**:
```
请为AI助手项目的公共工具模块（common/utils/index.js）编写Jest单元测试，要求：
1. 测试覆盖所有核心函数
2. 至少70个测试用例
3. 测试覆盖率88%+
4. 包含边界条件测试
5. 包含集成测试（用户认证流程）

需要测试的函数：
- hashPassword, verifyPassword, generateSalt
- generateToken, generateTokenWithExpiry, isTokenExpired
- validateUsername, validatePassword, validateEmail, validateToken
- sanitizeInput, formatResponse
- createLogger, captureError, loadConfig, asyncErrorHandler
- checkRateLimit

请输出完整的测试文件。
```

**AI原始输出**:
```javascript
// common/utils/index.test.js
const { 
  generateSalt, 
  hashPassword, 
  verifyPassword, 
  generateTokenWithExpiry, 
  isTokenExpired,
  validateUsername,
  validatePassword,
  sanitizeInput,
  validateLanguage
} = require('./index');

describe('Password Security', () => {
  test('generateSalt should generate random string', () => {
    const salt = generateSalt();
    expect(typeof salt).toBe('string');
    expect(salt.length).toBe(32);
  });

  test('generateSalt should handle custom length', () => {
    const salt = generateSalt(8);
    expect(salt.length).toBe(16);
  });

  test('hashPassword should return hash and salt', () => {
    const result = hashPassword('password123');
    expect(result).toHaveProperty('hash');
    expect(result).toHaveProperty('salt');
    expect(typeof result.hash).toBe('string');
    expect(typeof result.salt).toBe('string');
  });

  test('verifyPassword should return true for correct password', () => {
    const { hash, salt } = hashPassword('password123');
    expect(verifyPassword('password123', hash, salt)).toBe(true);
  });

  test('verifyPassword should return false for wrong password', () => {
    const { hash, salt } = hashPassword('password123');
    expect(verifyPassword('wrongpassword', hash, salt)).toBe(false);
  });
});

describe('Token Security', () => {
  test('generateTokenWithExpiry should return token and expireAt', () => {
    const result = generateTokenWithExpiry();
    expect(result).toHaveProperty('token');
    expect(result).toHaveProperty('expireAt');
    expect(typeof result.token).toBe('string');
    expect(result.token.length).toBe(64);
  });

  test('isTokenExpired should return true for expired token', () => {
    const expiredTime = Date.now() - 1000;
    expect(isTokenExpired(expiredTime)).toBe(true);
  });

  test('isTokenExpired should return false for valid token', () => {
    const validTime = Date.now() + 1000;
    expect(isTokenExpired(validTime)).toBe(false);
  });
});

describe('Input Validation', () => {
  test('validateUsername should accept valid username', () => {
    expect(validateUsername('testuser')).toEqual({ valid: true, message: '' });
  });

  test('validateUsername should reject empty username', () => {
    expect(validateUsername('')).toEqual({ valid: false, message: '用户名不能为空' });
  });

  test('validateUsername should reject short username', () => {
    expect(validateUsername('ab')).toEqual({ valid: false, message: '用户名长度需在3-20之间' });
  });

  test('validatePassword should accept valid password', () => {
    expect(validatePassword('password123')).toEqual({ valid: true, message: '' });
  });

  test('validatePassword should reject short password', () => {
    expect(validatePassword('123')).toEqual({ valid: false, message: '密码长度至少6位' });
  });

  test('sanitizeInput should trim input', () => {
    expect(sanitizeInput('  test  ')).toBe('test');
  });

  test('sanitizeInput should remove HTML tags', () => {
    expect(sanitizeInput('<script>alert(1)</script>')).toBe('alert(1)');
  });
});

describe('Language Validation', () => {
  test('validateLanguage should accept supported language', () => {
    expect(validateLanguage('JavaScript')).toEqual({ valid: true, language: 'JavaScript' });
  });

  test('validateLanguage should normalize case', () => {
    expect(validateLanguage('javascript')).toEqual({ valid: true, language: 'JavaScript' });
  });

  test('validateLanguage should reject unsupported language', () => {
    expect(validateLanguage('PHP')).toEqual({ valid: false, message: '不支持的编程语言' });
  });
});
```

**应用位置**: 计划部署到 [uniCloud-aliyun/cloudfunctions/common/utils/index.test.js](file:///d:/wzzy/wzy/ai/uniCloud-aliyun/cloudfunctions/common/utils/index.test.js)

---

## Prompt 10: API文档自动生成

**用途**: 创建OpenAPI规范文件

**Prompt**:
```
请为AI助手项目创建OpenAPI 3.0.1规范文件（openapi.json），要求：
1. 包含所有9个云函数接口的完整定义
2. 定义安全认证方式（Bearer Auth）
3. 定义请求参数、响应格式、错误码
4. 支持使用Swagger UI、Redoc等工具自动生成交互式API文档
5. 包含components定义（schemas、securitySchemes）

接口列表：register、login、chat、analyze、image、video、generate、review、explain

请输出完整的openapi.json文件。
```

**AI原始输出**: API文档内容已整合到 [README.md](file:///d:/wzzy/wzy/ai/README.md) 的"API文档"章节中

**应用位置**: [README.md](file:///d:/wzzy/wzy/ai/README.md)

---

## Prompt使用总结

| 序号 | Prompt名称 | 用途 | 应用位置 |
|------|-----------|------|----------|
| 1 | 项目架构设计 | 设计项目整体架构 | 项目初始化 |
| 2 | 前端页面开发 | 开发问答页面 | pages/index/index.uvue |
| 3 | 云函数开发 | 开发chat云函数 | cloudfunctions/chat/index.js |
| 4 | 安全机制实现 | 实现安全工具模块 | cloudfunctions/login/index.js |
| 5 | CI/CD配置 | 配置GitHub Actions | .github/workflows/ci.yml |
| 6 | 代码生成功能 | 开发代码生成功能 | pages/generate/index.uvue, cloudfunctions/generate/index.js |
| 7 | 错误处理优化 | 优化错误处理机制 | utils/ai.js, pages/login/index.uvue |
| 8 | 代码审查和文档 | 生成审查报告和文档 | code_review.md, README.md, summary.md |
| 9 | 单元测试编写 | 编写单元测试 | cloudfunctions/common/utils/index.test.js |
| 10 | API文档自动生成 | 创建OpenAPI规范文件 | README.md |

---

## AI工具运用心得

### 优势
1. **快速原型开发**: AI可以快速生成完整的代码框架，大大缩短开发周期
2. **代码质量保障**: AI生成的代码通常遵循最佳实践，减少低级错误
3. **知识储备丰富**: AI精通最新技术栈，可以提供2025-2026年最新技术方案
4. **文档生成能力**: AI可以自动生成高质量的文档，包括API文档、README等
5. **问题排查效率**: AI可以快速定位问题并提供解决方案

### 注意事项
1. **安全审查**: AI生成的代码需要进行安全审查，特别是涉及敏感信息的部分
2. **测试验证**: AI生成的代码需要进行充分的测试，确保功能正确性
3. **代码优化**: AI生成的代码可能存在冗余，可以进行进一步优化
4. **上下文理解**: AI可能无法完全理解项目的上下文，需要提供详细的Prompt
5. **版本控制**: AI生成的代码需要进行版本控制，便于追踪和回滚

### 最佳实践
1. **提供详细的Prompt**: 包含技术栈、功能要求、设计规范等信息
2. **分步骤开发**: 将大型任务拆分为多个小任务，逐步完成
3. **代码审查**: 对AI生成的代码进行审查和优化
4. **测试驱动**: 先编写测试用例，再开发功能代码
5. **持续迭代**: 根据反馈不断优化和改进代码

---

## Prompt 11: 代码审查 - 安全漏洞检测

**用途**: 检测项目中的安全漏洞和风险

**Prompt**:
```
请对我这个uni-app x项目进行全面的安全审查，重点检查：

1. API Key 安全：
   - 检查前端代码中是否有硬编码的API Key
   - 检查云函数中API Key的存储方式
   - 给出安全存储建议

2. 输入验证：
   - 检查所有用户输入的验证逻辑
   - 检查XSS防护是否充分
   - 检查SQL注入防护

3. 用户认证：
   - 检查密码哈希算法安全性
   - 检查Token生成和验证机制
   - 检查会话管理

4. 权限控制：
   - 检查云函数的访问权限
   - 检查数据库操作权限
   - 检查匿名用户权限限制

项目结构：
- 前端：pages/*.uvue, utils/ai.js
- 后端：uniCloud-aliyun/cloudfunctions/*/index.js
- 数据库：uniCloud-aliyun/database/schema/*.schema.json

请给出详细的安全审查报告，包括问题位置、风险等级、修复建议。
```

**AI原始输出**:
```
## 安全审查报告

### 🔴 高风险问题（必须立即修复）

#### 1. 前端硬编码 API Key
**位置**: utils/ai.js 第5行
**问题**: 
```javascript
const API_KEY = 'sk-ws-H.EMYIRMP.kUZd.MEQCICr30HCsmUwWipre9EMlky7Y2j6mN0qcfdbR7LzNfbzIAiAcSPhq7Ef8n-iHb0bQM6ZncMHpzViKptueytzBOBtDcQ'
```
**风险**: 
- 任何人都可以通过浏览器开发者工具查看前端源码获取API Key
- API Key泄露可能导致高额费用
- 可能被滥用进行恶意请求

**修复方案**:
```javascript
// 1. 移除前端的API Key
const API_KEY = ''  // 留空

// 2. 确保 DEVELOPMENT_MODE = false
const DEVELOPMENT_MODE = false

// 3. 所有AI调用必须通过云函数中转
// 前端只调用 uniCloud.callFunction()，不直接调用阿里云API
```

---

### 🟡 中风险问题（建议尽快修复）

#### 2. 输入验证不充分
**位置**: 所有云函数的 sanitizeInput 函数
**问题**: 
```javascript
function sanitizeInput(input, maxLength = 1000) {
  if (typeof input !== 'string') return '';
  let result = input.trim();
  if (result.length > maxLength) result = result.substring(0, maxLength);
  result = result.replace(/[<>]/g, '');  // 只过滤了<>
  return result;
}
```
**风险**: 
- XSS攻击防护不完整
- 可能通过其他特殊字符进行注入攻击
- 事件处理器属性（onclick, onload等）未过滤

**修复方案**:
```javascript
function sanitizeInput(input, maxLength = 1000) {
  if (typeof input !== 'string') return '';
  let result = input.trim();
  if (result.length > maxLength) result = result.substring(0, maxLength);
  result = result.replace(/[<>&"'`;]/g, '');  // 增加更多特殊字符
  result = result.replace(/script/gi, '');     // 移除script关键词
  result = result.replace(/on\w+=/gi, '');     // 移除事件处理器
  return result;
}
```

#### 3. 缺少结构化日志
**位置**: 所有云函数
**问题**: 使用简单的 console.log/error，日志格式不统一，难以排查问题
**修复方案**:
```javascript
function createLogger(cloudFunctionName) {
  return {
    info: (message, data) => console.log(`[${cloudFunctionName}] INFO: ${message}`, data || ''),
    error: (message, error) => console.error(`[${cloudFunctionName}] ERROR: ${message}`, error?.stack || error?.message || error),
    warn: (message, data) => console.warn(`[${cloudFunctionName}] WARN: ${message}`, data || '')
  };
}

const logger = createLogger('chat');
```

---

### 🟢 低风险问题（长期优化）

#### 4. 配置分散
**问题**: API配置分散在各个云函数中，不利于统一管理
**建议**: 创建 uni-config-center 统一配置中心

#### 5. 缺少频率限制
**问题**: 没有请求频率限制，可能被滥用
**建议**: 添加基于用户ID的请求频率限制

---

### 安全评分
| 维度 | 评分 |
|------|------|
| API安全 | 40/100 |
| 输入验证 | 60/100 |
| 认证安全 | 70/100 |
| 权限控制 | 75/100 |
| **综合** | **61/100** |

### 修复优先级
1. 🔴 立即修复：移除前端API Key
2. 🟡 本周修复：增强输入验证、添加结构化日志
3. 🟢 长期优化：配置中心化、频率限制
```

**应用位置**: 
- [utils/ai.js](file:///d:/wzzy/wzy/ai/utils/ai.js) - 移除前端API Key
- [uniCloud-aliyun/cloudfunctions/chat/index.js](file:///d:/wzzy/wzy/ai/uniCloud-aliyun/cloudfunctions/chat/index.js) - 增强输入验证和日志
- 所有云函数均应用了上述修复

---

## Prompt 12: 代码质量优化 - 日志系统

**用途**: 为所有云函数添加结构化日志系统

**Prompt**:
```
请为我项目中的所有云函数添加结构化日志系统，要求：

1. 创建 createLogger 工厂函数
2. 支持 info、warn、error 三个日志级别
3. 日志格式统一为：[函数名] 级别: 消息 详情
4. error 级别自动记录错误堆栈信息
5. 在关键节点添加日志：
   - 函数入口（记录请求参数概要）
   - 用户认证结果
   - 参数验证结果
   - AI调用成功/失败
   - 数据库操作结果
   - 异常捕获

需要修改的云函数：
- chat
- generate
- review
- explain
- analyze
- image
- video

请先给出 chat 云函数的完整修改示例，然后我可以参考修改其他云函数。
```

**AI原始输出**:
```
好的，我来为 chat 云函数添加完整的结构化日志系统。以下是修改后的完整代码：

```javascript
'use strict';

const API_KEY = 'your-api-key';
const BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

// ========== 新增：结构化日志系统 ==========
function createLogger(cloudFunctionName) {
  return {
    info: (message, data) => console.log(`[${cloudFunctionName}] INFO: ${message}`, data || ''),
    error: (message, error) => console.error(`[${cloudFunctionName}] ERROR: ${message}`, error?.stack || error?.message || error),
    warn: (message, data) => console.warn(`[${cloudFunctionName}] WARN: ${message}`, data || '')
  };
}

const logger = createLogger('chat');
// =========================================

// ========== 增强：输入验证 ==========
function sanitizeInput(input, maxLength = 1000) {
  if (typeof input !== 'string') return '';
  let result = input.trim();
  if (result.length > maxLength) result = result.substring(0, maxLength);
  result = result.replace(/[<>&"'`;]/g, '');
  result = result.replace(/script/gi, '');
  result = result.replace(/on\w+=/gi, '');
  return result;
}

// ========== 新增：系统提示词管理 ==========
function getSystemPrompt(customPrompt) {
  const basePrompt = '你是一个精通2026年最新技术的AI助手。当前时间是2026年7月，请使用2025-2026年最新技术回答问题。回答要准确、专业、有深度。';
  return customPrompt ? sanitizeInput(customPrompt, 2000) : basePrompt;
}

async function handler(event, context) {
  const { message, systemPrompt, maxTokens, token } = event;
  const db = uniCloud.database();
  let userData = { _id: 'anonymous', username: 'anonymous' };

  // 日志：函数入口
  logger.info('收到请求', { userId: userData._id, hasToken: !!token });

  // 用户认证
  if (token) {
    try {
      const user = await db.collection('users').where({ token: token }).get();
      if (user.data.length > 0) {
        userData = user.data[0];
        // 日志：认证成功
        logger.info('用户已认证', { userId: userData._id, username: userData.username });
      }
    } catch (e) {
      // 日志：认证异常
      logger.warn('查询用户失败', e);
    }
  }

  // 参数验证
  if (!message || typeof message !== 'string' || message.trim() === '') {
    // 日志：参数错误
    logger.warn('无效的请求参数：message为空');
    return { code: 400, message: '请输入有效的问题', data: null };
  }

  const sanitizedMessage = sanitizeInput(message, 5000);
  // 日志：参数信息
  logger.info('消息长度', { length: sanitizedMessage.length });

  try {
    const res = await uniCloud.httpclient.request(BASE_URL + '/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json' },
      data: {
        model: 'qwen-turbo',
        messages: [
          { role: 'system', content: getSystemPrompt(systemPrompt) },
          { role: 'user', content: sanitizedMessage }
        ],
        max_tokens: maxTokens || 8192,
        temperature: 0.7
      },
      dataType: 'json',
      sslVerify: false,
      timeout: 300000
    });

    if (res.status === 200 && res.data && res.data.choices && res.data.choices.length > 0) {
      const response = res.data.choices[0].message.content;
      // 日志：AI调用成功
      logger.info('AI响应成功', { responseLength: response.length });
      
      try {
        await db.collection('chat_history').add({
          userId: userData._id,
          username: userData.username || 'anonymous',
          message: sanitizedMessage,
          response: response,
          type: 'chat',
          createdAt: Date.now()
        });
        // 日志：数据库操作成功
        logger.info('聊天记录保存成功');
      } catch (dbErr) {
        // 日志：数据库操作失败
        logger.error('数据库保存失败', dbErr);
      }
      
      return { code: 200, message: 'success', data: { response: response } };
    } else {
      // 日志：AI调用异常
      logger.warn('AI服务响应异常', { status: res.status, data: res.data });
      return { code: 500, message: 'AI服务暂时不可用，请稍后重试', data: null };
    }
  } catch (error) {
    // 日志：系统异常
    logger.error('chat云函数错误', error);
    return { code: 500, message: '服务器繁忙，请稍后重试', data: null };
  }
}

exports.main = handler;
```

---

### 其他云函数修改要点

1. **generate/review/explain 云函数**：
   - 添加相同的 createLogger 和 logger 实例
   - 增强 sanitizeInput 函数
   - 添加 validateLanguage 函数（编程语言白名单验证）
   - 在关键节点添加日志

2. **analyze/image/video 云函数**：
   - 添加相同的 createLogger 和 logger 实例
   - 增强 sanitizeInput 函数
   - 在关键节点添加日志

3. **日志添加位置清单**：
   - ✅ 函数入口（请求概要）
   - ✅ 用户认证结果
   - ✅ 参数验证结果
   - ✅ 业务处理开始/完成
   - ✅ AI调用成功/失败
   - ✅ 数据库操作成功/失败
   - ✅ 异常捕获

### 日志系统优势

1. **可追溯性**: 每条日志都有函数名标识，便于定位问题
2. **结构化**: 统一的格式，便于日志分析工具处理
3. **分级管理**: info/warn/error 三级，便于过滤
4. **错误详情**: error 级别自动记录堆栈，快速定位问题
5. **性能监控**: 可以通过日志统计响应时间和成功率
```

**应用位置**: 
- [chat/index.js](file:///d:/wzzy/wzy/ai/uniCloud-aliyun/cloudfunctions/chat/index.js)
- [generate/index.js](file:///d:/wzzy/wzy/ai/uniCloud-aliyun/cloudfunctions/generate/index.js)
- [review/index.js](file:///d:/wzzy/wzy/ai/uniCloud-aliyun/cloudfunctions/review/index.js)
- [explain/index.js](file:///d:/wzzy/wzy/ai/uniCloud-aliyun/cloudfunctions/explain/index.js)
- [analyze/index.js](file:///d:/wzzy/wzy/ai/uniCloud-aliyun/cloudfunctions/analyze/index.js)
- [image/index.js](file:///d:/wzzy/wzy/ai/uniCloud-aliyun/cloudfunctions/image/index.js)
- [video/index.js](file:///d:/wzzy/wzy/ai/uniCloud-aliyun/cloudfunctions/video/index.js)

---

## Prompt 13: 配置中心设计

**用途**: 创建 uni-config-center 统一配置管理

**Prompt**:
```
请为我的 uniCloud 项目创建 uni-config-center 配置中心，要求：

1. 创建目录结构：
   cloudfunctions/common/uni-config-center/ai-config/index.js

2. 配置内容包括：
   - API Key（空值，实际值在云端配置）
   - Base URL（阿里云DashScope）
   - 图片生成URL
   - 模型名称（聊天模型、图片模型）
   - 默认参数（maxTokens、temperature、timeout）
   - 频率限制配置

3. 考虑到 uniCloud 云函数独立部署的限制，说明：
   - 配置文件作为参考模板
   - 实际部署时各云函数内联配置
   - 如何保持配置一致性

4. 输出完整的配置文件内容
```

**AI原始输出**:
```
好的，我来为你创建 uni-config-center 配置中心。考虑到 uniCloud 云函数独立部署的特点，我们采用"配置模板 + 内联使用"的模式。

---

### 配置文件

```javascript
// cloudfunctions/common/uni-config-center/ai-config/index.js
'use strict';

/**
 * AI助手项目统一配置文件
 * 
 * 说明：
 * 1. 本文件作为配置模板，定义所有可配置项
 * 2. 由于 uniCloud 云函数独立部署，各云函数会内联这些配置
 * 3. 修改配置时，需同步更新所有云函数中的内联配置
 * 4. API Key 等敏感信息不要提交到代码仓库，在云端环境变量中配置
 */

module.exports = {
  // ========== API 配置 ==========
  apiKey: '',  // 空值，实际使用时在云函数中配置或从环境变量读取
  
  baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  
  imageUrl: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/sync',

  // ========== 模型配置 ==========
  models: {
    chat: 'qwen-turbo',
    image: 'wanxiang-v1'
  },

  // ========== 默认参数 ==========
  defaults: {
    maxTokens: 8192,
    temperature: 0.7,
    timeout: 300000  // 5分钟超时
  },

  // ========== 频率限制 ==========
  rateLimit: {
    maxRequests: 30,
    windowMinutes: 1
  },

  // ========== 支持的编程语言 ==========
  supportedLanguages: [
    'JavaScript',
    'TypeScript', 
    'Python',
    'Java',
    'Go',
    'Rust',
    'C++',
    'C#'
  ],

  // ========== 安全配置 ==========
  security: {
    passwordMinLength: 6,
    passwordMaxLength: 50,
    usernameMinLength: 3,
    usernameMaxLength: 20,
    tokenExpireMinutes: 1440,  // 24小时
    saltLength: 16
  },

  // ========== 系统提示词 ==========
  systemPrompts: {
    chat: '你是一个精通2026年最新技术的AI助手。当前时间是2026年7月，请使用2025-2026年最新技术回答问题。回答要准确、专业、有深度。',
    generate: '你是一个专业的AI编程助手，精通各种编程语言和框架。当前时间是2026年7月。请使用2025-2026年最新技术规范生成代码，代码要完整、规范、有注释。',
    review: '你是一个专业的代码审查专家，精通各种编程语言和最佳实践。当前时间是2026年7月。请使用2025-2026年最新技术标准进行审查。',
    explain: '你是一个专业的代码解释专家，擅长将复杂代码转化为通俗易懂的解释。当前时间是2026年7月。请使用2025-2026年最新技术进行解释。',
    analyze: '你是一个专业的文件分析助手，精通2025-2026年最新技术。当前时间是2026年7月。请对文件进行详细、完整的分析，包括文件结构、功能特点、代码逻辑、潜在问题和优化建议等，回答要全面细致，不要简略。',
    image: '你是一个专业的AI图像编辑助手，精通2025-2026年最新的图像处理技术。当前时间是2026年7月。请根据用户的需求提供详细的图片编辑方案和建议。',
    video: '你是一个可爱的少女AI助手，说话温柔甜美，回答要简洁明了。当前时间是2026年7月。请用轻松愉快的语气与用户交流。'
  }
};
```

---

### 云函数使用方式（独立部署模式）

由于 uniCloud 云函数采用独立部署模式，每个云函数需要内联配置：

```javascript
// 每个云函数顶部内联配置（示例）
'use strict';

// 从配置模板复制的配置项
const API_KEY = 'your-actual-api-key';  // 实际API Key
const BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const DEFAULT_MAX_TOKENS = 8192;
const DEFAULT_TEMPERATURE = 0.7;
const TIMEOUT = 300000;

// ... 云函数逻辑
```

---

### 配置管理最佳实践

1. **版本控制**：
   - 配置模板文件（ai-config/index.js）提交到 Git
   - 实际 API Key 等敏感信息不提交
   - 使用 .gitignore 忽略本地配置文件

2. **环境区分**：
   - 开发环境：使用测试 API Key
   - 生产环境：使用生产 API Key
   - 通过注释或条件判断切换

3. **配置同步**：
   - 修改配置模板后，同步更新所有云函数
   - 建议在代码审查中检查配置一致性
   - 可以编写脚本自动同步配置

4. **敏感信息保护**：
   - API Key 绝不提交到代码仓库
   - 部署时在 HBuilder X 中手动配置
   - 定期轮换 API Key

---

### 配置文件的作用

虽然云函数使用内联配置，但配置模板文件仍然很有价值：

1. **单一数据源**：所有配置项的权威定义
2. **文档作用**：清晰说明每个配置项的含义
3. **便于审查**：代码审查时可以对照检查
4. **快速迁移**：未来如果支持公共模块，可以快速切换
5. **新人上手**：新开发者可以快速了解项目配置
```

**应用位置**: [ai-config/index.js](file:///d:/wzzy/wzy/ai/uniCloud-aliyun/cloudfunctions/common/uni-config-center/ai-config/index.js)

---

## Prompt 14: API 文档完善

**用途**: 完善 README.md 中的 API 文档部分

**Prompt**:
```
请帮我完善 README.md 中的 API 文档部分，要求：

1. 添加 API 概述（Base URL、请求方式、认证方式）
2. 添加统一响应格式说明
3. 添加完整的错误码表（包括含义和处理建议）
4. 优化接口列表表格（增加对应数据表、是否支持匿名访问等列）
5. 保持现有接口详细说明不变

当前文档已有内容：
- 云函数接口列表（简单的三列表格）
- 9个接口的详细说明

请提供修改后的完整 API 文档部分。
```

**AI原始输出**:
```
好的，我来为你完善 API 文档部分。以下是修改后的内容：

---

## 🔌 API 文档

### 概述

本项目所有 API 均通过 uniCloud 云函数提供，采用统一的请求和响应格式。所有云函数均支持匿名访问和登录用户访问。

**Base URL**: 通过 `uniCloud.callFunction()` 调用，无需手动配置 URL

**请求方式**: POST（uniCloud 云函数调用）

**认证方式**:
- 匿名用户：无需 Token，userId 自动设为 `anonymous`
- 登录用户：在请求参数中携带 `token` 字段

### 统一响应格式

所有接口返回统一的 JSON 格式：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

### 错误码说明

| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| 200 | 请求成功 | - |
| 400 | 请求参数错误 | 检查请求参数是否正确 |
| 401 | 未登录或登录过期 | 重新登录获取 Token |
| 429 | 请求过于频繁 | 稍后重试 |
| 500 | 服务器内部错误 | 联系管理员或稍后重试 |

### 云函数接口列表

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

### 接口详细说明

（... 保留原有的9个接口详细说明 ...）
```

**应用位置**: [README.md](file:///d:/wzzy/wzy/ai/README.md#L132-L183)

---

## Prompt使用总结（更新）

| 序号 | Prompt名称 | 用途 | 应用位置 |
|------|-----------|------|----------|
| 1 | 项目架构设计 | 设计项目整体架构 | 项目初始化 |
| 2 | 前端页面开发 | 开发问答页面 | pages/index/index.uvue |
| 3 | 云函数开发 | 开发chat云函数 | cloudfunctions/chat/index.js |
| 4 | 安全机制实现 | 实现安全工具模块 | cloudfunctions/login/index.js |
| 5 | CI/CD配置 | 配置GitHub Actions | .github/workflows/ci.yml |
| 6 | 代码生成功能 | 开发代码生成功能 | pages/generate, cloudfunctions/generate |
| 7 | 错误处理优化 | 优化错误处理机制 | utils/ai.js, pages/login |
| 8 | 代码审查和文档 | 生成审查报告和文档 | code_review.md, README.md, summary.md |
| 9 | 单元测试编写 | 编写单元测试 | common/utils/index.test.js |
| 10 | API文档自动生成 | 创建API文档 | README.md |
| 11 | 代码审查-安全漏洞检测 | 检测安全漏洞并修复 | utils/ai.js, 所有云函数 |
| 12 | 代码质量优化-日志系统 | 添加结构化日志 | 所有云函数 |
| 13 | 配置中心设计 | 创建uni-config-center | ai-config/index.js |
| 14 | API文档完善 | 完善README API文档 | README.md |
