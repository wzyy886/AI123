'use strict';

const aiConfig = require('../common/uni-config-center/ai-config/index.js');
const API_KEY = aiConfig.dashscope.apiKey;
const BASE_URL = aiConfig.dashscope.baseUrl;
const https = require('https');

function requestAI(message, systemPrompt, maxTokens) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'qwen-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt || '你是一个全能型AI助手，精通2026年最新技术。当前时间是2026年7月。你可以回答任何类型的问题，回答要详细、完整、准确。'
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: maxTokens || 4096,
      temperature: 0.7
    });

    const options = {
      hostname: 'dashscope.aliyuncs.com',
      path: '/compatible-mode/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      },
      timeout: 180000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => { reject(error); });
    req.on('timeout', () => { req.destroy(); reject(new Error('请求超时')); });
    req.write(data);
    req.end();
  });
}

exports.main = async (event, context) => {
  const { message, token, systemPrompt, maxTokens } = event;

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return { code: 400, message: '请输入有效的问题', data: null };
  }
  if (message.length > 5000) {
    return { code: 400, message: '输入内容过长，请精简后重试', data: null };
  }
  if (!token) {
    return { code: 401, message: '未登录或登录已过期', data: null };
  }

  const db = uniCloud.database();

  try {
    const user = await db.collection('users').where({ token: token }).get();
    if (user.data.length === 0) {
      return { code: 401, message: '未登录或登录已过期', data: null };
    }

    const response = await requestAI(message, systemPrompt, maxTokens);

    if (response && response.choices && response.choices.length > 0) {
      await db.collection('chat_history').add({
        userId: user.data[0]._id,
        userMessage: message,
        aiResponse: response.choices[0].message.content,
        createdAt: new Date().getTime()
      });

      return {
        code: 200,
        message: 'success',
        data: { response: response.choices[0].message.content }
      };
    } else {
      return { code: 500, message: 'AI服务暂时不可用，请稍后重试', data: null };
    }
  } catch (error) {
    console.error('AI问答失败:', error);
    return { code: 500, message: '服务器繁忙，请稍后重试', data: null };
  }
};
