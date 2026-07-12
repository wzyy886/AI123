'use strict';

const crypto = require('crypto');
const http = require('http');
const https = require('https');
const url = require('url');

function generateSalt(length = 16) {
  if (length === null || length === undefined || typeof length !== 'number') {
    length = 16;
  }
  if (length <= 0) {
    throw new Error('盐值长度必须大于0');
  }
  return crypto.randomBytes(length).toString('hex');
}

function hashPassword(password, salt = null) {
  if (!password || typeof password !== 'string') {
    throw new Error('密码不能为空');
  }
  const actualSalt = salt || generateSalt();
  const hash = crypto.createHash('sha256').update(password + actualSalt).digest('hex');
  return { hash: hash, salt: actualSalt };
}

function verifyPassword(password, hash, salt) {
  if (!password || !hash || !salt) {
    return false;
  }
  const computedHash = crypto.createHash('sha256').update(password + salt).digest('hex');
  return computedHash === hash;
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
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
  if (!username || typeof username !== 'string') {
    return { valid: false, message: '用户名不能为空' };
  }
  if (username.length < 3 || username.length > 20) {
    return { valid: false, message: '用户名长度需在3-20之间' };
  }
  const validPattern = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
  if (!validPattern.test(username)) {
    return { valid: false, message: '用户名只能包含字母、数字、下划线和中文' };
  }
  return { valid: true, message: '' };
}

function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: '密码不能为空' };
  }
  if (password.length < 6) {
    return { valid: false, message: '密码长度至少6位' };
  }
  if (password.length > 50) {
    return { valid: false, message: '密码长度不能超过50位' };
  }
  return { valid: true, message: '' };
}

function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: '邮箱不能为空' };
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return { valid: false, message: '邮箱格式不正确' };
  }
  return { valid: true, message: '' };
}

function validateToken(token) {
  if (!token || typeof token !== 'string') {
    return { valid: false, message: 'Token不能为空' };
  }
  if (token.length < 32) {
    return { valid: false, message: 'Token格式不正确' };
  }
  return { valid: true, message: '' };
}

function sanitizeInput(input, maxLength = 1000) {
  if (typeof input !== 'string') {
    return '';
  }
  let result = input.trim();
  if (result.length > maxLength) {
    result = result.substring(0, maxLength);
  }
  result = result.replace(/[<>]/g, '');
  return result;
}

function formatResponse(code, message, data = null) {
  return {
    code: code,
    message: message,
    data: data
  };
}

function createLogger(moduleName) {
  return {
    info: (message, data) => {
      console.log(`[INFO][${moduleName}] ${new Date().toISOString()} ${message}`, data || '');
    },
    warn: (message, data) => {
      console.warn(`[WARN][${moduleName}] ${new Date().toISOString()} ${message}`, data || '');
    },
    error: (message, error) => {
      console.error(`[ERROR][${moduleName}] ${new Date().toISOString()} ${message}`, error?.stack || error || '');
    },
    debug: (message, data) => {
      if (process.env.DEBUG === 'true') {
        console.debug(`[DEBUG][${moduleName}] ${new Date().toISOString()} ${message}`, data || '');
      }
    }
  };
}

const errorBuffer = [];
const MAX_ERROR_BUFFER = 100;

function captureError(error, context = {}) {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    message: error?.message || String(error),
    stack: error?.stack || null,
    context: context
  };
  
  errorBuffer.push(errorInfo);
  if (errorBuffer.length > MAX_ERROR_BUFFER) {
    errorBuffer.shift();
  }
  
  return errorInfo;
}

function getErrorStats() {
  return {
    total: errorBuffer.length,
    recent: errorBuffer.slice(-10),
    lastHour: errorBuffer.filter(e => {
      const t = new Date(e.timestamp).getTime();
      return Date.now() - t < 3600000;
    }).length
  };
}

