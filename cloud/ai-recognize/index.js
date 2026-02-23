// cloud/ai-recognize/index.js
const cloud = require('wx-server-sdk');

// 初始化云开发
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

/**
 * AI识别云函数
 */
exports.main = async (event, context) => {
  const { imageUrl } = event;

  try {
    // 1. 获取图片URL的临时访问地址
    const fileRes = await cloud.getTempFileURL({
      fileList: [imageUrl],
    });

    const imageHttpUrl = fileRes.fileList[0].tempFileURL;

    // 2. 调用AI识别（模拟实现，实际需要接入腾讯云混元VL）
    const recognitionResult = await recognizePaymentScreenshot(imageHttpUrl);

    if (!recognitionResult.success) {
      return {
        success: false,
        message: '识别失败',
        error: recognitionResult.error,
      };
    }

    // 3. 智能分类
    const category = smartClassify(recognitionResult.data);

    return {
      success: true,
      ...recognitionResult.data,
      categoryName: category.name,
      categoryId: category.categoryId || null,
    };
  } catch (error) {
    console.error('AI识别云函数错误:', error);
    return {
      success: false,
      message: '识别失败',
      error: error.message,
    };
  }
};

/**
 * 识别支付截图（模拟实现）
 * 实际需要接入腾讯云混元VL API
 */
async function recognizePaymentScreenshot(imageUrl) {
  // TODO: 实际项目中需要接入腾讯云混元VL API
  // 这里提供一个模拟实现用于开发测试

  return new Promise((resolve) => {
    // 模拟网络延迟
    setTimeout(() => {
      // 模拟识别结果
      resolve({
        success: true,
        data: {
          amount: '128.50',
          paymentTime: new Date().toISOString(),
          merchantName: '美团外卖',
        },
      });
    }, 1000);
  });

  /* 实际接入混元VL的代码示例（需要安装axios并配置环境变量）
  try {
    // 获取access_token
    const accessToken = await getAccessToken();

    // 构造请求
    const prompt = `
请识别这张支付截图中的以下信息：
1. 支付金额（以元为单位，如果是"¥12.50"则返回12.50）
2. 支付时间（格式为YYYY-MM-DD HH:mm）
3. 商户名称（如果有）

请以JSON格式返回结果，格式如下：
{
  "amount": "12.50",
  "paymentTime": "2024-01-15 14:30",
  "merchantName": "美团外卖"
}

如果识别失败或这不是支付截图，请返回：
{
  "error": "无法识别"
}
`;

    const axios = require('axios');
    const response = await axios.post(
      `https://hunyuan.cloud.tencent.com/hyllm/v1/images/generations`,
      {
        model: 'hunyuan-vision',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: imageUrl } },
              { type: 'text', text: prompt },
            ],
          },
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // 解析响应
    const content = response.data.choices[0].message.content;
    const result = JSON.parse(content);

    if (result.error) {
      return {
        success: false,
        message: result.error,
      };
    }

    return {
      success: true,
      data: {
        amount: result.amount,
        paymentTime: result.paymentTime,
        merchantName: result.merchantName || '',
      },
    };
  } catch (error) {
    console.error('混元VL识别失败:', error);
    return {
      success: false,
      message: '识别失败',
    };
  }
  */
}

/**
 * 获取混元VL access_token（示例代码）
 */
async function getAccessToken() {
  // TODO: 需要从环境变量读取配置
  const HUNYUAN_API_KEY = process.env.HUNYUAN_API_KEY;
  const HUNYUAN_SECRET_KEY = process.env.HUNYUAN_SECRET_KEY;

  try {
    const axios = require('axios');
    const response = await axios.post(
      'https://hunyuan.cloud.tencent.com/v1/oauth2/token',
      {
        grant_type: 'client_credentials',
        client_id: HUNYUAN_API_KEY,
        client_secret: HUNYUAN_SECRET_KEY,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('获取access_token失败:', error);
    throw error;
  }
}

/**
 * 智能分类
 */
function smartClassify(data) {
  const { amount, merchantName } = data;
  const amountNum = parseFloat(amount) || 0;

  // 基于商户名称的分类规则
  const merchantRules = [
    { keywords: ['美团', '饿了么', '外卖', '餐饮', '饭馆', '火锅', '烧烤', '奶茶', '咖啡', '餐厅'], category: '餐饮美食' },
    { keywords: ['超市', '商场', '购物', '服装', '化妆品', '母婴', '家居', '便利店'], category: '日常购物' },
    { keywords: ['滴滴', '打车', '公交', '地铁', '加油', '停车', '高速', '火车', '飞机', '出行'], category: '交通出行' },
    { keywords: ['房租', '房贷', '水电', '燃气', '物业', '宽带', '装修', '住房'], category: '居家住房' },
    { keywords: ['医院', '药店', '体检', '医疗', '药店'], category: '健康医疗' },
    { keywords: ['电影', '游戏', 'KTV', '旅游', '演唱会', '娱乐', '休闲'], category: '休闲娱乐' },
    { keywords: ['书店', '课程', '培训', '教育', '学习', '培训'], category: '学习成长' },
    { keywords: ['话费', '流量', '手机', '电脑', '数码', '电子'], category: '通讯数码' },
  ];

  // 优先匹配商户名称
  if (merchantName) {
    for (const rule of merchantRules) {
      if (rule.keywords.some(keyword => merchantName.includes(keyword))) {
        return { name: rule.category };
      }
    }
  }

  // 基于金额范围的辅助分类
  if (amountNum > 0) {
    if (amountNum < 30) {
      return { name: '日常购物' }; // 小额多为日常购物
    } else if (amountNum > 2000) {
      return { name: '居家住房' }; // 大额多为房租等
    }
  }

  // 默认分类
  return { name: '其他支出' };
}
