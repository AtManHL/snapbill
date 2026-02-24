// app.js
import { STORAGE_KEYS } from './utils/constants.js';
import { getStorage } from './utils/storage.js';

App({
  /**
   * 全局数据
   */
  globalData: {
    openid: '',              // 用户openid
    userInfo: null,          // 用户信息
    currentLedger: null,     // 当前账本
    categories: [],          // 分类列表
  },

  /**
   * 生命周期函数--监听小程序初始化
   */
  onLaunch() {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'snapbill-8g0nw28nfc2629a9', // 云开发环境ID
        traceUser: true,
      });
      console.log('云开发环境ID:', 'snapbill-8g0nw28nfc2629a9');
    }

    // 从本地存储恢复用户信息
    this.loadUserFromStorage();
  },

  /**
   * 生命周期函数--监听小程序显示
   */
  onShow() {
    // 检查登录状态
    this.checkLoginStatus();
  },

  /**
   * 从本地存储加载用户信息
   */
  loadUserFromStorage() {
    const openid = getStorage(STORAGE_KEYS.OPENID);
    const userInfo = getStorage(STORAGE_KEYS.USER_INFO);

    if (openid) {
      this.globalData.openid = openid;
    }

    if (userInfo) {
      this.globalData.userInfo = userInfo;
    }
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    return !!this.globalData.openid;
  },

  /**
   * 保存用户信息
   */
  saveUserInfo(openid, userInfo) {
    this.globalData.openid = openid;
    this.globalData.userInfo = userInfo;

    // 保存到本地存储
    wx.setStorageSync(STORAGE_KEYS.OPENID, openid);
    wx.setStorageSync(STORAGE_KEYS.USER_INFO, userInfo);
  },

  /**
   * 清除用户信息（登出）
   */
  clearUserInfo() {
    this.globalData.openid = '';
    this.globalData.userInfo = null;
    this.globalData.currentLedger = null;

    // 清除本地存储
    wx.removeStorageSync(STORAGE_KEYS.OPENID);
    wx.removeStorageSync(STORAGE_KEYS.USER_INFO);
    wx.removeStorageSync(STORAGE_KEYS.CURRENT_LEDGER);
  },
});
