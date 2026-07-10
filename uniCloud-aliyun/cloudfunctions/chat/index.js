'use strict';

exports.main = async (event, context) => {
  const { question } = event;
  
  const config = uniCloud.getConfig('ai-config');
  const API_KEY = config.dashscope.apiKey;
  const BASE_URL = config.dashscope.baseUrl;
  
  if (!question) {
    return {
      success: false,
      message: '请输入问题'
    };
  }

  if (!API_KEY) {
    return {
      success: false,
      message: '请在uni-config-center的ai-config中配置API_KEY'
    };
  }

  try {
    const res = await uniCloud.httpclient.request(
      BASE_URL + '/services/aigc/text-generation/generation',
      {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + API_KEY,
          'Content-Type': 'application/json'
        },
        data: {
          model: 'qwen-turbo',
          input: {
            messages: [
              {
                role: 'system',
                content: '你是一个专业的代码助手，擅长回答各种编程问题，包括编程语言语法、框架使用、调试技巧等。请用简洁明了的语言回答问题，并在适当的时候提供代码示例。'
              },
              {
                role: 'user',
                content: question
              }
            ]
          },
          parameters: {
            result_format: 'message'
          }
        },
        dataType: 'json'
      }
    );

    if (res.status === 200 && res.data && res.data.output && res.data.output.choices) {
      return {
        success: true,
        data: res.data.output.choices[0].message.content
      };
    } else {
      return {
        success: false,
        message: 'AI返回数据格式异常'
      };
    }
  } catch (error) {
    console.error('Chat API Error:', error);
    return {
      success: false,
      message: 'AI服务调用失败，请稍后重试'
    };
  }
};