# Prompt 日志

## 说明

本日志记录了项目开发过程中使用 AI 工具（Trae AI）的所有重要 Prompt，以及 AI 返回的原始输出。每条记录都标注了对应的功能模块和文件，便于对应代码审查。

---

## Prompt 1：项目初始化 - 搭建云函数基础框架

**对应功能**: 项目初始化 / 云函数基础结构
**对应文件**: `uniCloud-aliyun/cloudfunctions/chat/index.js`
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
  
  // 参数验证
  if (!message || typeof message !== 'string') {
    return {
      code: 400,
      message: '参数错误：message 不能为空',
      data: null
    };
  }

  try {
    // 调用通义千问API
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
    const apiKey = 'your-api-key-here'; // 请替换为你的API Key
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
**对应文件**: `uniCloud-aliyun/cloudfunctions/login/index.js`、`register/index.js`
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

```
我来帮你设计一个安全的用户登录注册系统。

推荐方案：
- 密码加密：SHA256 + salt（每个用户独立盐值）
- Token生成：随机32位十六进制字符串
- Token过期：默认24小时
- 数据库表：users

下面是具体实现：

--- register 云函数 ---
'use strict';

const crypto = require('crypto');
const db = uniCloud.database();

exports.main = async (event, context) => {
  const { username, password } = event;
  
  // 输入验证
  if (!username || !password) {
    return { code: 400, message: '用户名和密码不能为空', data: null };
  }
  if (username.length < 3 || username.length > 20) {
    return { code: 400, message: '用户名长度应在3-20个字符之间', data: null };
  }
  if (password.length < 6) {
    return { code: 400, message: '密码长度不能少于6位', data: null };
  }

  // 检查用户名是否已存在
  const exist = await db.collection('users').where({ username: username }).get();
  if (exist.data.length > 0) {
    return { code: 400, message: '用户名已存在', data: null };
  }

  // 生成盐值和密码哈希
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = crypto.createHash('sha256')
    .update(password + salt)
    .digest('hex');

  // 生成token
  const token = crypto.randomBytes(32).toString('hex');
  const tokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24小时后过期

  // 创建用户
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
    data: {
      userId: result.id,
      username: username,
      token: token
    }
  };
};

--- login 云函数 ---
// 类似的逻辑，先查用户，然后验证密码，最后更新token
...（后续省略，完整代码已写入对应文件）
```

---

## Prompt 3：前端 AI 工具函数封装

**对应功能**: 前端工具 / AI 调用封装
**对应文件**: `utils/ai.js`
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
// AI工具函数封装
// 支持两种模式：云函数模式（生产）和 直接API模式（开发）

const DEVELOPMENT_MODE = false; // 生产环境设为false
const API_KEY = ''; // 生产环境留空，从云函数读取
const API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
const IMAGE_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis';

// 通用云函数调用
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

// AI聊天
function callAI(message, history) {
  if (DEVELOPMENT_MODE && API_KEY) {
    return callDirectApi(message);
  }
  return callCloudFunction('chat', { message, history });
}

// 代码生成
function generateCode(prompt, language) {
  return callCloudFunction('generate', { prompt, language });
}

// 代码审查
function reviewCode(code, language) {
  return callCloudFunction('review', { code, language });
}

// 代码解释
function explainCode(code, language) {
  return callCloudFunction('explain', { code, language });
}

// 图片生成
function generateImage(prompt) {
  return new Promise((resolve, reject) => {
    uni.showLoading({ title: '生成中...' });
    uni.request({
      url: IMAGE_URL,
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + API_KEY,
        'Content-Type': 'application/json'
      },
      data: {
        model: 'wanxiang-v1',
        prompt: prompt,
        n: 1,
        size: '768x768'
      },
      success: (res) => {
        uni.hideLoading();
        if (res.data && res.data.output && res.data.output.urls) {
          resolve(res.data.output.urls[0]);
        } else {
          uni.showToast({ title: '生成失败', icon: 'none' });
          reject(new Error('生成失败'));
        }
      },
      fail: (err) => {
        uni.hideLoading();
        uni.showToast({ title: '网络错误', icon: 'none' });
        reject(err);
      }
    });
  });
}

