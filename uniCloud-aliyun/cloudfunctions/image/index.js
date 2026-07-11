'use strict';

const https = require('https');

function requestAI(prompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'qwen-turbo',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的AI图像编辑助手。当前时间是2026年7月。你可以帮助用户进行图片处理、修图、设计等工作。请根据用户的图片描述和需求，提供详细的图片编辑方案和建议。'
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
      timeout: 90000
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

function generateImage(prompt) {
  return new Promise((resolve) => {
    resolve({ output: { images: [] } });
  });
}

exports.main = async (event, context) => {
  const { imageUrl, imageContent, requirement, style, token } = event;
  
  if (!requirement || !token) {
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
    
    const prompt = `图片信息：${imageUrl || '已上传图片'}\n风格：${style || '原图'}\n用户需求：${requirement}\n\n请提供详细的图片编辑方案和建议。`;
    
    const response = await requestAI(prompt);
    
    if (response && response.choices && response.choices.length > 0) {
      await db.collection('image_history').add({
        userId: user.data[0]._id,
        imageUrl: imageUrl || '',
        requirement: requirement,
        style: style || '',
        suggestion: response.choices[0].message.content,
        createdAt: new Date().getTime()
      });
      
      return {
        code: 200,
        message: 'success',
        data: {
          suggestion: response.choices[0].message.content,
          generatedImageUrl: ''
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
    console.error('图片处理失败:', error);
    return {
      code: 500,
      message: '网络错误或服务器内部错误',
      data: null
    };
  }
};
