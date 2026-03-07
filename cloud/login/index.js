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
  console.log('=== login云函数开始 ===');
  console.log('event:', JSON.stringify(event));
  console.log('context:', JSON.stringify(context));

  const { nickName, avatarUrl } = event || {};
  console.log('用户信息 - nickName:', nickName, 'avatarUrl:', avatarUrl);

  const wxContext = cloud.getWXContext();
  console.log('wxContext:', JSON.stringify(wxContext));

  const { OPENID, APPID } = wxContext || {};
  console.log('OPENID:', OPENID, 'APPID:', APPID);

  // 检查 OPENID 是否存在
  if (!OPENID) {
    console.error('OPENID 为空，无法继续');
    return {
      success: false,
      message: '获取用户信息失败',
      error: 'OPENID is undefined'
    };
  }

  try {
    // 查询用户是否存在
    console.log('开始查询用户，OPENID:', OPENID);
    const userRes = await db.collection('users').where({
      _openid: OPENID,
    }).get();
    console.log('用户查询结果，数量:', userRes.data.length);

    let userId;
    let isNewUser = false;

    if (userRes.data.length === 0) {
      // 新用户，创建用户记录
      console.log('新用户，开始创建用户记录');

      const createRes = await db.collection('users').add({
        data: {
          _openid: OPENID,
          nickName: nickName || '微信用户',
          avatarUrl: avatarUrl || '',
          remark: '',
          createTime: db.serverDate(),
          updateTime: db.serverDate(),
        },
      });
      console.log('用户创建成功，userId:', createRes._id);

      userId = createRes._id;
      isNewUser = true;

      // 创建默认账本
      await createDefaultLedger(userId, OPENID, nickName || '微信用户');
    } else {
      console.log('老用户，userId:', userRes.data[0]._id);
      userId = userRes.data[0]._id;

      // 更新用户信息
      try {
        await db.collection('users').doc(userId).update({
          data: {
            nickName: nickName || '微信用户',
            avatarUrl: avatarUrl || '',
            updateTime: db.serverDate(),
          },
        });
        console.log('用户信息更新成功');
      } catch (updateError) {
        console.log('更新用户信息失败（可能无关紧要）:', updateError.errMsg);
      }
    }

    // 获取当前账本
    console.log('获取当前账本...');
    const user = await db.collection('users').doc(userId).get();
    const currentLedgerId = user.data ? user.data.currentLedgerId : null;
    console.log('当前账本ID:', currentLedgerId);

    console.log('=== login云函数完成 ===');
    return {
      success: true,
      openid: OPENID,
      userId,
      nickName: nickName || '微信用户',
      avatarUrl: avatarUrl || '',
      isNewUser,
      currentLedgerId,
    };
  } catch (error) {
    console.error('登录云函数错误:', error);
    console.error('错误堆栈:', error.stack);
    return {
      success: false,
      message: '登录失败',
      error: error.message,
      errMsg: error.errMsg
    };
  }
};

/**
 * 创建默认账本
 */
async function createDefaultLedger(userId, openid, nickName) {
  console.log('开始创建默认账本...');

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
  console.log('账本创建成功，ledgerId:', ledgerRes._id);

  // 添加账本成员记录
  await db.collection('ledgerMembers').add({
    data: {
      ledgerId: ledgerRes._id,
      userId: openid,
      userName: nickName,
      role: 'owner',
      joinTime: db.serverDate(),
    },
  });
  console.log('账本成员记录添加成功');

  // 更新用户的当前账本ID
  await db.collection('users').doc(userId).update({
    data: {
      currentLedgerId: ledgerRes._id,
      updateTime: db.serverDate(),
    },
  });
  console.log('用户当前账本ID更新成功');
}
