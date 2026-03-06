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
      case 'getMembers':
        return await getLedgerMembers(event, openid);
      case 'generateInviteCode':
        return await generateInviteCode(event, openid);
      case 'joinByInviteCode':
        return await joinByInviteCode(event, openid);
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

  // 创建账本
  const ledgerRes = await db.collection('ledgers').add({
    data: {
      name,
      description: description || '',
      ownerId: openid,
      isDefault: false,
      isDeleted: false,
      inviteCode: generateRandomCode(),
      createTime: new Date(),
      updateTime: new Date(),
    },
  });

  // 创建账本成员关系（创建者为管理员）
  await db.collection('ledgerMembers').add({
    data: {
      ledgerId: ledgerRes._id,
      userId: openid,
      role: 'owner',
      joinTime: new Date(),
    },
  });

  return {
    success: true,
    _id: ledgerRes._id,
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
 * 获取账本列表（带成员数和总支出统计）
 */
async function listLedgers(openid) {
  // 1. 获取用户相关的所有账本成员关系
  const memberRes = await db.collection('ledgerMembers')
    .where({ userId: openid })
    .get();

  const ledgerIds = memberRes.data.map(m => m.ledgerId);

  if (ledgerIds.length === 0) {
    return { success: true, data: [] };
  }

  // 2. 获取账本详情
  const ledgerRes = await db.collection('ledgers')
    .where({
      _id: _.in(ledgerIds),
      isDeleted: false,
    })
    .orderBy('createTime', 'desc')
    .get();

  // 3. 为每个账本计算成员数和总支出
  const ledgers = await Promise.all(ledgerRes.data.map(async (ledger) => {
    // 获取成员数
    const memberCountRes = await db.collection('ledgerMembers')
      .where({ ledgerId: ledger._id })
      .count();

    // 获取总支出
    const recordsRes = await db.collection('records')
      .where({ ledgerId: ledger._id })
      .get();

    const totalAmount = recordsRes.data.reduce((sum, r) => sum + (r.amount || 0), 0);

    return {
      ...ledger,
      memberCount: memberCountRes.total,
      totalAmount: totalAmount.toFixed(2),
    };
  }));

  return {
    success: true,
    data: ledgers,
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
  if (!ledger.data || ledger.data.isDeleted) {
    return { success: false, message: '账本不存在' };
  }

  // 检查是否是成员
  const memberRes = await db.collection('ledgerMembers')
    .where({
      ledgerId: ledgerId,
      userId: openid,
    })
    .get();

  if (memberRes.data.length === 0) {
    return { success: false, message: '无权限访问该账本' };
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

/**
 * 获取账本成员列表
 */
async function getLedgerMembers(event, openid) {
  const { ledgerId } = event;

  // 验证权限
  const memberRes = await db.collection('ledgerMembers')
    .where({
      ledgerId: ledgerId,
      userId: openid,
    })
    .get();

  if (memberRes.data.length === 0) {
    return { success: false, message: '无权限查看成员' };
  }

  // 获取所有成员
  const allMembers = await db.collection('ledgerMembers')
    .where({ ledgerId: ledgerId })
    .get();

  // 获取用户信息
  const members = await Promise.all(allMembers.data.map(async (member) => {
    const userRes = await db.collection('users')
      .where({ _openid: member.userId })
      .get();

    const user = userRes.data[0] || {};

    return {
      id: member.userId,
      name: user.nickName || '微信用户',
      avatar: '👤',
      role: member.role === 'owner' ? '创建者' : '成员',
    };
  }));

  return {
    success: true,
    data: members,
  };
}

/**
 * 生成新的邀请码
 */
async function generateInviteCode(event, openid) {
  const { ledgerId } = event;

  // 验证权限
  const ledger = await db.collection('ledgers').doc(ledgerId).get();
  if (ledger.data.ownerId !== openid) {
    return { success: false, message: '无权限操作' };
  }

  const newCode = generateRandomCode();

  await db.collection('ledgers').doc(ledgerId).update({
    data: {
      inviteCode: newCode,
      updateTime: new Date(),
    },
  });

  return {
    success: true,
    inviteCode: newCode,
  };
}

/**
 * 通过邀请码加入账本
 */
async function joinByInviteCode(event, openid) {
  const { inviteCode } = event;

  // 查找账本
  const ledgerRes = await db.collection('ledgers')
    .where({
      inviteCode: inviteCode,
      isDeleted: false,
    })
    .get();

  if (ledgerRes.data.length === 0) {
    return { success: false, message: '邀请码无效' };
  }

  const ledger = ledgerRes.data[0];

  // 检查是否已是成员
  const memberRes = await db.collection('ledgerMembers')
    .where({
      ledgerId: ledger._id,
      userId: openid,
    })
    .get();

  if (memberRes.data.length > 0) {
    return { success: false, message: '您已是该账本成员' };
  }

  // 添加成员关系
  await db.collection('ledgerMembers').add({
    data: {
      ledgerId: ledger._id,
      userId: openid,
      role: 'member',
      joinTime: new Date(),
    },
  });

  return {
    success: true,
    ledgerId: ledger._id,
    ledgerName: ledger.name,
  };
}

/**
 * 生成随机邀请码
 */
function generateRandomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
