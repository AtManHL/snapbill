// pages/record-list/record-list.js
const app = getApp();
import { formatDate, formatAmount, getMonthStart, getMonthEnd } from '../../utils/date.js';

Page({
  data: {
    records: [],
    categories: [],
    keyword: '',
    activeCategory: '',
    currentLedgerId: '',
    limit: 20,
    offset: 0,
    hasMore: true,
    loading: false,
    loadingMore: false,
  },

  onLoad() {
    this.loadCategories();
    this.loadCurrentLedger();
  },

  onShow() {
    this.loadData(true); // 重新加载
  },

  /**
   * 加载分类
   */
  async loadCategories() {
    try {
      const db = wx.cloud.database();
      const res = await db.collection('categories')
        .where({ isDeleted: false })
        .orderBy('sort', 'asc')
        .get();

      this.setData({ categories: res.data });
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  },

  /**
   * 加载当前账本
   */
  async loadCurrentLedger() {
    try {
      if (app.globalData.userInfo?.currentLedgerId) {
        this.setData({
          currentLedgerId: app.globalData.userInfo.currentLedgerId,
        });
      }
    } catch (error) {
      console.error('加载账本失败:', error);
    }
  },

  /**
   * 加载数据
   */
  async loadData(reset = false) {
    if (this.data.loading) return;

    const { currentLedgerId, limit, activeCategory, keyword } = this.data;
    const offset = reset ? 0 : this.data.offset;

    this.setData({ loading: true });

    try {
      // 默认查询本月数据
      const startDate = formatDate(getMonthStart(), 'YYYY-MM-DD HH:mm:ss');
      const endDate = formatDate(getMonthEnd(), 'YYYY-MM-DD HH:mm:ss');

      let data = {
        ledgerId: currentLedgerId,
        limit,
        offset,
        startDate,
        endDate,
      };

      if (activeCategory) {
        data.categoryId = activeCategory;
      }

      if (keyword) {
        data.keyword = keyword;
        // 搜索时移除时间范围限制
        delete data.startDate;
        delete data.endDate;
      }

      // 调用云函数
      const res = await wx.cloud.callFunction({
        name: 'record',
        data: {
          action: keyword ? 'search' : 'list',
          ...data,
        },
      });

      const newRecords = res.result?.data || [];
      const hasMore = newRecords.length >= limit;

      this.setData({
        records: reset ? newRecords : [...this.data.records, ...newRecords],
        hasMore,
        loading: false,
        offset: reset ? limit : offset + limit,
      });
    } catch (error) {
      console.error('加载记录失败:', error);
      this.setData({ loading: false });
    }
  },

  /**
   * 加载更多
   */
  loadMore() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.setData({ loadingMore: true });
      this.loadData().then(() => {
        this.setData({ loadingMore: false });
      });
    }
  },

  /**
   * 搜索
   */
  onSearch(e) {
    this.setData({
      keyword: e.detail.value,
      offset: 0,
    });
    this.loadData(true);
  },

  /**
   * 按分类筛选
   */
  filterByCategory(e) {
    const { id } = e.currentTarget.dataset;
    this.setData({
      activeCategory: id,
      offset: 0,
    });
    this.loadData(true);
  },

  /**
   * 查看详情
   */
  goToDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/record-detail/record-detail?id=${id}`,
    });
  },

  /**
   * 返回首页
   */
  goHome() {
    wx.reLaunch({
      url: '/pages/index/index',
    });
  },

  /**
   * 格式化金额
   */
  formatAmount(amount) {
    return formatAmount(amount);
  },

  /**
   * 格式化日期
   */
  formatDate(dateStr) {
    if (!dateStr) return '';
    return formatDate(new Date(dateStr), 'MM-DD HH:mm');
  },
});
