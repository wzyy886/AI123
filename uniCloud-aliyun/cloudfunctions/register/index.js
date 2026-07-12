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

function generateTokenWithExpiry(expireMinutes = 1440) {
  const token = crypto.randomBytes(32).toString('hex');
  const expireAt = Date.now() + expireMinutes * 60 * 1000;
  return { token: token, expireAt: expireAt };
}

function validateUsername(username) {
{"file_path": 