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
  const { code, language, token } = event;
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

  const sanitizedCode = sanitizeInput(code, 10000);
  const sanitizedLanguage = sanitizeInput(language || '', 50);

  if (!code || !code.trim()) {
    return { code: 400, message: '请输入代码', data: null };
  }

  try {
    const prompt = `你是一个专业的代码解释专家。当前时间是2026年7月。请对以下${sanitizedLanguage || '代码'}进行详细的解释，包括：\n1. 代码功能概述\n2. 核心逻辑分析\n3. 关键技术点说明\n4. 执行流程分析\n\n代码内容：\n${sanitizedCode}`;

    const res = await uniCloud.httpclient.request(BASE_URL + '/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json' },
      data: {
        model: 'qwen-turbo',
        messages: [
          { role: 'system', content: '你是一个专业的代码解释专家，擅长将复杂代码转化为通俗易懂的解释。当前时间是2026年7月。' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 8192,
        temperature: 0.7
      },
      dataType: 'json',
      sslVerify: false,
      timeout: 300000
    });

    if (res.status === 200 && res.data && res.data.choices && res.data.choices.length > 0) {
      const explanation = res.data.choices[0].message.content;
      
      try {
        await db.collection('chat_history').add({
          userId: userData._id,
          username: userData.username || 'anonymous',
          message: '代码解释',
          response: explanation,
          type: 'explain',
          language: sanitizedLanguage,
          createdAt: Date.now()
        });
        console.log('代码解释记录保存成功');
      } catch (dbErr) {
        console.error('数据库保存失败:', dbErr.message);
      }
      
      return { code: 200, message: 'success', data: { explanation: explanation } };
    } else {
      return { code: 500, message: 'AI服务暂时不可用，请稍后重试', data: null };
    }
  } catch (error) {
    console.error('explain云函数错误:', error.message);
    return { code: 500, message: '服务器繁忙，请稍后重试', data: null };
  }
}

exports.main = handler;