'use strict';

const axios = require('axios');

exports.main = async (event, context) => {
  const { imageUrl, requirement, style, token } = event;
  
  if (!imageUrl || !requirement || !token) {
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
    
    const response = await axios.post(
      'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      {
        model: 'qwen-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的AI图像编辑助手。当前时间是2026年7月。你可以根据用户的需求提供专业的修图建议和指导，包括但不限于：去除背景、添加滤镜、美颜美化、更换背景、调整亮度对比度、添加特效等。请提供详细的修图步骤和建议。'
          },
          {
            role: 'user',
            content: `图片已上传，请根据以下需求进行修图：\n需求：${requirement}\n风格：${style || '原图'}\n\n请提供详细的修图步骤和建议。`
          }
        ],
        max_tokens: 1024,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': 'Bearer sk-ws-H.EMYIRMP.kUZd.MEQCICr30HCsmUwWipre9EMlky7Y2j6mN0qcfdbR7LzNfbzIAiAcSPhq7Ef8n-iHb0bQM6ZncMHpzViKptueytzBOBtDcQ',
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );
    
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      await db.collection('image_history').add({
        userId: user.data[0]._id,
        imageUrl: imageUrl,
        requirement: requirement,
        style: style,
        suggestion: response.data.choices[0].message.content,
        createdAt: new Date().getTime()
      });
      
      return {
        code: 200,
        message: 'success',
        data: {
          suggestion: response.data.choices[0].message.content
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
