'use strict';

module.exports = {
  apiKey: 'sk-ws-H.EMYIRMP.kUZd.MEQCICr30HCsmUwWipre9EMlky7Y2j6mN0qcfdbR7LzNfbzIAiAcSPhq7Ef8n-iHb0bQM6ZncMHpzViKptueytzBOBtDcQ',
  baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  imageUrl: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/sync',
  models: {
    chat: 'qwen-turbo',
    image: 'wanxiang-v1'
  },
  defaults: {
    maxTokens: 8192,
    temperature: 0.7,
    timeout: 300000
  },
  rateLimit: {
    maxRequests: 30,
    windowMinutes: 1
  }
};