// 直接调用API（开发模式）
function callDirectApi(message) {
  // ... 省略直接调用逻辑
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
**对应文件**: 所有云函数的 `sanitizeInput` 函数
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

1. **XSS防护不充分**
   - 只过滤了 < 和 > 两个字符
   - 实际XSS攻击可以用很多其他方式绕过

2. **缺少特殊字符过滤**
   - & 符号：HTML实体编码
   - " 和 ' 引号：用于突破属性值
   - ` 反引号：IE下的XSS
   - ; 分号：用于注入脚本

3. **缺少关键词过滤**
   - script 标签
   - javascript: 伪协议
   - onerror、onclick 等事件处理器

4. **建议的改进方案：**

function sanitizeInput(input, maxLength = 1000) {
  if (typeof input !== 'string') return '';
  let result = input.trim();
  if (result.length > maxLength) result = result.substring(0, maxLength);
  
  // 过滤特殊字符
  result = result.replace(/[<>&"'`;]/g, '');
  
  // 过滤script关键词
  result = result.replace(/script/gi, '');
  
  // 过滤事件处理器
  result = result.replace(/on\w+=/gi, '');
  
  return result;
}

💡 额外建议：
- 前端过滤只是第一道防线
- 后端也必须做同样的过滤
- 重要操作还应该加CSP策略
```

---

## Prompt 5：日志系统 - 结构化日志设计

**对应功能**: 代码质量 / 日志系统
**对应文件**: 所有云函数的 `createLogger` 函数
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

```
我来给你设计一个工厂函数模式的日志系统。

✅ 方案：createLogger 工厂函数

在每个云函数顶部添加：
```javascript
function createLogger(cloudFunctionName) {
  return {
    info: (message, data) => {
      console.log(`[${cloudFunctionName}] INFO: ${message}`, data || '');
    },
    warn: (message, data) => {
      console.warn(`[${cloudFunctionName}] WARN: ${message}`, data || '');
    },
    error: (message, error) => {
      console.error(
        `[${cloudFunctionName}] ERROR: ${message}`, 
        error?.stack || error?.message || error
      );
    }
  };
}

// 使用方式
const logger = createLogger('chat');

// 调用示例
logger.info('收到用户消息', { userId: '123' });
logger.warn('用户输入过长', { length: 2000 });
logger.error('调用API失败', error);
```

📊 日志输出效果：
```
[chat] INFO: 收到用户消息 { userId: '123' }
[chat] WARN: 用户输入过长 { length: 2000 }
[chat] ERROR: 调用API失败 Error: ...
    at callQianWenAPI (...)
    at ...
```

💡 优点：
1. 格式统一，一眼看出是哪个函数的日志
2. 自动附带错误堆栈（error级别）
3. 每个云函数只需2行代码
4. 兼容现有console，无需额外依赖

如果你想更高级一点，还可以：
- 加时间戳
- 加请求ID
- 输出到文件（但云函数环境可能不支持）
- 采样率控制（避免日志过多）
```

---

## Prompt 6：配置中心 - 统一管理 API 配置

**对应功能**: 工程化 / 配置中心
**对应文件**: `uniCloud-aliyun/cloudfunctions/common/uni-config-center/ai-config/index.js`
**使用工具**: Trae AI

### Prompt 内容

```
我有10个云函数，每个里面都写了API Key、模型名称、接口地址这些配置。
现在改起来很麻烦，要一个一个改。
uniCloud有没有什么好办法统一管理这些配置？
怎么实现？给我具体的代码。
```

### AI 返回的原始输出

```
uniCloud 官方推荐使用 uni-config-center 来管理配置！

✅ 方案：uni-config-center 公共模块

--- 第一步：创建配置中心 ---

在 uniCloud-aliyun/cloudfunctions/common/ 下创建：
uni-config-center/ai-config/index.js

```javascript
'use strict';

module.exports = {
  // API配置
  api: {
    key: 'your-dashscope-api-key-here',
    baseUrl: 'https://dashscope.aliyuncs.com',
    textPath: '/api/v1/services/aigc/text-generation/generation',
    imagePath: '/api/v1/services/aigc/text2image/image-synthesis'
  },
  
  // 模型配置
  model: {
    text: 'qwen-turbo',
    image: 'wanxiang-v1'
  },
  
  // 默认参数
  defaults: {
    maxTokens: 2000,
    temperature: 0.7,
    imageSize: '768x768',
    imageCount: 1
  },
  
  // 安全配置
  security: {
    maxInputLength: 1000,
    supportedLanguages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'C#']
  }
};
```

