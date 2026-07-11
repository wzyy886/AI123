'use strict';

const aiConfig = require('../common/uni-config-center/ai-config/index.js');
const API_KEY = aiConfig.dashscope.apiKey;
const BASE_URL = aiConfig.dashscope.baseUrl;

exports.main = async (event, context) => {
  const { language, description, token } = event;

  if (!description || typeof description !== 'string' || description.trim() === '') {
    return { code: 400, message: '请输入功能描述', data: null };
  }
  if (description.length > 2000) {
    return { code: 400, message: '描述内容过长，请精简后重试', data: null };
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
          { role: 'system', content: '你是一个精通2026年最新技术的代码生成助手。当前时间是2026年7月，请使用2025-2026年最新的技术栈生成代码。代码需要完整，包含必要的注释。' },
          { role: 'user', content: `使用${language || 'JavaScript'}语言，实现以下功能：${description}` }
        ],
        max_tokens: 2048,
        temperature: 0.7
      },
      dataType: 'json',
      sslVerify: false,
      timeout: 180000
    });

    if (res.status === 200 && res.data && res.data.choices && res.data.choices.length > 0) {
      return { code: 200, message: 'success', data: { response: res.data.choices[0].message.content } };
    } else {
      console.error('Generate API Error:', res.status);
      return { code: 500, message: 'AI服务暂时不可用，请稍后重试', data: null };
    }
  } catch (error) {
    console.error('Generate Error:', error);
    return { code: 500, message: '服务器繁忙，请稍后重试', data: null };
  }
};
