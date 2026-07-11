'use strict';

const axios = require('axios');

exports.main = async (event, context) => {
  const { action, token } = event;
  
  if (!action || !token) {
    return {
      code: 400,
      message: '参数不完整',
      data: null
    };
  }
  
  const db = uniCloud.database();
  
  try {
    const user = await db.collection('users').where({
      token: token
    }).get();
    
    if (user.data.length === 0) {
      return {
        code: 401,
        message: '未登录或登录已过期',
        data: null
      };
    }
    
    if (action === 'start') {
      await db.collection('video_calls').add({
        userId: user.data[0]._id,
        status: 'connected',
        startedAt: new Date().getTime()
      });
      
      return {
        code: 200,
        message: '通话已连接',
        data: {
          callId: Date.now().toString(),
          status: 'connected'
        }
      };
    } else if (action === 'end') {
      await db.collection('video_calls').where({
        userId: user.data[0]._id,
        status: 'connected'
      }).update({
        status: 'ended',
        endedAt: new Date().getTime()
      });
      
      return {
        code: 200,
        message: '通话已结束',
        data: {
          status: 'ended'
        }
      };
    } else {
      return {
        code: 400,
        message: '无效的操作',
        data: null
      };
    }
  } catch (error) {
    console.error('视频通话操作失败:', error);
    return {
      code: 500,
      message: '服务器内部错误',
      data: null
    };
  }
};
