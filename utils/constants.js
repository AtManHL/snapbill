/**
 * 常量定义
 */

// 默认分类列表
export const DEFAULT_CATEGORIES = [
  {
    name: '餐饮美食',
    icon: '🍽',
    color: '#FF6B6B',
    sort: 1,
    isDefault: true,
  },
  {
    name: '日常购物',
    icon: '🛒',
    color: '#4ECDC4',
    sort: 2,
    isDefault: true,
  },
  {
    name: '交通出行',
    icon: '🚗',
    color: '#45B7D1',
    sort: 3,
    isDefault: true,
  },
  {
    name: '居家住房',
    icon: '🏠',
    color: '#96CEB4',
    sort: 4,
    isDefault: true,
  },
  {
    name: '健康医疗',
    icon: '🏥',
    color: '#FFEAA7',
    sort: 5,
    isDefault: true,
  },
  {
    name: '休闲娱乐',
    icon: '🎬',
    color: '#DDA0DD',
    sort: 6,
    isDefault: true,
  },
  {
    name: '学习成长',
    icon: '📚',
    color: '#98D8C8',
    sort: 7,
    isDefault: true,
  },
  {
    name: '人情往来',
    icon: '🧾',
    color: '#F7DC6F',
    sort: 8,
    isDefault: true,
  },
  {
    name: '通讯数码',
    icon: '📱',
    color: '#BB8FCE',
    sort: 9,
    isDefault: true,
  },
  {
    name: '其他支出',
    icon: '💰',
    color: '#95A5A6',
    sort: 10,
    isDefault: true,
  },
];

// 存储键名
export const STORAGE_KEYS = {
  OPENID: 'openid',
  USER_INFO: 'userInfo',
  CURRENT_LEDGER: 'currentLedger',
};

// 云函数名称
export const CLOUD_FUNCTIONS = {
  INIT: 'init',
  LOGIN: 'login',
  AI_RECOGNIZE: 'ai-recognize',
  RECORD: 'record',
  LEDGER: 'ledger',
  STATISTICS: 'statistics',
};

// 图表颜色
export const CHART_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#95A5A6',
];

// 错误提示
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络错误，请重试',
  AI_RECOGNIZE_FAILED: '识别失败，请手动输入',
  INVALID_IMAGE: '非支付截图，请重新上传',
  TIMEOUT: '请求超时，请重试',
  INVALID_INVITE_CODE: '邀请码失效',
  INVALID_AMOUNT: '请输入有效金额',
  INVALID_TIME: '请选择时间',
  PERMISSION_DENIED: '无权限操作',
};
