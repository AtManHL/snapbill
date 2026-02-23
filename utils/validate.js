/**
 * 数据验证工具函数
 */

/**
 * 验证金额
 * @param {string|number} amount 金额
 * @returns {object} { valid: boolean, message: string }
 */
export function validateAmount(amount) {
  if (amount === '' || amount === null || amount === undefined) {
    return { valid: false, message: '请输入金额' };
  }

  const num = parseFloat(amount);
  if (isNaN(num)) {
    return { valid: false, message: '金额格式不正确' };
  }

  if (num <= 0) {
    return { valid: false, message: '金额必须大于0' };
  }

  if (num > 1000000) {
    return { valid: false, message: '金额不能超过100万' };
  }

  return { valid: true };
}

/**
 * 验证日期时间
 * @param {string} datetime 日期时间字符串
 * @returns {object} { valid: boolean, message: string }
 */
export function validateDateTime(datetime) {
  if (!datetime) {
    return { valid: false, message: '请选择时间' };
  }

  const date = new Date(datetime);
  if (isNaN(date.getTime())) {
    return { valid: false, message: '时间格式不正确' };
  }

  // 检查是否为未来时间
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date > tomorrow) {
    return { valid: false, message: '时间不能是未来时间' };
  }

  return { valid: true };
}

/**
 * 验证文本长度
 * @param {string} text 文本
 * @param {number} min 最小长度
 * @param {number} max 最大长度
 * @returns {object} { valid: boolean, message: string }
 */
export function validateTextLength(text, min = 0, max = 100) {
  const length = text ? text.trim().length : 0;

  if (length < min) {
    return { valid: false, message: `至少输入${min}个字符` };
  }

  if (length > max) {
    return { valid: false, message: `最多输入${max}个字符` };
  }

  return { valid: true };
}

/**
 * 验证账本名称
 * @param {string} name 账本名称
 * @returns {object} { valid: boolean, message: string }
 */
export function validateLedgerName(name) {
  if (!name || name.trim() === '') {
    return { valid: false, message: '请输入账本名称' };
  }

  const result = validateTextLength(name.trim(), 1, 50);
  if (!result.valid) {
    return result;
  }

  return { valid: true };
}

/**
 * 验证备注
 * @param {string} remark 备注
 * @returns {object} { valid: boolean, message: string }
 */
export function validateRemark(remark) {
  if (!remark || remark.trim() === '') {
    return { valid: true }; // 备注可为空
  }

  return validateTextLength(remark.trim(), 0, 200);
}

/**
 * 验证手机号
 * @param {string} phone 手机号
 * @returns {object} { valid: boolean, message: string }
 */
export function validatePhone(phone) {
  if (!phone) {
    return { valid: false, message: '请输入手机号' };
  }

  const regex = /^1[3-9]\d{9}$/;
  if (!regex.test(phone)) {
    return { valid: false, message: '手机号格式不正确' };
  }

  return { valid: true };
}

/**
 * 验证图片大小
 * @param {number} size 文件大小（字节）
 * @param {number} maxSize 最大大小（字节，默认5MB）
 * @returns {object} { valid: boolean, message: string }
 */
export function validateImageSize(size, maxSize = 5 * 1024 * 1024) {
  if (size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return { valid: false, message: `图片大小不能超过${maxSizeMB}MB` };
  }

  return { valid: true };
}

/**
 * 验证图片类型
 * @param {string} type 文件类型
 * @returns {object} { valid: boolean, message: string }
 */
export function validateImageType(type) {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

  if (!validTypes.includes(type)) {
    return { valid: false, message: '仅支持JPG、PNG、GIF格式' };
  }

  return { valid: true };
}
