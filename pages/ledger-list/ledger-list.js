// pages/ledger-list/ledger-list.js
const app = getApp();

Page({
  data: {
    ledgers: [],
    currentLedgerId: '',
    loading: false,
    showInvite: false,
    inviteCode: '',
    members: [],
    currentLedger: null,
  },

  onLoad() {
    this.loadLedgers();
    this.loadCurrentLedger();
  },

  onShow() {
    this.loadLedgers();
  },

  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack();
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

      const ledgers = res.result.data || [];
      this.setData({
        ledgers: ledgers,
        loading: false,
      });

      // 如果有当前账本，加载成员
      if (this.data.currentLedgerId) {
        this.loadMembers(this.data.currentLedgerId);
        const current = ledgers.find(l => l._id === this.data.currentLedgerId);
        if (current) {
          this.setData({ currentLedger: current });
        }
      }
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
   * 加载账本成员
   */
  async loadMembers(ledgerId) {
    try {
      const res = await wx.cloud.callFunction({
        name: 'ledger',
        data: {
          action: 'getMembers',
          ledgerId: ledgerId,
        },
      });

      if (res.result.success) {
        this.setData({
          members: res.result.data || [],
        });
      }
    } catch (error) {
      console.error('加载成员失败:', error);
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
   * 切换邀请码显示
   */
  async toggleInvite() {
    const newShowInvite = !this.data.showInvite;
    this.setData({ showInvite: newShowInvite });

    // 如果展开邀请区域，生成新的邀请码
    if (newShowInvite && this.data.currentLedgerId) {
      try {
        const res = await wx.cloud.callFunction({
          name: 'ledger',
          data: {
            action: 'generateInviteCode',
            ledgerId: this.data.currentLedgerId,
          },
        });

        if (res.result.success) {
          this.setData({ inviteCode: res.result.inviteCode });
        }
      } catch (error) {
        console.error('生成邀请码失败:', error);
      }
    }
  },

  /**
   * 复制邀请码
   */
  copyInviteCode() {
    wx.setClipboardData({
      data: this.data.inviteCode,
      success: () => {
        wx.showToast({
          title: '复制成功',
          icon: 'success',
        });
      },
    });
  },

  /**
   * 管理账本
   */
  manageLedger(e) {
    const { id } = e.currentTarget.dataset;
    wx.showToast({
      title: '账本管理功能开发中',
      icon: 'none',
    });
  },

  /**
   * 编辑账本信息
   */
  editLedgerInfo() {
    wx.showToast({
      title: '编辑功能开发中',
      icon: 'none',
    });
  },

  /**
   * 管理分类
   */
  manageCategories() {
    wx.showToast({
      title: '分类管理功能开发中',
      icon: 'none',
    });
  },

  /**
   * 删除账本
   */
  deleteLedger() {
    wx.showModal({
      title: '确认删除',
      content: '删除后数据无法恢复，是否继续？',
      confirmColor: '#dc2626',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '删除功能开发中',
            icon: 'none',
          });
        }
      },
    });
  },
});
