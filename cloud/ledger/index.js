// cloud/ledger/index.js
const cloud = require('wx-server-sdk');

// 初始化云开发
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

/**
 * 账本云函数
 */
exports.main = async (event, context) => {
  const { action } = event;
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    switch (action) {
      case 'create':
        return await createLedger(event, openid);
      case 'update':
        return await updateLedger(event, openid);
      case 'delete':
        return await deleteLedger(event, openid);
      case 'list':
        return await listLedgers(openid);
      case 'get':
        return await getLedger(event, openid);
      case 'switch':
        return await switchLedger(event, openid);
      case 'getCurrent':
        return await getCurrentLedger(openid);
      default:
        return { success: false, message: '未知操作' };
    }
  } catch (error) {
    console.error('账本云函数错误:', error);
    return {
      success: false,
      message: '操作失败',
      error: error.message
    };
  }
};

/**
 * 创建账本
 */
async function createLedger(event, openid) {
  const { name, description } = event;

  const result = await db.collection('ledgers').add({
    data: {
      name,
      description: description || '',
      ownerId: openid,
      isDefault: false,
      isDeleted: false,
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
 * 更新账本
 */
async function updateLedger(event, openid) {
  const { _id, name, description } = event;

  // 验证权限
  const ledger = await db.collection('ledgers').doc(_id).get();
  if (ledger.data.ownerId !== openid) {
    return { success: false, message: '无权限修改' };
  }

  const updateData = {
    updateTime: new Date(),
  };

  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;

  await db.collection('ledgers').doc(_id).update({
    data: updateData,
  });

  return { success: true };
}

/**
 * 删除账本（软删除）
 */
async function deleteLedger(event, openid) {
  const { _id } = event;

  // 验证权限
  const ledger = await db.collection('ledgers').doc(_id).get();
  if (ledger.data.ownerId !== openid) {
    return { success: false, message: '无权限删除' };
  }

  // 软删除
  await db.collection('ledgers').doc(_id).update({
    data: {
      isDeleted: true,
      updateTime: new Date(),
    },
  });

  return { success: true };
}

/**
 * 获取账本列表
 */
async function listLedgers(openid) {
  const result = await db.collection('ledgers')
    .where({
      ownerId: openid,
      isDeleted: false,
    })
    .orderBy('createTime', 'desc')
    .get();

  return {
    success: true,
    data: result.data,
  };
}

/**
 * 获取单个账本
 */
async function getLedger(event, openid) {
  const { _id } = event;

  const ledger = await db.collection('ledgers').doc(_id).get();

  if (ledger.data.ownerId !== openid) {
    return { success: false, message: '无权限查看' };
  }

  return {
    success: true,
    data: ledger.data,
  };
}

/**
 * 切换账本
 */
async function switchLedger(event, openid) {
  const { ledgerId } = event;

  // 验证账本权限
  const ledger = await db.collection('ledgers').doc(ledgerId).get();
  if (!ledger.data || ledger.data.ownerId !== openid || ledger.data.isDeleted) {
    return { success: false, message: '账本不存在或无权限' };
  }

  // 获取用户ID
  const userRes = await db.collection('users')
    .where({ _openid: openid })
    .get();

  if (userRes.data.length > 0) {
    // 更新用户当前账本
    await db.collection('users').doc(userRes.data[0]._id).update({
      data: {
        currentLedgerId: ledgerId,
        updateTime: new Date(),
      },
    });
  }

  return { success: true };
}

/**
 * 获取当前账本
 */
async function getCurrentLedger(openid) {
  const userRes = await db.collection('users')
    .where({ _openid: openid })
    .get();

  if (userRes.data.length === 0) {
    return { success: false, message: '用户不存在' };
  }

  const { currentLedgerId } = userRes.data[0];
  if (!currentLedgerId) {
    return { success: false, message: '未设置当前账本' };
  }

  const ledger = await db.collection('ledgers').doc(currentLedgerId).get();

  return {
    success: true,
    ledger: ledger.data,
  };
}
