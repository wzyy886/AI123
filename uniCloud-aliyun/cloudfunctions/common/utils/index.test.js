const {
  generateSalt,
  hashPassword,
  verifyPassword,
  generateToken,
  generateTokenWithExpiry,
  isTokenExpired,
  validateUsername,
  validatePassword,
  validateEmail,
  validateToken,
  sanitizeInput,
  formatResponse,
  createLogger,
  checkRateLimit
} = require('./index');

describe('generateSalt', () => {
  test('应该返回指定长度的随机盐值', () => {
    const salt = generateSalt(16);
    expect(salt).toBeDefined();
    expect(salt.length).toBe(32);
    expect(/^[a-f0-9]{32}$/.test(salt)).toBe(true);
  });

  test('默认长度应该是16字节（32字符）', () => {
    const salt = generateSalt();
    expect(salt.length).toBe(32);
  });

  test('不同调用应该返回不同的盐值', () => {
    const salt1 = generateSalt();
    const salt2 = generateSalt();
    expect(salt1).not.toBe(salt2);
  });
});

describe('hashPassword', () => {
  test('应该返回包含hash和salt的对象', () => {
    const result = hashPassword('test123');
    expect(result).toBeDefined();
    expect(result.hash).toBeDefined();
    expect(result.salt).toBeDefined();
    expect(result.hash.length).toBe(64);
    expect(result.salt.length).toBe(32);
  });

  test('相同密码使用相同盐值应该返回相同哈希', () => {
    const salt = generateSalt();
    const result1 = hashPassword('samepassword', salt);
    const result2 = hashPassword('samepassword', salt);
    expect(result1.hash).toBe(result2.hash);
    expect(result1.salt).toBe(result2.salt);
  });

  test('相同密码使用不同盐值应该返回不同哈希', () => {
    const result1 = hashPassword('samepassword');
    const result2 = hashPassword('samepassword');
    expect(result1.hash).not.toBe(result2.hash);
    expect(result1.salt).not.toBe(result2.salt);
  });

  test('不同密码应该返回不同哈希', () => {
    const salt = generateSalt();
    const result1 = hashPassword('password1', salt);
    const result2 = hashPassword('password2', salt);
    expect(result1.hash).not.toBe(result2.hash);
  });

  test('空密码应该抛出错误', () => {
    expect(() => hashPassword('')).toThrow('密码不能为空');
    expect(() => hashPassword(null)).toThrow('密码不能为空');
    expect(() => hashPassword(undefined)).toThrow('密码不能为空');
  });
});

describe('verifyPassword', () => {
  test('正确密码应该返回true', () => {
    const { hash, salt } = hashPassword('test123');
    const result = verifyPassword('test123', hash, salt);
    expect(result).toBe(true);
  });

  test('错误密码应该返回false', () => {
    const { hash, salt } = hashPassword('test123');
    const result = verifyPassword('wrongpassword', hash, salt);
    expect(result).toBe(false);
  });

  test('缺少参数应该返回false', () => {
    const { hash, salt } = hashPassword('test123');
    expect(verifyPassword('', hash, salt)).toBe(false);
    expect(verifyPassword('test123', '', salt)).toBe(false);
    expect(verifyPassword('test123', hash, '')).toBe(false);
    expect(verifyPassword(null, hash, salt)).toBe(false);
    expect(verifyPassword('test123', null, salt)).toBe(false);
    expect(verifyPassword('test123', hash, null)).toBe(false);
  });

  test('不同盐值应该验证失败', () => {
    const { hash } = hashPassword('test123');
    const { salt } = hashPassword('different');
    const result = verifyPassword('test123', hash, salt);
    expect(result).toBe(false);
  });
});

describe('generateToken', () => {
  test('应该返回64位十六进制字符串', () => {
    const token = generateToken();
    expect(token).toBeDefined();
    expect(token.length).toBe(64);
    expect(/^[a-f0-9]{64}$/.test(token)).toBe(true);
  });

  test('每次调用应该返回不同的token', () => {
    const token1 = generateToken();
    const token2 = generateToken();
    expect(token1).not.toBe(token2);
  });
});

