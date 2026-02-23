// pages/login/login.js
const app = getApp();

Page({
  data: {
    canIUseGetUserProfile: false,
    loading: false,
  },

  onLoad() {
    // 检查是否支持 getUserProfile
    if (wx.getUserProfile) {
      this.setData({ canIUseGetUserProfile: true });
    }

    // 检查登录状态
    this.checkLoginStatus();
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    if (app.globalData.openid) {
      // 已登录，跳转首页
      wx.reLaunch({
        url: '/pages/index/index',
      });
    }
  },

  /**
   * 微信授权登录
   */
  handleGetUserInfo() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        const { userInfo } = res;
        this.loginWithCloud(userInfo);
      },
      fail: (error) => {
        console.error('获取用户信息失败:', error);
        wx.showToast({
          title: '需要授权才能使用',
          icon: 'none',
        });
      },
    });
  },

  /**
   * 调用云函数登录
   */
  async loginWithCloud(userInfo) {
    this.setData({ loading: true });

    try {
      // 调用云函数登录
      const result = await wx.cloud.callFunction({
        name: 'login',
        data: {
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
        },
      });

      if (result.result && result.result.success) {
        const { openid, userId, nickName, avatarUrl, isNewUser, currentLedgerId } = result.result;

        // 保存到全局数据
        app.globalData.openid = openid;
        app.globalData.userInfo = {
          nickName,
          avatarUrl,
          userId,
          currentLedgerId,
        };

        // 保存到本地存储
        wx.setStorageSync('openid', openid);
        wx.setStorageSync('userInfo', {
          nickName,
          avatarUrl,
          userId,
          currentLedgerId,
        });

        this.setData({ loading: false });

        // 如果是新用户，先初始化分类
        if (isNewUser) {
          await this.initCategories();
        }

        wx.showToast({
          title: '登录成功',
          icon: 'success',
        });

        // 跳转首页
        setTimeout(() => {
          wx.reLaunch({
            url: '/pages/index/index',
          });
        }, 1500);
      } else {
        this.setData({ loading: false });
        wx.showToast({
          title: result.result?.message || '登录失败',
          icon: 'none',
        });
      }
    } catch (error) {
      console.error('登录失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none',
      });
    }
  },

  /**
   * 初始化分类（新用户）
   */
  async initCategories() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'init',
        data: { type: 'categories' },
      });
      console.log('分类初始化结果:', result);
    } catch (error) {
      console.error('分类初始化失败:', error);
      // 分类初始化失败不影响登录流程
    }
  },
});
