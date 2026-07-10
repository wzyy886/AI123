'use strict';

const aiConfig = require('../common/uni-config-center/ai-config/index.js');
const API_KEY = aiConfig.dashscope.apiKey;
const BASE_URL = aiConfig.dashscope.baseUrl;

exports.main = async (event, context) => {
  const { language, description } = event;
  
  if (!description) {
    return {
      success: false,
      message: '请输入功能描述'
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
              content: '你是一个专业的代码生成助手。请根据用户的描述生成高质量、可运行的代码。代码需要完整，包含必要的注释。'
            },
            {
              role: 'user',
              content: `使用${language || 'JavaScript'}语言，实现以下功能：${description}`
            }
          ],
          max_tokens: 2048,
          temperature: 0.7
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
    console.error('Generate API Error:', error);
    return {
      success: false,
      message: '网络请求失败',
      error: error.message || String(error)
    };
  }
};
