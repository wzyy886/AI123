const MAX_RETRIES = 2

const DEVELOPMENT_MODE = false

const API_KEY = 'sk-ws-H.EMYIRMP.kUZd.MEQCICr30HCsmUwWipre9EMlky7Y2j6mN0qcfdbR7LzNfbzIAiAcSPhq7Ef8n-iHb0bQM6ZncMHpzViKptueytzBOBtDcQ'
const BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1'
const IMAGE_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/sync'

function callCloudFunction(name, data, retryCount = 0) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')

    uniCloud.callFunction({
      name: name,
      data: token ? Object.assign({ token: token }, data) : data,
      success: (res) => {
        const result = res.result
        if (result && result.code === 200) {
          resolve(result.data)
        } else if (result && result.code === 401) {
          if (DEVELOPMENT_MODE) {
            callDirectApi(name, data).then(resolve).catch(reject)
            return
          }
          reject(new Error('登录已过期，请重新登录'))
        } else if (result && result.code === 400) {
          reject(new Error(result.message || '请求参数有误'))
        } else if (result && result.code === 429) {
          reject(new Error('请求过于频繁，请稍后再试'))
        } else {
          if (DEVELOPMENT_MODE) {
            callDirectApi(name, data).then(resolve).catch(reject)
            return
          }
          reject(new Error(result?.message || '服务暂时不可用，请稍后重试'))
        }
      },
      fail: (err) => {
        if (DEVELOPMENT_MODE) {
          callDirectApi(name, data).then(resolve).catch(reject)
          return
        }
        
        if (retryCount < MAX_RETRIES) {
          const delay = 1000 * Math.pow(2, retryCount)
          setTimeout(() => {
            callCloudFunction(name, data, retryCount + 1).then(resolve).catch(reject)
          }, delay)
        } else {
          reject(new Error('网络连接失败，请检查网络后重试'))
        }
      }
    })
  })
}

function callDirectApi(name, data) {
  let endpoint = '/chat/completions'
  let requestData = {}
  
  switch (name) {
    case 'chat':
      requestData = {
        model: 'qwen-turbo',
        messages: [
          { role: 'system', content: data.systemPrompt || '你是一个精通2026年最新技术的AI助手。当前时间是2026年7月，请使用2025-2026年最新技术回答问题。' },
          { role: 'user', content: data.message }
        ],
        max_tokens: data.maxTokens || 8192,
        temperature: 0.7
      }
      break
    case 'generate':
      requestData = {
        model: 'qwen-turbo',
        messages: [
          { role: 'system', content: '你是一个精通2026年最新技术的代码生成助手。当前时间是2026年7月，请使用2025-2026年最新的技术栈生成代码。代码需要完整，包含必要的注释。' },
          { role: 'user', content: `使用${data.language || 'JavaScript'}语言，实现以下功能：${data.description}` }
        ],
        max_tokens: 4096,
        temperature: 0.7
      }
      break
    case 'review':
      requestData = {
        model: 'qwen-turbo',
        messages: [
          { role: 'system', content: '你是一个精通2026年最新技术的代码审查助手。请检查代码的正确性、安全性、性能问题和代码风格，并给出改进建议。' },
          { role: 'user', content: `请审查以下${data.language || 'JavaScript'}代码：\n\n${data.code}` }
        ],
        max_tokens: 4096,
        temperature: 0.5
      }
      break
    case 'explain':
      requestData = {
        model: 'qwen-turbo',
        messages: [
          { role: 'system', content: '你是一个精通2026年最新技术的代码解释助手。请详细解释代码的功能、执行流程和关键技术点。' },
          { role: 'user', content: `请解释以下${data.language || 'JavaScript'}代码：\n\n${data.code}` }
        ],
        max_tokens: 4096,
        temperature: 0.5
      }
      break
    case 'image':
      requestData = {
        model: 'qwen-turbo',
        messages: [
          { role: 'system', content: '你是一个专业的AI图像编辑助手。当前时间是2026年7月。你可以帮助用户进行图片处理、修图、设计等工作。请根据用户的图片描述和需求，提供详细的图片编辑方案和建议。' },
          { role: 'user', content: `图片信息：${data.imageUrl || '已上传图片'}\n风格：${data.style || '原图'}\n用户需求：${data.requirement}\n\n请提供详细的图片编辑方案和建议。` }
        ],
        max_tokens: 4096,
        temperature: 0.7
      }
      break
    case 'analyze':
      let prompt = ''
      if (data.fileContent) {
        prompt = `文件名称：${data.fileName}\n用户需求：${data.requirement}\n\n文件内容：\n${data.fileContent}`
      } else {
        prompt = `文件名称：${data.fileName}\n用户需求：${data.requirement}\n\n请根据文件名和用户需求进行分析。`
      }
      requestData = {
        model: 'qwen-turbo',
        messages: [
          { role: 'system', content: '你是一个专业的文件分析助手。当前时间是2026年7月。你可以分析各种类型的文件，包括代码文件、文档文件、数据文件等。请根据用户的需求提供详细的分析报告。' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 4096,
        temperature: 0.7
      }
      break
    case 'video':
      if (data.action === 'message') {
        requestData = {
          model: 'qwen-turbo',
          messages: [
            { role: 'system', content: '你是一个可爱的少女AI助手，说话温柔甜美，回答要简洁明了。当前时间是2026年7月。' },
            { role: 'user', content: data.message }
          ],
          max_tokens: 2048,
          temperature: 0.8
        }
      } else {
        return Promise.resolve({ response: '' })
      }
      break
    default:
      return Promise.reject(new Error('不支持的API调用'))
  }
  
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + endpoint,
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + API_KEY,
        'Content-Type': 'application/json'
      },
      data: requestData,
      timeout: 300000,
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.choices && res.data.choices.length > 0) {
          const response = res.data.choices[0].message.content
          resolve({ response: response })
        } else {
          reject(new Error('AI服务暂时不可用'))
        }
      },
      fail: (err) => {
        reject(new Error('网络连接失败'))
      }
    })
  })
}

