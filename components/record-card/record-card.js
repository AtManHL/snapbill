Component({
  properties: {
    // 分类名称
    categoryName: {
      type: String,
      value: '',
    },
    // 分类图标
    categoryIcon: {
      type: String,
      value: '💰',
    },
    // 分类颜色
    categoryColor: {
      type: String,
      value: '#FF6B6B',
    },
    // 金额
    amount: {
      type: String,
      value: '0.00',
    },
    // 时间（如 12:30）
    time: {
      type: String,
      value: '',
    },
    // 日期（如 02-24）
    date: {
      type: String,
      value: '',
    },
    // 记账人
    payerName: {
      type: String,
      value: '',
    },
    // 备注
    remark: {
      type: String,
      value: '',
    },
  },

  data: {},

  methods: {
    /**
     * 点击记录卡片
     */
    onTap() {
      this.triggerEvent('tap');
    },
  },
});