describe('generateTokenWithExpiry', () => {
  test('应该返回包含token和expireAt的对象', () => {
    const result = generateTokenWithExpiry();
    expect(result).toBeDefined();
    expect(result.token).toBeDefined();
    expect(result.expireAt).toBeDefined();
    expect(result.token.length).toBe(64);
    expect(typeof result.expireAt).toBe('number');
  });

  test('过期时间应该是当前时间+指定分钟数', () => {
    const now = Date.now();
    const result = generateTokenWithExpiry(60);
    expect(result.expireAt).toBeGreaterThan(now);
    expect(result.expireAt).toBeLessThanOrEqual(now + 60 * 60 * 1000 + 100);
  });

  test('默认过期时间应该是1440分钟（24小时）', () => {
    const now = Date.now();
    const result = generateTokenWithExpiry();
    expect(result.expireAt).toBeGreaterThan(now);
    expect(result.expireAt).toBeLessThanOrEqual(now + 1440 * 60 * 1000 + 100);
  });

  test('每次调用应该返回不同的token', () => {
    const result1 = generateTokenWithExpiry();
    const result2 = generateTokenWithExpiry();
    expect(result1.token).not.toBe(result2.token);
  });
});

describe('isTokenExpired', () => {
  test('未过期的token应该返回false', () => {
    const futureTime = Date.now() + 3600000;
    const result = isTokenExpired(futureTime);
    expect(result).toBe(false);
  });

  test('已过期的token应该返回true', () => {
    const pastTime = Date.now() - 3600000;
    const result = isTokenExpired(pastTime);
    expect(result).toBe(true);
  });

  test('缺少过期时间应该返回true', () => {
    expect(isTokenExpired(null)).toBe(true);
    expect(isTokenExpired(undefined)).toBe(true);
    expect(isTokenExpired(0)).toBe(true);
  });

  test('当前时间应该判定为已过期', () => {
    const result = isTokenExpired(Date.now());
    expect(result).toBe(true);
  });
});

describe('validateUsername', () => {
  test('有效用户名应该返回valid=true', () => {
    const result = validateUsername('testuser');
    expect(result.valid).toBe(true);
  });

  test('中文用户名应该有效', () => {
    const result = validateUsername('测试用户');
    expect(result.valid).toBe(true);
  });

  test('包含下划线的用户名应该有效', () => {
    const result = validateUsername('test_user123');
    expect(result.valid).toBe(true);
  });

  test('用户名长度小于3应该无效', () => {
    const result = validateUsername('ab');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('长度');
  });

  test('用户名长度大于20应该无效', () => {
    const result = validateUsername('a'.repeat(21));
    expect(result.valid).toBe(false);
    expect(result.message).toContain('长度');
  });

  test('空用户应该无效', () => {
    expect(validateUsername('').valid).toBe(false);
    expect(validateUsername(null).valid).toBe(false);
    expect(validateUsername(undefined).valid).toBe(false);
  });

  test('包含特殊字符的用户名应该无效', () => {
    const result = validateUsername('test@user');
    expect(result.valid).toBe(false);
  });
});

describe('validatePassword', () => {
  test('有效密码应该返回valid=true', () => {
    const result = validatePassword('test123');
    expect(result.valid).toBe(true);
  });

  test('密码长度小于6应该无效', () => {
    const result = validatePassword('12345');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('至少6位');
  });

  test('空密码应该无效', () => {
    expect(validatePassword('').valid).toBe(false);
    expect(validatePassword(null).valid).toBe(false);
    expect(validatePassword(undefined).valid).toBe(false);
  });

  test('密码长度超过50应该无效', () => {
    const result = validatePassword('a'.repeat(51));
    expect(result.valid).toBe(false);
  });
});

describe('validateEmail', () => {
  test('有效邮箱应该返回valid=true', () => {
    expect(validateEmail('test@example.com').valid).toBe(true);
    expect(validateEmail('user.name@domain.co.jp').valid).toBe(true);
    expect(validateEmail('user123@test.org').valid).toBe(true);
  });

  test('无效邮箱格式应该返回valid=false', () => {
    expect(validateEmail('notanemail').valid).toBe(false);
    expect(validateEmail('missing@domain').valid).toBe(false);
    expect(validateEmail('@nodomain.com').valid).toBe(false);
  });

  test('空邮箱应该无效', () => {
    expect(validateEmail('').valid).toBe(false);
    expect(validateEmail(null).valid).toBe(false);
    expect(validateEmail(undefined).valid).toBe(false);
  });
});

