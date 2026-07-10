'use strict';

const API_KEY = 'sk-ws-H.EMYIRMP.kUZd.MEQCICr30HCsmUwWipre9EMlky7Y2j6mN0qcfdbR7LzNfbzIAiAcSPhq7Ef8n-iHb0bQM6ZncMHpzViKptueytzBOBtDcQ';
const BASE_URL = 'https://dashscope.aliyuncs.com/api/v1';

exports.main = async (event, context) => {
  const { code, language = 'JavaScript' } = event;
  
  if (!code) {
    return {
      success: false,
      message: '请输入要审查的代码'
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
                content: `你是一个专业的代码审查专家。请对${language}代码进行全面审查，包括代码质量、安全性、性能和最佳实践。`
              },
              {
                role: 'user',
                content: `请审查以下${language}代码：\n\n${code}`
              }
            ]
          },
          parameters: {
            max_tokens: 2048,
            temperature: 0.7
          }
        },
        dataType: 'json',
        sslVerify: false,
        timeout: 60000
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
        message: 'AI返回数据格式异常',
        status: res.status,
        response: res.data
      };
    }
  } catch (error) {
    console.error('Review API Error:', error);
    return {
      success: false,
      message: 'AI服务调用失败',
      error: error.message || String(error)
    };
  }
};