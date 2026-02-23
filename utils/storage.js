/**
 * 本地存储封装
 */

/**
 * 设置存储
 * @param {string} key 键
 * @param {*} value 值
 */
export function setStorage(key, value) {
  try {
    wx.setStorageSync(key, value);
  } catch (error) {
    console.error('设置存储失败:', error);
  }
}

/**
 * 获取存储
 * @param {string} key 键
 * @returns {*} 值
 */
export function getStorage(key) {
  try {
    return wx.getStorageSync(key);
  } catch (error) {
    console.error('获取存储失败:', error);
    return null;
  }
}

/**
 * 删除存储
 * @param {string} key 键
 */
export function removeStorage(key) {
  try {
    wx.removeStorageSync(key);
  } catch (error) {
    console.error('删除存储失败:', error);
  }
}

/**
 * 清空存储
 */
export function clearStorage() {
  try {
    wx.clearStorageSync();
  } catch (error) {
    console.error('清空存储失败:', error);
  }
}

/**
 * 获取存储信息
 * @returns {object}
 */
export function getStorageInfo() {
  try {
    return wx.getStorageInfoSync();
  } catch (error) {
    console.error('获取存储信息失败:', error);
    return { keys: [], currentSize: 0, limitSize: 0 };
  }
}

/**
 * 异步设置存储
 * @param {string} key 键
 * @param {*} value 值
 * @returns {Promise}
 */
export function setStorageAsync(key, value) {
  return new Promise((resolve, reject) => {
    wx.setStorage({
      key,
      data: value,
      success: resolve,
      fail: reject,
    });
  });
}

/**
 * 异步获取存储
 * @param {string} key 键
 * @returns {Promise}
 */
export function getStorageAsync(key) {
  return new Promise((resolve, reject) => {
    wx.getStorage({
      key,
      success: (res) => resolve(res.data),
      fail: reject,
    });
  });
}

/**
 * 异步删除存储
 * @param {string} key 键
 * @returns {Promise}
 */
export function removeStorageAsync(key) {
  return new Promise((resolve, reject) => {
    wx.removeStorage({
      key,
      success: resolve,
      fail: reject,
    });
  });
}
