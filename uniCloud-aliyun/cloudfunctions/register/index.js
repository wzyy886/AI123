'use strict';

const crypto = require('crypto');

function hashPassword(password, salt) {
  if (!password || typeof password !== 'string') {
    throw new Error('密码不能为空');
  }
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256').update(password + actualSalt).digest('hex');
  return { hash: hash, salt: actualSalt };
}

function generateTokenWithExpiry(expireMinutes) {
  const token = crypto.randomBytes(32).toString('hex');
  const expireAt = Date.now() + (expireMinutes || 1440) * 60 * 1000;
  return { token: token, expireAt: expireAt };
}

function validateUsername(username) {
  if (!username || typeof username !== 'string') {
    return { valid: false, message: '用户名不能为空' };
  }
  if (username.length < 3 || username.length > 20) {
    return { valid: false, message: '用户名长度需在3-20之间' };
  }
  const validPattern = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
  if (!validPattern.test(username)) {
    return { valid: false, message: '用户名只能包含字母、数字、下划线和中文' };
  }
  return { valid: true, message: '' };
}

function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: '密码不能为空' };
  }
  if (password.length < 6) {
    return { valid: false, message: '密码长度至少6位' };
  }
  return { valid: true, message: '' };
}

function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: '邮箱不能为空' };
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return { valid: false, message: '邮箱格式不正确' };
  }
  return { valid: true, message: '' };
}

async function handler(event, context) {
  const { username, password, email } = event;

  const usernameValidation = validateUsername(username);
  if (!usernameValidation.valid) {
    return { code: 400, message: usernameValidation.message, data: null };
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return { code: 400, message: passwordValidation.message, data: null };
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return { code: 400, message: emailValidation.message, data: null };
  }

  const db = uniCloud.database();

  const existingUser = await db.collection('users').where({
    username: username
  }).get();

  if (existingUser.data.length > 0) {
    return { code: 400, message: '用户名已存在', data: null };
  }

  const existingEmail = await db.collection('users').where({
    email: email
  }).get();

  if (existingEmail.data.length > 0) {
    return { code: 400, message: '邮箱已被注册', data: null };
  }

  const { hash: hashedPassword, salt } = hashPassword(password);
  const { token, expireAt } = generateTokenWithExpiry(1440);

  const result = await db.collection('users').add({
    username: username,
    password: hashedPassword,
    salt: salt,
    email: email,
    token: token,
    tokenExpireAt: expireAt,
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
}

exports.main = handler;