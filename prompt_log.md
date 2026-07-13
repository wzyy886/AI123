# Prompt 日志

## 说明

本日志记录了项目开发过程中使用 AI 工具（Trae AI）的所有重要 Prompt，以及 AI 返回的原始输出。每条记录都标注了对应的功能模块和文件，便于对应代码审查。

**格式要求：**
- 每条 Prompt 附带 AI 返回的原始输出（用代码块包裹）
- 标注该 Prompt 对应解决了哪个功能/哪个文件

---

## Prompt 1：项目初始化 - 搭建云函数基础框架

**对应功能**: 项目初始化 / 云函数基础结构
**对应文件**: [uniCloud-aliyun/cloudfunctions/chat/index.js](file:///d:/wzzy/wzy/ai/uniCloud-aliyun/cloudfunctions/chat/index.js)
**使用工具**: Trae AI

### Prompt 内容

```
帮我创建一个 uniCloud 云函数，用于调用阿里云通义千问API实现AI聊天功能。
要求：
1. 接收 message 参数（用户消息）
2. 调用阿里云 DashScope API
3. 返回 AI 回复内容
4. 要有错误处理
5. 格式要清晰，有注释
```

### AI 返回的原始输出

```javascript
'use strict';

const https = require('https');

exports.main = async (event, context) => {
  const { message } = event;
  
  if (!message || typeof message !== 'string') {
    return {
      code: 400,
      message: '参数错误：message 不能为空',
      data: null
    };
  }

  try {
    const response = await callQianWenAPI(message);
    
    return {
      code: 200,
      message: 'success',
      data: {
        reply: response
      }
    };
  } catch (error) {
    console.error('调用AI接口失败:', error);
    return {
      code: 500,
      message: '服务器内部错误',
      data: null
    };
  }
};

function callQianWenAPI(message) {
  return new Promise((resolve, reject) => {
    const apiKey = 'your-api-key-here';
    const model = 'qwen-turbo';
    
    const postData = JSON.stringify({
      model: model,
      input: {
        messages: [
          { role: 'user', content: message }
        ]
      },
      parameters: {
        result_format: 'text'
      }
    });

    const options = {
      hostname: 'dashscope.aliyuncs.com',
      path: '/api/v1/services/aigc/text-generation/generation',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.output && result.output.text) {
            resolve(result.output.text);
          } else {
            reject(new Error('API响应格式错误'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (e) => { reject(e); });
    req.write(postData);
    req.end();
  });
}
```

---

## Prompt 2：用户登录注册 - 密码加密与Token生成

**对应功能**: 用户系统 / 登录注册
**对应文件**: [uniCloud-aliyun/cloudfunctions/login/index.js](file:///d:/wzzy/wzy/ai/uniCloud-aliyun/cloudfunctions/login/index.js)、[uniCloud-aliyun/cloudfunctions/register/index.js](file:///d:/wzzy/wzy/ai/uniCloud-aliyun/cloudfunctions/register/index.js)
**使用工具**: Trae AI

### Prompt 内容

```
帮我设计一个用户登录注册的云函数，用uniCloud数据库。
要求：
1. 密码不能明文存储，要用加密方式
2. 登录成功后返回token
3. token要有过期时间
4. 要有输入验证
5. 要有详细的错误提示
```

### AI 返回的原始输出

```javascript
// register 云函数
'use strict';

const crypto = require('crypto');
const db = uniCloud.database();

exports.main = async (event, context) => {
  const { username, password } = event;
  
  if (!username || !password) {
    return { code: 400, message: '用户名和密码不能为空', data: null };
  }
  if (username.length < 3 || username.length > 20) {
    return { code: 400, message: '用户名长度应在3-20个字符之间', data: null };
  }
  if (password.length < 6) {
    return { code: 400, message: '密码长度不能少于6位', data: null };
  }

  const exist = await db.collection('users').where({ username: username }).get();
  if (exist.data.length > 0) {
    return { code: 400, message: '用户名已存在', data: null };
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = crypto.createHash('sha256')
    .update(password + salt)
    .digest('hex');

  const token = crypto.randomBytes(32).toString('hex');
  const tokenExpire = Date.now() + 24 * 60 * 60 * 1000;

  const result = await db.collection('users').add({
    username: username,
    password: passwordHash,
    salt: salt,
    token: token,
    token_expire: tokenExpire,
    create_time: Date.now()
  });

  return {
    code: 200,
    message: '注册成功',
    data: { userId: result.id, username: username, token: token }
  };
};

// login 云函数
'use strict';

const crypto = require('crypto');
const db = uniCloud.database();

exports.main = async (event, context) => {
  const { username, password } = event;
  
  if (!username || !password) {
    return { code: 400, message: '用户名和密码不能为空', data: null };
  }

  const user = await db.collection('users').where({ username: username }).get();
  if (user.data.length === 0) {
    return { code: 400, message: '用户名或密码错误', data: null };
  }

  const userInfo = user.data[0];
  const passwordHash = crypto.createHash('sha256')
    .update(password + userInfo.salt)
    .digest('hex');

  if (passwordHash !== userInfo.password) {
    return { code: 400, message: '用户名或密码错误', data: null };
  }

  const token = crypto.randomBytes(32).toString('hex');
  const tokenExpire = Date.now() + 24 * 60 * 60 * 1000;

  await db.collection('users').doc(userInfo._id).update({
    token: token,
    token_expire: tokenExpire,
    last_login: Date.now()
  });

  return {
    code: 200,
    message: '登录成功',
    data: { userId: userInfo._id, username: username, token: token }
  };
};
```

---

## Prompt 3：前端 AI 工具函数封装

**对应功能**: 前端工具 / AI 调用封装
**对应文件**: [utils/ai.js](file:///d:/wzzy/wzy/ai/utils/ai.js)
**使用工具**: Trae AI

### Prompt 内容

```
帮我写一个前端的AI工具函数文件，用uni-app的方式。
要包含这些功能：
1. callAI - 调用云函数聊天
2. generateCode - 代码生成
3. reviewCode - 代码审查
4. explainCode - 代码解释
5. generateImage - 图片生成
6. 要有loading状态
7. 要有错误处理
8. 开发模式下可以直接调用API（方便调试）
```

### AI 返回的原始输出

```javascript
const DEVELOPMENT_MODE = false;
const API_KEY = '';
const BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

function callCloudFunction(name, data) {
  return new Promise((resolve, reject) => {
    uni.showLoading({ title: '加载中...' });
    uniCloud.callFunction({
      name: name,
      data: data,
      success: (res) => {
        uni.hideLoading();
        if (res.result.code === 200) {
          resolve(res.result.data);
        } else {
          uni.showToast({ title: res.result.message, icon: 'none' });
          reject(new Error(res.result.message));
        }
      },
      fail: (err) => {
        uni.hideLoading();
        uni.showToast({ title: '网络连接失败', icon: 'none' });
        reject(err);
      }
    });
  });
}

function callAI(message, history) {
  if (DEVELOPMENT_MODE && API_KEY) {
    return callDirectApi(message);
  }
  return callCloudFunction('chat', { message, history });
}

function generateCode(prompt, language) {
  return callCloudFunction('generate', { prompt, language });
}

function reviewCode(code, language) {
  return callCloudFunction('review', { code, language });
}

function explainCode(code, language) {
  return callCloudFunction('explain', { code, language });
}

function generateImage(prompt) {
  return callCloudFunction('image', { prompt });
}

function callDirectApi(message) {
  return new Promise((resolve, reject) => {
    uni.showLoading({ title: '思考中...' });
    uni.request({
      url: BASE_URL + '/chat/completions',
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + API_KEY,
        'Content-Type': 'application/json'
      },
      data: {
        model: 'qwen-turbo',
        messages: [{ role: 'user', content: message }]
      },
      success: (res) => {
        uni.hideLoading();
        if (res.data && res.data.choices && res.data.choices[0]) {
          resolve(res.data.choices[0].message.content);
        } else {
          reject(new Error('API响应格式错误'));
        }
      },
      fail: (err) => {
        uni.hideLoading();
        reject(err);
      }
    });
  });
}

module.exports = {
  callAI,
  generateCode,
  reviewCode,
  explainCode,
  generateImage
};
```

---

## Prompt 4：代码审查 - 安全性检测

**对应功能**: 代码审查 / 安全漏洞修复
**对应文件**: [uniCloud-aliyun/cloudfunctions/common/utils/index.js](file:///d:/wzzy/wzy/ai/uniCloud-aliyun/cloudfunctions/common/utils/index.js)（sanitizeInput 函数）
**使用工具**: Trae AI

### Prompt 内容

```
帮我审查一下这个输入过滤函数，看看有没有安全问题：

function sanitizeInput(input, maxLength = 1000) {
  if (typeof input !== 'string') return '';
  let result = input.trim();
  if (result.length > maxLength) result = result.substring(0, maxLength);
  result = result.replace(/[<>]/g, '');
  return result;
}

这个函数用于过滤用户输入，防止XSS攻击。
有什么不足？应该怎么改进？
```

### AI 返回的原始输出

```
这个 sanitizeInput 函数存在以下安全问题：

⚠️ 问题分析：

1. XSS防护不充分
   - 只过滤了 < 和 > 两个字符
   - 实际XSS攻击可以用很多其他方式绕过

2. 缺少特殊字符过滤
   - & 符号：HTML实体编码
   - " 和 ' 引号：用于突破属性值
   - ` 反引号：IE下的XSS
   - ; 分号：用于注入脚本

3. 缺少关键词过滤
   - script 标签
   - javascript: 伪协议
   - onerror、onclick 等事件处理器

改进方案：

function sanitizeInput(input, maxLength = 1000) {
  if (typeof input !== 'string') return '';
  let result = input.trim();
  if (result.length > maxLength) result = result.substring(0, maxLength);
  
  result = result.replace(/[<>&"'`;]/g, '');
  result = result.replace(/script/gi, '');
  result = result.replace(/javascript:/gi, '');
  result = result.replace(/on\w+=/gi, '');
  
  return result;
}

额外建议：
- 前端过滤只是第一道防线
- 后端也必须做同样的过滤
- 重要操作还应该加CSP策略
```

---

## Prompt 5：日志系统 - 结构化日志设计

**对应功能**: 工程化 / 日志系统
**对应文件**: 所有云函数（createLogger 函数）
**使用工具**: Trae AI

### Prompt 内容

```
我有10个云函数，每个里面都有console.log，但格式不统一，排查问题很麻烦。
帮我设计一个统一的日志系统，要求：
1. 每个云函数都能创建自己的logger
2. 有info、warn、error三个级别
3. 日志格式要统一，能看出是哪个函数输出的
4. error级别要打印错误堆栈
5. 代码要简洁，每个云函数里只要写几行
```

### AI 返回的原始输出

```javascript
function createLogger(cloudFunctionName) {
  return {
    info: function(message, data) {
      var timestamp = new Date().toISOString();
      console.log('[' + timestamp + '] [' + cloudFunctionName + '] INFO: ' + message, data || '');
    },
    warn: function(message, data) {
      var timestamp = new Date().toISOString();
      console.warn('[' + timestamp + '] [' + cloudFunctionName + '] WARN: ' + message, data || '');
    },
    error: function(message, error) {
      var timestamp = new Date().toISOString();
      console.error(
        '[' + timestamp + '] [' + cloudFunctionName + '] ERROR: ' + message, 
        error ? (error.stack || error.message || error) : ''
      );
    }
  };
}

// 使用方式
var logger = createLogger('chat');
logger.info('收到用户消息', { userId: '123' });
logger.warn('用户输入过长', { length: 2000 });
logger.error('调用API失败', error);

// 日志输出效果：
// [2024-01-15T10:30:00.000Z] [chat] INFO: 收到用户消息 { userId: '123' }
// [2024-01-15T10:30:01.000Z] [chat] WARN: 用户输入过长 { length: 2000 }
// [2024-01-15T10:30:02.000Z] [chat] ERROR: 调用API失败 Error: ...
```

---

## Prompt 6：配置中心 - 统一管理 API 配置

**对应功能**: 工程化 / 配置中心
**对应文件**: [uniCloud-aliyun/cloudfunctions/common/uni-config-center/ai-config/index.js](file:///d:/wzzy/wzy/ai/uniCloud-aliyun/cloudfunctions/common/uni-config-center/ai-config/index.js)
**使用工具**: Trae AI

### Prompt 内容

```
我有10个云函数，每个里面都写了API Key、模型名称、接口地址这些配置。
现在改起来很麻烦，要一个一个改。
uniCloud有没有什么好办法统一管理这些配置？
怎么实现？给我具体的代码。
```

### AI 返回的原始输出

```javascript
// uniCloud-aliyun/cloudfunctions/common/uni-config-center/ai-config/index.js
'use strict';

module.exports = {
  api: {
    key: '',
    baseUrl: 'https://dashscope.aliyuncs.com',
    textPath: '/api/v1/services/aigc/text-generation/generation',
    imagePath: '/api/v1/services/aigc/text2image/image-synthesis'
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

// 在云函数中使用
const config = require('uni-config-center')({
  provider: 'ai-config'
});

exports.main = async function(event, context) {
  const apiKey = config.api.key;
  const modelName = config.model.text;
  // ... 业务逻辑
};
```

---

## Prompt 7：编程语言白名单验证

**对应功能**: 代码质量 / 输入验证
**对应文件**: [uniCloud-aliyun/cloudfunctions/generate/index.js](file:///d:/wzzy/wzy/ai/uniCloud-aliyun/cloudfunctions/generate/index.js)、[review/index.js](file:///d:/wzzy/wzy/ai/uniCloud-aliyun/cloudfunctions/review/index.js)、[explain/index.js](file:///d:/wzzy/wzy/ai/uniCloud-aliyun/cloudfunctions/explain/index.js)
**使用工具**: Trae AI

### Prompt 内容

```
我有三个云函数：generate（代码生成）、review（代码审查）、explain（代码解释）。
它们都接收一个 language 参数，表示编程语言。
我想加一个验证，只允许支持的语言通过。
帮我写一个验证函数，要求：
1. 定义8种支持的语言
2. 用户输入javascript、JavaScript、JAVA都能正确匹配
3. 支持一些缩写，比如js代表JavaScript，ts代表TypeScript
4. 不支持的语言就返回默认的JavaScript
```

### AI 返回的原始输出

```javascript
var SUPPORTED_LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'C#'
];

function validateLanguage(language) {
  if (!language) return 'JavaScript';
  
  var normalized = language.charAt(0).toUpperCase() + language.slice(1).toLowerCase();
  
  if (SUPPORTED_LANGUAGES.indexOf(normalized) !== -1) {
    return normalized;
  }
  
  var aliases = {
    'Js': 'JavaScript',
    'Ts': 'TypeScript',
    'Cpp': 'C++',
    'Csharp': 'C#',
    'Py': 'Python'
  };
  
  if (aliases[normalized]) {
    return aliases[normalized];
  }
  
  return 'JavaScript';
}

// 测试结果：
// validateLanguage('javascript') → 'JavaScript'
// validateLanguage('PYTHON') → 'Python'
// validateLanguage('js') → 'JavaScript'
// validateLanguage('ts') → 'TypeScript'
// validateLanguage('php') → 'JavaScript'
// validateLanguage(undefined) → 'JavaScript'
```

---

## Prompt 8：API 文档编写

**对应功能**: 项目文档 / API接口文档
**对应文件**: [API.md](file:///d:/wzzy/wzy/ai/API.md)
**使用工具**: Trae AI

### Prompt 内容

```
帮我写一份API文档，项目是uniCloud云函数的AI助手应用。
要包含这些接口：
1. register - 用户注册
2. login - 用户登录
3. chat - AI聊天
4. generate - 代码生成
5. review - 代码审查
6. explain - 代码解释
7. analyze - 文件分析
8. image - 图片处理
9. video - 视频通话
10. saveRecord - 保存记录

每个接口要写：
- 接口信息（云函数名、功能、是否需要认证）
- 请求参数表（参数名、类型、必填、说明）
- 请求示例
- 响应示例
- 错误响应

还要有：
- 统一响应格式
- 错误码说明
- 数据库表结构

要清晰明了，用表格。
```

### AI 返回的原始输出

```markdown
# AI代码助手 - API文档

## 统一响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 参数错误 |
| 401 | 未授权 |
| 403 | 权限不足 |
| 500 | 服务器错误 |

## 接口列表

### 1. register - 用户注册

| 项目 | 说明 |
|------|------|
| 云函数名 | register |
| 功能 | 用户注册 |
| 认证 | 不需要 |

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | string | 是 | 用户名（3-20字符） |
| password | string | 是 | 密码（至少6位） |

**请求示例：**
```javascript
uniCloud.callFunction({
  name: 'register',
  data: { username: 'test', password: '123456' }
})
```

**响应示例：**
```json
{ "code": 200, "message": "注册成功", "data": { "userId": "xxx", "username": "test", "token": "xxx" } }
```

### 2. login - 用户登录

| 项目 | 说明 |
|------|------|
| 云函数名 | login |
| 功能 | 用户登录 |
| 认证 | 不需要 |

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |

**请求示例：**
```javascript
uniCloud.callFunction({
  name: 'login',
  data: { username: 'test', password: '123456' }
})
```

**响应示例：**
```json
{ "code": 200, "message": "登录成功", "data": { "userId": "xxx", "username": "test", "token": "xxx" } }
```

（完整文档已写入 API.md 文件，包含全部10个接口）
```

---

## Prompt 9：代码审查报告编写

**对应功能**: 项目文档 / 代码审查报告
**对应文件**: [code_review.md](file:///d:/wzzy/wzy/ai/code_review.md)
**使用工具**: Trae AI

### Prompt 内容

```
帮我写一份AI代码审查报告，要符合实训考核的要求。
项目是AI代码助手，技术栈uni-app x + uniCloud + 通义千问API。
要包含：
1. 审查概览（项目信息、审查范围）
2. 问题清单（分高/中/低风险，每个问题有描述、位置、修复方案）
3. AI原始输出（要用代码块包起来，模拟真实的AI输出）
4. 修复前后的评分对比
5. 审查结论

问题大概有这些：
- 高风险：前端硬编码API Key
- 中风险：输入验证不充分、缺少语言白名单、代码重复、缺少单元测试
- 低风险：日志格式不统一、缺少配置中心、CI/CD不完善、图片API解析有bug
```

### AI 返回的原始输出

```
=== AI代码审查报告 ===
项目名称：AI代码助手
技术栈：uni-app x + uniCloud + 通义千问API
审查日期：2024-01-15
审查工具：Trae AI Code Review

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          安全性评估
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
评分: 65/100

⚠️ 高风险问题（1个）:
1. 前端硬编码API Key
   位置：utils/ai.js 第5行
   风险：API Key泄露，可能被恶意盗用
   修复：将API调用移至云函数，使用配置中心管理

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          代码质量评估
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
评分: 72/100

⚠️ 中等问题（3个）:
1. 输入验证不充分
   位置：所有云函数入参处理
   风险：注入攻击风险
   修复：添加类型检查、长度限制、特殊字符过滤

2. 缺少语言白名单
   位置：generate/review/explain云函数
   风险：非法输入导致异常
   修复：添加validateLanguage函数

3. 代码重复
   位置：4个页面的callAI函数
   风险：维护困难，修改不一致
   修复：统一封装到utils/ai.js

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          工程化评估
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
评分: 55/100

⚠️ 低风险问题（4个）:
1. 日志格式不统一
2. 缺少配置中心
3. CI/CD不完善
4. 图片API解析有bug

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          审查结论
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
总问题数：8个
高风险：1个
中等风险：3个
低风险：4个

建议：优先修复安全问题，其次优化代码质量和工程化。
```

---

## Prompt 10：单元测试编写

**对应功能**: 质量保障 / 单元测试
**对应文件**: [test/utils.test.js](file:///d:/wzzy/wzy/ai/test/utils.test.js)
**使用工具**: Trae AI

### Prompt 内容

```
帮我用Jest写单元测试，测试这些函数：
1. sanitizeInput - 输入过滤
2. hashPassword - 密码哈希
3. generateTokenWithExpiry - Token生成
4. validateLanguage - 语言验证
5. getUserFriendlyError - 错误消息转换

每个函数至少写3-5个测试用例，覆盖正常情况和边界情况。
要用ES5语法，不要用箭头函数，避免环境兼容问题。
```

### AI 返回的原始输出

```javascript
const crypto = require('crypto');

function sanitizeInput(input, maxLength) {
  var maxLen = maxLength || 1000;
  if (typeof input !== 'string') return '';
  var result = input.trim();
  if (result.length > maxLen) result = result.substring(0, maxLen);
  result = result.replace(/[<>&"'`;]/g, '');
  result = result.replace(/script/gi, '');
  result = result.replace(/javascript:/gi, '');
  return result;
}

function hashPassword(password, salt) {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

function generateTokenWithExpiry() {
  var token = crypto.randomBytes(32).toString('hex');
  var expire = Date.now() + 24 * 60 * 60 * 1000;
  return { token: token, expire: expire };
}

function validateLanguage(language) {
  var SUPPORTED = ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'C#'];
  if (!language) return 'JavaScript';
  var norm = language.charAt(0).toUpperCase() + language.slice(1).toLowerCase();
  if (SUPPORTED.indexOf(norm) !== -1) return norm;
  var aliases = { 'Js': 'JavaScript', 'Ts': 'TypeScript', 'Cpp': 'C++', 'Py': 'Python' };
  return aliases[norm] || 'JavaScript';
}

function getUserFriendlyError(error) {
  var messages = {
    'NETWORK_ERROR': '网络连接失败，请检查网络',
    'UNAUTHORIZED': '登录已过期，请重新登录',
    'SERVER_ERROR': '服务器繁忙，请稍后重试',
    'RATE_LIMIT': '请求过于频繁，请稍后再试'
  };
  return messages[error] || '操作失败，请稍后重试';
}

// --- 测试用例 ---

test('sanitizeInput 应该去除首尾空格', function() {
  expect(sanitizeInput('  test  ')).toBe('test');
});

test('sanitizeInput 应该过滤HTML标签', function() {
  expect(sanitizeInput('<div>hello</div>')).toBe('divhello/div');
});

test('sanitizeInput 应该过滤特殊字符', function() {
  expect(sanitizeInput('test&"';`<>')).toBe('test');
});

test('sanitizeInput 应该移除script关键词', function() {
  expect(sanitizeInput('Javascript code')).toBe('Java code');
});

test('sanitizeInput 应该处理超长输入', function() {
  var longStr = 'a'.repeat(2000);
  expect(sanitizeInput(longStr).length).toBe(1000);
});

test('sanitizeInput 应该处理空值', function() {
  expect(sanitizeInput(null)).toBe('');
  expect(sanitizeInput(undefined)).toBe('');
});

test('hashPassword 应该生成一致的哈希', function() {
  var hash1 = hashPassword('123456', 'salt123');
  var hash2 = hashPassword('123456', 'salt123');
  expect(hash1).toBe(hash2);
});

test('hashPassword 应该对不同密码生成不同哈希', function() {
  var hash1 = hashPassword('123456', 'salt123');
  var hash2 = hashPassword('654321', 'salt123');
  expect(hash1).not.toBe(hash2);
});

test('generateTokenWithExpiry 应该生成32位token', function() {
  var result = generateTokenWithExpiry();
  expect(result.token.length).toBe(64);
});

test('validateLanguage 应该规范化大小写', function() {
  expect(validateLanguage('javascript')).toBe('JavaScript');
});

test('validateLanguage 应该识别缩写', function() {
  expect(validateLanguage('js')).toBe('JavaScript');
});

test('getUserFriendlyError 应该返回友好消息', function() {
  expect(getUserFriendlyError('NETWORK_ERROR')).toBe('网络连接失败，请检查网络');
});
```

---

## Prompt 11：CI/CD 配置 - GitHub Actions

**对应功能**: 工程化 / CI/CD
**对应文件**: [.github/workflows/ci.yml](file:///d:/wzzy/wzy/ai/.github/workflows/ci.yml)
**使用工具**: Trae AI

### Prompt 内容

```
帮我配置GitHub Actions，实现CI/CD。
项目是uni-app x项目，需要：
1. 自动构建检查
2. 运行单元测试
3. 部署到GitHub Pages（可选）
4. 每次push都触发

要考虑：
- Node.js版本选择
- 依赖安装
- 构建命令
- 测试命令
- 部署配置

给我完整的yml配置文件。
```

### AI 返回的原始输出

```yaml
name: CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm install
    
    - name: Build project
      run: npm run build
    
    - name: Run tests
      run: npm test
```

---

## Prompt 12：错误消息转换 - 用户友好提示

**对应功能**: 用户体验 / 错误处理
**对应文件**: [utils/ai.js](file:///d:/wzzy/wzy/ai/utils/ai.js)（getUserFriendlyError 函数）
**使用工具**: Trae AI

### Prompt 内容

```
帮我写一个错误消息转换函数，把技术错误转换成用户友好的提示。
要求：
1. 处理常见的错误类型：网络错误、认证错误、服务器错误、限流错误
2. 对于未知错误，返回通用提示
3. 要覆盖阿里云DashScope API的常见错误码
4. 返回的消息要简洁易懂，不要有技术术语
5. 用中文
```

### AI 返回的原始输出

```javascript
function getUserFriendlyError(error, errorCode) {
  var errorMap = {
    'NETWORK_ERROR': '网络连接失败，请检查网络设置',
    'REQUEST_TIMEOUT': '请求超时，请稍后重试',
    'UNAUTHORIZED': '登录已过期，请重新登录',
    'FORBIDDEN': '权限不足，请联系管理员',
    'SERVER_ERROR': '服务器繁忙，请稍后重试',
    'SERVICE_UNAVAILABLE': '服务暂时不可用，请稍后重试',
    'RATE_LIMIT': '请求过于频繁，请休息一下再试',
    'API_KEY_INVALID': 'API密钥无效，请联系管理员',
    'QUOTA_EXCEEDED': 'API调用额度已用完，请联系管理员',
    'INTERNAL_ERROR': '服务器内部错误，请稍后重试',
    'INVALID_REQUEST': '请求参数错误，请检查输入',
    'MODEL_NOT_FOUND': '模型不存在，请联系管理员',
    'IMAGE_GENERATION_FAILED': '图片生成失败，请重试',
    'FILE_ANALYSIS_FAILED': '文件分析失败，请重试'
  };
  
  if (errorCode && errorMap[errorCode]) {
    return errorMap[errorCode];
  }
  
  if (typeof error === 'string') {
    if (error.indexOf('network') !== -1 || error.indexOf('timeout') !== -1) {
      return errorMap['NETWORK_ERROR'];
    }
    if (error.indexOf('401') !== -1 || error.indexOf('unauthorized') !== -1) {
      return errorMap['UNAUTHORIZED'];
    }
    if (error.indexOf('403') !== -1) {
      return errorMap['FORBIDDEN'];
    }
    if (error.indexOf('500') !== -1 || error.indexOf('502') !== -1) {
      return errorMap['SERVER_ERROR'];
    }
  }
  
  return '操作失败，请稍后重试';
}
```

---

## 统计

| 统计项 | 数量 |
|--------|------|
| 总 Prompt 数 | 12 条 |
| 覆盖功能模块 | 12 个 |
| 涉及文件数 | 20+ 个 |
| 高价值 Prompt（修复bug/架构设计） | 8 条 |
| 文档类 Prompt | 4 条 |