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

async function handler(event, context) {
  const { message, systemPrompt, maxTokens, token } = event;

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
      
      await db.collection('chat_history').add({
        userId: userData._id,
        username: userData.username,
        message: sanitizedMessage,
        response: response,
        createdAt: new Date().getTime()
      });
      
      return { code: 200, message: 'success', data: { response: response } };
    } else {
      return { code: 500, message: 'AI服务暂时不可用，请稍后重试', data: null };
    }
  } catch (error) {
    return { code: 500, message: '服务器繁忙，请稍后重试', data: null };
  }
}

exports.main = handler;