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
  const { requirement, language, framework, token } = event;
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

  const sanitizedRequirement = sanitizeInput(requirement, 2000);
  const sanitizedLanguage = sanitizeInput(language || '', 50);
  const sanitizedFramework = sanitizeInput(framework || '', 50);

  if (!requirement || !requirement.trim()) {
    return { code: 400, message: '请输入生成需求', data: null };
  }

  try {
    let prompt = `你是一个专业的AI编程助手。当前时间是2026年7月。请根据用户需求生成高质量的${sanitizedLanguage || '代码'}。`;
    if (sanitizedFramework) prompt += `使用${sanitizedFramework}框架。`;
    prompt += `\n\n用户需求：${sanitizedRequirement}\n\n请生成完整的代码实现，包括必要的注释和说明。`;

    const res = await uniCloud.httpclient.request(BASE_URL + '/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json' },
      data: {
        model: 'qwen-turbo',
        messages: [
          { role: 'system', content: '你是一个专业的AI编程助手，精通各种编程语言和框架。当前时间是2026年7月。请使用最新技术规范生成代码。' },
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
      const code = res.data.choices[0].message.content;
      
      try {
        await db.collection('chat_history').add({
          userId: userData._id,
          username: userData.username || 'anonymous',
          message: '生成代码：' + sanitizedRequirement,
          response: code,
          type: 'generate',
          language: sanitizedLanguage,
          framework: sanitizedFramework,
          createdAt: Date.now()
        });
        console.log('代码生成记录保存成功');
      } catch (dbErr) {
        console.error('数据库保存失败:', dbErr.message);
      }
      
      return { code: 200, message: 'success', data: { code: code } };
    } else {
      return { code: 500, message: 'AI服务暂时不可用，请稍后重试', data: null };
    }
  } catch (error) {
    console.error('generate云函数错误:', error.message);
    return { code: 500, message: '服务器繁忙，请稍后重试', data: null };
  }
}

exports.main = handler;