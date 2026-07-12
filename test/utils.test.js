const crypto = require('crypto');

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

describe('sanitizeInput', () => {
  test('should trim input', () => {
    expect(sanitizeInput('  test  ')).toBe('test');
  });

  test('should remove HTML tags', () => {
    expect(sanitizeInput('<script>alert(1)</script>')).toBe('alert(1)');
  });

  test('should remove special characters', () => {
    expect(sanitizeInput("test&\"';`<>")).toBe('test');
  });

  test('should remove script keyword', () => {
    expect(sanitizeInput('Javascript code')).toBe('Javacode');
  });

  test('should remove event handlers', () => {
    expect(sanitizeInput('onclick=alert(1)')).toBe('alert(1)');
  });

  test('should truncate long input', () => {
    const longInput = 'a'.repeat(1500);
    expect(sanitizeInput(longInput).length).toBe(1000);
  });

  test('should handle empty string', () => {
    expect(sanitizeInput('')).toBe('');
  });

  test('should handle null and undefined', () => {
    expect(sanitizeInput(null)).toBe('');
    expect(sanitizeInput(undefined)).toBe('');
  });
});

describe('hashPassword', () => {
  test('should generate consistent hash for same input', () => {
    const hash1 = hashPassword('password123', 'salt123');
    const hash2 = hashPassword('password123', 'salt123');
    expect(hash1).toBe(hash2);
  });

  test('should generate different hash for different password', () => {
    const hash1 = hashPassword('password123', 'salt123');
    const hash2 = hashPassword('password456', 'salt123');
    expect(hash1).not.toBe(hash2);
  });

  test('should generate different hash for different salt', () => {
    const hash1 = hashPassword('password123', 'salt123');
    const hash2 = hashPassword('password123', 'salt456');
    expect(hash1).not.toBe(hash2);
  });

  test('should return 64 character hex string', () => {
    const hash = hashPassword('password123', 'salt123');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]{64}$/i);
  });
});

describe('generateTokenWithExpiry', () => {
  test('should generate 64 character token', () => {
    const result = generateTokenWithExpiry();
    expect(result.token).toHaveLength(64);
    expect(result.token).toMatch(/^[a-f0-9]{64}$/i);
  });

  test('should generate unique tokens', () => {
    const token1 = generateTokenWithExpiry().token;
    const token2 = generateTokenWithExpiry().token;
    expect(token1).not.toBe(token2);
  });

  test('should set correct expiry time', () => {
    const now = Date.now();
    const result = generateTokenWithExpiry(60);
    expect(result.expireAt).toBeGreaterThan(now + 59 * 60 * 1000);
    expect(result.expireAt).toBeLessThan(now + 61 * 60 * 1000);
  });
});

describe('validateLanguage', () => {
  test('should return normalized language name', () => {
    expect(validateLanguage('javascript')).toBe('JavaScript');
    expect(validateLanguage('python')).toBe('Python');
    expect(validateLanguage('JAVA')).toBe('Java');
  });

  test('should handle shorthand aliases', () => {
    expect(validateLanguage('js')).toBe('JavaScript');
    expect(validateLanguage('ts')).toBe('TypeScript');
    expect(validateLanguage('cpp')).toBe('C++');
  });

  test('should return default for unsupported language', () => {
    expect(validateLanguage('php')).toBe('JavaScript');
    expect(validateLanguage('ruby')).toBe('JavaScript');
  });

  test('should return default for empty input', () => {
    expect(validateLanguage('')).toBe('JavaScript');
    expect(validateLanguage(null)).toBe('JavaScript');
    expect(validateLanguage(undefined)).toBe('JavaScript');
  });

  test('should support all listed languages', () => {
    SUPPORTED_LANGUAGES.forEach(lang => {
      expect(validateLanguage(lang.toLowerCase())).toBe(lang);
      expect(validateLanguage(lang.toUpperCase())).toBe(lang);
    });
  });
});

describe('getUserFriendlyError', () => {
  function getUserFriendlyError(error) {
    const message = error?.message || String(error);
    if (message.includes('network') || message.includes('网络') || message.includes('timeout') || message.includes('超时')) {
      return '网络连接异常，请检查网络后重试';
    }
    if (message.includes('401') || message.includes('登录') || message.includes('token')) {
      return '登录已过期，请重新登录';
    }
    if (message.includes('500') || message.includes('服务器')) {
      return '服务器繁忙，请稍后重试';
    }
    if (message.includes('429')) {
      return '请求过于频繁，请稍后再试';
    }
    return message;
  }

  test('should return network error message', () => {
    expect(getUserFriendlyError(new Error('网络连接失败'))).toBe('网络连接异常，请检查网络后重试');
    expect(getUserFriendlyError(new Error('timeout'))).toBe('网络连接异常，请检查网络后重试');
  });

  test('should return auth error message', () => {
    expect(getUserFriendlyError(new Error('401 Unauthorized'))).toBe('登录已过期，请重新登录');
    expect(getUserFriendlyError(new Error('token expired'))).toBe('登录已过期，请重新登录');
  });

  test('should return server error message', () => {
    expect(getUserFriendlyError(new Error('500 Internal Server Error'))).toBe('服务器繁忙，请稍后重试');
    expect(getUserFriendlyError(new Error('服务器错误'))).toBe('服务器繁忙，请稍后重试');
  });

  test('should return rate limit message', () => {
    expect(getUserFriendlyError(new Error('429 Too Many Requests'))).toBe('请求过于频繁，请稍后再试');
  });

  test('should return original message for other errors', () => {
    expect(getUserFriendlyError(new Error('自定义错误'))).toBe('自定义错误');
  });
});
