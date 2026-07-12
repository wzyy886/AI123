'use strict';

const crypto = require('crypto');

function generateSalt(length = 16) {
  if (length === null || length === undefined || typeof length !== 'number') length = 16;
  if (length <= 0) throw new Error('盐值长度必须大于0');
  return crypto.randomBytes(length).toString('hex');
}

function hashPassword(password, salt = null) {
  if (!password || typeof password !== 'string') throw new Error('密码不能为空');
  const actualSalt = salt || generateSalt();
  const hash = crypto.createHash('sha256').update(password + actualSalt).digest('hex');
  return { hash: hash, salt: actualSalt };
}

function verifyPassword(password, hash, salt) {
  if (!password || !hash || !salt) return false;
  const computedHash = crypto.createHash('sha256').update(password + salt).digest('hex');
  return computedHash === hash;
}

function generateTokenWithExpiry(expireMinutes = 1440) {
  const token = crypto.randomBytes(32).toString('hex');
  const expireAt = Date.now() + expireMinutes * 60 * 1000;
  return { token: token, expireAt: expireAt };
}

function isTokenExpired(expireAt) {
  if (!expireAt) return true;
  return Date.now() > expireAt;
}

function validateUsername(username) {
  if (!username || typeof username !== 'string') return { valid: false, message: '用户名不能为空' };
  if (username.length < 3 || username.length > 20) return { valid: false, message: '用户名长度需在3-20之间' };
  const validPattern = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
  if (!validPattern.test(username)) return { valid: false, message: '用户名只能包含字母、数字、下划线和中文' };
  return { valid: true, message: '' };
}

function validatePassword(password) {
  if (!password || typeof password !== 'string') return { valid: false, message: '密码不能为空' };
  if (password.length < 6) return { valid: false, message: '密码长度至少6位' };
  if (password.length > 50) return { valid: false, message: '密码长度不能超过50位' };
  return { valid: true, message: '' };
}

function validateToken(token) {
  if (!token || typeof token !== 'string') return { valid: false, message: 'Token不能为空' };
  if (token.length < 32) return { valid: false, message: 'Token格式不正确' };
  return { valid: true, message: '' };
}

async function handler(event, context) {
  const { username, password, token } = event;

  if (token) {
    const tokenValidation = validateToken(token);
    if (!tokenValidation.valid) {
      return { code: 400, message: tokenValidation.message, data: null };
    }

    const db = uniCloud.database();
    const user = await db.collection('users').where({ token: token }).get();
    
    if (user.data.length === 0) {
      return { code: 401, message: '登录已过期，请重新登录', data: null };
    }

    const userData = user.data[0];
    if (isTokenExpired(userData.tokenExpireAt)) {
      return { code: 401, message: '登录已过期，请重新登录', data: null };
    }

    if (userData.status !== 1) {
      return { code: 400, message: '账号已被禁用', data: null };
    }

    return {
      code: 200,
      message: '登录成功',
      data: {
        userId: userData._id,
        username: userData.username,
        email: userData.email,
        token: token
      }
    };
  }

  const usernameValidation = validateUsername(username);
  if (!usernameValidation.valid) {
    return { code: 400, message: usernameValidation.message, data: null };
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return { code: 400, message: passwordValidation.message, data: null };
  }

  const db = uniCloud.database();
  const user = await db.collection('users').where({ username: username }).get();

  if (user.data.length === 0) {
    return { code: 400, message: '用户名或密码错误', data: null };
  }

  const userData = user.data[0];

  if (!userData.salt) {
    const oldHash = crypto.createHash('sha256').update(password).digest('hex');
    if (userData.password !== oldHash) {
      return { code: 400, message: '用户名或密码错误', data: null };
    }
    const { hash: newHash, salt: newSalt } = hashPassword(password);
    await db.collection('users').doc(userData._id).update({
      password: newHash,
      salt: newSalt
    }, { validateSchema: false });
  } else {
    if (!verifyPassword(password, userData.password, userData.salt)) {
      return { code: 400, message: '用户名或密码错误', data: null };
    }
  }

  if (userData.status !== 1) {
    return { code: 400, message: '账号已被禁用', data: null };
  }

  const { token: newToken, expireAt } = generateTokenWithExpiry(1440);

  await db.collection('users').doc(userData._id).update({
    token: newToken,
    tokenExpireAt: expireAt,
    lastLoginAt: new Date().getTime()
  }, { validateSchema: false });

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
}

exports.main = handler;