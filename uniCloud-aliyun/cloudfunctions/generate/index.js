'use strict';

const API_KEY = 'sk-ws-H.EMYIRMP.kUZd.MEQCICr30HCsmUwWipre9EMlky7Y2j6mN0qcfdbR7LzNfbzIAiAcSPhq7Ef8n-iHb0bQM6ZncMHpzViKptueytzBOBtDcQ';
const BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

exports.main = async (event, context) => {
  const { description, language = 'JavaScript' } = event;
  
  if (!description) {
    return {
      success: false,
      message: '请输入代码描述'
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
              content: `你是一个专业的代码生成助手。根据用户描述生成高质量的${language}代码。`
            },
            {
              role: 'user',
              content: `请根据以下描述生成${language}代码：\n\n${description}`
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
    console.error('Generate API Error:', error);
    return {
      success: false,
      message: 'AI服务调用失败',
      error: error.message || String(error)
    };
  }
};