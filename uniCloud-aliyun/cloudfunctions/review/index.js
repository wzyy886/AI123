'use strict';

const aiConfig = require('../common/uni-config-center/ai-config/index.js');
const API_KEY = aiConfig.dashscope.apiKey;
const BASE_URL = aiConfig.dashscope.baseUrl;

function validateToken(token) {
  if (!token || typeof token !== 'string') {
    return { valid: false, message: 'Token不能为空' };
  }
  if (token.length < 32) {
    return { valid: false, message: 'Token格式不正确' };
  }
  return { valid: true, message: '' };
}

function sanitizeInput(input, maxLength) {
  if (typeof input !== 'string') {
    return '';
  }
  let result = input.trim();
  if (result.length > (maxLength || 1000)) {
    result = result.substring(0, maxLength || 1000);
  }
  result = result.replace(/[<>]/g, '');
  return result;
}

function isTokenExpired(expireAt) {
  if (!expireAt) return true;
  return Date.now() > expireAt;
}

const SUPPORTED_LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'C#'];

async function handler(event, context) {
  const { language, code, token } = event;

  const tokenValidation = validateToken(token);
  if (!tokenValidation.valid) {
    return { code: 401, message: tokenValidation.message, data: null };
  }

  const db = uniCloud.database();
  const user = await db.collection('users').where({ token: token }).get();
  
  if (user.data.length === 0) {
    return { code: 401, message: '未登录或登录已过期', data: null };
  }

  const userData = user.data[0];
  if (isTokenExpired(userData.tokenExpireAt)) {
    return { code: 401, message: '登录已过期，请重新登录', data: null };
  }

  if (!code || typeof code !== 'string' || code.trim() === '') {
    return { code: 400, message: '请输入待审查的代码', data: null };
  }

  const sanitizedLanguage = language && SUPPORTED_LANGUAGES.includes(language) ? language : 'JavaScript';
  const sanitizedCode = sanitizeInput(code, 10000);

  try {
    const res = await uniCloud.httpclient.request(BASE_URL + '/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json' },
      data: {
        model: 'qwen-turbo',
        messages: [
          { role: 'system', content: '你是一个精通2026年最新技术的代码审查助手。请检查代码的正确性、安全性、性能问题和代码风格，并给出改进建议。' },
          { role: 'user', content: `请审查以下${sanitizedLanguage}代码：\n\n${sanitizedCode}` }
        ],
        max_tokens: 4096,
        temperature: 0.5
      },
      dataType: 'json',
      sslVerify: false,
      timeout: 300000
    });

    if (res.status === 200 && res.data && res.data.choices && res.data.choices.length > 0) {
      return { code: 200, message: 'success', data: { response: res.data.choices[0].message.content } };
    } else {
      return { code: 500, message: 'AI服务暂时不可用，请稍后重试', data: null };
    }
  } catch (error) {
    return { code: 500, message: '服务器繁忙，请稍后重试', data: null };
  }
}

exports.main = handler;