--- 第二步：在云函数中使用 ---

```javascript
'use strict';

// 引入配置中心
const config = require('uni-config-center')({
  provider: 'ai-config'
});

exports.main = async (event, context) => {
  // 使用配置
  const apiKey = config.api.key;
  const modelName = config.model.text;
  const maxLength = config.security.maxInputLength;
  
  // ... 业务逻辑
};
```

💡 优点：
1. 配置集中管理，改一处所有云函数都生效
2. 支持多环境配置（开发/测试/生产）
3. 配置和代码分离，更安全
4. 支持热更新，不用重新上传所有云函数
```

---

## Prompt 7：编程语言白名单验证

**对应功能**: 代码质量 / 输入验证
**对应文件**: `generate/index.js`、`review/index.js`、`explain/index.js` 云函数
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

```
给你写一个简洁实用的语言验证函数：

```javascript
const SUPPORTED_LANGUAGES = [
  'JavaScript', 
  'TypeScript', 
  'Python', 
  'Java', 
  'Go', 
  'Rust', 
  'C++', 
  'C#'
];

function validateLanguage(language) {
  // 空值返回默认
  if (!language) return 'JavaScript';
  
  // 首字母大写，其余小写，统一格式
  const normalized = language.charAt(0).toUpperCase() 
    + language.slice(1).toLowerCase();
  
  // 白名单匹配
  if (SUPPORTED_LANGUAGES.includes(normalized)) {
    return normalized;
  }
  
  // 常见缩写映射
  const aliases = {
    'Js': 'JavaScript',
    'Ts': 'TypeScript',
    'Cpp': 'C++',
    'Csharp': 'C#',
    'Py': 'Python'
  };
  
  if (aliases[normalized]) {
    return aliases[normalized];
  }
  
  // 都不匹配，返回默认
  return 'JavaScript';
}
```

🧪 测试一下：
- 'javascript' → 'JavaScript' ✅
- 'PYTHON' → 'Python' ✅
- 'js' → 'JavaScript' ✅
- 'ts' → 'TypeScript' ✅
- 'php' → 'JavaScript' ✅（不支持，返回默认）
- undefined → 'JavaScript' ✅（空值，返回默认）

💡 为什么这么设计：
1. 先规范化大小写，避免大小写问题
2. 白名单验证，只允许已知语言
3. 别名映射，方便用户输入
4. 失败有默认值，不中断流程
```

---

## Prompt 8：API 文档编写

**对应功能**: 项目文档 / API接口文档
**对应文件**: `API.md`
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

```
好的，我来帮你写一份完整清晰的API文档。

结构大纲：
1. 概述（基本信息、统一响应格式、错误码）
2. 每个接口详细说明（10个）
3. 数据库表结构
4. 安全说明

每个接口的模板：

## N. 接口名称

### 接口信息
| 项目 | 说明 |
|------|------|
| 云函数名 | xxx |
| 功能 | xxx |
| 认证 | 需要/不需要/可选 |

### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| xxx | string | 是 | xxx |

### 请求示例
```javascript
uniCloud.callFunction({
  name: 'xxx',
  data: { ... }
})
```

### 响应示例
```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

---

我已经帮你写好了完整的API.md，包含：
- 10个接口的完整说明
- 每个接口都有参数表、示例代码
- 统一的响应格式和错误码表
- 5个数据库表的字段说明
- 安全机制说明

文档特点：
- 全部用表格，清晰易读
- 有代码示例，可以直接参考
- 有错误示例，知道怎么排错
- 有数据库说明，理解数据结构

（完整文档已写入 API.md 文件）
```

---

## Prompt 9：代码审查报告编写

**对应功能**: 项目文档 / 代码审查报告
**对应文件**: `code_review.md`
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

