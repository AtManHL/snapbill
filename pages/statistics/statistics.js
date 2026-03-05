const app = getApp();
import * as echarts from '../../components/ec-canvas/echarts.min';
import { callCloudFunction, showToast } from '../../utils/request.js';
import { getTodayStart, getTodayEnd, getWeekStart, getWeekEnd, getMonthStart, getMonthEnd, getYearStart, getYearEnd, formatAmount } from '../../utils/date.js';
import { CLOUD_FUNCTIONS } from '../../utils/constants.js';

Page({
  data: {
    currentLedger: null,
    timeType: 'month',
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    startDate: '',
    endDate: '',
    summary: {
      total: '0.00',
      count: 0,
      avg: '0.00',
    },
    categoryData: [],
    dateData: [],
    memberData: [
      { name: '小明', amount: 4856, avatar: '👨', percentage: 57.4 },
      { name: '小红', amount: 3600, avatar: '👩', percentage: 42.6 },
    ],
    loading: false,
    colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'],
    emojis: ['🍽', '🏠', '🚗', '🛒', '🎬', '💰'],
  },

  onLoad() {
    // 初始化时间范围
    this.initTimeRange();
    // 加载统计数据
    this.loadStatistics();
  },

  onShow() {
    // 重新加载当前账本
    this.loadCurrentLedger();
  },

  /**
   * 初始化时间范围
   */
  initTimeRange() {
    const now = new Date();
    let startDate, endDate;

    switch (this.data.timeType) {
      case 'day':
        startDate = getTodayStart();
        endDate = getTodayEnd();
        break;
      case 'week':
        startDate = getWeekStart();
        endDate = getWeekEnd();
        break;
      case 'month':
        startDate = getMonthStart();
        endDate = getMonthEnd();
        break;
      case 'year':
        startDate = getYearStart();
        endDate = getYearEnd();
        break;
    }

    this.setData({
      startDate: this.formatDate(startDate),
      endDate: this.formatDate(endDate),
    });
  },

  /**
   * 格式化日期为 YYYY-MM-DD
   */
  formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * 加载当前账本
   */
  loadCurrentLedger() {
    if (app.globalData.currentLedger) {
      this.setData({
        currentLedger: app.globalData.currentLedger,
      });
    }
  },

  /**
   * 加载统计数据
   */
  async loadStatistics() {
    const { currentLedger, timeType, startDate, endDate } = this.data;

    if (!currentLedger) {
      showToast('请先选择账本');
      return;
    }

    this.setData({ loading: true });

    try {
      // 并行请求汇总、分类统计、日期统计
      const [summaryRes, categoryRes, dateRes] = await Promise.all([
        this.callStatistics('summary', currentLedger._id, startDate, endDate),
        this.callStatistics('byCategory', currentLedger._id, startDate, endDate),
        this.callStatistics('byDate', currentLedger._id, startDate, endDate),
      ]);

      const { colors, emojis } = this.data;
      const categoryData = (categoryRes.data || []).map((item, index) => ({
        ...item,
        color: colors[index % colors.length],
        emoji: emojis[index % emojis.length],
        gradient: `linear-gradient(135deg, ${colors[index % colors.length]}20 0%, ${colors[(index + 1) % colors.length]}20 100%)`,
      }));

      this.setData({
        summary: summaryRes.summary || { total: '0.00', count: 0, avg: '0.00' },
        categoryData,
        dateData: dateRes.data || [],
        loading: false,
      });
    } catch (error) {
      console.error('加载统计数据失败:', error);
      showToast('加载失败，请重试');
      this.setData({ loading: false });
    }
  },

  /**
   * 调用统计云函数
   */
  callStatistics(type, ledgerId, startDate, endDate) {
    return callCloudFunction(
      CLOUD_FUNCTIONS.STATISTICS,
      { type, ledgerId, startDate, endDate },
      { loading: false, showErrorMessage: false }
    );
  },

  /**
   * 切换时间类型
   */
  switchTimeType(e) {
    const { type } = e.currentTarget.dataset;
    if (type === this.data.timeType) return;

    this.setData({ timeType: type });
    this.initTimeRange();
    this.loadStatistics();
  },

  /**
   * 格式化金额
   */
  formatAmount(amount) {
    return formatAmount(amount);
  },

  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack();
  },

  /**
   * 初始化分类饼图
   */
  initPieChart(canvas, width, height, dpr) {
    const chart = echarts.init(canvas, null, {
      width: width,
      height: height,
      devicePixelRatio: dpr
    });

    const categoryData = this.data.categoryData || [];
    const pieData = categoryData.map(item => ({
      name: item.name,
      value: item.amount,
    }));

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: ¥{c} ({d}%)'
      },
      series: [
        {
          name: '分类统计',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: pieData
        }
      ],
      color: [
        '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
        '#10b981', '#6366f1', '#8b5cf6', '#f472b6'
      ]
    };

    chart.setOption(option);

    // 保存图表实例，后续可以用于更新
    this.pieChart = chart;

    return chart;
  },

  /**
   * 初始化趋势折线图
   */
  initLineChart(canvas, width, height, dpr) {
    const chart = echarts.init(canvas, null, {
      width: width,
      height: height,
      devicePixelRatio: dpr
    });

    const dateData = this.data.dateData || [];
    const xData = dateData.map(item => item.date);
    const yData = dateData.map(item => item.amount.toFixed(2));

    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: function(params) {
          const value = params[0].value;
          return `${params[0].name}\n¥${value}`;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xData,
        axisLabel: {
          fontSize: 10
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          fontSize: 10
        }
      },
      series: [
        {
          name: '支出趋势',
          type: 'line',
          smooth: true,
          data: yData,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(69, 183, 209, 0.3)' },
                { offset: 1, color: 'rgba(69, 183, 209, 0.05)' }
              ]
            }
          },
          itemStyle: {
            color: '#45B7D1'
          }
        }
      ]
    };

    chart.setOption(option);

    // 保存图表实例
    this.lineChart = chart;

    return chart;
  },
});
