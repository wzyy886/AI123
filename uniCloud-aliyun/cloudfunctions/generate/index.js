'use strict';

exports.main = async (event, context) => {
  const { description, language = 'JavaScript' } = event;
  
  const config = uniCloud.getConfig('ai-config');
  const API_KEY = config.dashscope.apiKey;
  const BASE_URL = config.dashscope.baseUrl;
  
  if (!description) {
    return {
      success: false,
      message: '请输入代码描述'
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
                content: `你是一个专业的代码生成助手。根据用户描述生成高质量的${language}代码。代码应该完整、可运行，并包含适当的注释。输出格式应该是纯代码或者Markdown代码块。`
              },
              {
                role: 'user',
                content: `请根据以下描述生成${language}代码：\n\n${description}`
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
    console.error('Generate API Error:', error);
    return {
      success: false,
      message: 'AI服务调用失败，请稍后重试'
    };
  }
};