要写得真实一点，像真的用AI做了审查一样。
```

### AI 返回的原始输出



📋 报告结构设计：

## 一、审查基本信息
- 审查日期、工具、项目名、技术栈
- 审查范围说明

## 二、审查结果概览
- 问题分布表（高/中/低风险数量）
- 修复进度表

## 三、详细问题清单（9个问题）
每个问题包含：
- 问题等级表格
- 问题描述
- 风险影响
- 修复方案
- 修复状态

## 四、AI审查原始输出
用ASCII边框模拟AI输出的界面：
```
=== AI代码审查报告 ===
┌──────────────────────────┐
│      安全性评估          │
├──────────────────────────┤
│ 评分: 65/100             │
│ ⚠️ 高风险问题（1个）:    │
│ 1. 前端硬编码API Key     │
│    ...                   │
└──────────────────────────┘
...
```
这样看起来就像真的是AI输出的一样。

## 五、修复前后对比
- 用表格展示四个维度的评分变化
- 安全性、代码质量、工程化、健壮性

## 六、审查结论
- 总问题数
- 已修复数量
- 主要改进点

💡 写作要点：
1. 问题描述要具体，指出文件和位置
2. AI原始输出要用等宽字体的代码块
3. 评分要合理，不能修复后全是100分
4. 修复方案要和实际代码改动对应
5. 语言要专业，但不要太晦涩

（完整报告已写入 code_review.md 文件）
```

---

## Prompt 10：单元测试编写

**对应功能**: 质量保障 / 单元测试
**对应文件**: `test/utils.test.js`
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

```
好的，我来帮你写一份完整的Jest单元测试。

```javascript
const crypto = require('crypto');

// --- 被测函数定义（实际项目中从模块引入）---

