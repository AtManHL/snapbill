// cloud/init/index.js
const cloud = require('wx-server-sdk');

// 初始化云开发
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

/**
 * 初始化云函数
 */
exports.main = async (event, context) => {
  const { type } = event || {};

  try {
    switch (type) {
      case 'categories':
        return await seedCategories();
      case 'all':
        return await seedAll();
      default:
        // 无参数时默认初始化所有数据
        console.log('未指定type，默认初始化所有数据');
        return await seedAll();
    }
  } catch (error) {
    console.error('初始化云函数错误:', error);
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
async function seedAll() {
  // 1. 初始化分类
  const categoriesResult = await seedCategories();

  return {
    success: true,
    message: '全部数据初始化完成',
    data: {
      categories: categoriesResult
    }
  };
}

/**
 * 初始化默认分类数据
 */
async function seedCategories() {
  // 默认分类列表
  const defaultCategories = [
    {
      name: '餐饮美食',
      icon: '🍽',
      color: '#FF6B6B',
      sort: 1,
      isDefault: true,
      isDeleted: false,
      createTime: db.serverDate(),
      updateTime: db.serverDate(),
    },
    {
      name: '日常购物',
      icon: '🛒',
      color: '#4ECDC4',
      sort: 2,
      isDefault: true,
      isDeleted: false,
      createTime: db.serverDate(),
      updateTime: db.serverDate(),
    },
    {
      name: '交通出行',
      icon: '🚗',
      color: '#45B7D1',
      sort: 3,
      isDefault: true,
      isDeleted: false,
      createTime: db.serverDate(),
      updateTime: db.serverDate(),
    },
    {
      name: '居家住房',
      icon: '🏠',
      color: '#96CEB4',
      sort: 4,
      isDefault: true,
      isDeleted: false,
      createTime: db.serverDate(),
      updateTime: db.serverDate(),
    },
    {
      name: '健康医疗',
      icon: '🏥',
      color: '#FFEAA7',
      sort: 5,
      isDefault: true,
      isDeleted: false,
      createTime: db.serverDate(),
      updateTime: db.serverDate(),
    },
    {
      name: '休闲娱乐',
      icon: '🎬',
      color: '#DDA0DD',
      sort: 6,
      isDefault: true,
      isDeleted: false,
      createTime: db.serverDate(),
      updateTime: db.serverDate(),
    },
    {
      name: '学习成长',
      icon: '📚',
      color: '#98D8C8',
      sort: 7,
      isDefault: true,
      isDeleted: false,
      createTime: db.serverDate(),
      updateTime: db.serverDate(),
    },
    {
      name: '人情往来',
      icon: '🧾',
      color: '#F7DC6F',
      sort: 8,
      isDefault: true,
      isDeleted: false,
      createTime: db.serverDate(),
      updateTime: db.serverDate(),
    },
    {
      name: '通讯数码',
      icon: '📱',
      color: '#BB8FCE',
      sort: 9,
      isDefault: true,
      isDeleted: false,
      createTime: db.serverDate(),
      updateTime: db.serverDate(),
    },
    {
      name: '其他支出',
      icon: '💰',
      color: '#95A5A6',
      sort: 10,
      isDefault: true,
      isDeleted: false,
      createTime: db.serverDate(),
      updateTime: db.serverDate(),
    },
  ];

  // 批量添加分类
  const results = [];
  for (const category of defaultCategories) {
    try {
      const result = await db.collection('categories').add({
        data: category
      });
      results.push({
        _id: result._id,
        name: category.name
      });
    } catch (error) {
      // 忽略重复添加的错误（可能已存在）
      console.log('添加分类跳过:', category.name, error.errMsg);
    }
  }

  return {
    success: true,
    message: '默认分类初始化成功',
    count: results.length,
    data: results
  };
}
