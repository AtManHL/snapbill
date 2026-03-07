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

  // 获取用户信息
  const userRes = await db.collection('users').where({ _openid: openid }).get();
  const userName = userRes.data[0]?.nickName || '微信用户';

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
      userName: userName,
      role: 'owner',
      joinTime: new Date(),
    },
  });

  // 自动切换到新创建的账本
  await db.collection('users').doc(userRes.data[0]._id).update({
    data: {
      currentLedgerId: ledgerRes._id,
      updateTime: new Date(),
    },
  });

  return {
    success: true,
    _id: ledgerRes._id,
    ledgerId: ledgerRes._id,
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
 * 获取当前账本（带验证和自动切换）
 */
async function getCurrentLedger(openid) {
  const userRes = await db.collection('users')
    .where({ _openid: openid })
    .get();

  if (userRes.data.length === 0) {
    return { success: false, message: '用户不存在' };
  }

  const user = userRes.data[0];
  let { currentLedgerId } = user;

  // 验证当前账本是否有效
  let currentLedger = null;
  let isValid = false;

  if (currentLedgerId) {
    try {
      const ledger = await db.collection('ledgers').doc(currentLedgerId).get();

      // 检查账本是否存在且未被删除
      if (ledger.data && !ledger.data.isDeleted) {
        // 检查用户是否仍是成员
        const memberRes = await db.collection('ledgerMembers')
          .where({
            ledgerId: currentLedgerId,
            userId: openid,
          })
          .get();

        if (memberRes.data.length > 0) {
          currentLedger = ledger.data;
          isValid = true;
        }
      }
    } catch (e) {
      console.log('当前账本验证失败:', e);
    }
  }

  // 如果当前账本无效，尝试切换到第一个可用账本
  if (!isValid) {
    console.log('当前账本无效，尝试切换...');

    // 获取用户的所有账本成员关系
    const memberRes = await db.collection('ledgerMembers')
      .where({ userId: openid })
      .orderBy('joinTime', 'asc')
      .get();

    // 查找第一个有效的账本
    for (const member of memberRes.data) {
      try {
        const ledger = await db.collection('ledgers').doc(member.ledgerId).get();
        if (ledger.data && !ledger.data.isDeleted) {
          currentLedgerId = member.ledgerId;
          currentLedger = ledger.data;
          isValid = true;

          // 更新用户的当前账本
          await db.collection('users').doc(user._id).update({
            data: {
              currentLedgerId: currentLedgerId,
              updateTime: new Date(),
            },
          });
          console.log('已自动切换到账本:', currentLedgerId);
          break;
        }
      } catch (e) {
        console.log('账本查询失败:', e);
      }
    }
  }

  if (!isValid) {
    return {
      success: false,
      code: 'NO_VALID_LEDGER',
      message: '没有可用的账本，请创建或加入账本',
    };
  }

  return {
    success: true,
    ledger: currentLedger,
    ledgerId: currentLedgerId,
    isSwitched: !user.currentLedgerId || user.currentLedgerId !== currentLedgerId,
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

  // 直接使用 ledgerMembers 中的 userName，无需查询 users 表
  const members = allMembers.data.map((member) => {
    return {
      id: member.userId,
      name: member.userName || '微信用户',
      avatar: '👤',
      role: member.role === 'owner' ? '创建者' : '成员',
    };
  });

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

  // 获取用户信息
  const userRes = await db.collection('users').where({ _openid: openid }).get();
  const userName = userRes.data[0]?.nickName || '微信用户';

  // 添加成员关系
  await db.collection('ledgerMembers').add({
    data: {
      ledgerId: ledger._id,
      userId: openid,
      userName: userName,
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