function callAI(message, systemPrompt, maxTokens = 8192) {
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return Promise.reject(new Error('请输入有效的问题'))
  }
  if (message.length > 5000) {
    return Promise.reject(new Error('输入内容过长，请精简后重试'))
  }
  
  if (DEVELOPMENT_MODE) {
    return callDirectApi('chat', {
      message: message,
      systemPrompt: systemPrompt,
      maxTokens: maxTokens
    }).then(data => data.response)
  }
  
  return callCloudFunction('chat', {
    message: message,
    systemPrompt: systemPrompt,
    maxTokens: maxTokens
  }).then(data => data.response)
}

function generateCode(language, description) {
  if (!description || typeof description !== 'string' || description.trim() === '') {
    return Promise.reject(new Error('请输入功能描述'))
  }
  if (description.length > 2000) {
    return Promise.reject(new Error('描述内容过长，请精简后重试'))
  }
  
  if (DEVELOPMENT_MODE) {
    return callDirectApi('generate', {
      language: language,
      description: description
    }).then(data => data.response)
  }
  
  return callCloudFunction('generate', {
    language: language,
    description: description
  }).then(data => data.response)
}

function reviewCode(language, code) {
  if (!code || typeof code !== 'string' || code.trim() === '') {
    return Promise.reject(new Error('请输入待审查的代码'))
  }
  if (code.length > 10000) {
    return Promise.reject(new Error('代码内容过长，请精简后重试'))
  }
  
  if (DEVELOPMENT_MODE) {
    return callDirectApi('review', {
      language: language,
      code: code
    }).then(data => data.response)
  }
  
  return callCloudFunction('review', {
    language: language,
    code: code
  }).then(data => data.response)
}

function explainCode(language, code) {
  if (!code || typeof code !== 'string' || code.trim() === '') {
    return Promise.reject(new Error('请输入待解释的代码'))
  }
  if (code.length > 10000) {
    return Promise.reject(new Error('代码内容过长，请精简后重试'))
  }
  
  if (DEVELOPMENT_MODE) {
    return callDirectApi('explain', {
      language: language,
      code: code
    }).then(data => data.response)
  }
  
  return callCloudFunction('explain', {
    language: language,
    code: code
  }).then(data => data.response)
}

function generateImage(prompt) {
  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    return Promise.reject(new Error('请输入图片描述'))
  }
  return new Promise((resolve, reject) => {
    uni.request({
      url: IMAGE_URL,
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + API_KEY,
        'Content-Type': 'application/json'
      },
      data: {
        model: 'wanxiang-v1',
        prompt: prompt,
        n: 1,
        size: '768x768'
      },
      timeout: 120000,
      success: (res) => {
        console.log('图片生成API响应:', JSON.stringify(res, null, 2))
        
        if (res.statusCode === 200 && res.data) {
          if (res.data.output && res.data.output.results && res.data.output.results.length > 0) {
            resolve(res.data.output.results[0].url)
          } else if (res.data.output && res.data.output.urls && res.data.output.urls.length > 0) {
            resolve(res.data.output.urls[0])
          } else if (res.data.output && typeof res.data.output === 'string') {
            resolve(res.data.output)
          } else {
            reject(new Error('图片生成失败：' + JSON.stringify(res.data)))
          }
        } else {
          reject(new Error('图片生成失败，状态码：' + res.statusCode))
        }
      },
      fail: (err) => {
        reject(new Error('网络连接失败：' + JSON.stringify(err)))
      }
    })
  })
}

function formatTime() {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

function getUserFriendlyError(error) {
  const message = error?.message || String(error)
  if (message.includes('network') || message.includes('网络') || message.includes('timeout') || message.includes('超时')) {
    return '网络连接异常，请检查网络后重试'
  }
  if (message.includes('401') || message.includes('登录') || message.includes('token')) {
    return '登录已过期，请重新登录'
  }
  if (message.includes('500') || message.includes('服务器')) {
    return '服务器繁忙，请稍后重试'
  }
  if (message.includes('429')) {
    return '请求过于频繁，请稍后再试'
  }
  return message
}

function saveRecord(type, data) {
  const token = uni.getStorageSync('token')
  uniCloud.callFunction({
    name: 'saveRecord',
    data: token ? { token: token, type: type, data: data } : { type: type, data: data },
    fail: () => {}
  })
}
export {
  callAI,
  generateCode,
  reviewCode,
  explainCode,
  generateImage,
  formatTime,
  formatSize,
  getUserFriendlyError,
  saveRecord
}