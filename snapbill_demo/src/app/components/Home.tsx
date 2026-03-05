import { Plus, TrendingUp, Clock, Users, Settings } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-blue-50/30 to-white">
      {/* 头部 */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl mb-1 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">我们的小家账本</h1>
            <p className="text-sm text-gray-600">3月账单</p>
          </div>
          <button 
            onClick={() => onNavigate('books')}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center"
          >
            <Settings size={20} className="text-blue-600" />
          </button>
        </div>

        {/* 本月支出卡片 */}
        <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-6 text-white mb-6 shadow-lg">
          <p className="text-sm opacity-80 mb-2">本月支出</p>
          <p className="text-4xl mb-4">¥8,456.80</p>
          <div className="flex gap-4 text-sm">
            <div>
              <span className="opacity-80">日均：</span>
              <span>¥282.56</span>
            </div>
            <div>
              <span className="opacity-80">笔数：</span>
              <span>127</span>
            </div>
          </div>
        </div>

        {/* 快速入口 */}
        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={() => onNavigate('statistics')}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 active:from-blue-100 active:to-blue-200"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-md">
              <TrendingUp size={20} className="text-white" />
            </div>
            <span className="text-sm text-blue-900">统计</span>
          </button>
          
          <button 
            onClick={() => onNavigate('history')}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 active:from-purple-100 active:to-purple-200"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-md">
              <Clock size={20} className="text-white" />
            </div>
            <span className="text-sm text-purple-900">记录</span>
          </button>
          
          <button 
            onClick={() => onNavigate('profile')}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100 active:from-pink-100 active:to-pink-200"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center shadow-md">
              <Users size={20} className="text-white" />
            </div>
            <span className="text-sm text-pink-900">成员</span>
          </button>
        </div>
      </div>

      {/* 最近记录 */}
      <div className="flex-1 px-6 pb-24 overflow-auto">
        <h2 className="text-lg mb-4 text-gray-700">最近记录</h2>
        
        <div className="space-y-3">
          {[
            { emoji: '🍽', category: '餐饮美食', amount: '45.80', time: '今天 12:30', merchant: '美团外卖', user: '小明' },
            { emoji: '🚗', category: '交通出行', amount: '18.50', time: '今天 09:15', merchant: '滴滴出行', user: '小红' },
            { emoji: '🛒', category: '日常购物', amount: '128.00', time: '昨天 19:20', merchant: '盒马鲜生', user: '小明' },
            { emoji: '🏠', category: '居家住房', amount: '3500.00', time: '昨天 10:00', merchant: '房租', user: '小红' },
            { emoji: '🍽', category: '餐饮美食', amount: '89.00', time: '3月3日 18:45', merchant: '海底捞', user: '小明' },
          ].map((record, index) => (
            <div key={index} className="flex items-center gap-3 p-4 rounded-2xl bg-white shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-2xl shadow-sm">
                {record.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-gray-800">{record.category}</p>
                  <span className="text-xs text-gray-300">·</span>
                  <p className="text-xs text-gray-500">{record.user}</p>
                </div>
                <p className="text-xs text-gray-400">{record.merchant} · {record.time}</p>
              </div>
              <p className="text-lg text-gray-700">-¥{record.amount}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 底部添加按钮 */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <button 
          onClick={() => onNavigate('add')}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-xl flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus size={32} />
        </button>
      </div>
    </div>
  );
}
