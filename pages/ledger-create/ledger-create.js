// pages/ledger-create/ledger-create.js
import { validateLedgerName } from '../../utils/validate.js';
import { showToast, showLoading, hideLoading } from '../../utils/request.js';

Page({
  data: {
    name: '',
    description: '',
    loading: false,
  },

  onLoad() {
    // 自动聚焦到第一个输入框
  },

  /**
   * 账本名称输入
   */
  onNameInput(e) {
    this.setData({ name: e.detail.value });
  },

  /**
   * 账本描述输入
   */
  onDescInput(e) {
    this.setData({ description: e.detail.value });
  },

  /**
   * 取消创建
   */
  onCancel() {
    wx.navigateBack();
  },

  /**
   * 确认创建
   */
  async onConfirm() {
    const { name, description } = this.data;

    // 验证账本名称
    const nameValid = validateLedgerName(name);
    if (!nameValid.valid) {
      showToast(nameValid.message);
      return;
    }

    showLoading('创建中...');

    try {
      // 调用云函数创建账本
      const res = await wx.cloud.callFunction({
        name: 'ledger',
        data: {
          action: 'create',
          name,
          description,
        },
      });

      hideLoading();

      if (res.result && res.result.success) {
        showToast('创建成功', 'success');

        // 创建成功后选择该账本
        await this.selectLedger(res.result._id);
      } else {
        showToast(res.result?.message || '创建失败');
      }
    } catch (error) {
      console.error('创建账本失败:', error);
      hideLoading();
      showToast('创建失败，请重试');
    }
  },

  /**
   * 选择刚创建的账本
   */
  async selectLedger(ledgerId) {
    try {
      const res = await wx.cloud.callFunction({
        name: 'ledger',
        data: {
          action: 'switch',
          ledgerId,
        },
      });

      if (res.result && res.result.success) {
        // 更新全局数据
        const app = getApp();
        app.globalData.userInfo.currentLedgerId = ledgerId;

        // 更新本地存储
        wx.setStorageSync('userInfo', app.globalData.userInfo);

        // 返回首页
        setTimeout(() => {
          wx.reLaunch({
            url: '/pages/index/index',
          });
        }, 1500);
      }
    } catch (error) {
      console.error('切换账本失败:', error);
      // 即使切换失败也返回首页
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/index/index',
        });
      }, 1500);
    }
  },
});
