'use strict';

const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

exports.main = async (event, context) => {
  const { username, password, email } = event;
  
  if (!username || !password || !email) {
    return {
      code: 400,
      message: '参数不完整',
      data: null
    };
  }
  
  if (username.length < 3 || username.length > 20) {
    return {
      code: 400,
      message: '用户名长度需在3-20之间',
      data: null
    };
  }
  
  if (password.length < 6) {
    return {
      code: 400,
      message: '密码长度至少6位',
      data: null
    };
  }
  
  const db = uniCloud.database();
  
  try {
    const existingUser = await db.collection('users').where({
      username: username
    }).get();
    
    if (existingUser.data.length > 0) {
      return {
        code: 400,
        message: '用户名已存在',
        data: null
      };
    }
    
    const existingEmail = await db.collection('users').where({
      email: email
    }).get();
    
    if (existingEmail.data.length > 0) {
      return {
        code: 400,
        message: '邮箱已被注册',
        data: null
      };
    }
    
    const token = generateToken();
    const hashedPassword = hashPassword(password);
    
    const result = await db.collection('users').add({
      username: username,
      password: hashedPassword,
      email: email,
      token: token,
      createdAt: new Date().getTime(),
      status: 1
    });
    
    return {
      code: 200,
      message: '注册成功',
      data: {
        userId: result.id,
        username: username,
        email: email,
        token: token
      }
    };
  } catch (error) {
    console.error('注册失败:', error);
    return {
      code: 500,
      message: '服务器内部错误',
      data: null
    };
  }
};