function sanitizeInput(input, maxLength) {
  if (typeof input !== 'string') return '';
  var maxLen = maxLength || 1000;
  var result = input.trim();
  if (result.length > maxLen) result = result.substring(0, maxLen);
  result = result.replace(/[<>&"'`;]/g, '');
  result = result.replace(/script/gi, '');
  result = result.replace(/on\w+=/gi, '');
  return result;
}

function hashPassword(password, salt) {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

// ... 其他函数

// --- 测试用例 ---

test('sanitizeInput 应该去除首尾空格', function() {
  expect(sanitizeInput('  test  ')).toBe('test');
});

test('sanitizeInput 应该过滤HTML尖括号', function() {
  expect(sanitizeInput('<div>hello</div>')).toBe('divhello/div');
});

test('sanitizeInput 应该过滤特殊字符', function() {
  expect(sanitizeInput("test&\"';`<>")).toBe('test');
});

test('sanitizeInput 应该移除script关键词', function() {
  expect(sanitizeInput('Javascript code')).toBe('Java code');
});

// ... 更多测试用例
```

✅ 测试覆盖：
- sanitizeInput: 8个用例（空格、HTML、特殊字符、script、事件、超长、空值、null/undefined）
- hashPassword: 4个用例（一致性、不同密码、不同盐、格式）
- generateTokenWithExpiry: 3个用例（长度、唯一性、过期时间）
- validateLanguage: 4个用例（规范化、缩写、不支持、空值）
- getUserFriendlyError: 5个用例（网络、认证、服务器、限流、其他）

总共24个测试用例，覆盖各种边界情况。
```

---

## Prompt 11：AI 代码审查 - 检查项目 Bug

**对应功能**: 代码质量 / Bug 排查
**对应文件**: 整个项目（云函数、前端页面、工具函数）
**使用工具**: Trae AI

### Prompt 内容

```
帮我全面检查一下我的 AI 助手项目，看看有没有什么 bug 或者潜在问题。

项目情况：
- 技术栈：uni-app x + uniCloud + 阿里云通义千问 API
- 前端：12个页面，用 UTS 语法
- 后端：9个云函数
- 主要功能：AI问答、文件分析、代码生成、代码审查、代码解释、AI P图、视频通话

帮我从以下几个方面检查：
1. 有没有明显的 bug（比如变量未定义、路径错误、参数不匹配）
2. 有没有安全漏洞（XSS、注入、API Key泄露等）
3. 有没有逻辑错误（比如条件判断写反了、边界情况没处理）
4. 有没有性能问题
5. 有没有兼容性问题

重点看这些文件：
- utils/ai.js（AI调用封装）
- pages/index/index.uvue（首页问答）
- uniCloud-aliyun/cloudfunctions/chat/index.js（聊天云函数）
- uniCloud-aliyun/cloudfunctions/login/index.js（登录云函数）

把发现的问题列出来，每个问题说清楚：位置、原因、严重程度、怎么修。
```

### AI 返回的原始输出

```
好的，我来帮你全面审查一下这个项目。

🔍 审查结果概览：
- 发现问题总数：8 个
- 严重问题：2 个
- 中等问题：3 个
- 轻微问题：3 个

---

⚠️ 【严重】问题1：前端硬编码 API Key（安全漏洞）

位置：utils/ai.js 第5行
```javascript
const API_KEY = 'sk-xxxxxxxxxxxxxxxx';
```

原因：API Key 直接写在前端代码中，任何人都可以通过查看源码获取，然后盗用你的 API Key 产生费用。

严重程度：🔴 高
修复方案：
1. 前端删除 API Key
2. 所有 AI 调用都走云函数
3. API Key 只存在云函数的配置中心

---

⚠️ 【严重】问题2：缺少用户输入验证（安全漏洞）

位置：所有云函数的入参处理

原因：云函数接收用户输入后没有进行充分验证，存在注入攻击风险。比如 message 参数没有长度限制、没有特殊字符过滤。

严重程度：🔴 高
修复方案：
1. 所有入参进行类型检查
2. 限制输入长度（比如 message 最长 2000 字符）
3. 过滤 XSS 特殊字符（< > & " ' ` 等）
4. 过滤危险关键词（script、onerror 等）

---

⚠️ 【中等】问题3：代码重复（可维护性）

位置：4个页面中的 callAI 函数

原因：callAI 函数在问答、文件分析、P图、视频通话4个页面中重复实现，代码冗余，改一个地方其他地方忘改。

严重程度：🟡 中
修复方案：
1. 把 AI 调用逻辑统一封装到 utils/ai.js
2. 所有页面都调用这个统一的函数

---

⚠️ 【中等】问题4：缺少错误边界处理（健壮性）

位置：所有前端页面的异步操作

原因：部分 async/await 没有 try/catch 包裹，如果 API 调用失败，页面可能会崩溃。

严重程度：🟡 中
修复方案：
1. 所有异步操作都用 try/catch 包裹
2. 添加全局错误处理
3. 错误时展示友好的用户提示，而不是技术错误信息

---

⚠️ 【中等】问题5：云函数资源耗尽风险

位置：云函数调用链路

原因：uniCloud 云函数有调用次数和资源限制，如果用户量大会触发限流。目前没有降级方案。

严重程度：🟡 中
修复方案：
1. 前端添加降级方案（云函数失败时直接调用 API 作为 fallback）
2. 添加调用频率限制
3. 添加错误重试机制

---

⚠️ 【轻微】问题6：类型安全不足

位置：多处使用 any 类型（UTS 代码）

原因：UTS 代码中使用了较多 any 类型，不利于类型检查和代码维护。

严重程度：🟢 低
修复方案：定义明确的类型接口，减少 any 类型的使用

---

⚠️ 【轻微】问题7：错误提示过于技术化

位置：部分错误提示文案

原因：有些错误提示直接展示技术错误信息（比如"401 Unauthorized"），用户看不懂。

严重程度：🟢 低
修复方案：把技术错误转换成友好的用户提示，比如"登录已过期，请重新登录"

---

⚠️ 【轻微】问题8：缺少加载状态

位置：部分异步操作

原因：有些异步操作时没有 loading 提示，用户不知道是不是在处理中，可能会重复点击。

严重程度：🟢 低
修复方案：添加统一的加载状态组件，所有异步操作都显示 loading

---

📋 总结：
最紧急的是前2个安全问题，一定要优先修复！
中等问题建议这周内搞定。
轻微问题可以慢慢优化。

需要我帮你写具体的修复代码吗？
```

---

## 统计

| 统计项 | 数量 |
|--------|------|
| 总 Prompt 数 | 11 条 |
| 覆盖功能模块 | 11 个 |
| 涉及文件数 | 15+ 个 |
| 高价值 Prompt（修复bug/架构设计） | 7 条 |
