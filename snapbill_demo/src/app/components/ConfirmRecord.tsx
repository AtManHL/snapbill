import { ArrowLeft, Calendar, Tag, Store } from 'lucide-react';
import { useState } from 'react';

interface ConfirmRecordProps {
  data: any;
  onNavigate: (page: string) => void;
}

const categories = [
  { emoji: '🍽', name: '餐饮美食' },
  { emoji: '🛒', name: '日常购物' },
  { emoji: '🚗', name: '交通出行' },
  { emoji: '🏠', name: '居家住房' },
  { emoji: '🏥', name: '健康医疗' },
  { emoji: '🎬', name: '休闲娱乐' },
  { emoji: '📚', name: '学习成长' },
  { emoji: '🧾', name: '人情往来' },
  { emoji: '📱', name: '通讯数码' },
  { emoji: '💰', name: '其他支出' },
];

export function ConfirmRecord({ data, onNavigate }: ConfirmRecordProps) {
  const [amount, setAmount] = useState(data?.amount || '');
  const [category, setCategory] = useState(data?.category || '餐饮美食');
  const [showCategories, setShowCategories] = useState(false);
  const [merchant, setMerchant] = useState(data?.merchant || '');
  const [time, setTime] = useState(data?.time || '');

  const handleConfirm = () => {
    // 模拟保存
    setTimeout(() => {
      onNavigate('home');
    }, 300);
  };

  const selectedCategory = categories.find(c => c.name === category) || categories[0];

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-blue-50/30 to-white">
      {/* 导航栏 */}
      <div className="px-6 pt-6 pb-4 flex items-center gap-4 border-b border-blue-100">
        <button 
          onClick={() => onNavigate('add')}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center"
        >
          <ArrowLeft size={20} className="text-blue-600" />
        </button>
        <h1 className="text-xl text-gray-800">确认记账</h1>
      </div>

      <div className="flex-1 overflow-auto px-6 py-6">
        {/* AI识别提示 */}
        {data?.merchant && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 shadow-sm">
            <p className="text-sm bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ✨ AI已自动识别支付信息，请确认后提交
            </p>
          </div>
        )}

        {/* 金额输入 */}
        <div className="mb-6">
          <label className="text-sm text-gray-500 mb-2 block">支付金额</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-400">¥</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-16 pl-12 pr-4 text-2xl rounded-2xl border-2 border-gray-200 focus:border-gray-900 focus:outline-none"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* 分类选择 */}
        <div className="mb-6">
          <label className="text-sm text-gray-500 mb-2 block">消费分类</label>
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="w-full h-14 px-4 rounded-2xl border-2 border-gray-200 flex items-center gap-3 active:bg-gray-50"
          >
            <Tag size={20} className="text-gray-400" />
            <span className="text-2xl">{selectedCategory.emoji}</span>
            <span className="flex-1 text-left">{selectedCategory.name}</span>
            <span className="text-gray-400">›</span>
          </button>

          {/* 分类选择器 */}
          {showCategories && (
            <div className="mt-3 p-3 rounded-2xl border-2 border-gray-200 bg-white grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => {
                    setCategory(cat.name);
                    setShowCategories(false);
                  }}
                  className={`p-3 rounded-xl flex flex-col items-center gap-1 ${
                    category === cat.name ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md' : 'bg-gradient-to-br from-blue-50 to-purple-50 active:from-blue-100 active:to-purple-100 text-gray-700'
                  }`}
                >
                  <span className="text-2xl">{cat.emoji}</span>
                  <span className="text-xs">{cat.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 商户名称 */}
        <div className="mb-6">
          <label className="text-sm text-gray-500 mb-2 block">商户名称（可选）</label>
          <div className="relative">
            <Store size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className="w-full h-14 pl-12 pr-4 rounded-2xl border-2 border-gray-200 focus:border-gray-900 focus:outline-none"
              placeholder="如：美团外卖"
            />
          </div>
        </div>

        {/* 支付时间 */}
        <div className="mb-6">
          <label className="text-sm text-gray-500 mb-2 block">支付时间</label>
          <div className="relative">
            <Calendar size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="datetime-local"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full h-14 pl-12 pr-4 rounded-2xl border-2 border-gray-200 focus:border-gray-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 底部按钮 */}
      <div className="p-6 border-t border-blue-100 bg-white">
        <div className="flex gap-3">
          <button
            onClick={() => onNavigate('add')}
            className="flex-1 h-14 rounded-2xl border-2 border-blue-200 text-blue-600 active:bg-blue-50"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white active:from-blue-600 active:to-purple-700 shadow-md"
          >
            确认记账
          </button>
        </div>
      </div>
    </div>
  );
}
