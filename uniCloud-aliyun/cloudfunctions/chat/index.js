'use strict';

const https = require('https');

function requestAI(message) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'qwen-turbo',
      messages: [
        {
          role: 'system',
          content: '你是一个全能型AI助手，精通2026年最新技术。当前时间是2026年7月。你可以回答任何类型的问题，包括但不限于：编程代码问题、技术咨询、生活常识、学习辅导、情感交流、创意写作、数据分析、数学计算、英语翻译等。对于编程问题，请使用2025-2026年最新的技术栈：React 19、Vue 3.5+、TypeScript 5.5+、Vite 6+、Tailwind CSS 4+、Node.js 22+、Python 3.13+、Rust 1.75+、Go 1.22+、Next.js 14+、Nuxt.js 3.13+、Solid.js、Svelte 5、Bun、Prisma 5+、Tauri 2+、Cloudflare Workers、AI Agent框架、RAG技术、向量数据库等。请根据用户的问题类型提供最合适、最专业的回答。'
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 2048,
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
  const { message, token } = event;
  
  if (!message || !token) {
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
    
    const response = await requestAI(message);
    
    if (response && response.choices && response.choices.length > 0) {
      await db.collection('chat_history').add({
        userId: user.data[0]._id,
        userMessage: message,
        aiResponse: response.choices[0].message.content,
        createdAt: new Date().getTime()
      });
      
      return {
        code: 200,
        message: 'success',
        data: {
          response: response.choices[0].message.content
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
    console.error('AI问答失败:', error);
    return {
      code: 500,
      message: '网络错误或服务器内部错误',
      data: null
    };
  }
};
