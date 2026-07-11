'use strict';

const aiConfig = require('../common/uni-config-center/ai-config/index.js');
const API_KEY = aiConfig.dashscope.apiKey;
const BASE_URL = aiConfig.dashscope.baseUrl;

exports.main = async (event, context) => {
  const { language, code, token } = event;

  if (!code || typeof code !== 'string' || code.trim() === '') {
    return { code: 400, message: '请输入待审查的代码', data: null };
  }
  if (code.length > 10000) {
    return { code: 400, message: '代码内容过长，请精简后重试', data: null };
  }
  if (!token) {
    return { code: 401, message: '未登录或登录已过期', data: null };
  }

  const db = uniCloud.database();
  const user = await db.collection('users').where({ token: token }).get();
  if (user.data.length === 0) {
    return { code: 401, message: '未登录或登录已过期', data: null };
  }

  try {
    const res = await uniCloud.httpclient.request(BASE_URL + '/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json' },
      data: {
        model: 'qwen-turbo',
        messages: [
          { role: 'system', content: '你是一个精通2026年最新技术的代码审查助手。请检查代码的正确性、安全性、性能问题和代码风格，并给出改进建议。' },
          { role: 'user', content: `请审查以下${language || 'JavaScript'}代码：\n\n${code}` }
        ],
        max_tokens: 2048,
        temperature: 0.5
      },
      dataType: 'json',
      sslVerify: false,
      timeout: 180000
    });

    if (res.status === 200 && res.data && res.data.choices && res.data.choices.length > 0) {
      return { code: 200, message: 'success', data: { response: res.data.choices[0].message.content } };
    } else {
      console.error('Review API Error:', res.status);
      return { code: 500, message: 'AI服务暂时不可用，请稍后重试', data: null };
    }
  } catch (error) {
    console.error('Review Error:', error);
    return { code: 500, message: '服务器繁忙，请稍后重试', data: null };
  }
};
