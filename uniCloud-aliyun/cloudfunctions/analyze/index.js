'use strict';

const API_KEY = 'sk-ws-H.EMYIRMP.kUZd.MEQCICr30HCsmUwWipre9EMlky7Y2j6mN0qcfdbR7LzNfbzIAiAcSPhq7Ef8n-iHb0bQM6ZncMHpzViKptueytzBOBtDcQ';
const BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

const fileTypeMap = {
  '.pdf': 'PDF文档', '.doc': 'Word文档', '.docx': 'Word文档',
  '.xls': 'Excel表格', '.xlsx': 'Excel表格', '.ppt': 'PPT演示文稿',
  '.pptx': 'PPT演示文稿', '.jpg': '图片文件', '.jpeg': '图片文件',
  '.png': '图片文件', '.gif': 'GIF动图', '.bmp': '图片文件',
  '.mp4': '视频文件', '.avi': '视频文件', '.mov': '视频文件',
  '.mp3': '音频文件', '.wav': '音频文件', '.zip': '压缩文件',
  '.rar': '压缩文件', '.7z': '压缩文件', '.txt': '文本文件',
  '.js': 'JavaScript文件', '.ts': 'TypeScript文件', '.py': 'Python文件',
  '.java': 'Java文件', '.go': 'Go文件', '.rs': 'Rust文件',
  '.vue': 'Vue文件', '.jsx': 'React文件', '.html': 'HTML文件',
  '.css': 'CSS文件', '.json': 'JSON文件', '.md': 'Markdown文件'
};

function sanitizeInput(input, maxLength = 1000) {
  if (typeof input !== 'string') return '';
  let result = input.trim();
  if (result.length > maxLength) result = result.substring(0, maxLength);
  result = result.replace(/[<>]/g, '');
  return result;
}

async function handler(event, context) {
  const { fileName, fileContent, requirement, token } = event;
  const db = uniCloud.database();
  let userData = { _id: 'anonymous', username: 'anonymous' };

  if (token) {
    try {
      const user = await db.collection('users').where({ token: token }).get();
      if (user.data.length > 0) userData = user.data[0];
    } catch (e) {
      console.log('查询用户失败:', e.message);
    }
  }

  const sanitizedFileName = sanitizeInput(fileName, 200);
  const sanitizedRequirement = sanitizeInput(requirement, 500);

  let prompt = '';
  if (fileContent) {
    const sanitizedContent = sanitizeInput(fileContent, 5000);
    prompt = `文件名称：${sanitizedFileName}\n用户需求：${sanitizedRequirement}\n\n文件内容：\n${sanitizedContent}`;
  } else {
    const ext = sanitizedFileName.toLowerCase().substring(sanitizedFileName.lastIndexOf('.'));
    const fileType = fileTypeMap[ext] || '其他文件';
    prompt = `文件名称：${sanitizedFileName}\n文件类型：${fileType}\n用户需求：${sanitizedRequirement}\n\n请分析这个文件并给出建议。`;
  }

  try {
    const res = await uniCloud.httpclient.request(BASE_URL + '/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json' },
      data: {
        model: 'qwen-turbo',
        messages: [
          { role: 'system', content: '你是一个专业的文件分析助手。当前时间是2026年7月。请对文件进行详细、完整的分析，包括文件结构、功能特点、代码逻辑、潜在问题和优化建议等，回答要全面细致，不要简略。' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 4096,
        temperature: 0.7
      },
      dataType: 'json',
      sslVerify: false,
      timeout: 300000
    });

    if (res.status === 200 && res.data && res.data.choices && res.data.choices.length > 0) {
      const analysis = res.data.choices[0].message.content;
      
      const ext = sanitizedFileName.toLowerCase().substring(sanitizedFileName.lastIndexOf('.'));
      const fileType = fileTypeMap[ext] || '其他文件';
      
      try {
        await db.collection('file_history').add({
          userId: userData._id,
          username: userData.username || 'anonymous',
          fileName: sanitizedFileName,
          fileType: fileType,
          content: fileContent || '',
          analysis: analysis,
          createdAt: Date.now()
        });
        console.log('文件分析记录保存成功');
      } catch (dbErr) {
        console.error('数据库保存失败:', dbErr.message);
      }
      
      return { code: 200, message: 'success', data: { analysis: analysis } };
    } else {
      return { code: 500, message: 'AI服务暂时不可用，请稍后重试', data: null };
    }
  } catch (error) {
    console.error('analyze云函数错误:', error.message);
    return { code: 500, message: '服务器繁忙，请稍后重试', data: null };
  }
}

exports.main = handler;