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
    const prompt = `你是一个专业的代码审查专家。当前时间是2026年7月。请对以下${sanitizedLanguage || '代码'}进行全面的审查，包括：\n1. 代码质量评估\n2. 潜在问题和bug\n3. 性能优化建议\n4. 安全隐患\n5. 代码风格建议\n\n代码内容：\n${sanitizedCode}`;

    const res = await uniCloud.httpclient.request(BASE_URL + '/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json' },
      data: {
        model: 'qwen-turbo',
        messages: [
          { role: 'system', content: '你是一个专业的代码审查专家，精通各种编程语言和最佳实践。当前时间是2026年7月。' },
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
      const review = res.data.choices[0].message.content;
      
      try {
        await db.collection('chat_history').add({
          userId: userData._id,
          username: userData.username || 'anonymous',
          message: '代码审查',
          response: review,
          type: 'review',
          language: sanitizedLanguage,
          createdAt: Date.now()
        });
        console.log('代码审查记录保存成功');
      } catch (dbErr) {
        console.error('数据库保存失败:', dbErr.message);
      }
      
      return { code: 200, message: 'success', data: { review: review } };
    } else {
      return { code: 500, message: 'AI服务暂时不可用，请稍后重试', data: null };
    }
  } catch (error) {
    console.error('review云函数错误:', error.message);
    return { code: 500, message: '服务器繁忙，请稍后重试', data: null };
  }
}

exports.main = handler;