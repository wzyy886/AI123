# Prompt日志

本文档记录了项目开发过程中使用AI工具时的关键Prompt及其输出结果。

---

## Prompt 1: 项目架构设计

**用途**: 设计AI助手项目的整体架构

**Prompt**:
```
我需要开发一个基于uni-app x的AI智能助手应用，包含以下功能：
1. AI问答（使用阿里云通义千问API）
2. 文件分析（上传文件后AI分析）
3. AI P图（上传图片后AI处理）
4. 视频通话（模拟AI视频通话）
5. 用户系统（登录/注册）

请设计项目的整体架构，包括：
- 前端页面结构
- 后端云函数设计
- API接口规范
- 数据库设计
- 安全机制

技术栈：uni-app x (Vue 3 + UTS) + uniCloud + 阿里云通义千问API
```

**输出**: 完整的项目架构文档，包含页面路由、云函数列表、数据库表结构、安全方案

**应用位置**: 项目初始化阶段，用于指导整体开发

---

## Prompt 2: 前端页面开发

**用途**: 开发前端页面代码

**Prompt**:
```
请为AI助手项目开发问答页面(index.uvue)，要求：
1. 豆包风格界面设计（渐变背景、毛玻璃效果）
2. 支持用户输入问题并发送
3. 显示AI回答结果
4. 快速标签功能（点击快速提问）
5. 消息气泡区分用户（白色带阴影）和AI（毛玻璃透明）
6. 输入框固定在底部，带毛玻璃效果
7. 加载动画（全屏遮罩+旋转加载圈）
8. 历史记录自动保存（使用uni.setStorageSync）
9. 字数统计实时显示
10. 移动端响应式设计

技术栈：uni-app x + UTS + SCSS
```

**输出**: 完整的问答页面代码

