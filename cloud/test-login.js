// 测试 login 云函数
const cloud = require('wx-server-sdk');

// 初始化云开发
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

/**
 * 测试云函数
 */
exports.main = async (event, context) => {
  console.log('=== test-login 开始 ===');
  console.log('event:', JSON.stringify(event));
  console.log('context:', JSON.stringify(context));

  try {
    const { action } = event || {};

    switch (action) {
      case 'test-context':
        return await testWXContext();
      case 'test-create-user':
        return await testCreateUser(event);
      case 'test-query-user':
        return await testQueryUser(event);
      case 'test-create-ledger':
        return await testCreateLedger(event);
      case 'test-add-record':
        return await testAddRecord(event);
      default:
        return {
          success: true,
          message: '测试函数运行正常',
          availableActions: [
            'test-context',
            'test-create-user',
            'test-query-user',
            'test-create-ledger',
            'test-add-record'
          ]
        };
    }
  } catch (error) {
    console.error('测试云函数错误:', error);
    return {
      success: false,
      message: '测试失败',
      error: error.message,
      errMsg: error.errMsg
    };
  }
};

/**
 * 测试微信上下文
 */
async function testWXContext() {
  console.log('测试微信上下文...');

  const wxContext = cloud.getWXContext();
  console.log('wxContext:', JSON.stringify(wxContext));

  const { openid, appid, unionid } = wxContext || {};

  return {
    success: true,
    message: '微信上下文获取成功',
    data: {
      openid: openid || 'null',
      appid: appid || 'null',
      unionid: unionid || 'null'
    }
  };
}

/**
 * 测试创建用户
 */
async function testCreateUser(event) {
  console.log('测试创建用户...');

  const wxContext = cloud.getWXContext();
  const { openid } = wxContext || {};

  if (!openid) {
    return {
      success: false,
      message: 'openid 为空'
    };
  }

  const { nickName, avatarUrl } = event || {};

  try {
    const result = await db.collection('users').add({
      data: {
        _openid: openid,
        nickName: nickName || '测试用户',
        avatarUrl: avatarUrl || '',
        remark: '测试创建',
        createTime: db.serverDate(),
        updateTime: db.serverDate(),
      },
    });

    console.log('用户创建成功，ID:', result._id);

    return {
      success: true,
      message: '用户创建成功',
      userId: result._id
    };
  } catch (error) {
    console.error('创建用户失败:', error);
    return {
      success: false,
      message: '创建用户失败',
      error: error.errMsg
    };
  }
}

/**
 * 测试查询用户
 */
async function testQueryUser(event) {
  console.log('测试查询用户...');

  const wxContext = cloud.getWXContext();
  const { openid } = wxContext || {};

  if (!openid) {
    return {
      success: false,
      message: 'openid 为空'
    };
  }

  try {
    const result = await db.collection('users').where({
      _openid: openid
    }).get();

    console.log('查询结果，数量:', result.data.length);

    return {
      success: true,
      message: '查询成功',
      count: result.data.length,
      users: result.data.map(u => ({
        _id: u._id,
        nickName: u.nickName,
        currentLedgerId: u.currentLedgerId
      }))
    };
  } catch (error) {
    console.error('查询用户失败:', error);
    return {
      success: false,
      message: '查询用户失败',
      error: error.errMsg
    };
  }
}

/**
 * 测试创建账本
 */
async function testCreateLedger(event) {
  console.log('测试创建账本...');

  const wxContext = cloud.getWXContext();
  const { openid } = wxContext || {};

  if (!openid) {
    return {
      success: false,
      message: 'openid 为空'
    };
  }

  try {
    const result = await db.collection('ledgers').add({
      data: {
        name: '测试账本',
        description: '测试创建',
        ownerId: openid,
        isDefault: true,
        isDeleted: false,
        createTime: db.serverDate(),
        updateTime: db.serverDate(),
      },
    });

    console.log('账本创建成功，ID:', result._id);

    return {
      success: true,
      message: '账本创建成功',
      ledgerId: result._id
    };
  } catch (error) {
    console.error('创建账本失败:', error);
    return {
      success: false,
      message: '创建账本失败',
      error: error.errMsg
    };
  }
}

/**
 * 测试添加记录
 */
async function testAddRecord(event) {
  console.log('测试添加记录...');

  const wxContext = cloud.getWXContext();
  const { openid } = wxContext || {};

  if (!openid) {
    return {
      success: false,
      message: 'openid 为空'
    };
  }

  // 先获取用户的当前账本
  const userRes = await db.collection('users').where({
    _openid: openid
  }).get();

  if (userRes.data.length === 0) {
    return {
      success: false,
      message: '用户不存在'
    };
  }

  const userId = userRes.data[0]._id;
  const currentLedgerId = userRes.data[0].currentLedgerId;

  if (!currentLedgerId) {
    return {
      success: false,
      message: '用户没有账本'
    };
  }

  try {
    const result = await db.collection('records').add({
      data: {
        ledgerId: currentLedgerId,
        amount: 100.00,
        amountInCents: 10000,
        categoryName: '餐饮美食',
        paymentTime: db.serverDate(),
        payerId: openid,
        payerName: '测试用户',
        merchantName: '测试商户',
        remark: '测试记录',
        createTime: db.serverDate(),
        updateTime: db.serverDate(),
      },
    });

    console.log('记录创建成功，ID:', result._id);

    return {
      success: true,
      message: '记录创建成功',
      recordId: result._id
    };
  } catch (error) {
    console.error('创建记录失败:', error);
    return {
      success: false,
      message: '创建记录失败',
      error: error.errMsg
    };
  }
}