function sendErrorAlert(errorInfo) {
  const webhookUrl = process.env.ERROR_WEBHOOK_URL;
  if (!webhookUrl) {
    return Promise.resolve();
  }
  
  return new Promise((resolve) => {
    try {
      const parsedUrl = url.parse(webhookUrl);
      const transport = parsedUrl.protocol === 'https:' ? https : http;
      
      const postData = JSON.stringify({
        msgtype: 'markdown',
        markdown: {
          title: 'AI助手错误告警',
          text: `## 错误告警\n\n**时间**: ${errorInfo.timestamp}\n**错误**: ${errorInfo.message}\n**上下文**: \`\`\`${JSON.stringify(errorInfo.context, null, 2)}\`\`\`\n**堆栈**: \`\`\`${errorInfo.stack || '无'}\`\`\``
        }
      });
      
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };
      
      const req = transport.request(options, () => {
        resolve();
      });
      
      req.on('error', () => {
        resolve();
      });
      
      req.setTimeout(5000, () => {
        req.destroy();
        resolve();
      });
      
      req.write(postData);
      req.end();
    } catch (e) {
      resolve();
    }
  });
}

function asyncErrorHandler(fn, moduleName) {
  const logger = createLogger(moduleName);
  
  return async (event, context) => {
    const startTime = Date.now();
    
    try {
      logger.info('请求开始', { 
        function: moduleName,
        eventKeys: Object.keys(event || {})
      });
      
      const result = await fn(event, context);
      
      const duration = Date.now() - startTime;
      logger.info('请求完成', { 
        function: moduleName,
        duration: duration + 'ms',
        code: result?.code
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('请求异常', error);
      
      const errorInfo = captureError(error, {
        module: moduleName,
        duration: duration + 'ms',
        event: event
      });
      
      sendErrorAlert(errorInfo).catch(() => {});
      
      return formatResponse(500, '服务器内部错误', null);
    }
  };
}

const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60000;
const RATE_LIMIT_MAX = 30;

function checkRateLimit(userId) {
  if (!userId) {
    return { allowed: true, remaining: RATE_LIMIT_MAX };
  }
  
  const now = Date.now();
  const record = requestCounts.get(userId);
  
  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW) {
    requestCounts.set(userId, {
      windowStart: now,
      count: 1
    });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((record.windowStart + RATE_LIMIT_WINDOW - now) / 1000);
    return { 
      allowed: false, 
      remaining: 0,
      message: '请求过于频繁，请稍后再试',
      retryAfter: retryAfter
    };
  }
  
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count };
}

function loadConfig() {
  const defaults = {
    NODE_ENV: 'development',
    DEBUG: 'false',
    LOG_LEVEL: 'info',
    REQUEST_TIMEOUT: '600000',
    MAX_RETRIES: '2',
    RETRY_DELAY_BASE: '1000',
    DASHSCOPE_CHAT_URL: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    DASHSCOPE_IMAGE_TASK_URL: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
    DASHSCOPE_IMAGE_STATUS_URL: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/tasks/',
    DASHSCOPE_IMAGE_SYNC_URL: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/sync',
    AI_CHAT_MODEL: 'qwen-turbo',
    AI_IMAGE_MODEL: 'wanxiang-v1',
    AI_MAX_TOKENS: '8192',
    AI_TEMPERATURE: '0.7',
    TOKEN_EXPIRE_MINUTES: '1440',
    RATE_LIMIT_MAX: '30',
    RATE_LIMIT_WINDOW_MS: '60000'
  };
  
  const config = {};
  for (const [key, defaultValue] of Object.entries(defaults)) {
    config[key] = process.env[key] || defaultValue;
  }
  
  return config;
}

module.exports = {
  generateSalt,
  hashPassword,
  verifyPassword,
  generateToken,
  generateTokenWithExpiry,
  isTokenExpired,
  validateUsername,
  validatePassword,
  validateEmail,
  validateToken,
  sanitizeInput,
  formatResponse,
  createLogger,
  captureError,
  getErrorStats,
  sendErrorAlert,
  asyncErrorHandler,
  checkRateLimit,
  loadConfig
};