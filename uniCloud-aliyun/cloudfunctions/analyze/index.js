'use strict';

const aiConfig = require('../common/uni-config-center/ai-config/index.js');
const API_KEY = aiConfig.dashscope.apiKey;
const BASE_URL = aiConfig.dashscope.baseUrl;

function validateToken(token) {
  if (!token || typeof token !== 'string') {
    return { valid: false, message: 'Token不能为空' };
  }
  if (token.length < 32) {
    return { valid: false, message: 'Token格式不正确' };
  }
  return { valid: true, message: '' };
}

function sanitizeInput(input, maxLength) {
  if (typeof input !== 'string') {
    return '';
  }
  let result = input.trim();
  if (result.length > (maxLength || 1000)) {
    result = result.substring(0, maxLength || 1000);
  }
  result = result.replace(/[<>]/g, '');
  return result;
}

function isTokenExpired(expireAt) {
  if (!expireAt) return true;
  return Date.now() > expireAt;
}

async function handler(event, context) {
  const { fileName, fileContent, fileUrl, requirement, token } = event;

  const tokenValidation = validateToken(token);
  if (!tokenValidation.valid) {
    return { code: 401, message: tokenValidation.message, data: null };
  }

  if (!fileName || !requirement) {
    return { code: 400, message: '参数不完整', data: null };
  }

  const db = uniCloud.database();
  const user = await db.collection('users').where({ token: token }).get();
  
  if (user.data.length === 0) {
    return { code: 401, message: '未登录或登录已过期', data: null };
  }

  const userData = user.data[0];
  if (isTokenExpired(userData.tokenExpireAt)) {
    return { code: 401, message: '登录已过期，请重新登录', data: null };
  }

  const sanitizedFileName = sanitizeInput(fileName, 200);
  const sanitizedRequirement = sanitizeInput(requirement, 2000);

  let prompt = '';
  if (fileContent) {
    const sanitizedContent = sanitizeInput(fileContent, 10000);
    prompt = `文件名称：${sanitizedFileName}\n用户需求：${sanitizedRequirement}\n\n文件内容：\n${sanitizedContent}`;
  } else if (fileUrl) {
    const ext = sanitizedFileName.toLowerCase().substring(sanitizedFileName.lastIndexOf('.'));
    const fileTypeMap = {
      '.pdf': 'PDF文档', '.doc': 'Word文档', '.docx': 'Word文档',
      '.xls': 'Excel表格', '.xlsx': 'Excel表格', '.ppt': 'PPT演示文稿',
      '.pptx': 'PPT演示文稿', '.jpg': '图片文件', '.jpeg': '图片文件',
      '.png': '图片文件', '.gif': 'GIF动图', '.bmp': '图片文件',
      '.mp4': '视频文件', '.avi': '视频文件', '.mov': '视频文件',
      '.mp3': '音频文件', '.wav': '音频文件', '.zip': '压缩文件',
      '.rar': '压缩文件', '.7z': '压缩文件'
    };
    const fileType = fileTypeMap[ext] || '其他文件';
    prompt = `文件名称：${sanitizedFileName}\n文件类型：${fileType}\n用户需求：${sanitizedRequirement}\n\n请根据文件信息进行分析。`;
  } else {
    prompt = `文件名称：${sanitizedFileName}\n用户需求：${sanitizedRequirement}\n\n请根据文件名和用户需求进行分析。`;
  }

  try {
    const res = await uniCloud.httpclient.request(BASE_URL + '/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json' },
      data: {
        model: 'qwen-turbo',
        messages: [
          { role: 'system', content: '你是一个专业的文件分析助手。当前时间是2026年7月。你可以分析各种类型的文件，包括代码文件、文档文件、数据文件等。请根据用户的需求提供详细的分析报告。' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 4096,
        temperature: 0.7
      },
      dataType: 'json',
      sslVerify: false,
      timeout: 300000
    });

    if (res.status === 200 && res.data && res.data.choices && res.data.choices.length > 0) {
      return { code: 200, message: 'success', data: { analysis: res.data.choices[0].message.content } };
    } else {
      return { code: 500, message: 'AI服务暂时不可用，请稍后重试', data: null };
    }
  } catch (error) {
    return { code: 500, message: '服务器繁忙，请稍后重试', data: null };
  }
}

exports.main = handler;