/**
 * 网络请求封装
 */

/**
 * 调用云函数
 * @param {string} name 云函数名称
 * @param {object} data 传递的数据
 * @param {object} options 配置选项
 * @returns {Promise}
 */
export function callCloudFunction(name, data = {}, options = {}) {
  const { loading = true, loadingText = '加载中...', showErrorMessage = true } = options;

  return new Promise((resolve, reject) => {
    if (loading) {
      wx.showLoading({ title: loadingText, mask: true });
    }

    wx.cloud.callFunction({
      name,
      data,
      success: (res) => {
        wx.hideLoading();
        resolve(res.result);
      },
      fail: (error) => {
        wx.hideLoading();

        console.error(`云函数调用失败 [${name}]:`, error);

        if (showErrorMessage) {
          const errorMessage = error.errMsg || '请求失败，请重试';
          wx.showToast({
            title: errorMessage,
            icon: 'none',
            duration: 2000,
          });
        }

        reject(error);
      },
    });
  });
}

/**
 * 上传文件到云存储
 * @param {string} cloudPath 云存储路径
 * @param {string} filePath 本地文件路径
 * @param {object} options 配置选项
 * @returns {Promise}
 */
export function uploadToCloud(cloudPath, filePath, options = {}) {
  const { loading = true, loadingText = '上传中...', showErrorMessage = true } = options;

  return new Promise((resolve, reject) => {
    if (loading) {
      wx.showLoading({ title: loadingText, mask: true });
    }

    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: (res) => {
        wx.hideLoading();
        resolve(res);
      },
      fail: (error) => {
        wx.hideLoading();

        console.error('文件上传失败:', error);

        if (showErrorMessage) {
          wx.showToast({
            title: '上传失败，请重试',
            icon: 'none',
            duration: 2000,
          });
        }

        reject(error);
      },
    });
  });
}

/**
 * 获取临时文件链接
 * @param {Array<string>} fileList 文件ID列表
 * @param {object} options 配置选项
 * @returns {Promise}
 */
export function getTempFileURL(fileList, options = {}) {
  const { showErrorMessage = true } = options;

  return new Promise((resolve, reject) => {
    wx.cloud.getTempFileURL({
      fileList,
      success: (res) => {
        resolve(res);
      },
      fail: (error) => {
        console.error('获取临时链接失败:', error);

        if (showErrorMessage) {
          wx.showToast({
            title: '获取文件失败',
            icon: 'none',
            duration: 2000,
          });
        }

        reject(error);
      },
    });
  });
}

/**
 * 删除云存储文件
 * @param {Array<string>} fileList 文件ID列表
 * @param {object} options 配置选项
 * @returns {Promise}
 */
export function deleteCloudFile(fileList, options = {}) {
  const { showErrorMessage = true } = options;

  return new Promise((resolve, reject) => {
    wx.cloud.deleteFile({
      fileList,
      success: (res) => {
        resolve(res);
      },
      fail: (error) => {
        console.error('删除文件失败:', error);

        if (showErrorMessage) {
          wx.showToast({
            title: '删除文件失败',
            icon: 'none',
            duration: 2000,
          });
        }

        reject(error);
      },
    });
  });
}

/**
 * 下载文件
 * @param {string} url 文件URL
 * @param {object} options 配置选项
 * @returns {Promise}
 */
export function downloadFile(url, options = {}) {
  const { loading = true, loadingText = '下载中...', showErrorMessage = true } = options;

  return new Promise((resolve, reject) => {
    if (loading) {
      wx.showLoading({ title: loadingText, mask: true });
    }

    wx.downloadFile({
      url,
      success: (res) => {
        wx.hideLoading();

        if (res.statusCode === 200) {
          resolve(res.tempFilePath);
        } else {
          throw new Error(`下载失败，状态码: ${res.statusCode}`);
        }
      },
      fail: (error) => {
        wx.hideLoading();

        console.error('下载失败:', error);

        if (showErrorMessage) {
          wx.showToast({
            title: '下载失败，请重试',
            icon: 'none',
            duration: 2000,
          });
        }

        reject(error);
      },
    });
  });
}

/**
 * 显示 Toast 提示
 * @param {string} title 提示内容
 * @param {string} icon 图标类型
 * @param {number} duration 持续时间
 */
export function showToast(title, icon = 'none', duration = 2000) {
  wx.showToast({
    title,
    icon,
    duration,
  });
}

/**
 * 显示加载提示
 * @param {string} title 提示内容
 */
export function showLoading(title = '加载中...') {
  wx.showLoading({
    title,
    mask: true,
  });
}

/**
 * 隐藏加载提示
 */
export function hideLoading() {
  wx.hideLoading();
}

/**
 * 显示确认对话框
 * @param {string} content 对话框内容
 * @param {object} options 配置选项
 * @returns {Promise<boolean>}
 */
export function showModal(content, options = {}) {
  const {
    title = '提示',
    confirmText = '确定',
    cancelText = '取消',
    showCancel = true,
  } = options;

  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      confirmText,
      cancelText,
      showCancel,
      success: (res) => {
        resolve(res.confirm);
      },
      fail: () => {
        resolve(false);
      },
    });
  });
}
