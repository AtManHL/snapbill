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

  console.log('init云函数被调用，type:', type);

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
      error: error.message,
      errMsg: error.errMsg
    };
  }
};

/**
 * 初始化所有数据
 */
async function seedAll() {
  console.log('开始初始化所有数据...');

  // 1. 初始化分类
  const categoriesResult = await seedCategories();

  console.log('分类初始化结果:', JSON.stringify(categoriesResult));

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
  console.log('开始初始化默认分类...');

  // 默认分类列表
  const defaultCategories = [
    { name: '餐饮美食', icon: '\uD83C\uDF7D', color: '#FF6B6B', sort: 1 },
    { name: '日常购物', icon: '\uD83D\uDE92', color: '#4ECDC4', sort: 2 },
    { name: '交通出行', icon: '\uD83D\uDE97', color: '#45B7D1', sort: 3 },
    { name: '居家住房', icon: '\uD83C\uDFE0', color: '#96CEB4', sort: 4 },
    { name: '健康医疗', icon: '\uD83C\uDFE5', color: '#FFEAA7', sort: 5 },
    { name: '休闲娱乐', icon: '\uD83C\uDFAC', color: '#DDA0DD', sort: 6 },
    { name: '学习成长', icon: '\uD83D\uDCDA', color: '#98D8C8', sort: 7 },
    { name: '人情往来', icon: '\uD83E\uDF7E', color: '#F7DC6F', sort: 8 },
    { name: '通讯数码', icon: '\uD83D\uDCF1', color: '#BB8FCE', sort: 9 },
    { name: '其他支出', icon: '\uD83D\uDCB0', color: '#95A5A6', sort: 10 },
  ];

  // 构造要插入的数据
  const categoriesToInsert = defaultCategories.map(cat => ({
    name: cat.name,
    icon: cat.icon,
    color: cat.color,
    sort: cat.sort,
    isDefault: true,
    isDeleted: false,
    createTime: db.serverDate(),
    updateTime: db.serverDate(),
  }));

  console.log('准备添加分类，数量:', categoriesToInsert.length);

  // 批量添加分类
  const results = [];
  for (let i = 0; i < categoriesToInsert.length; i++) {
    const category = categoriesToInsert[i];
    try {
      console.log(`正在添加第${i + 1}个分类:`, category.name);
      const result = await db.collection('categories').add({
        data: category
      });
      console.log('添加成功:', category.name, 'ID:', result._id);
      results.push({
        _id: result._id,
        name: category.name
      });
    } catch (error) {
      // 忽略重复添加的错误
      console.log('添加分类跳过:', category.name, '错误:', error.errMsg);
    }
  }

  console.log('分类添加完成，成功数量:', results.length);

  return {
    success: true,
    message: '默认分类初始化成功',
    count: results.length,
    data: results
  };
}
