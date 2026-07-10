'use strict';

const API_KEY = 'sk-ws-H.EMYIRMP.kUZd.MEQCICr30HCsmUwWipre9EMlky7Y2j6mN0qcfdbR7LzNfbzIAiAcSPhq7Ef8n-iHb0bQM6ZncMHpzViKptueytzBOBtDcQ';
const BASE_URL = 'https://dashscope.aliyuncs.com/api/v1';

exports.main = async (event, context) => {
  const { question } = event;
  
  if (!question) {
    return {
      success: false,
      message: '请输入问题'
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
                content: '你是一个专业的代码助手，擅长回答各种编程问题。'
              },
              {
                role: 'user',
                content: question
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
    console.error('Chat API Error:', error);
    return {
      success: false,
      message: 'AI服务调用失败',
      error: error.message || String(error)
    };
  }
};