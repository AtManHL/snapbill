// cloud/init-database/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

/**
 * 初始化数据库
 * 请在微信开发者工具云开发控制台中手动创建集合后，再执行此云函数
 */
exports.main = async (event, context) => {
  const { action = 'all' } = event;

  try {
    switch (action) {
      case 'collections':
        return await initCollections();
      case 'indexes':
        return await initIndexes();
      case 'categories':
        return await seedCategories();
      case 'all':
      default:
        return await initAll();
    }
  } catch (error) {
    console.error('初始化数据库错误:', error);
    return {
      success: false,
      message: '初始化失败',
      error: error.message
    };
  }
};

/**
 * 初始化所有数据
 */
async function initAll() {
  console.log('开始初始化数据库...');

  const results = {
    categories: await seedCategories(),
  };

  return {
    success: true,
    message: '数据库初始化完成',
    data: results
  };
}

/**
 * 初始化默认分类数据
 */
async function seedCategories() {
  console.log('开始初始化默认分类...');

  const defaultCategories = [
    { name: '餐饮美食', icon: '🍽', color: '#FF6B6B', sort: 1 },
    { name: '日常购物', icon: '🛒', color: '#4ECDC4', sort: 2 },
    { name: '交通出行', icon: '🚗', color: '#45B7D1', sort: 3 },
    { name: '居家住房', icon: '🏠', color: '#96CEB4', sort: 4 },
    { name: '健康医疗', icon: '🏥', color: '#FFEAA7', sort: 5 },
    { name: '休闲娱乐', icon: '🎬', color: '#DDA0DD', sort: 6 },
    { name: '学习成长', icon: '📚', color: '#98D8C8', sort: 7 },
    { name: '人情往来', icon: '💝', color: '#F7DC6F', sort: 8 },
    { name: '通讯数码', icon: '📱', color: '#BB8FCE', sort: 9 },
    { name: '其他支出', icon: '💰', color: '#95A5A6', sort: 10 },
  ];

  const results = [];
  for (const cat of defaultCategories) {
    try {
      // 检查是否已存在
      const existRes = await db.collection('categories')
        .where({
          name: cat.name,
          isDefault: true
        })
        .get();

      if (existRes.data.length > 0) {
        console.log(`分类 ${cat.name} 已存在，跳过`);
        results.push({ name: cat.name, status: 'skipped' });
        continue;
      }

      const result = await db.collection('categories').add({
        data: {
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          sort: cat.sort,
          isDefault: true,
          isDeleted: false,
          ledgerId: '',
          createTime: db.serverDate(),
          updateTime: db.serverDate(),
        }
      });

      console.log(`分类 ${cat.name} 创建成功，ID: ${result._id}`);
      results.push({ name: cat.name, status: 'created', _id: result._id });
    } catch (error) {
      console.error(`分类 ${cat.name} 创建失败:`, error);
      results.push({ name: cat.name, status: 'error', error: error.message });
    }
  }

  return {
    success: true,
    message: '默认分类初始化完成',
    count: results.filter(r => r.status === 'created').length,
    data: results
  };
}

/**
 * 初始化集合（需要在云开发控制台手动创建集合后调用）
 */
async function initCollections() {
  const collections = ['users', 'ledgers', 'ledgerMembers', 'records', 'categories'];

  return {
    success: true,
    message: '请手动在云开发控制台创建以下集合',
    collections: collections,
    instructions: [
      '1. 打开微信开发者工具',
      '2. 点击"云开发"按钮',
      '3. 进入"数据库"页面',
      '4. 点击"添加集合"',
      '5. 依次创建: users, ledgers, ledgerMembers, records, categories',
      '6. 设置权限为"仅创建者可读写"',
    ]
  };
}

/**
 * 初始化索引（需要在云开发控制台手动创建）
 */
async function initIndexes() {
  return {
    success: true,
    message: '请手动在云开发控制台创建以下索引',
    indexes: [
      { collection: 'users', field: '_openid', unique: true },
      { collection: 'ledgers', field: 'ownerId' },
      { collection: 'ledgers', field: 'inviteCode', unique: true },
      { collection: 'ledgerMembers', fields: ['ledgerId', 'userId'], unique: true },
      { collection: 'records', field: 'ledgerId' },
      { collection: 'records', field: 'payerId' },
      { collection: 'records', field: 'paymentTime' },
      { collection: 'categories', field: 'isDefault' },
      { collection: 'categories', field: 'sort' },
    ]
  };
}
