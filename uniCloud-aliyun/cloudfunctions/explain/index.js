'use strict';

exports.main = async (event, context) => {
  const { code, language = 'JavaScript' } = event;
  
  const config = uniCloud.getConfig('ai-config');
  const API_KEY = config.dashscope.apiKey;
  const BASE_URL = config.dashscope.baseUrl;
  
  if (!code) {
    return {
      success: false,
      message: '请输入要解释的代码'
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
                content: `你是一个专业的代码解释专家。请用通俗易懂的语言解释${language}代码的含义和工作原理，包括：\n1. 代码的整体功能和目的\n2. 关键部分的详细解释\n3. 使用的技术和设计模式\n4. 执行流程和逻辑\n\n请用结构化的方式输出解释结果。`
              },
              {
                role: 'user',
                content: `请解释以下${language}代码：\n\n${code}`
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
    console.error('Explain API Error:', error);
    return {
      success: false,
      message: 'AI服务调用失败，请稍后重试'
    };
  }
};