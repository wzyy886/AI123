const {
  hashPassword,
  generateToken,
  validateUsername,
  validatePassword,
  validateEmail,
  validateToken,
  sanitizeInput,
  formatResponse,
  createLogger
} = require('./index');

describe('hashPassword', () => {
  test('应该返回64位十六进制字符串(SHA256)', () => {
    const result = hashPassword('test123');
    expect(result).toBeDefined();
    expect(result.length).toBe(64);
    expect(/^[a-f0-9]{64}$/.test(result)).toBe(true);
  });

  test('相同密码应该返回相同哈希', () => {
    const hash1 = hashPassword('samepassword');
    const hash2 = hashPassword('samepassword');
    expect(hash1).toBe(hash2);
  });

  test('不同密码应该返回不同哈希', () => {
    const hash1 = hashPassword('password1');
    const hash2 = hashPassword('password2');
    expect(hash1).not.toBe(hash2);
  });

  test('空密码应该抛出错误', () => {
    expect(() => hashPassword('')).toThrow('密码不能为空');
    expect(() => hashPassword(null)).toThrow('密码不能为空');
    expect(() => hashPassword(undefined)).toThrow('密码不能为空');
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

describe('captureError & getErrorStats', () => {
  const { captureError, getErrorStats } = require('./index');

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
});

describe('loadConfig', () => {
  const { loadConfig } = require('./index');

  test('应该返回默认配置', () => {
    const config = loadConfig();
    expect(config.NODE_ENV).toBeDefined();
    expect(config.DEBUG).toBeDefined();
    expect(config.DASHSCOPE_CHAT_URL).toBeDefined();
    expect(config.AI_CHAT_MODEL).toBe('qwen-turbo');
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
});
