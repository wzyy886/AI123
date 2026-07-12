'use strict';

const API_KEY = 'sk-ws-H.EMYIRMP.kUZd.MEQCICr30HCsmUwWipre9EMlky7Y2j6mN0qcfdbR7LzNfbzIAiAcSPhq7Ef8n-iHb0bQM6ZncMHpzViKptueytzBOBtDcQ';
const BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

const SUPPORTED_LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'C#'];

function createLogger(cloudFunctionName) {
  return {
    info: (message, data) => console.log(`[${cloudFunctionName}] INFO: ${message}`, data || ''),
    error: (message, error) => console.error(`[${cloudFunctionName}] ERROR: ${message}`, error?.stack || error?.message || error),
    warn: (message, data) => console.warn(`[${cloudFunctionName}] WARN: ${message}`, data || '')
  };
}

const logger = createLogger('review');

function sanitizeInput(input, maxLength = 1000) {
  if (typeof input !== 'string') return '';
  let result = input.trim();
  if (result.length > maxLength) result = result.substring(0, maxLength);
  result = result.replace(/[<>&"'`;]/g, '');
  result = result.replace(/script/gi, '');
  result = result.replace(/on\w+=/gi, '');
  return result;
}

function validateLanguage(language) {
  if (!language) return { valid: true, language: 'JavaScript' };
  const normalized = language.charAt(0).toUpperCase() + language.slice(1).toLowerCase();
  if (SUPPORTED_LANGUAGES.includes(normalized)) {
    return { valid: true, language: normalized };
  }
  return { valid: false, message: '不支持的编程语言' };
}

async function handler(event, context) {
  const { code, language, token } = event;
  const db = uniCloud.database();
  let userData = { _id: 'anonymous', username: 'anonymous' };

  logger.info('收到代码审查请求', { hasToken: !!token });

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

  if (!code || typeof code !== 'string' || !code.trim()) {
    logger.warn('无效的请求参数：code为空');
    return { code: 400, message: '请输入代码', data: null };
  }

  const langValidation = validateLanguage(language);
  const targetLanguage = langValidation.valid ? langValidation.language : sanitizeInput(language || '', 50);
  const sanitizedCode = sanitizeInput(code, 10000);

  logger.info('审查参数', { language: targetLanguage, codeLength: sanitizedCode.length });

  try {
    const prompt = `你是一个专业的代码审查专家，精通2025-2026年最新技术和最佳实践。当前时间是2026年7月。请对以下${targetLanguage || '代码'}进行全面的审查，包括：\n1. 代码质量评估\n2. 潜在问题和bug\n3. 性能优化建议\n4. 安全隐患\n5. 代码风格建议\n6. 可维护性评分\n\n代码内容：\n${sanitizedCode}`;

    const res = await uniCloud.httpclient.request(BASE_URL + '/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json' },
      data: {
        model: 'qwen-turbo',
        messages: [
          { role: 'system', content: '你是一个专业的代码审查专家，精通各种编程语言和最佳实践。当前时间是2026年7月。请使用2025-2026年最新技术标准进行审查。' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 8192,
        temperature: 0.5
      },
      dataType: 'json',
      sslVerify: false,
      timeout: 300000
    });

    if (res.status === 200 && res.data && res.data.choices && res.data.choices.length > 0) {
      const review = res.data.choices[0].message.content;
      logger.info('代码审查完成', { reviewLength: review.length });
      
      try {
        await db.collection('chat_history').add({
          userId: userData._id,
          username: userData.username || 'anonymous',
          message: '代码审查',
          response: review,
          type: 'review',
          language: targetLanguage,
          createdAt: Date.now()
        });
        logger.info('代码审查记录保存成功');
      } catch (dbErr) {
        logger.error('数据库保存失败', dbErr);
      }
      
      return { code: 200, message: 'success', data: { review: review, response: review } };
    } else {
      logger.warn('AI服务响应异常', { status: res.status });
      return { code: 500, message: 'AI服务暂时不可用，请稍后重试', data: null };
    }
  } catch (error) {
    logger.error('review云函数错误', error);
    return { code: 500, message: '服务器繁忙，请稍后重试', data: null };
  }
}

exports.main = handler;