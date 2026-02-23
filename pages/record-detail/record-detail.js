// pages/record-detail/record-detail.js
const app = getApp();
import { formatDate, formatAmount } from '../../utils/date.js';
import { callCloudFunction, showToast, showLoading, hideLoading } from '../../utils/request.js';
import { validateAmount, validateDateTime } from '../../utils/validate.js';

Page({
  data: {
    recordId: '',
    record: null,
    loading: false,
    editing: false,
    editData: {
      amount: '',
      paymentTime: '',
      categoryId: '',
      categoryName: '',
      categoryIcon: '',
      categoryColor: '',
      merchantName: '',
      remark: '',
    },
    categories: [],
    showImagePreview: false,
  },

  onLoad(options) {
    const { id } = options;
    if (!id) {
      showToast('记录ID不存在');
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }

    this.setData({ recordId: id });
    this.loadRecord(id);
    this.loadCategories();
  },

  /**
   * 加载记录详情
   */
  async loadRecord(id) {
    this.setData({ loading: true });

    try {
      // TODO: 调用云函数获取记录
      // const res = await callCloudFunction('record', {
      //   action: 'get',
      //   _id: id,
      // });

      // 模拟数据
      const record = {
        _id: id,
        amount: 128.50,
        categoryName: '餐饮美食',
        categoryIcon: '🍽',
        categoryColor: '#FF6B6B',
        paymentTime: new Date(),
        merchantName: '美团外卖',
        remark: '午餐',
        thumbnailUrl: '',
      };

      this.setData({
        record,
        loading: false,
      });
    } catch (error) {
      console.error('加载记录失败:', error);
      this.setData({ loading: false });
      showToast('加载失败，请重试');
    }
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
   * 开始编辑
   */
  startEdit() {
    const { record } = this.data;
    this.setData({
      editing: true,
      editData: {
        amount: record.amount.toString(),
        paymentTime: formatDate(new Date(record.paymentTime), 'YYYY-MM-DD HH:mm'),
        categoryId: record.categoryId,
        categoryName: record.categoryName,
        categoryIcon: record.categoryIcon,
        categoryColor: record.categoryColor,
        merchantName: record.merchantName || '',
        remark: record.remark || '',
      },
    });
  },

  /**
   * 取消编辑
   */
  cancelEdit() {
    this.setData({ editing: false });
  },

  /**
   * 保存编辑
   */
  async saveEdit() {
    const { recordId, editData } = this.data;

    // 验证金额
    const amountValid = validateAmount(editData.amount);
    if (!amountValid.valid) {
      showToast(amountValid.message);
      return;
    }

    // 验证时间
    const timeValid = validateDateTime(editData.paymentTime);
    if (!timeValid.valid) {
      showToast(timeValid.message);
      return;
    }

    showLoading('保存中...');

    try {
      // TODO: 调用云函数更新记录
      // await callCloudFunction('record', {
      //   action: 'update',
      //   _id: recordId,
      //   amount: parseFloat(editData.amount),
      //   paymentTime: new Date(editData.paymentTime),
      //   categoryId: editData.categoryId,
      //   categoryName: editData.categoryName,
      //   merchantName: editData.merchantName,
      //   remark: editData.remark,
      // });

      hideLoading();
      showToast('保存成功', 'success');

      // 退出编辑模式并重新加载
      setTimeout(() => {
        this.setData({ editing: false });
        this.loadRecord(recordId);
      }, 1500);
    } catch (error) {
      console.error('保存失败:', error);
      hideLoading();
      showToast('保存失败，请重试');
    }
  },

  /**
   * 删除记录
   */
  async deleteRecord() {
    const { recordId } = this.data;

    const confirmed = await wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      confirmText: '删除',
      cancelText: '取消',
    });

    if (!confirmed) {
      return;
    }

    showLoading('删除中...');

    try {
      // TODO: 调用云函数删除记录
      // await callCloudFunction('record', {
      //   action: 'delete',
      //   _id: recordId,
      // });

      hideLoading();
      showToast('删除成功', 'success');

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (error) {
      console.error('删除失败:', error);
      hideLoading();
      showToast('删除失败，请重试');
    }
  },

  /**
   * 编辑表单输入处理
   */
  onEditAmountChange(e) {
    this.setData({ 'editData.amount': e.detail.value });
  },

  onEditTimeChange(e) {
    this.setData({ 'editData.paymentTime': e.detail.value });
  },

  onEditCategoryChange(e) {
    const index = parseInt(e.detail.value);
    const category = this.data.categories[index];
    this.setData({
      'editData.categoryIndex': index,
      'editData.categoryId': category._id,
      'editData.categoryName': category.name,
      'editData.categoryIcon': category.icon,
      'editData.categoryColor': category.color,
    });
  },

  onEditMerchantChange(e) {
    this.setData({ 'editData.merchantName': e.detail.value });
  },

  onEditRemarkChange(e) {
    this.setData({ 'editData.remark': e.detail.value });
  },

  /**
   * 预览图片
   */
  previewImage() {
    const { record } = this.data;
    if (record.thumbnailUrl) {
      wx.previewImage({
        urls: [record.thumbnailUrl],
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
   * 格式化日期
   */
  formatDate(dateStr) {
    if (!dateStr) return '';
    return formatDate(new Date(dateStr), 'YYYY-MM-DD HH:mm');
  },
});
