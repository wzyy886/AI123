const crypto = require('crypto');

function sanitizeInput(input, maxLength) {
  if (typeof input !== 'string') return '';
  var maxLen = maxLength || 1000;
  var result = input.trim();
  if (result.length > maxLen) result = result.substring(0, maxLen);
  result = result.replace(/[<>&"'`;]/g, '');
  result = result.replace(/script/gi, '');
  result = result.replace(/on\w+=/gi, '');
  return result;
}

function hashPassword(password, salt) {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

function generateTokenWithExpiry(expireMinutes) {
  var mins = expireMinutes || 1440;
  var token = crypto.randomBytes(32).toString('hex');
  var expireAt = Date.now() + mins * 60 * 1000;
  return { token: token, expireAt: expireAt };
}

var SUPPORTED_LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'C#'];

function validateLanguage(language) {
  if (!language) return 'JavaScript';
  var normalized = language.charAt(0).toUpperCase() + language.slice(1).toLowerCase();
  if (SUPPORTED_LANGUAGES.indexOf(normalized) !== -1) {
    return normalized;
  }
  if (normalized === 'Js') return 'JavaScript';
  if (normalized === 'Ts') return 'TypeScript';
  if (normalized === 'Cpp') return 'C++';
  return 'JavaScript';
}

function getUserFriendlyError(error) {
  var message = '';
  if (error && error.message) {
    message = error.message;
  } else {
    message = String(error);
  }
  if (message.indexOf('network') !== -1 || message.indexOf('网络') !== -1 || message.indexOf('timeout') !== -1 || message.indexOf('超时') !== -1) {
    return '网络连接异常，请检查网络后重试';
  }
  if (message.indexOf('401') !== -1 || message.indexOf('登录') !== -1 || message.indexOf('token') !== -1) {
    return '登录已过期，请重新登录';
  }
  if (message.indexOf('500') !== -1 || message.indexOf('服务器') !== -1) {
    return '服务器繁忙，请稍后重试';
  }
  if (message.indexOf('429') !== -1) {
    return '请求过于频繁，请稍后再试';
  }
  return message;
}

test('sanitizeInput should trim input', function() {
  expect(sanitizeInput('  test  ')).toBe('test');
});

test('sanitizeInput should remove HTML angle brackets', function() {
  expect(sanitizeInput('<div>hello</div>')).toBe('divhello/div');
});

test('sanitizeInput should remove special characters', function() {
  expect(sanitizeInput("test&\"';`<>")).toBe('test');
});

test('sanitizeInput should remove script keyword', function() {
  expect(sanitizeInput('Javascript code')).toBe('Java code');
});

test('sanitizeInput should remove event handlers', function() {
  expect(sanitizeInput('onclick=alert(1)')).toBe('alert(1)');
});

test('sanitizeInput should truncate long input', function() {
  var longInput = '';
  for (var i = 0; i < 1500; i++) longInput += 'a';
  expect(sanitizeInput(longInput).length).toBe(1000);
});

test('sanitizeInput should handle empty string', function() {
  expect(sanitizeInput('')).toBe('');
});

test('sanitizeInput should handle null and undefined', function() {
  expect(sanitizeInput(null)).toBe('');
  expect(sanitizeInput(undefined)).toBe('');
});

test('hashPassword should generate consistent hash', function() {
  var hash1 = hashPassword('password123', 'salt123');
  var hash2 = hashPassword('password123', 'salt123');
  expect(hash1).toBe(hash2);
});

test('hashPassword should generate different hash for different password', function() {
  var hash1 = hashPassword('password123', 'salt123');
  var hash2 = hashPassword('password456', 'salt123');
  expect(hash1).not.toBe(hash2);
});

test('hashPassword should generate different hash for different salt', function() {
  var hash1 = hashPassword('password123', 'salt123');
  var hash2 = hashPassword('password123', 'salt456');
  expect(hash1).not.toBe(hash2);
});

test('hashPassword should return 64 character hex string', function() {
  var hash = hashPassword('password123', 'salt123');
  expect(hash.length).toBe(64);
  expect(hash).toMatch(/^[a-f0-9]{64}$/i);
});

test('generateTokenWithExpiry should generate 64 character token', function() {
  var result = generateTokenWithExpiry();
  expect(result.token.length).toBe(64);
  expect(result.token).toMatch(/^[a-f0-9]{64}$/i);
});

test('generateTokenWithExpiry should generate unique tokens', function() {
  var token1 = generateTokenWithExpiry().token;
  var token2 = generateTokenWithExpiry().token;
  expect(token1).not.toBe(token2);
});

test('generateTokenWithExpiry should set correct expiry time', function() {
  var now = Date.now();
  var result = generateTokenWithExpiry(60);
  expect(result.expireAt).toBeGreaterThan(now + 59 * 60 * 1000);
  expect(result.expireAt).toBeLessThan(now + 61 * 60 * 1000);
});

test('validateLanguage should return normalized language name', function() {
  expect(validateLanguage('javascript')).toBe('JavaScript');
  expect(validateLanguage('python')).toBe('Python');
  expect(validateLanguage('JAVA')).toBe('Java');
});

test('validateLanguage should handle shorthand aliases', function() {
  expect(validateLanguage('js')).toBe('JavaScript');
  expect(validateLanguage('ts')).toBe('TypeScript');
  expect(validateLanguage('cpp')).toBe('C++');
});

test('validateLanguage should return default for unsupported language', function() {
  expect(validateLanguage('php')).toBe('JavaScript');
  expect(validateLanguage('ruby')).toBe('JavaScript');
});

test('validateLanguage should return default for empty input', function() {
  expect(validateLanguage('')).toBe('JavaScript');
  expect(validateLanguage(null)).toBe('JavaScript');
  expect(validateLanguage(undefined)).toBe('JavaScript');
});

test('getUserFriendlyError should return network error message', function() {
  expect(getUserFriendlyError(new Error('网络连接失败'))).toBe('网络连接异常，请检查网络后重试');
  expect(getUserFriendlyError(new Error('timeout'))).toBe('网络连接异常，请检查网络后重试');
});

test('getUserFriendlyError should return auth error message', function() {
  expect(getUserFriendlyError(new Error('401 Unauthorized'))).toBe('登录已过期，请重新登录');
  expect(getUserFriendlyError(new Error('token expired'))).toBe('登录已过期，请重新登录');
});

test('getUserFriendlyError should return server error message', function() {
  expect(getUserFriendlyError(new Error('500 Internal Server Error'))).toBe('服务器繁忙，请稍后重试');
  expect(getUserFriendlyError(new Error('服务器错误'))).toBe('服务器繁忙，请稍后重试');
});

test('getUserFriendlyError should return rate limit message', function() {
  expect(getUserFriendlyError(new Error('429 Too Many Requests'))).toBe('请求过于频繁，请稍后再试');
});

test('getUserFriendlyError should return original message for other errors', function() {
  expect(getUserFriendlyError(new Error('自定义错误'))).toBe('自定义错误');
});
