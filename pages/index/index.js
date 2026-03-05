// pages/index/index.js
const app = getApp();
import { getMonthStart, getMonthEnd, formatAmount } from '../../utils/date.js';

Page({
  data: {
    currentLedger: { name: '我们的小家账本' },
    monthlyTotal: '0.00',
    dailyAverage: '0.00',
    recordCount: 0,
    recentRecords: [],
    loading: false,
  },

  onLoad() {
    // 检查登录状态
    this.checkLogin();

    // 加载当前账本
    this.loadCurrentLedger();

    // 加载最近记录
    this.loadRecentRecords();
  },

  onShow() {
    // 每次显示时重新加载数据
    this.loadRecentRecords();
  },

  /**
   * 检查登录状态
   */
  checkLogin() {
    if (!app.globalData.openid) {
      // 未登录，跳转登录页
      wx.reLaunch({
        url: '/pages/login/login',
      });
    }
  },

  /**
   * 加载当前账本
   */
  async loadCurrentLedger() {
    try {
      if (!app.globalData.userInfo?.currentLedgerId) {
        return;
      }

      this.setData({ loading: true });

      const db = wx.cloud.database();
      const ledgerRes = await db.collection('ledgers')
        .doc(app.globalData.userInfo.currentLedgerId)
        .get();

      if (ledgerRes.data) {
        this.setData({
          currentLedger: ledgerRes.data,
        });
        // 保存到全局
        app.globalData.currentLedger = ledgerRes.data;
      }

      this.setData({ loading: false });
    } catch (error) {
      console.error('加载账本失败:', error);
      this.setData({ loading: false });
    }
  },

  /**
   * 加载最近记录
   */
  async loadRecentRecords() {
    try {
      if (!app.globalData.openid) {
        return;
      }

      const db = wx.cloud.database();
      const ledgerId = app.globalData.userInfo?.currentLedgerId;

      if (!ledgerId) {
        return;
      }

      this.setData({ loading: true });

      // 计算本月时间范围
      const startDate = getMonthStart();
      const endDate = getMonthEnd();

      // 查询本月记录
      const recordRes = await db.collection('records')
        .where({
          ledgerId,
          paymentTime: db.command.gte(startDate).and(db.command.lte(endDate)),
        })
        .orderBy('paymentTime', 'desc')
        .limit(5)
        .get();

      const records = recordRes.data || [];
      const stats = this.calculateMonthlyStats(records);

      // 为记录添加分类 emoji
      const recordsWithEmoji = records.map(record => ({
        ...record,
        categoryEmoji: this.getCategoryEmoji(record.category),
      }));

      this.setData({
        recentRecords: recordsWithEmoji,
        ...stats,
        loading: false,
      });
    } catch (error) {
      console.error('加载记录失败:', error);
      this.setData({ loading: false });
    }
  },

  /**
   * 计算本月统计数据
   */
  calculateMonthlyStats(records) {
    const total = records.reduce((sum, record) => sum + (record.amount || 0), 0);
    const count = records.length;
    // 计算本月已过天数
    const today = new Date();
    const dayOfMonth = today.getDate();
    const dailyAvg = dayOfMonth > 0 ? (total / dayOfMonth).toFixed(2) : '0.00';

    return {
      monthlyTotal: total.toFixed(2),
      recordCount: count,
      dailyAverage: dailyAvg,
    };
  },

  /**
   * 获取分类 emoji
   */
  getCategoryEmoji(category) {
    const emojiMap = {
      '餐饮': '🍽',
      '餐饮美食': '🍽',
      '购物': '🛒',
      '日常购物': '🛒',
      '交通': '🚗',
      '交通出行': '🚗',
      '住房': '🏠',
      '居家住房': '🏠',
      '医疗': '🏥',
      '健康医疗': '🏥',
      '娱乐': '🎬',
      '休闲娱乐': '🎬',
      '学习': '📚',
      '学习成长': '📚',
      '人情': '💝',
      '人情往来': '💝',
      '数码': '📱',
      '通讯数码': '📱',
      '其他': '💰',
      '其他支出': '💰',
    };
    return emojiMap[category] || '📦';
  },

  /**
   * 格式化金额显示
   */
  formatAmount(amount) {
    return formatAmount(amount);
  },

  /**
   * 格式化日期显示
   */
  formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${month}-${day} ${hour}:${minute}`;
  },

  /**
   * 跳转记账页面
   */
  goToAddRecord() {
    wx.navigateTo({
      url: '/pages/add-record/add-record',
    });
  },

  /**
   * 跳转统计页面
   */
  goToStatistics() {
    wx.navigateTo({
      url: '/pages/statistics/statistics',
    });
  },

  /**
   * 跳转个人中心
   */
  goToProfile() {
    wx.navigateTo({
      url: '/pages/profile/profile',
    });
  },

  /**
   * 跳转记录列表
   */
  goToRecordList() {
    wx.navigateTo({
      url: '/pages/record-list/record-list',
    });
  },

  /**
   * 跳转记录详情
   */
  goToRecordDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/record-detail/record-detail?id=${id}`,
    });
  },

  /**
   * 切换账本
   */
  switchLedger() {
    wx.navigateTo({
      url: '/pages/ledger-list/ledger-list',
    });
  },
});
