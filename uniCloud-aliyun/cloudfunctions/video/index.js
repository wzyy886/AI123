'use strict';

function validateToken(token) {
  if (!token || typeof token !== 'string') {
    return { valid: false, message: 'Token不能为空' };
  }
  if (token.length < 32) {
    return { valid: false, message: 'Token格式不正确' };
  }
  return { valid: true, message: '' };
}

function isTokenExpired(expireAt) {
  if (!expireAt) return true;
  return Date.now() > expireAt;
}

async function handler(event, context) {
  const { action, token } = event;

  const tokenValidation = validateToken(token);
  if (!tokenValidation.valid) {
    return { code: 401, message: tokenValidation.message, data: null };
  }

  if (!action) {
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

  if (action === 'start') {
    await db.collection('video_calls').add({
      userId: userData._id,
      status: 'calling',
      startedAt: new Date().getTime()
    });

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
    await db.collection('video_calls').where({
      userId: userData._id,
      status: 'calling'
    }).update({
      status: 'ended',
      endedAt: new Date().getTime()
    });

    return {
      code: 200,
      message: 'success',
      data: {
        status: 'ended',
        message: '通话已结束'
      }
    };
  } else {
    return {
      code: 400,
      message: '无效的操作',
      data: null
    };
  }
}

exports.main = handler;