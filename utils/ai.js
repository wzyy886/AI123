const API_KEY = 'sk-ws-H.EMYIRMP.kUZd.MEQCICr30HCsmUwWipre9EMlky7Y2j6mN0qcfdbR7LzNfbzIAiAcSPhq7Ef8n-iHb0bQM6ZncMHpzViKptueytzBOBtDcQ'
const CHAT_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
const IMAGE_TASK_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis'
const IMAGE_STATUS_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/tasks/'
const IMAGE_SYNC_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/sync'

function generateImageSync(prompt) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', IMAGE_SYNC_URL, true)
    xhr.setRequestHeader('Authorization', 'Bearer ' + API_KEY)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.timeout = 600000

    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          const result = JSON.parse(xhr.responseText)
          if (result.output && result.output.results && result.output.results.length > 0) {
            resolve(result.output.results[0].url)
          } else {
            reject(new Error('图片生成失败'))
          }
        } catch (e) {
          reject(new Error('解析响应失败'))
        }
      } else {
        reject(new Error('请求失败，状态码: ' + xhr.status))
      }
    }

    xhr.onerror = () => reject(new Error('网络错误'))
    xhr.ontimeout = () => reject(new Error('请求超时'))

    xhr.send(JSON.stringify({
      model: 'wanxiang-v1',
      input: {
        prompt: prompt
      },
      parameters: {
        size: '1024x1024',
        n: 1
      }
    }))
  })
}

function callAI(message, systemPrompt, maxTokens = 8192, retryCount = 0) {
  const maxRetries = 2
  return new Promise((resolve, reject) => {
    if (!message || typeof message !== 'string') {
      reject(new Error('参数无效'))
      return
    }

    if (typeof window !== 'undefined' && navigator.onLine === false) {
      reject(new Error('网络断开，请检查网络连接'))
      return
    }

    const xhr = new XMLHttpRequest()
    xhr.open('POST', CHAT_URL, true)
    xhr.setRequestHeader('Authorization', 'Bearer ' + API_KEY)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.timeout = 600000

    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          const result = JSON.parse(xhr.responseText)
          if (result.choices && result.choices.length > 0) {
            resolve(result.choices[0].message.content)
          } else if (result.error) {
            reject(new Error('AI服务错误: ' + (result.error.message || '未知错误')))
          } else {
            reject(new Error('AI响应格式异常'))
          }
        } catch (e) {
          reject(new Error('解析响应失败'))
        }
      } else if (xhr.status >= 500 && retryCount < maxRetries) {
        setTimeout(() => {
          callAI(message, systemPrompt, maxTokens, retryCount + 1).then(resolve).catch(reject)
        }, 1000 * Math.pow(2, retryCount))
      } else {
        reject(new Error('请求失败，状态码: ' + xhr.status))
      }
    }

    xhr.onerror = () => {
      if (retryCount < maxRetries) {
        setTimeout(() => {
          callAI(message, systemPrompt, maxTokens, retryCount + 1).then(resolve).catch(reject)
        }, 1000 * Math.pow(2, retryCount))
      } else {
        reject(new Error('网络错误，请检查网络连接'))
      }
    }

    xhr.ontimeout = () => {
      if (retryCount < maxRetries) {
        setTimeout(() => {
          callAI(message, systemPrompt, maxTokens, retryCount + 1).then(resolve).catch(reject)
        }, 2000 * Math.pow(2, retryCount))
      } else {
        reject(new Error('请求超时，请稍后重试'))
      }
    }

    xhr.send(JSON.stringify({
      model: 'qwen-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: maxTokens,
      temperature: 0.7
    }))
  })
}

function requestImageTask(prompt) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', IMAGE_TASK_URL, true)
    xhr.setRequestHeader('Authorization', 'Bearer ' + API_KEY)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.timeout = 600000

    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          const result = JSON.parse(xhr.responseText)
          if (result.output && result.output.task_id) {
            resolve(result.output.task_id)
          } else {
            reject(new Error('创建图片任务失败'))
          }
        } catch (e) {
          reject(new Error('解析响应失败'))
        }
      } else {
        reject(new Error('请求失败，状态码: ' + xhr.status))
      }
    }

    xhr.onerror = () => reject(new Error('网络错误'))
    xhr.ontimeout = () => reject(new Error('请求超时'))

    xhr.send(JSON.stringify({
      model: 'wanxiang-v1',
      input: {
        prompt: prompt
      },
      parameters: {
        size: '1024x1024',
        n: 1
      }
    }))
  })
}

function getTaskStatus(taskId) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', IMAGE_STATUS_URL + taskId, true)
    xhr.setRequestHeader('Authorization', 'Bearer ' + API_KEY)
    xhr.timeout = 600000

    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          const result = JSON.parse(xhr.responseText)
          resolve(result)
        } catch (e) {
          reject(new Error('解析响应失败'))
        }
      } else {
        reject(new Error('请求失败，状态码: ' + xhr.status))
      }
    }

    xhr.onerror = () => reject(new Error('网络错误'))
    xhr.ontimeout = () => reject(new Error('请求超时'))

    xhr.send()
  })
}

function generateImage(prompt) {
  return new Promise((resolve, reject) => {
    if (!prompt || typeof prompt !== 'string') {
      reject(new Error('参数无效'))
      return
    }

    if (typeof window !== 'undefined' && navigator.onLine === false) {
      reject(new Error('网络断开，请检查网络连接'))
      return
    }

    generateImageSync(prompt).then(resolve).catch(err => {
      let pollCount = 0
      const maxPolls = 30

      requestImageTask(prompt).then(taskId => {
        const poll = () => {
          if (pollCount >= maxPolls) {
            reject(new Error('图片生成超时'))
            return
          }

          pollCount++

          getTaskStatus(taskId).then(result => {
            if (result.output && result.output.status === 'SUCCEEDED') {
              if (result.output.results && result.output.results.length > 0) {
                resolve(result.output.results[0].url)
              } else {
                reject(new Error('图片生成失败'))
              }
            } else if (result.output && result.output.status === 'FAILED') {
              reject(new Error('图片生成失败: ' + (result.output.message || '未知错误')))
            } else {
              setTimeout(poll, 3000)
            }
          }).catch(err => {
            if (pollCount < maxPolls) {
              setTimeout(poll, 3000)
            } else {
              reject(err)
            }
          })
        }

        setTimeout(poll, 2000)
      }).catch(reject)
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

export {
  callAI,
  generateImage,
  formatTime,
  formatSize
}
