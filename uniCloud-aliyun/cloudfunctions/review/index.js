'use strict';

const aiConfig = require('../common/uni-config-center/ai-config/index.js');
const API_KEY = aiConfig.dashscope.apiKey;
const BASE_URL = aiConfig.dashscope.baseUrl;

exports.main = async (event, context) => {
  const { language, code } = event;
  
  if (!code) {
    return {
      success: false,
      message: '请输入待审查的代码'
    };
  }

  try {
    const res = await uniCloud.httpclient.request(
      BASE_URL + '/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + API_KEY,
          'Content-Type': 'application/json'
        },
        data: {
          model: 'qwen-turbo',
          messages: [
            {
              role: 'system',
              content: '你是一个专业的代码审查助手。请检查代码的正确性、安全性、性能问题和代码风格，并给出改进建议。'
            },
            {
              role: 'user',
              content: `请审查以下${language || 'JavaScript'}代码：\n\n${code}`
            }
          ],
          max_tokens: 2048,
          temperature: 0.5
        },
        dataType: 'json',
        sslVerify: false,
        timeout: 60000
      }
    );

    if (res.status === 200 && res.data && res.data.choices && res.data.choices.length > 0) {
      return {
        success: true,
        data: res.data.choices[0].message.content
      };
    } else {
      console.error('API Response Error:', res);
      return {
        success: false,
        message: 'AI服务返回异常',
        status: res.status,
        response: res.data
      };
    }
  } catch (error) {
    console.error('Review API Error:', error);
    return {
      success: false,
      message: '网络请求失败',
      error: error.message || String(error)
    };
  }
};
