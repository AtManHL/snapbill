/**
 * 日期工具函数
 */

/**
 * 格式化日期
 * @param {Date} date 日期对象
 * @param {string} format 格式化字符串，如 'YYYY-MM-DD HH:mm'
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  const second = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second);
}

/**
 * 获取今日开始时间（00:00:00）
 * @returns {Date}
 */
export function getTodayStart() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

/**
 * 获取今日结束时间（23:59:59）
 * @returns {Date}
 */
export function getTodayEnd() {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  return now;
}

/**
 * 获取本周开始时间（周一00:00:00）
 * @returns {Date}
 */
export function getWeekStart() {
  const now = new Date();
  const dayOfWeek = now.getDay() || 7; // 将周日(0)转为7
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek + 1);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * 获取本周结束时间（周日23:59:59）
 * @returns {Date}
 */
export function getWeekEnd() {
  const start = getWeekStart();
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * 获取本月开始时间（1日00:00:00）
 * @returns {Date}
 */
export function getMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
}

/**
 * 获取本月结束时间（最后一天23:59:59）
 * @returns {Date}
 */
export function getMonthEnd() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
}

/**
 * 获取本年开始时间（1月1日00:00:00）
 * @returns {Date}
 */
export function getYearStart() {
  const now = new Date();
  return new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
}

/**
 * 获取本年结束时间（12月31日23:59:59）
 * @returns {Date}
 */
export function getYearEnd() {
  const now = new Date();
  return new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
}

/**
 * 判断是否为同一天
 * @param {Date} date1
 * @param {Date} date2
 * @returns {boolean}
 */
export function isSameDay(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * 获取相对时间描述
 * @param {Date} date 日期
 * @returns {string} 如"刚刚"、"5分钟前"、"2小时前"、"昨天"、"3天前"
 */
export function getRelativeTime(date) {
  if (!date) return '';

  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return '刚刚';
  } else if (minutes < 60) {
    return `${minutes}分钟前`;
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else if (days === 1) {
    return '昨天';
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    return formatDate(date, 'MM-DD');
  }
}

/**
 * 将金额（元）转换为分
 * @param {number} amount 金额（元）
 * @returns {number} 金额（分）
 */
export function yuanToFen(amount) {
  return Math.round(parseFloat(amount) * 100);
}

/**
 * 将金额（分）转换为元
 * @param {number} amount 金额（分）
 * @returns {number} 金额（元）
 */
export function fenToYuan(amount) {
  return (parseFloat(amount) / 100).toFixed(2);
}

/**
 * 格式化金额显示
 * @param {number} amount 金额
 * @param {boolean} showSymbol 是否显示货币符号
 * @returns {string}
 */
export function formatAmount(amount, showSymbol = true) {
  const num = parseFloat(amount);
  if (isNaN(num)) return '0.00';
  return showSymbol ? `¥${num.toFixed(2)}` : num.toFixed(2);
}
