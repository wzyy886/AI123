'use strict';

async function handler(event, context) {
  const { type, data, token } = event;
  const db = uniCloud.database();
  
  let userId = 'anonymous';
  let username = 'anonymous';

  if (token) {
    try {
      const user = await db.collection('users').where({ token: token }).get();
      if (user.data.length > 0) {
        userId = user.data[0]._id;
        username = user.data[0].username || 'anonymous';
      }
    } catch (e) {
      console.log('查询用户失败:', e.message);
    }
  }

  const record = {
    userId: userId,
    username: username,
    createdAt: Date.now(),
    ...data
  };

  let collectionName = '';
  
  switch (type) {
    case 'chat':
      collectionName = 'chat_history';
      break;
    case 'generate':
      collectionName = 'chat_history';
      record.type = 'generate';
      break;
    case 'review':
      collectionName = 'chat_history';
      record.type = 'review';
      break;
    case 'explain':
      collectionName = 'chat_history';
      record.type = 'explain';
      break;
    case 'analyze':
      collectionName = 'file_history';
      break;
    case 'image':
      collectionName = 'image_history';
      break;
    case 'video':
      collectionName = 'video_calls';
      break;
    default:
      return { code: 400, message: '不支持的记录类型', data: null };
  }

  try {
    await db.collection(collectionName).add(record);
    console.log('记录保存成功:', collectionName);
    return { code: 200, message: 'success', data: null };
  } catch (error) {
    console.error('数据库保存失败:', error.message);
    return { code: 200, message: 'success', data: null };
  }
}

exports.main = handler;