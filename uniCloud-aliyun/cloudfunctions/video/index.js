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
  const { action, message, token } = event;
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

  if (action === 'start') {
    try {
      await db.collection('video_calls').add({
        userId: userData._id,
        username: userData.username || 'anonymous',
        status: 'calling',
        startedAt: Date.now()
      });
      console.log('视频通话开始记录保存成功');
    } catch (dbErr) {
      console.error('数据库保存失败:', dbErr.message);
    }
    
    return {
      code: 200,
      message: 'success',
      data: {
        status: 'calling',
        callId: Date.now().toString(),
        message: '正在连接AI助手，请稍候...'
      }
    };
  } else if (action === 'end') {
    try {
      await db.collection('video_calls').add({
        userId: userData._id,
        username: userData.username || 'anonymous',
        status: 'ended',
        startedAt: Date.now(),
        endedAt: Date.now(),
        duration: 0
      });
      console.log('视频通话结束记录保存成功');
    } catch (dbErr) {
      console.error('数据库保存失败:', dbErr.message);
    }
    
    return {
      code: 200,
      message: 'success',
      data: {
        status: 'ended',
        message: '通话已结束'
      }
    };
  } else if (action === 'message') {
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return { code: 400, message: '请输入消息', data: null };
    }

    const sanitizedMessage = sanitizeInput(message, 2000);

    try {
      const res = await uniCloud.httpclient.request(BASE_URL + '/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json' },
        data: {
          model: 'qwen-turbo',
          messages: [
            { role: 'system', content: '你是一个可爱的少女AI助手，说话温柔甜美，回答要简洁明了。当前时间是2026年7月。' },
            { role: 'user', content: sanitizedMessage }
          ],
          max_tokens: 2048,
          temperature: 0.8
        },
        dataType: 'json',
        sslVerify: false,
        timeout: 300000
      });

      if (res.status === 200 && res.data && res.data.choices && res.data.choices.length > 0) {
        const response = res.data.choices[0].message.content;
        
        try {
          await db.collection('chat_history').add({
            userId: userData._id,
            username: userData.username || 'anonymous',
            message: sanitizedMessage,
            response: response,
            createdAt: Date.now()
          });
          console.log('视频通话消息记录保存成功');
        } catch (dbErr) {
          console.error('数据库保存失败:', dbErr.message);
        }
        
        return { code: 200, message: 'success', data: { response: response } };
      } else {
        return { code: 500, message: 'AI服务暂时不可用，请稍后重试', data: null };
      }
    } catch (error) {
      console.error('video云函数错误:', error.message);
      return { code: 500, message: '服务器繁忙，请稍后重试', data: null };
    }
  } else {
    return { code: 400, message: '不支持的操作', data: null };
  }
}

exports.main = handler;