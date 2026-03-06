// cloud/statistics/index.js
const cloud = require('wx-server-sdk');

// 初始化云开发
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

/**
 * 统计云函数
 */
exports.main = async (event, context) => {
  const { type, ledgerId, startDate, endDate } = event;

  try {
    switch (type) {
      case 'byCategory':
        return await statisticsByCategory(ledgerId, startDate, endDate);
      case 'byDate':
        return await statisticsByDate(ledgerId, startDate, endDate);
      case 'byUser':
        return await statisticsByUser(ledgerId, startDate, endDate);
      case 'summary':
        return await statisticsSummary(ledgerId, startDate, endDate);
      default:
        return { success: false, message: '未知统计类型' };
    }
  } catch (error) {
    console.error('统计云函数错误:', error);
    return {
      success: false,
      message: '统计失败',
      error: error.message
    };
  }
};

/**
 * 按分类统计
 */
async function statisticsByCategory(ledgerId, startDate, endDate) {
  let collection = db.collection('records').where({ ledgerId });

  if (startDate) {
    collection = collection.where({
      paymentTime: _.gte(new Date(startDate)),
    });
  }
  if (endDate) {
    collection = collection.where({
      paymentTime: _.lte(new Date(endDate)),
    });
  }

  const records = await collection.get();
  const data = records.data;

  // 按分类汇总
  const categoryMap = {};
  let total = 0;

  data.forEach(record => {
    const { categoryName, amount } = record;
    if (!categoryMap[categoryName]) {
      categoryMap[categoryName] = { name: categoryName, amount: 0, count: 0 };
    }
    categoryMap[categoryName].amount += amount;
    categoryMap[categoryName].count += 1;
    total += amount;
  });

  // 转换为数组并计算占比
  const result = Object.values(categoryMap).map(item => ({
    ...item,
    percentage: total > 0 ? (item.amount / total * 100).toFixed(2) : 0,
  })).sort((a, b) => b.amount - a.amount);

  return {
    success: true,
    data: result,
    total: total.toFixed(2),
  };
}

/**
 * 按日期统计
 */
async function statisticsByDate(ledgerId, startDate, endDate) {
  let collection = db.collection('records').where({ ledgerId });

  if (startDate) {
    collection = collection.where({
      paymentTime: _.gte(new Date(startDate)),
    });
  }
  if (endDate) {
    collection = collection.where({
      paymentTime: _.lte(new Date(endDate)),
    });
  }

  const records = await collection.orderBy('paymentTime', 'asc').get();
  const data = records.data;

  // 按日期汇总
  const dateMap = {};

  data.forEach(record => {
    const date = new Date(record.paymentTime);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    if (!dateMap[dateKey]) {
      dateMap[dateKey] = { date: dateKey, amount: 0, count: 0 };
    }
    dateMap[dateKey].amount += record.amount;
    dateMap[dateKey].count += 1;
  });

  const result = Object.values(dateMap);

  return {
    success: true,
    data: result,
  };
}

/**
 * 按用户统计（成员统计）
 */
async function statisticsByUser(ledgerId, startDate, endDate) {
  let collection = db.collection('records').where({ ledgerId });

  if (startDate) {
    collection = collection.where({
      paymentTime: _.gte(new Date(startDate)),
    });
  }
  if (endDate) {
    collection = collection.where({
      paymentTime: _.lte(new Date(endDate)),
    });
  }

  const records = await collection.get();
  const data = records.data;

  // 按用户汇总
  const userMap = {};
  let total = 0;

  data.forEach(record => {
    const { payerId, payerName, amount } = record;
    if (!userMap[payerId]) {
      userMap[payerId] = {
        id: payerId,
        name: payerName || '微信用户',
        avatar: '👤',
        amount: 0,
        count: 0,
      };
    }
    userMap[payerId].amount += amount;
    userMap[payerId].count += 1;
    total += amount;
  });

  // 转换为数组并计算占比
  const result = Object.values(userMap).map(item => ({
    ...item,
    percentage: total > 0 ? (item.amount / total * 100).toFixed(1) : 0,
  })).sort((a, b) => b.amount - a.amount);

  return {
    success: true,
    data: result,
    total: total.toFixed(2),
  };
}

/**
 * 统计汇总
 */
async function statisticsSummary(ledgerId, startDate, endDate) {
  let collection = db.collection('records').where({ ledgerId });

  if (startDate) {
    collection = collection.where({
      paymentTime: _.gte(new Date(startDate)),
    });
  }
  if (endDate) {
    collection = collection.where({
      paymentTime: _.lte(new Date(endDate)),
    });
  }

  const records = await collection.get();
  const data = records.data;

  const total = data.reduce((sum, record) => sum + (record.amount || 0), 0);
  const count = data.length;
  const avg = count > 0 ? total / count : 0;

  return {
    success: true,
    summary: {
      total: total.toFixed(2),
      count,
      avg: avg.toFixed(2),
    },
  };
}
