// pages/add-record/add-record.js
const app = getApp();
import { formatDate, yuanToFen } from '../../utils/date.js';
import { validateAmount, validateDateTime } from '../../utils/validate.js';
import { callCloudFunction, uploadToCloud, showToast, showLoading, hideLoading } from '../../utils/request.js';

Page({
  data: {
    uploadMode: 'album', // album: 相册, camera: 拍照
    imageUrl: '',
    loading: false,
    categories: [],

    // AI识别结果
    recognizedData: null,

    // 手动输入数据
    manualData: {
      amount: '',
      paymentTime: formatDate(new Date(), 'YYYY-MM-DD HH:mm'),
      categoryIndex: 9, // 默认"其他支出"
      categoryId: '',
      categoryName: '其他支出',
      categoryIcon: '💰',
      categoryColor: '#95A5A6',
      remark: '',
    },

    showManualInput: false,
    currentLedgerId: '',
  },

  onLoad() {
    this.loadCategories();
    this.loadCurrentLedger();
  },

  /**
   * 加载分类列表
   */
  async loadCategories() {
    try {
      const db = wx.cloud.database();
      const res = await db.collection('categories')
        .where({ isDeleted: false })
        .orderBy('sort', 'asc')
        .get();

      this.setData({
        categories: res.data,
      });
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
   * 切换上传方式
   */
  switchUploadMode(e) {
    const { mode } = e.currentTarget.dataset;
    this.setData({ uploadMode: mode });
  },

  /**
   * 选择图片
   */
  chooseImage() {
    const { uploadMode } = this.data;
    const sourceType = uploadMode === 'camera' ? ['camera'] : ['album'];

    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType,
      sizeType: ['compressed'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setData({ imageUrl: tempFilePath });
        this.recognizeImage(tempFilePath);
      },
      fail: (err) => {
        console.error('选择图片失败:', err);
        showToast('选择图片失败');
      },
    });
  },

  /**
   * AI识别图片
   */
  async recognizeImage(filePath) {
    showLoading('识别中...');

    try {
      // 1. 上传图片到云存储
      const uploadRes = await this.uploadImage(filePath);
      const fileID = uploadRes.fileID;

      // 2. 调用AI识别云函数
      const recognizeRes = await callCloudFunction('ai-recognize', {
        imageUrl: fileID,
      }, { loading: false, showErrorMessage: false });

      if (recognizeRes && recognizeRes.success) {
        // 识别成功
        const categoryIndex = this.findCategoryIndex(recognizeRes.categoryName);
        const category = this.data.categories[categoryIndex] || this.data.categories[9];

        this.setData({
          recognizedData: {
            amount: recognizeRes.amount || '',
            paymentTime: recognizeRes.paymentTime || formatDate(new Date(), 'YYYY-MM-DD HH:mm'),
            categoryIndex,
            categoryId: category._id,
            categoryName: category.name,
            categoryIcon: category.icon,
            categoryColor: category.color,
            merchantName: recognizeRes.merchantName || '',
            originalImageUrl: fileID,
          },
          loading: false,
        });

        showToast('识别成功', 'success');
      } else {
        // 识别失败，显示降级方案
        this.setData({
          showManualInput: true,
          loading: false,
        });
        showToast('识别失败，请手动输入');
      }
    } catch (error) {
      console.error('AI识别失败:', error);
      this.setData({
        showManualInput: true,
        loading: false,
      });
      showToast('识别失败，请手动输入');
    } finally {
      hideLoading();
    }
  },

  /**
   * 上传图片到云存储
   */
  async uploadImage(filePath) {
    const cloudPath = `records/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
    return await uploadToCloud(cloudPath, filePath);
  },

  /**
   * 查找分类索引
   */
  findCategoryIndex(categoryName) {
    const index = this.data.categories.findIndex(cat =>
      cat.name === categoryName
    );
    return index >= 0 ? index : 9; // 找不到则返回"其他支出"的索引
  },

  /**
   * AI识别结果输入处理
   */
  onAmountChange(e) {
    this.setData({
      'recognizedData.amount': e.detail.value,
    });
  },

  onTimeChange(e) {
    this.setData({
      'recognizedData.paymentTime': e.detail.value,
    });
  },

  onCategoryChange(e) {
    const index = parseInt(e.detail.value);
    const category = this.data.categories[index];
    this.setData({
      'recognizedData.categoryIndex': index,
      'recognizedData.categoryId': category._id,
      'recognizedData.categoryName': category.name,
      'recognizedData.categoryIcon': category.icon,
      'recognizedData.categoryColor': category.color,
    });
  },

  onMerchantChange(e) {
    this.setData({
      'recognizedData.merchantName': e.detail.value,
    });
  },

  /**
   * 手动输入处理
   */
  onManualAmountChange(e) {
    this.setData({
      'manualData.amount': e.detail.value,
    });
  },

  onManualTimeChange(e) {
    this.setData({
      'manualData.paymentTime': e.detail.value,
    });
  },

  onManualCategoryChange(e) {
    const index = parseInt(e.detail.value);
    const category = this.data.categories[index];
    this.setData({
      'manualData.categoryIndex': index,
      'manualData.categoryId': category._id,
      'manualData.categoryName': category.name,
      'manualData.categoryIcon': category.icon,
      'manualData.categoryColor': category.color,
    });
  },

  onManualRemarkChange(e) {
    this.setData({
      'manualData.remark': e.detail.value,
    });
  },

  /**
   * 显示手动输入
   */
  showManualInput() {
    this.setData({ showManualInput: true });
  },

  /**
   * 取消记账
   */
  onCancel() {
    wx.navigateBack();
  },

  /**
   * 确认记账
   */
  async onConfirm() {
    const { recognizedData, manualData, showManualInput, currentLedgerId } = this.data;

    // 确定使用的数据源
    const data = showManualInput ? manualData : recognizedData;

    // 验证金额
    const amountValid = validateAmount(data.amount);
    if (!amountValid.valid) {
      showToast(amountValid.message);
      return;
    }

    // 验证时间
    const timeValid = validateDateTime(data.paymentTime);
    if (!timeValid.valid) {
      showToast(timeValid.message);
      return;
    }

    try {
      showLoading('记账中...');

      // 准备记录数据
      const recordData = {
        ledgerId: currentLedgerId,
        amount: parseFloat(data.amount),
        amountInCents: yuanToFen(data.amount),
        categoryId: data.categoryId,
        categoryName: data.categoryName,
        paymentTime: new Date(data.paymentTime),
        payerId: app.globalData.openid,
        payerName: app.globalData.userInfo?.nickName || '',
        merchantName: data.merchantName || '',
        remark: data.remark || '',
        isAIEstimated: !showManualInput,
        createTime: new Date(),
        updateTime: new Date(),
      };

      // 如果有图片，添加图片URL
      if (data.originalImageUrl) {
        recordData.originalImageUrl = data.originalImageUrl;
        recordData.thumbnailUrl = data.originalImageUrl + '?thumbnail/400x400';
      }

      // TODO: 调用云函数添加记录（待实现）
      // const result = await callCloudFunction('record', {
      //   action: 'add',
      //   ...recordData,
      // });

      hideLoading();
      showToast('记账成功', 'success');

      // 返回首页
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/index/index',
        });
      }, 1500);
    } catch (error) {
      console.error('记账失败:', error);
      hideLoading();
      showToast('记账失败，请重试');
    }
  },

  /**
   * 格式化时间显示
   */
  formatTime(timeStr) {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    return formatDate(date, 'MM-DD HH:mm');
  },
});
