// pages/record-list/record-list.js
const app = getApp();
import { formatDate, formatAmount, getMonthStart, getMonthEnd } from '../../utils/date.js';

Page({
  data: {
    records: [],
    groupedRecords: [],
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
      const allRecords = reset ? newRecords : [...this.data.records, ...newRecords];

      this.setData({
        records: allRecords,
        groupedRecords: this.groupRecordsByDate(allRecords),
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
   * 按日期分组记录
   */
  groupRecordsByDate(records) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = this.formatDateStr(today);
    const yesterdayStr = this.formatDateStr(yesterday);

    const groups = {};

    records.forEach(record => {
      const date = new Date(record.paymentTime);
      const dateStr = this.formatDateStr(date);

      if (!groups[dateStr]) {
        groups[dateStr] = {
          date: dateStr,
          label: this.getDateLabel(dateStr, todayStr, yesterdayStr),
          records: [],
          count: 0,
        };
      }

      groups[dateStr].records.push(record);
      groups[dateStr].count++;
    });

    // 转换为数组并按日期降序排序
    return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
  },

  /**
   * 格式化日期字符串
   */
  formatDateStr(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * 获取日期标签
   */
  getDateLabel(dateStr, todayStr, yesterdayStr) {
    if (dateStr === todayStr) return '今天';
    if (dateStr === yesterdayStr) return '昨天';
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  },

  /**
   * 格式化时间
   */
  formatTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
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
   * 返回上一页
   */
  goBack() {
    wx.navigateBack();
  },

  /**
   * 显示筛选
   */
  showFilter() {
    wx.showToast({
      title: '筛选功能开发中',
      icon: 'none',
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
