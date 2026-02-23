// cloud/login/index.js
const cloud = require('wx-server-sdk');

// 初始化云开发
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

/**
 * 登录云函数
 */
exports.main = async (event, context) => {
  const { nickName, avatarUrl } = event;
  const wxContext = cloud.getWXContext();
  const { openid, appid } = wxContext;

  try {
    // 查询用户是否存在
    const userRes = await db.collection('users').where({
      _openid: openid,
    }).get();

    let userId;
    let isNewUser = false;

    if (userRes.data.length === 0) {
      // 新用户，创建用户记录
      const createRes = await db.collection('users').add({
        data: {
          _openid: openid,
          nickName,
          avatarUrl,
          remark: '',
          createTime: db.serverDate(),
          updateTime: db.serverDate(),
        },
      });
      userId = createRes._id;
      isNewUser = true;

      // 创建默认账本
      await createDefaultLedger(userId, openid, nickName);
    } else {
      userId = userRes.data[0]._id;
      // 更新用户信息
      await db.collection('users').doc(userId).update({
        data: {
          nickName,
          avatarUrl,
          updateTime: db.serverDate(),
        },
      });
    }

    // 获取当前账本
    const user = await db.collection('users').doc(userId).get();
    const currentLedgerId = user.data.currentLedgerId;

    return {
      success: true,
      openid,
      userId,
      nickName,
      avatarUrl,
      isNewUser,
      currentLedgerId,
    };
  } catch (error) {
    console.error('登录云函数错误:', error);
    return {
      success: false,
      message: '登录失败',
      error: error.message
    };
  }
};

/**
 * 创建默认账本
 */
async function createDefaultLedger(userId, openid, nickName) {
  const ledgerRes = await db.collection('ledgers').add({
    data: {
      name: '我的账本',
      description: '',
      ownerId: openid,
      isDefault: true,
      isDeleted: false,
      createTime: db.serverDate(),
      updateTime: db.serverDate(),
    },
  });

  // 更新用户的当前账本ID
  await db.collection('users').doc(userId).update({
    data: {
      currentLedgerId: ledgerRes._id,
      updateTime: db.serverDate(),
    },
  });
}
