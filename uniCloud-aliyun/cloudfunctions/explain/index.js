'use strict';

const API_KEY = 'sk-ws-H.EMYIRMP.kUZd.MEQCICr30HCsmUwWipre9EMlky7Y2j6mN0qcfdbR7LzNfbzIAiAcSPhq7Ef8n-iHb0bQM6ZncMHpzViKptueytzBOBtDcQ';
const BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

exports.main = async (event, context) => {
  const { language, code } = event;
  
  if (!code) {
    return {
      success: false,
      message: '请输入待解释的代码'
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
              content: '你是一个专业的代码解释助手。请详细解释代码的功能、执行流程和关键技术点。'
            },
            {
              role: 'user',
              content: `请解释以下${language || 'JavaScript'}代码：\n\n${code}`
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
    console.error('Explain API Error:', error);
    return {
      success: false,
      message: '网络请求失败',
      error: error.message || String(error)
    };
  }
};
