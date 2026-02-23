// pages/ledger-list/ledger-list.js
const app = getApp();

Page({
  data: {
    ledgers: [],
    currentLedgerId: '',
    loading: false,
  },

  onLoad() {
    this.loadLedgers();
    this.loadCurrentLedger();
  },

  onShow() {
    this.loadLedgers();
  },

  /**
   * 加载账本列表
   */
  async loadLedgers() {
    this.setData({ loading: true });

    try {
      const res = await wx.cloud.callFunction({
        name: 'ledger',
        data: { action: 'list' },
      });

      this.setData({
        ledgers: res.result.data || [],
        loading: false,
      });
    } catch (error) {
      console.error('加载账本失败:', error);
      this.setData({ loading: false });
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
      console.error('加载当前账本失败:', error);
    }
  },

  /**
   * 选择账本
   */
  async selectLedger(e) {
    const { id } = e.currentTarget.dataset;

    // 如果已经是当前账本，直接返回
    if (id === this.data.currentLedgerId) {
      wx.navigateBack();
      return;
    }

    try {
      wx.showLoading({ title: '切换中...' });

      const res = await wx.cloud.callFunction({
        name: 'ledger',
        data: {
          action: 'switch',
          ledgerId: id,
        },
      });

      wx.hideLoading();

      if (res.result && res.result.success) {
        // 更新全局数据
        app.globalData.userInfo.currentLedgerId = id;

        // 更新本地存储
        wx.setStorageSync('userInfo', app.globalData.userInfo);

        wx.showToast({
          title: '切换成功',
          icon: 'success',
        });

        // 返回首页
        setTimeout(() => {
          wx.reLaunch({
            url: '/pages/index/index',
          });
        }, 1500);
      } else {
        wx.showToast({
          title: res.result?.message || '切换失败',
          icon: 'none',
        });
      }
    } catch (error) {
      console.error('切换账本失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '切换失败，请重试',
        icon: 'none',
      });
    }
  },

  /**
   * 创建账本
   */
  createLedger() {
    wx.navigateTo({
      url: '/pages/ledger-create/ledger-create',
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
});