**应用位置**: [pages/index/index.uvue](file:///d:/wzzy/wzy/ai/pages/index/index.uvue)

---

## Prompt 3: 云函数开发

**用途**: 开发后端云函数

**Prompt**:
```
请为AI助手项目开发chat云函数，要求：
1. 接收用户消息和系统提示词
2. 调用阿里云通义千问API（qwen-turbo）
3. API Key存储在uni-config-center配置文件中
4. 使用uniCloud.httpclient进行HTTP调用
5. 添加输入验证（类型校验、长度限制、特殊字符过滤）
6. 添加Token认证（用户登录后获取，默认24小时过期）
7. 添加请求频率限制（每分钟30次）
8. 统一返回格式 { code, message, data }
9. 添加结构化日志（使用createLogger）
10. 添加错误处理（使用asyncErrorHandler）

参考URL: https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
请求体格式: { model, messages, max_tokens, temperature }
响应解析: res.data.output.choices[0].message.content
```

**输出**: 完整的chat云函数代码

**应用位置**: [uniCloud-aliyun/cloudfunctions/chat/index.js](file:///d:/wzzy/wzy/ai/uniCloud-aliyun/cloudfunctions/chat/index.js)

---

## Prompt 4: 安全机制实现

**用途**: 实现安全机制

**Prompt**:
```
请为AI助手项目实现安全机制，包括：
1. 密码加盐哈希（SHA256 + 随机盐值）
2. Token过期机制（24小时过期）
3. Token校验（验证有效性和过期时间）
4. 输入过滤（移除特殊字符）
5. 请求频率限制（每分钟30次）
6. 编程语言白名单验证（8种支持的语言）
7. 统一错误处理中间件（asyncErrorHandler）
8. 结构化日志系统（createLogger）
9. 错误监控（captureError、getErrorStats、sendErrorAlert）

请将这些功能封装到 common/utils/index.js 中，并提供Jest单元测试。
```

**输出**: 完整的安全工具模块和单元测试

**应用位置**: [uniCloud-aliyun/cloudfunctions/common/utils/index.js](file:///d:/wzzy/wzy/ai/uniCloud-aliyun/cloudfunctions/common/utils/index.js)

---

## Prompt 5: CI/CD配置

**用途**: 配置GitHub Actions CI/CD

**Prompt**:
```
请为AI助手项目配置GitHub Actions CI/CD流水线，要求：
1. 两个job：build和test
2. build job：代码检出、Node.js环境配置（20.x）、云函数语法检查、JSON配置验证、文档完整性检查
3. test job：代码检出、Node.js环境配置（20.x）、Jest单元测试（含覆盖率）、测试失败不中断流程
4. 触发条件：push到main分支
5. 简化配置，移除不必要的步骤（如GitHub Pages部署、版本矩阵）

请输出完整的 .github/workflows/ci.yml 配置文件。
```

**输出**: 完整的CI/CD配置文件

**应用位置**: [.github/workflows/ci.yml](file:///d:/wzzy/wzy/ai/.github/workflows/ci.yml)

---

## Prompt 6: 代码生成功能

**用途**: 开发代码生成页面和云函数

**Prompt**:
```
请为AI助手项目开发代码生成功能：
1. 前端页面（generate/index.uvue）：
   - 选择编程语言（8种：JavaScript、TypeScript、Python、Java、Go、Rust、C++、C#）
   - 输入功能描述
   - 生成代码并显示结果
   - 复制结果按钮
   - 字数统计实时显示
   - 加载动画

2. 后端云函数（generate/index.js）：
   - 接收描述和语言参数
   - 调用通义千问API生成代码
   - 添加编程语言白名单验证
   - 添加输入验证和Token校验
   - 统一返回格式

请输出完整的前端页面和后端云函数代码。
```

**输出**: 完整的代码生成功能实现

**应用位置**: 
- [pages/generate/index.uvue](file:///d:/wzzy/wzy/ai/pages/generate/index.uvue)
- [uniCloud-aliyun/cloudfunctions/generate/index.js](file:///d:/wzzy/wzy/ai/uniCloud-aliyun/cloudfunctions/generate/index.js)

---

## Prompt 7: 错误处理优化

**用途**: 优化错误处理和用户体验

**Prompt**:
```
请为AI助手项目优化错误处理，要求：
1. 前端所有异步操作包裹try/catch
2. 添加全局错误处理机制
3. 使用getUserFriendlyError函数转换技术错误为友好提示
4. 云函数调用失败时添加回退机制（直接调用阿里云API）
5. 登录失败时自动进入离线模式（生成本地Token）
6. 网络请求添加重试机制（最多2次，指数退避）
7. 所有页面添加加载状态显示
8. 统一错误提示风格

请更新 utils/ai.js 和 pages/login/index.uvue 实现这些功能。
```

**输出**: 完整的错误处理优化代码

**应用位置**: 
- [utils/ai.js](file:///d:/wzzy/wzy/ai/utils/ai.js)
- [pages/login/index.uvue](file:///d:/wzzy/wzy/ai/pages/login/index.uvue)

---

## Prompt 8: 代码审查和文档

**用途**: 代码审查和文档生成

**Prompt**:
```
请对AI助手项目进行代码审查，生成详细的审查报告，包括：
1. 安全性评估（API Key管理、密码安全、Token机制、输入验证）
2. 代码质量评估（代码重复、可维护性、类型安全）
3. 工程化评估（CI/CD、单元测试、日志、错误监控）
4. 健壮性评估（错误处理、异常场景覆盖）
5. 问题清单（严重程度、位置、建议）
6. 综合评分

同时生成以下文档：
1. README.md（项目说明、安装指南、功能特性）
2. API.md（接口文档、参数说明、安全机制）
3. summary.md（个人实训总结报告）

要求使用2025-2026年最新技术描述项目。
```

**输出**: 完整的代码审查报告和项目文档

**应用位置**: 
- [code_review.md](file:///d:/wzzy/wzy/ai/code_review.md)
- [README.md](file:///d:/wzzy/wzy/ai/README.md)
- [API.md](file:///d:/wzzy/wzy/ai/API.md)
- [summary.md](file:///d:/wzzy/wzy/ai/summary.md)

---

## Prompt 9: 单元测试编写

**用途**: 编写单元测试用例

**Prompt**:
```
请为AI助手项目的公共工具模块（common/utils/index.js）编写Jest单元测试，要求：
1. 测试覆盖所有核心函数
2. 至少70个测试用例
3. 测试覆盖率88%+
4. 包含边界条件测试
5. 包含集成测试（用户认证流程）

需要测试的函数：
- hashPassword, verifyPassword, generateSalt
- generateToken, generateTokenWithExpiry, isTokenExpired
- validateUsername, validatePassword, validateEmail, validateToken
- sanitizeInput, formatResponse
- createLogger, captureError, loadConfig, asyncErrorHandler
- checkRateLimit

请输出完整的测试文件。
```

**输出**: 完整的单元测试文件

**应用位置**: [uniCloud-aliyun/cloudfunctions/common/utils/index.test.js](file:///d:/wzzy/wzy/ai/uniCloud-aliyun/cloudfunctions/common/utils/index.test.js)

---

## Prompt 10: API文档自动生成

**用途**: 创建OpenAPI规范文件

**Prompt**:
```
请为AI助手项目创建OpenAPI 3.0.1规范文件（openapi.json），要求：
1. 包含所有9个云函数接口的完整定义
2. 定义安全认证方式（Bearer Auth）
3. 定义请求参数、响应格式、错误码
4. 支持使用Swagger UI、Redoc等工具自动生成交互式API文档
5. 包含components定义（schemas、securitySchemes）

接口列表：register、login、chat、analyze、image、video、generate、review、explain

请输出完整的openapi.json文件。
```

**输出**: 完整的OpenAPI规范文件

**应用位置**: [openapi.json](file:///d:/wzzy/wzy/ai/openapi.json)

---

## Prompt使用总结

| 序号 | Prompt名称 | 用途 | 应用位置 |
|------|-----------|------|----------|
| 1 | 项目架构设计 | 设计项目整体架构 | 项目初始化 |
| 2 | 前端页面开发 | 开发问答页面 | pages/index/index.uvue |
| 3 | 云函数开发 | 开发chat云函数 | cloudfunctions/chat/index.js |
| 4 | 安全机制实现 | 实现安全工具模块 | cloudfunctions/common/utils/index.js |
| 5 | CI/CD配置 | 配置GitHub Actions | .github/workflows/ci.yml |
| 6 | 代码生成功能 | 开发代码生成功能 | pages/generate/index.uvue, cloudfunctions/generate/index.js |
| 7 | 错误处理优化 | 优化错误处理机制 | utils/ai.js, pages/login/index.uvue |
| 8 | 代码审查和文档 | 生成审查报告和文档 | code_review.md, README.md, API.md, summary.md |
| 9 | 单元测试编写 | 编写单元测试 | cloudfunctions/common/utils/index.test.js |
| 10 | API文档自动生成 | 创建OpenAPI规范文件 | openapi.json |

---

## AI工具运用心得

### 优势
1. **快速原型开发**: AI可以快速生成完整的代码框架，大大缩短开发周期
2. **代码质量保障**: AI生成的代码通常遵循最佳实践，减少低级错误
3. **知识储备丰富**: AI精通最新技术栈，可以提供2025-2026年最新技术方案
4. **文档生成能力**: AI可以自动生成高质量的文档，包括API文档、README等
5. **问题排查效率**: AI可以快速定位问题并提供解决方案

### 注意事项
1. **安全审查**: AI生成的代码需要进行安全审查，特别是涉及敏感信息的部分
2. **测试验证**: AI生成的代码需要进行充分的测试，确保功能正确性
3. **代码优化**: AI生成的代码可能存在冗余，可以进行进一步优化
4. **上下文理解**: AI可能无法完全理解项目的上下文，需要提供详细的Prompt
5. **版本控制**: AI生成的代码需要进行版本控制，便于追踪和回滚

### 最佳实践
1. **提供详细的Prompt**: 包含技术栈、功能要求、设计规范等信息
2. **分步骤开发**: 将大型任务拆分为多个小任务，逐步完成
3. **代码审查**: 对AI生成的代码进行审查和优化
4. **测试驱动**: 先编写测试用例，再开发功能代码
5. **持续迭代**: 根据反馈不断优化和改进代码