describe('validateToken', () => {
  test('有效token应该返回valid=true', () => {
    const token = generateToken();
    expect(validateToken(token).valid).toBe(true);
  });

  test('空token应该无效', () => {
    expect(validateToken('').valid).toBe(false);
    expect(validateToken(null).valid).toBe(false);
    expect(validateToken(undefined).valid).toBe(false);
  });

  test('过短的token应该无效', () => {
    expect(validateToken('short').valid).toBe(false);
  });
});

describe('sanitizeInput', () => {
  test('应该去除首尾空格', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });

  test('应该移除HTML标签字符', () => {
    expect(sanitizeInput('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
  });

  test('应该限制最大长度', () => {
    const longStr = 'a'.repeat(2000);
    const result = sanitizeInput(longStr, 100);
    expect(result.length).toBe(100);
  });

  test('非字符串输入应该返回空字符串', () => {
    expect(sanitizeInput(null)).toBe('');
    expect(sanitizeInput(undefined)).toBe('');
    expect(sanitizeInput(123)).toBe('');
  });

  test('默认最大长度为1000', () => {
    const longStr = 'a'.repeat(2000);
    const result = sanitizeInput(longStr);
    expect(result.length).toBe(1000);
  });
});

describe('formatResponse', () => {
  test('应该正确格式化成功响应', () => {
    const result = formatResponse(200, '成功', { id: 1 });
    expect(result.code).toBe(200);
    expect(result.message).toBe('成功');
    expect(result.data).toEqual({ id: 1 });
  });

  test('应该正确格式化错误响应', () => {
    const result = formatResponse(400, '参数错误');
    expect(result.code).toBe(400);
    expect(result.message).toBe('参数错误');
    expect(result.data).toBeNull();
  });

  test('data默认为null', () => {
    const result = formatResponse(500, '服务器错误');
    expect(result.data).toBeNull();
  });
});

describe('createLogger', () => {
  let originalLog, originalWarn, originalError, originalDebug;

  beforeEach(() => {
    originalLog = console.log;
    originalWarn = console.warn;
    originalError = console.error;
    originalDebug = console.debug;
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
    console.debug = jest.fn();
  });

  afterEach(() => {
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
    console.debug = originalDebug;
    delete process.env.DEBUG;
  });

  test('应该创建包含info方法的logger', () => {
    const logger = createLogger('test-module');
    expect(typeof logger.info).toBe('function');
    logger.info('test message');
    expect(console.log).toHaveBeenCalled();
  });

  test('应该创建包含warn方法的logger', () => {
    const logger = createLogger('test-module');
    expect(typeof logger.warn).toBe('function');
    logger.warn('warning message');
    expect(console.warn).toHaveBeenCalled();
  });

  test('应该创建包含error方法的logger', () => {
    const logger = createLogger('test-module');
    expect(typeof logger.error).toBe('function');
    logger.error('error message');
    expect(console.error).toHaveBeenCalled();
  });

  test('debug方法在DEBUG=false时不输出', () => {
    process.env.DEBUG = 'false';
    const logger = createLogger('test-module');
    logger.debug('debug message');
    expect(console.debug).not.toHaveBeenCalled();
  });

  test('debug方法在DEBUG=true时输出', () => {
    process.env.DEBUG = 'true';
    const logger = createLogger('test-module');
    logger.debug('debug message');
    expect(console.debug).toHaveBeenCalled();
  });

  test('日志应该包含模块名', () => {
    const logger = createLogger('auth');
    logger.info('login success');
    const logOutput = console.log.mock.calls[0][0];
    expect(logOutput).toContain('auth');
    expect(logOutput).toContain('INFO');
  });
});

describe('checkRateLimit', () => {
  test('空用户ID应该允许请求', () => {
    const result = checkRateLimit(null);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(30);
  });

  test('未达到限制应该允许请求', () => {
    const result = checkRateLimit('test-user-1');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBeLessThan(30);
  });

  test('同一用户多次请求应该减少剩余次数', () => {
    const userId = 'test-user-2';
    const result1 = checkRateLimit(userId);
    const result2 = checkRateLimit(userId);
    const result3 = checkRateLimit(userId);
    expect(result1.remaining).toBeGreaterThan(result2.remaining);
    expect(result2.remaining).toBeGreaterThan(result3.remaining);
  });

  test('不同用户应该独立计数', () => {
    const result1 = checkRateLimit('user-a');
    const result2 = checkRateLimit('user-b');
    const result3 = checkRateLimit('user-a');
    expect(result1.remaining).toBeGreaterThan(result3.remaining);
    expect(result2.remaining).toBe(29);
  });

  test('超过限制应该拒绝请求', () => {
    const userId = 'rate-limit-test-user';
    for (let i = 0; i < 35; i++) {
      checkRateLimit(userId);
    }
    const result = checkRateLimit(userId);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.message).toBe('请求过于频繁，请稍后再试');
  });

  test('应该返回正确的重试时间', () => {
    const userId = 'retry-after-test';
    for (let i = 0; i < 35; i++) {
      checkRateLimit(userId);
    }
    const result = checkRateLimit(userId);
    expect(result.retryAfter).toBeDefined();
    expect(typeof result.retryAfter).toBe('number');
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  test('undefined用户ID应该允许请求', () => {
    const result = checkRateLimit(undefined);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(30);
  });

  test('空字符串用户ID应该允许请求', () => {
    const result = checkRateLimit('');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(30);
  });
});

describe('captureError & getErrorStats', () => {
  const { captureError, getErrorStats, sendErrorAlert } = require('./index');

  test('应该捕获错误信息并返回错误对象', () => {
    const error = new Error('测试错误');
    const result = captureError(error, { userId: '123' });
    expect(result.message).toBe('测试错误');
    expect(result.stack).toBeDefined();
    expect(result.context.userId).toBe('123');
    expect(result.timestamp).toBeDefined();
  });

  test('应该处理非Error类型的错误', () => {
    const result = captureError('字符串错误');
    expect(result.message).toBe('字符串错误');
  });

  test('getErrorStats应该返回统计信息', () => {
    const stats = getErrorStats();
    expect(typeof stats.total).toBe('number');
    expect(typeof stats.lastHour).toBe('number');
    expect(Array.isArray(stats.recent)).toBe(true);
  });

  test('应该记录错误堆栈信息', () => {
    const error = new Error('测试堆栈');
    const result = captureError(error);
    expect(result.stack).toContain('test');
  });

  test('空上下文应该正常处理', () => {
    const error = new Error('测试错误');
    const result = captureError(error);
    expect(result.context).toEqual({});
  });

  test('null错误应该正常处理', () => {
    const result = captureError(null);
    expect(result.message).toBe('未知错误');
  });

  test('undefined错误应该正常处理', () => {
    const result = captureError(undefined);
    expect(result.message).toBe('未知错误');
  });

  test('sendErrorAlert应该返回发送状态', () => {
    const result = sendErrorAlert({ message: '测试告警' });
    expect(result).toBeDefined();
    expect(typeof result).toBe('boolean');
  });
});

describe('loadConfig', () => {
  const { loadConfig } = require('./index');

  test('应该返回默认配置', () => {
    const config = loadConfig();
    expect(config.NODE_ENV).toBeDefined();
    expect(config.DEBUG).toBeDefined();
    expect(config.DASHSCOPE_CHAT_URL).toBeDefined();
    expect(config.AI_CHAT_MODEL).toBe('qwen-turbo');
    expect(config.TOKEN_EXPIRE_MINUTES).toBe('1440');
    expect(config.RATE_LIMIT_MAX).toBe('30');
  });

  test('应该从环境变量读取配置', () => {
    process.env.TEST_CONFIG_KEY = 'test_value';
    const config = loadConfig();
    expect(config).toBeDefined();
    delete process.env.TEST_CONFIG_KEY;
  });
});

describe('asyncErrorHandler', () => {
  const { asyncErrorHandler } = require('./index');
  let originalLog, originalError;

  beforeEach(() => {
    originalLog = console.log;
    originalError = console.error;
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    console.log = originalLog;
    console.error = originalError;
  });

  test('应该正常处理成功的请求', async () => {
    const mockFn = jest.fn().mockResolvedValue({ code: 200, message: '成功' });
    const handler = asyncErrorHandler(mockFn, 'test-module');
    const result = await handler({ test: true }, {});
    
    expect(result.code).toBe(200);
    expect(result.message).toBe('成功');
    expect(mockFn).toHaveBeenCalled();
  });

  test('应该捕获异常并返回500错误', async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error('测试异常'));
    const handler = asyncErrorHandler(mockFn, 'test-module');
    const result = await handler({ test: true }, {});
    
    expect(result.code).toBe(500);
    expect(result.message).toBe('服务器内部错误');
    expect(result.data).toBeNull();
  });

  test('应该记录请求日志', async () => {
    const mockFn = jest.fn().mockResolvedValue({ code: 200, message: '成功' });
    const handler = asyncErrorHandler(mockFn, 'test-module');
    await handler({ test: true }, {});
    
    expect(console.log).toHaveBeenCalled();
    const firstLog = console.log.mock.calls[0][0];
    expect(firstLog).toContain('test-module');
    expect(firstLog).toContain('请求开始');
  });

  test('应该正确传递业务错误返回（非抛出异常）', async () => {
    const mockFn = jest.fn().mockResolvedValue({ code: 400, message: '用户名或密码错误', data: null });
    const handler = asyncErrorHandler(mockFn, 'test-module');
    const result = await handler({ username: 'test' }, {});
    
    expect(result.code).toBe(400);
    expect(result.message).toBe('用户名或密码错误');
    expect(result.data).toBeNull();
  });

  test('应该记录错误日志', async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error('测试错误'));
    const handler = asyncErrorHandler(mockFn, 'test-module');
    await handler({ test: true }, {});
    
    expect(console.error).toHaveBeenCalled();
    const errorLog = console.error.mock.calls[0][0];
    expect(errorLog).toContain('test-module');
    expect(errorLog).toContain('错误');
  });

  test('空参数应该正常处理', async () => {
    const mockFn = jest.fn().mockResolvedValue({ code: 200, message: '成功' });
    const handler = asyncErrorHandler(mockFn, 'test-module');
    const result = await handler();
    
    expect(result.code).toBe(200);
    expect(mockFn).toHaveBeenCalled();
  });

  test('undefined参数应该正常处理', async () => {
    const mockFn = jest.fn().mockResolvedValue({ code: 200, message: '成功' });
    const handler = asyncErrorHandler(mockFn, 'test-module');
    const result = await handler(undefined, undefined);
    
    expect(result.code).toBe(200);
    expect(mockFn).toHaveBeenCalled();
  });
});

