'use strict';

const API_KEY = 'sk-ws-H.EMYIRMP.kUZd.MEQCICr30HCsmUwWipre9EMlky7Y2j6mN0qcfdbR7LzNfbzIAiAcSPhq7Ef8n-iHb0bQM6ZncMHpzViKptueytzBOBtDcQ';
const BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const IMAGE_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/sync';

function createLogger(cloudFunctionName) {
  return {
    info: (message, data) => console.log(`[${cloudFunctionName}] INFO: ${message}`, data || ''),
    error: (message, error) => console.error(`[${cloudFunctionName}] ERROR: ${message}`, error?.stack || error?.message || error),
    warn: (message, data) => console.warn(`[${cloudFunctionName}] WARN: ${message}`, data || '')
  };
}

const logger = createLogger('image');

function sanitizeInput(input, maxLength = 1000) {
  if (typeof input !== 'string') return '';
  let result = input.trim();
  if (result.length > maxLength) result = result.substring(0, maxLength);
  result = result.replace(/[<>&"'`;]/g, '');
  result = result.replace(/script/gi, '');
  result = result.replace(/on\w+=/gi, '');
  return result;
}

async function generateImageByApi(imagePrompt) {
  try {
    const res = await uniCloud.httpclient.request(IMAGE_API_URL, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json' },
      data: {
        model: 'wanxiang-v1',
        prompt: imagePrompt,
        n: 1,
        size: '768x768'
      },
      dataType: 'json',
      sslVerify: false,
      timeout: 120000
    });
    
    logger.info('图片生成API响应', { status: res.status, data: res.data });
    
    if (res.status === 200 && res.data) {
      if (res.data.output && res.data.output.results && res.data.output.results.length > 0) {
        const url = res.data.output.results[0].url;
        logger.info('图片生成成功', { url });
        return url;
      }
      if (res.data.output && res.data.output.urls && res.data.output.urls.length > 0) {
        logger.info('图片生成成功(旧格式)', { url: res.data.output.urls[0] });
        return res.data.output.urls[0];
      }
    }
    
    logger.warn('图片生成返回数据格式异常', res.data);
    return '';
  } catch (error) {
    logger.error('图片生成API调用失败', error);
    return '';
  }
}

async function handler(event, context) {
  const { imageUrl, style, requirement, prompt, token } = event;
  const db = uniCloud.database();
  let userData = { _id: 'anonymous', username: 'anonymous' };

  logger.info('收到图片处理请求', { hasToken: !!token });

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

  if (!requirement && !prompt) {
    logger.warn('无效的请求参数：requirement和prompt都为空');
    return { code: 400, message: '请输入修图需求或图片描述', data: null };
  }

  const sanitizedImageUrl = sanitizeInput(imageUrl || '', 500);
  const sanitizedStyle = sanitizeInput(style || '', 50);
  const sanitizedRequirement = sanitizeInput(requirement || prompt || '', 500);

  logger.info('图片处理参数', { hasImageUrl: !!sanitizedImageUrl, style: sanitizedStyle, requirementLength: sanitizedRequirement.length });

  try {
    let suggestion = '';
    let generatedImageUrl = '';
    
    const analyzePrompt = `图片信息：${sanitizedImageUrl || '已上传图片'}\n风格：${sanitizedStyle || '原图'}\n用户需求：${sanitizedRequirement}\n\n请分析图片并给出详细的图片编辑方案。`;
    
    const analyzeRes = await uniCloud.httpclient.request(BASE_URL + '/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json' },
      data: {
        model: 'qwen-turbo',
        messages: [
          { role: 'system', content: '你是一个专业的AI图像编辑助手，精通2025-2026年最新的图像处理技术。当前时间是2026年7月。请根据用户的需求提供详细的图片编辑方案和建议。' },
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
      logger.info('图片处理方案生成成功', { suggestionLength: suggestion.length });
    }
    
    const imageGenerationPrompt = `${sanitizedStyle || '原图'}风格，${sanitizedRequirement}。高质量，高清，细节丰富。`;
    generatedImageUrl = await generateImageByApi(imageGenerationPrompt);
    
    try {
      await db.collection('image_history').add({
        userId: userData._id,
        username: userData.username || 'anonymous',
        imageUrl: sanitizedImageUrl,
        style: sanitizedStyle,
        requirement: sanitizedRequirement,
        suggestion: suggestion,
        result: suggestion,
        generatedImageUrl: generatedImageUrl,
        createdAt: Date.now()
      });
      logger.info('图片编辑记录保存成功');
    } catch (dbErr) {
      logger.error('数据库保存失败', dbErr);
    }
    
    return { code: 200, message: 'success', data: { suggestion: suggestion, response: suggestion, generatedImageUrl: generatedImageUrl } };
  } catch (error) {
    logger.error('image云函数错误', error);
    return { code: 500, message: '服务器繁忙，请稍后重试', data: null };
  }
}

exports.main = handler;