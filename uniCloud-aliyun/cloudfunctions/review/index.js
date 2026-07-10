'use strict';

exports.main = async (event, context) => {
  const { code, language = 'JavaScript' } = event;
  
  const config = uniCloud.getConfig('ai-config');
  const API_KEY = config.dashscope.apiKey;
  const BASE_URL = config.dashscope.baseUrl;
  
  if (!code) {
    return {
      success: false,
      message: '请输入要审查的代码'
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
                content: `你是一个专业的代码审查专家。请对${language}代码进行全面审查，包括：\n1. 代码质量和可读性\n2. 潜在的bug和安全隐患\n3. 性能优化建议\n4. 最佳实践和规范\n5. 代码改进建议\n\n请用结构化的方式输出审查结果。`
              },
              {
                role: 'user',
                content: `请审查以下${language}代码：\n\n${code}`
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
    console.error('Review API Error:', error);
    return {
      success: false,
      message: 'AI服务调用失败，请稍后重试'
    };
  }
};