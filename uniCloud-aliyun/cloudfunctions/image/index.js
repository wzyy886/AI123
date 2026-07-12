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
  const { imageUrl, imageContent, requirement, style, token } = event;

  const tokenValidation = validateToken(token);
  if (!tokenValidation.valid) {
    return { code: 401, message: tokenValidation.message, data: null };
  }

  if (!requirement) {
    return { code: 400, message: '参数不完整', data: null };
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

  const sanitizedRequirement = sanitizeInput(requirement, 2000);
  const sanitizedStyle = style ? sanitizeInput(style, 100) : '';
  const sanitizedImageUrl = imageUrl ? sanitizeInput(imageUrl, 500) : '';

  const prompt = `图片信息：${sanitizedImageUrl || '已上传图片'}\n风格：${sanitizedStyle || '原图'}\n用户需求：${sanitizedRequirement}\n\n请提供详细的图片编辑方案和建议。`;

  try {
    const res = await uniCloud.httpclient.request(BASE_URL + '/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json' },
      data: {
        model: 'qwen-turbo',
        messages: [
          { role: 'system', content: '你是一个专业的AI图像编辑助手。当前时间是2026年7月。你可以帮助用户进行图片处理、修图、设计等工作。请根据用户的图片描述和需求，提供详细的图片编辑方案和建议。' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 4096,
        temperature: 0.7
      },
      dataType: 'json',
      sslVerify: false,
      timeout: 300000
    });

    if (res.status === 200 && res.data && res.data.choices && res.data.choices.length > 0) {
      const suggestion = res.data.choices[0].message.content;
      return { code: 200, message: 'success', data: {
        suggestion: suggestion,
        generatedImageUrl: ''
      } };
    } else {
      return { code: 500, message: 'AI服务暂时不可用，请稍后重试', data: null };
    }
  } catch (error) {
    return { code: 500, message: '服务器繁忙，请稍后重试', data: null };
  }
}

exports.main = handler;
