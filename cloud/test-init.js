// 测试 init 云函数
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
  console.log('测试参数:', JSON.stringify(event));

  try {
    const { action } = event || {};

    switch (action) {
      case 'test-seed-categories':
        return await testSeedCategories();
      case 'test-seed-all':
        return await testSeedAll();
      default:
        return {
          success: true,
          message: '测试函数运行正常',
          timestamp: new Date().toISOString(),
        };
    }
  } catch (error) {
    console.error('测试云函数错误:', error);
    return {
      success: false,
      message: '测试失败',
      error: error.message
    };
  }
};

/**
 * 测试 seedCategories
 */
async function testSeedCategories() {
  console.log('开始测试 seedCategories...');

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
  ];

  console.log('分类数据准备完成，数量:', defaultCategories.length);

  const results = [];
  for (const category of defaultCategories) {
    try {
      console.log('准备添加分类:', category.name);
      const result = await db.collection('categories').add({
        data: category
      });
      console.log('添加成功:', category.name, 'ID:', result._id);
      results.push({
        _id: result._id,
        name: category.name
      });
    } catch (error) {
      console.error('添加分类失败:', category.name, error);
      return {
        success: false,
        message: `添加分类失败: ${category.name}`,
        error: error.errMsg
      };
    }
  }

  return {
    success: true,
    message: '测试完成',
    count: results.length,
    data: results
  };
}

/**
 * 测试 seedAll
 */
async function testSeedAll() {
  console.log('开始测试 seedAll...');

  const categoriesResult = await testSeedCategories();

  console.log('categoriesResult:', JSON.stringify(categoriesResult));

  if (!categoriesResult.success) {
    return {
      success: false,
      message: '测试失败',
      error: categoriesResult.message
    };
  }

  return {
    success: true,
    message: '全部测试完成',
    data: {
      categories: categoriesResult
    }
  };
}
