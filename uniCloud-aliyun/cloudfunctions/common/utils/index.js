'use strict';

const crypto = require('crypto');

function createLogger(cloudFunctionName) {
  return {
    info: (message, data) => console.log(`[${cloudFunctionName}] INFO: ${message}`, data || ''),
    error: (message, error) => console.error(`[${cloudFunctionName}] ERROR: ${message}`, error?.stack || error?.message || error),
    warn: (message, data) => console.warn(`[${cloudFunctionName}] WARN: ${message}`, data || '')
  };
}

function sanitizeInput(input, maxLength = 1000) {
  if (typeof input !== 'string') return '';
  let result = input.trim();
  if (result.length > maxLength) result = result.substring(0, maxLength);
  result = result.replace(/[<>&"'`;]/g, '');
  result = result.replace(/script/gi, '');
  result = result.replace(/on\w+=/gi, '');
  return result;
}

function hashPassword(password, salt) {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

function generateTokenWithExpiry(expireMinutes = 1440) {
  const token = crypto.randomBytes(32).toString('hex');
  const expireAt = Date.now() + expireMinutes * 60 * 1000;
  return { token: token, expireAt: expireAt };
}

function generateSalt(length = 16) {
  return crypto.randomBytes(length).toString('hex');
}

const SUPPORTED_LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'C#'];

function validateLanguage(language) {
  if (!language) return 'JavaScript';
  const normalized = language.charAt(0).toUpperCase() + language.slice(1).toLowerCase();
  if (SUPPORTED_LANGUAGES.includes(normalized)) {
    return normalized;
  }
  if (normalized === 'Js') return 'JavaScript';
  if (normalized === 'Ts') return 'TypeScript';
  if (normalized === 'Cpp') return 'C++';
  return 'JavaScript';
}

async function getUserByToken(db, token) {
  if (!token) return { _id: 'anonymous', username: 'anonymous' };
  try {
    const user = await db.collection('users').where({ token: token }).get();
    if (user.data.length > 0) {
      return user.data[0];
    }
  } catch (e) {
    console.warn('查询用户失败', e);
  }
  return { _id: 'anonymous', username: 'anonymous' };
}

module.exports = {
  createLogger,
  sanitizeInput,
  hashPassword,
  generateTokenWithExpiry,
  generateSalt,
  validateLanguage,
  getUserByToken,
  SUPPORTED_LANGUAGES
};
