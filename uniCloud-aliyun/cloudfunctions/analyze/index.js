'use strict';

const aiConfig = require('../common/uni-config-center/ai-config/index.js');
const API_KEY = aiConfig.dashscope.apiKey;
const https = require('https');

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
        'Authorization': 'Bearer ' + API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      },
      timeout: 180000
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
  const { fileName, fileContent, fileUrl, requirement, token } = event;
  
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
    
    let prompt = '';
    if (fileContent) {
      prompt = `文件名称：${fileName}\n用户需求：${requirement}\n\n文件内容：\n${fileContent}`;
    } else if (fileUrl) {
      const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
      const fileTypeMap = {
        '.pdf': 'PDF文档',
        '.doc': 'Word文档',
        '.docx': 'Word文档',
        '.xls': 'Excel表格',
        '.xlsx': 'Excel表格',
        '.ppt': 'PPT演示文稿',
        '.pptx': 'PPT演示文稿',
        '.jpg': '图片文件',
        '.jpeg': '图片文件',
        '.png': '图片文件',
        '.gif': 'GIF动图',
        '.bmp': '图片文件',
        '.mp4': '视频文件',
        '.avi': '视频文件',
        '.mov': '视频文件',
        '.mp3': '音频文件',
        '.wav': '音频文件',
        '.zip': '压缩文件',
        '.rar': '压缩文件',
        '.7z': '压缩文件'
      };
      const fileType = fileTypeMap[ext] || '其他文件';
      prompt = `文件名称：${fileName}\n文件类型：${fileType}\n文件大小：未知\n用户需求：${requirement}\n\n这是一个${fileType}文件，请根据文件名和用户需求提供相关分析和建议。`;
    } else {
      prompt = `文件名称：${fileName}\n用户需求：${requirement}\n\n请根据文件名和用户需求进行分析。`;
    }
    
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
