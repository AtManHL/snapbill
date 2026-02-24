const app = getApp();
import { callCloudFunction, showModal } from '../../utils/request.js';
import { showToast } from '../../utils/request.js';
import { CLOUD_FUNCTIONS } from '../../utils/constants.js';
import { formatAmount } from '../../utils/date.js';

Page({
  data: {
    userInfo: null,
    userStats: {
      totalAmount: '0.00',
      totalCount: 0,
      monthAmount: '0.00',
    },
    loading: false,
    remark: '',
  },

  onLoad() {
    this.loadUserInfo();
    this.loadUserStats();
  },

  onShow() {
    this.loadUserInfo();
  },

  /**
   * 加载用户信息
   */
  loadUserInfo() {
    const userInfo = app.globalData.userInfo;
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        remark: userInfo.remark || '',
      });
    }
  },

  /**
   * 加载用户统计
   */
  async loadUserStats() {
    const { userInfo } = this.data;
    if (!userInfo) return;

    this.setData({ loading: true });

    try {
      // 调用统计云函数获取用户数据
      const res = await callCloudFunction(
        CLOUD_FUNCTIONS.STATISTICS,
        {
          type: 'byUser',
          ledgerId: userInfo.currentLedgerId,
        },
        { loading: false, showErrorMessage: false }
      );

      if (res.success && res.data) {
        this.setData({
          userStats: {
            totalAmount: res.data.totalAmount || '0.00',
            totalCount: res.data.totalCount || 0,
            monthAmount: res.data.monthAmount || '0.00',
          },
        });
      }
    } catch (error) {
      console.error('加载用户统计失败:', error);
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 编辑个人备注
   */
  async editRemark() {
    const { remark } = this.data;

    try {
      const input = await showModal(
        '请输入个人备注（用于账本成员区分）',
        {
          title: '编辑备注',
          confirmText: '保存',
          showCancel: true,
        }
      );

      if (input) {
        // 显示输入框（微信小程序没有原生输入对话框，使用自定义方式）
        // 这里简化处理，实际项目中可以使用自定义输入组件
        wx.showModal({
          title: '编辑备注',
          content: '当前：' + remark,
          editable: true,
          placeholderText: '请输入备注',
          success: (res) => {
            if (res.confirm && res.content !== undefined) {
              this.updateRemark(res.content);
            }
          },
        });
      }
    } catch (error) {
      console.error('编辑备注失败:', error);
    }
  },

  /**
   * 更新备注
   */
  async updateRemark(remark) {
    try {
      const res = await callCloudFunction(
        CLOUD_FUNCTIONS.LOGIN,
        {
          action: 'updateRemark',
          remark: remark,
        },
        { loadingText: '保存中...' }
      );

      if (res.success) {
        // 更新本地数据
        const userInfo = { ...this.data.userInfo, remark: remark };
        app.globalData.userInfo = userInfo;
        this.setData({ userInfo, remark });
        showToast('保存成功');
      }
    } catch (error) {
      console.error('更新备注失败:', error);
      showToast('保存失败，请重试');
    }
  },

  /**
   * 跳转到账本列表
   */
  goToLedgerList() {
    wx.navigateTo({
      url: '/pages/ledger-list/ledger-list',
    });
  },

  /**
   * 跳转到记录列表
   */
  goToRecordList() {
    wx.navigateTo({
      url: '/pages/record-list/record-list',
    });
  },

  /**
   * 跳转到统计页面
   */
  goToStatistics() {
    wx.navigateTo({
      url: '/pages/statistics/statistics',
    });
  },

  /**
   * 退出登录
   */
  async logout() {
    const confirm = await showModal('确定要退出登录吗？', {
      title: '提示',
      confirmText: '确定',
      cancelText: '取消',
    });

    if (confirm) {
      // 清除本地数据
      app.globalData.openid = null;
      app.globalData.userInfo = null;
      app.globalData.currentLedger = null;

      // 跳转到登录页
      wx.reLaunch({
        url: '/pages/login/login',
      });
    }
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
});