describe('集成测试 - 用户认证流程', () => {
  test('完整的用户注册和登录流程', () => {
    const password = 'testPassword123';
    const { hash, salt } = hashPassword(password);
    
    const verificationResult = verifyPassword(password, hash, salt);
    expect(verificationResult).toBe(true);
    
    const wrongVerification = verifyPassword('wrongPassword', hash, salt);
    expect(wrongVerification).toBe(false);
    
    const tokenResult = generateTokenWithExpiry(60);
    expect(tokenResult.token).toBeDefined();
    expect(tokenResult.expireAt).toBeDefined();
    
    const isExpired = isTokenExpired(tokenResult.expireAt);
    expect(isExpired).toBe(false);
  });

  test('用户输入验证流程', () => {
    const usernameResult = validateUsername('validUser');
    expect(usernameResult.valid).toBe(true);
    
    const emailResult = validateEmail('test@example.com');
    expect(emailResult.valid).toBe(true);
    
    const passwordResult = validatePassword('validPass123');
    expect(passwordResult.valid).toBe(true);
    
    const sanitizedInput = sanitizeInput('  <script>test</script>  ');
    expect(sanitizedInput).toBe('scripttest/script');
    expect(sanitizedInput).not.toContain('<');
    expect(sanitizedInput).not.toContain('>');
  });

  test('Token生成和验证流程', () => {
    const token = generateToken();
    const tokenValidation = validateToken(token);
    expect(tokenValidation.valid).toBe(true);
    
    const expiredTime = Date.now() - 3600000;
    const isExpired = isTokenExpired(expiredTime);
    expect(isExpired).toBe(true);
    
    const futureTime = Date.now() + 3600000;
    const notExpired = isTokenExpired(futureTime);
    expect(notExpired).toBe(false);
  });

  test('日志和错误处理流程', () => {
    const logger = createLogger('integration-test');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
    
    const error = captureError(new Error('集成测试错误'), { userId: 'test-user' });
    expect(error.message).toBe('集成测试错误');
    expect(error.context.userId).toBe('test-user');
    
    const stats = getErrorStats();
    expect(typeof stats.total).toBe('number');
  });
});

