'use strict';

const https = require('https');
const querystring = require('querystring');

function requestAI(prompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'qwen-turbo',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的文件分析助手。当前时间是2026年7月。你可以分析各种类型的文件，包括代码文件、文档文件、数据文件等。请根据用户的需求提供详细的分析报告。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 4096,
      temperature: 0.7
    });
    
    const options = {
      hostname: 'dashscope.aliyuncs.com',
      path: '/compatible-mode/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer sk-ws-H.EMYIRMP.kUZd.MEQCICr30HCsmUwWipre9EMlky7Y2j6mN0qcfdbR7LzNfbzIAiAcSPhq7Ef8n-iHb0bQM6ZncMHpzViKptueytzBOBtDcQ',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      },
      timeout: 60000
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
    
    req.write(data);
    req.end();
  });
}

exports.main = async (event, context) => {
  const { fileName, fileContent, requirement, token } = event;
  
  if (!fileName || !requirement || !token) {
    return {
      code: 400,
      message: '参数不完整',
      data: null
    };
  }
  
  const db = uniCloud.database();
  
  try {
    const user = await db.collection('users').where({
      token: token
    }).get();
    
    if (user.data.length === 0) {
      return {
        code: 401,
        message: '未登录或登录已过期',
        data: null
      };
    }
    
    const prompt = `文件名称：${fileName}\n用户需求：${requirement}\n\n${fileContent ? '文件内容：\n' + fileContent : '请根据文件名和用户需求进行分析。'}`;
    
    const response = await requestAI(prompt);
    
    if (response && response.choices && response.choices.length > 0) {
      await db.collection('file_history').add({
        userId: user.data[0]._id,
        fileName: fileName,
        requirement: requirement,
        analysis: response.choices[0].message.content,
        createdAt: new Date().getTime()
      });
      
      return {
        code: 200,
        message: 'success',
        data: {
          analysis: response.choices[0].message.content
        }
      };
    } else {
      return {
        code: 500,
        message: 'AI响应失败',
        data: null
      };
    }
  } catch (error) {
    console.error('文件分析失败:', error);
    return {
      code: 500,
      message: '网络错误或服务器内部错误',
      data: null
    };
  }
};
