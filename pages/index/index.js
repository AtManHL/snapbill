// pages/index/index.js
const app = getApp();
import { getMonthStart, getMonthEnd, formatAmount } from '../../utils/date.js';

Page({
  data: {
    currentLedger: { name: '我的账本' },
    monthlyTotal: '0.00',
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
      const monthlyTotal = this.calculateMonthlyTotal(records);

      this.setData({
        recentRecords: records,
        monthlyTotal,
        loading: false,
      });
    } catch (error) {
      console.error('加载记录失败:', error);
      this.setData({ loading: false });
    }
  },

  /**
   * 计算本月总额
   */
  calculateMonthlyTotal(records) {
    const total = records.reduce((sum, record) => sum + (record.amount || 0), 0);
    return total.toFixed(2);
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