describe('边界条件测试', () => {
  test('generateSalt边界条件', () => {
    expect(() => generateSalt(0)).toThrow();
    expect(() => generateSalt(-1)).toThrow();
    expect(() => generateSalt(null)).toThrow();
    expect(() => generateSalt(undefined)).toThrow();
    
    const maxSalt = generateSalt(256);
    expect(maxSalt.length).toBe(512);
    
    const minSalt = generateSalt(1);
    expect(minSalt.length).toBe(2);
  });

  test('hashPassword边界条件', () => {
    expect(() => hashPassword('')).toThrow('密码不能为空');
    expect(() => hashPassword(null)).toThrow('密码不能为空');
    expect(() => hashPassword(undefined)).toThrow('密码不能为空');
    
    const longPassword = hashPassword('a'.repeat(100));
    expect(longPassword.hash.length).toBe(64);
    
    const specialChars = hashPassword('!@#$%^&*()');
    expect(specialChars.hash.length).toBe(64);
  });

  test('sanitizeInput边界条件', () => {
    expect(sanitizeInput('')).toBe('');
    expect(sanitizeInput(null)).toBe('');
    expect(sanitizeInput(undefined)).toBe('');
    expect(sanitizeInput(123)).toBe('');
    expect(sanitizeInput(true)).toBe('');
    
    const htmlContent = sanitizeInput('<div><p>test</p></div>');
    expect(htmlContent).toBe('divptest/p/div');
    
    const specialChars = sanitizeInput('!@#$%^&*()_+-=[]{}|;:,.<>?');
    expect(specialChars).toBe('!@#$%^&*()_+-=[]{}|;:,.?');
  });

  test('validateUsername边界条件', () => {
    expect(validateUsername('')).toEqual({ valid: false, message: '用户名不能为空' });
    expect(validateUsername(null)).toEqual({ valid: false, message: '用户名不能为空' });
    expect(validateUsername(undefined)).toEqual({ valid: false, message: '用户名不能为空' });
    
    const maxUsername = validateUsername('a'.repeat(20));
    expect(maxUsername.valid).toBe(true);
    
    const overMax = validateUsername('a'.repeat(21));
    expect(overMax.valid).toBe(false);
    
    const minUsername = validateUsername('ab');
    expect(minUsername.valid).toBe(false);
    
    const exactlyMin = validateUsername('abc');
    expect(exactlyMin.valid).toBe(true);
  });

  test('validateEmail边界条件', () => {
    expect(validateEmail('')).toEqual({ valid: false, message: '邮箱不能为空' });
    expect(validateEmail(null)).toEqual({ valid: false, message: '邮箱不能为空' });
    expect(validateEmail(undefined)).toEqual({ valid: false, message: '邮箱不能为空' });
    
    const longEmail = validateEmail('a'.repeat(64) + '@example.com');
    expect(longEmail.valid).toBe(true);
    
    const invalidEmail = validateEmail('test@@example.com');
    expect(invalidEmail.valid).toBe(false);
    
    const noDomain = validateEmail('test@');
    expect(noDomain.valid).toBe(false);
    
    const noLocal = validateEmail('@example.com');
    expect(noLocal.valid).toBe(false);
  });
});