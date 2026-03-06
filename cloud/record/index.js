// cloud/record/index.js
const cloud = require('wx-server-sdk');

// 初始化云开发
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

/**
 * 记录云函数
 */
exports.main = async (event, context) => {
  const { action } = event;
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    switch (action) {
      case 'add':
        return await addRecord(event, openid);
      case 'update':
        return await updateRecord(event, openid);
      case 'delete':
        return await deleteRecord(event, openid);
      case 'get':
        return await getRecord(event, openid);
      case 'list':
        return await listRecords(event, openid);
      case 'search':
        return await searchRecords(event, openid);
      default:
        return { success: false, message: '未知操作' };
    }
  } catch (error) {
    console.error('记录云函数错误:', error);
    return {
      success: false,
      message: '操作失败',
      error: error.message
    };
  }
};

/**
 * 添加记录
 */
async function addRecord(event, openid) {
  const {
    ledgerId,
    amount,
    amountInCents,
    categoryId,
    categoryName,
    paymentTime,
    payerName,
    merchantName,
    remark,
    isAIEstimated,
    originalImageUrl,
    thumbnailUrl,
  } = event;

  // 获取用户昵称作为 payerName
  let payerNameToSave = payerName;
  if (!payerNameToSave) {
    const userRes = await db.collection('users').where({ _openid: openid }).get();
    if (userRes.data.length > 0) {
      payerNameToSave = userRes.data[0].nickName || '我';
    } else {
      payerNameToSave = '我';
    }
  }

  const result = await db.collection('records').add({
    data: {
      ledgerId,
      amount,
      amountInCents,
      categoryId,
      categoryName,
      paymentTime: new Date(paymentTime),
      payerId: openid,
      payerName: payerNameToSave,
      merchantName: merchantName || '',
      remark: remark || '',
      isAIEstimated: isAIEstimated || false,
      originalImageUrl: originalImageUrl || '',
      thumbnailUrl: thumbnailUrl || '',
      createTime: new Date(),
      updateTime: new Date(),
    },
  });

  return {
    success: true,
    _id: result._id,
  };
}

/**
 * 更新记录
 */
async function updateRecord(event, openid) {
  const { _id, ...updateData } = event;

  // 验证权限
  const record = await db.collection('records').doc(_id).get();
  if (record.data.payerId !== openid) {
    return { success: false, message: '无权限修改' };
  }

  // 更新数据
  updateData.updateTime = new Date();
  if (updateData.paymentTime) {
    updateData.paymentTime = new Date(updateData.paymentTime);
  }

  await db.collection('records').doc(_id).update({
    data: updateData,
  });

  return { success: true };
}

/**
 * 删除记录
 */
async function deleteRecord(event, openid) {
  const { _id } = event;

  // 验证权限
  const record = await db.collection('records').doc(_id).get();
  if (record.data.payerId !== openid) {
    return { success: false, message: '无权限删除' };
  }

  await db.collection('records').doc(_id).remove();

  return { success: true };
}

/**
 * 获取单条记录
 */
async function getRecord(event, openid) {
  const { _id } = event;

  const record = await db.collection('records').doc(_id).get();

  if (record.data.payerId !== openid) {
    return { success: false, message: '无权限查看' };
  }

  return {
    success: true,
    data: record.data,
  };
}

/**
 * 查询记录列表
 */
async function listRecords(event, openid) {
  const {
    ledgerId,
    limit = 20,
    offset = 0,
    categoryId,
    startDate,
    endDate,
  } = event;

  let query = db.collection('records').where({
    ledgerId,
  });

  // 添加筛选条件
  if (categoryId) {
    query = query.where({ categoryId });
  }
  if (startDate) {
    query = query.where({
      paymentTime: _.gte(new Date(startDate)),
    });
  }
  if (endDate) {
    query = query.where({
      paymentTime: _.lte(new Date(endDate)),
    });
  }

  const result = await query
    .orderBy('paymentTime', 'desc')
    .limit(limit)
    .skip(offset)
    .get();

  return {
    success: true,
    data: result.data,
    total: result.data.length,
  };
}

/**
 * 搜索记录
 */
async function searchRecords(event, openid) {
  const { ledgerId, keyword } = event;

  if (!keyword) {
    return await listRecords({ ledgerId, openid });
  }

  // 使用正则表达式搜索
  const result = await db.collection('records')
    .where({
      ledgerId,
      _.or([
        { categoryName: db.RegExp({ regexp: keyword, options: 'i' }) },
        { remark: db.RegExp({ regexp: keyword, options: 'i' }) },
      ]),
    })
    .orderBy('paymentTime', 'desc')
    .get();

  return {
    success: true,
    data: result.data,
  };
}
