'use strict';

const API_KEY = 'sk-ws-H.EMYIRMP.kUZd.MEQCICr30HCsmUwWipre9EMlky7Y2j6mN0qcfdbR7LzNfbzIAiAcSPhq7Ef8n-iHb0bQM6ZncMHpzViKptueytzBOBtDcQ';
const BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

exports.main = async (event, context) => {
  const { code, language = 'JavaScript' } = event;
  
  if (!code) {
    return {
      success: false,
      message: '请输入要解释的代码'
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
              content: `你是一个专业的代码解释专家。请用通俗易懂的语言解释${language}代码。`
            },
            {
              role: 'user',
              content: `请解释以下${language}代码：\n\n${code}`
            }
          ],
          max_tokens: 2048
        },
        dataType: 'json',
        sslVerify: false,
        timeout: 30000
      }
    );

    if (res.status === 200 && res.data && res.data.choices) {
      return {
        success: true,
        data: res.data.choices[0].message.content
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
    console.error('Explain API Error:', error);
    return {
      success: false,
      message: 'AI服务调用失败',
      error: error.message || String(error)
    };
  }
};