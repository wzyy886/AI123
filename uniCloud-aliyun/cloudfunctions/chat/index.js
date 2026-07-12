'use strict';

const API_KEY = 'sk-ws-H.EMYIRMP.kUZd.MEQCICr30HCsmUwWipre9EMlky7Y2j6mN0qcfdbR7LzNfbzIAiAcSPhq7Ef8n-iHb0bQM6ZncMHpzViKptueytzBOBtDcQ';
const BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

function createLogger(cloudFunctionName) {
  return {
    info: (message, data) => console.log(`[${cloudFunctionName}] INFO: ${message}`, data || ''),
    error: (message, error) => console.error(`[${cloudFunctionName}] ERROR: ${message}`, error?.stack || error?.message || error),
    warn: (message, data) => console.warn(`[${cloudFunctionName}] WARN: ${message}`, data || '')
  };
}

const logger = createLogger('chat');

function sanitizeInput(input, maxLength = 1000) {
  if (typeof input !== 'string') return '';
  let result = input.trim();
  if (result.length > maxLength) result = result.substring(0, maxLength);
  result = result.replace(/[<>&"'`;]/g, '');
  result = result.replace(/script/gi, '');
  result = result.replace(/on\w+=/gi, '');
  return result;
}

function getSystemPrompt(customPrompt) {
  const basePrompt = '你是一个精通2026年最新技术的AI助手。当前时间是2026年7月，请使用2025-2026年最新技术回答问题。回答要准确、专业、有深度。';
  return customPrompt ? sanitizeInput(customPrompt, 2000) : basePrompt;
}

async function handler(event, context) {
  const { message, systemPrompt, maxTokens, token } = event;
  const db = uniCloud.database();
  let userData = { _id: 'anonymous', username: 'anonymous' };

  logger.info('收到请求', { userId: userData._id, hasToken: !!token });

  if (token) {
    try {
      const user = await db.collection('users').where({ token: token }).get();
      if (user.data.length > 0) {
        userData = user.data[0];
        logger.info('用户已认证', { userId: userData._id, username: userData.username });
      }
    } catch (e) {
      logger.warn('查询用户失败', e);
    }
  }

  if (!message || typeof message !== 'string' || message.trim() === '') {
    logger.warn('无效的请求参数：message为空');
    return { code: 400, message: '请输入有效的问题', data: null };
  }

  const sanitizedMessage = sanitizeInput(message, 5000);
  logger.info('消息长度', { length: sanitizedMessage.length });

  try {
    const res = await uniCloud.httpclient.request(BASE_URL + '/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json' },
      data: {
        model: 'qwen-turbo',
        messages: [
          { role: 'system', content: getSystemPrompt(systemPrompt) },
          { role: 'user', content: sanitizedMessage }
        ],
        max_tokens: maxTokens || 8192,
        temperature: 0.7
      },
      dataType: 'json',
      sslVerify: false,
      timeout: 300000
    });

    if (res.status === 200 && res.data && res.data.choices && res.data.choices.length > 0) {
      const response = res.data.choices[0].message.content;
      logger.info('AI响应成功', { responseLength: response.length });
      
      try {
        await db.collection('chat_history').add({
          userId: userData._id,
          username: userData.username || 'anonymous',
          message: sanitizedMessage,
          response: response,
          type: 'chat',
          createdAt: Date.now()
        });
        logger.info('聊天记录保存成功');
      } catch (dbErr) {
        logger.error('数据库保存失败', dbErr);
      }
      
      return { code: 200, message: 'success', data: { response: response } };
    } else {
      logger.warn('AI服务响应异常', { status: res.status, data: res.data });
      return { code: 500, message: 'AI服务暂时不可用，请稍后重试', data: null };
    }
  } catch (error) {
    logger.error('chat云函数错误', error);
    return { code: 500, message: '服务器繁忙，请稍后重试', data: null };
  }
}

exports.main = handler;