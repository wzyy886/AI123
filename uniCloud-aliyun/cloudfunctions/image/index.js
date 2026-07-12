'use strict';

const API_KEY = 'sk-ws-H.EMYIRMP.kUZd.MEQCICr30HCsmUwWipre9EMlky7Y2j6mN0qcfdbR7LzNfbzIAiAcSPhq7Ef8n-iHb0bQM6ZncMHpzViKptueytzBOBtDcQ';
const BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

function sanitizeInput(input, maxLength = 1000) {
  if (typeof input !== 'string') return '';
  let result = input.trim();
  if (result.length > maxLength) result = result.substring(0, maxLength);
  result = result.replace(/[<>]/g, '');
  return result;
}

async function handler(event, context) {
  const { imageUrl, style, requirement, prompt, token } = event;
  const db = uniCloud.database();
  let userData = { _id: 'anonymous', username: 'anonymous' };

  if (token) {
    try {
      const user = await db.collection('users').where({ token: token }).get();
      if (user.data.length > 0) userData = user.data[0];
    } catch (e) {
      console.log('查询用户失败:', e.message);
    }
  }

  const sanitizedImageUrl = sanitizeInput(imageUrl || '', 500);
  const sanitizedStyle = sanitizeInput(style || '', 50);
  const sanitizedRequirement = sanitizeInput(requirement || '', 500);

  if (!requirement && !prompt) {
    return { code: 400, message: '请输入修图需求或图片描述', data: null };
  }

  try {
    let suggestion = '';
    
    const analyzePrompt = `图片信息：${sanitizedImageUrl || '已上传图片'}\n风格：${sanitizedStyle || '原图'}\n用户需求：${sanitizedRequirement}\n\n请分析图片并给出详细的图片编辑方案。`;
    
    const analyzeRes = await uniCloud.httpclient.request(BASE_URL + '/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json' },
      data: {
        model: 'qwen-turbo',
        messages: [
          { role: 'system', content: '你是一个专业的AI图像编辑助手。当前时间是2026年7月。请根据用户的需求提供详细的图片编辑方案和建议。' },
          { role: 'user', content: analyzePrompt }
        ],
        max_tokens: 4096,
        temperature: 0.7
      },
      dataType: 'json',
      sslVerify: false,
      timeout: 300000
    });
    
    if (analyzeRes.status === 200 && analyzeRes.data && analyzeRes.data.choices && analyzeRes.data.choices.length > 0) {
      suggestion = analyzeRes.data.choices[0].message.content;
    }
    
    try {
      await db.collection('image_history').add({
        userId: userData._id,
        username: userData.username || 'anonymous',
        imageUrl: sanitizedImageUrl,
        style: sanitizedStyle,
        requirement: sanitizedRequirement,
        suggestion: suggestion,
        createdAt: Date.now()
      });
      console.log('图片编辑记录保存成功');
    } catch (dbErr) {
      console.error('数据库保存失败:', dbErr.message);
    }
    
    return { code: 200, message: 'success', data: { suggestion: suggestion, generatedImageUrl: '' } };
  } catch (error) {
    console.error('image云函数错误:', error.message);
    return { code: 500, message: '服务器繁忙，请稍后重试', data: null };
  }
}

exports.main = handler;