'use strict';

const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

exports.main = async (event, context) => {
  const { username, password } = event;
  
  if (!username || !password) {
    return {
      code: 400,
      message: '参数不完整',
      data: null
    };
  }
  
  const db = uniCloud.database();
  
  try {
    const user = await db.collection('users').where({
      username: username
    }).get();
    
    if (user.data.length === 0) {
      return {
        code: 400,
        message: '用户名或密码错误',
        data: null
      };
    }
    
    const userData = user.data[0];
    
    if (userData.password !== hashPassword(password)) {
      return {
        code: 400,
        message: '用户名或密码错误',
        data: null
      };
    }
    
    if (userData.status !== 1) {
      return {
        code: 400,
        message: '账号已被禁用',
        data: null
      };
    }
    
    const newToken = generateToken();
    
    await db.collection('users').doc(userData._id).update({
      token: newToken,
      lastLoginAt: new Date().getTime()
    });
    
    return {
      code: 200,
      message: '登录成功',
      data: {
        userId: userData._id,
        username: userData.username,
        email: userData.email,
        token: newToken
      }
    };
  } catch (error) {
    console.error('登录失败:', error);
    return {
      code: 500,
      message: '服务器内部错误',
      data: null
    };
  }
};
