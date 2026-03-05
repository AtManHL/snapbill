import { ArrowLeft, ChevronDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface StatisticsProps {
  onNavigate: (page: string) => void;
}

const data = [
  { name: '餐饮美食', value: 2856, emoji: '🍽' },
  { name: '居家住房', value: 3500, emoji: '🏠' },
  { name: '交通出行', value: 856, emoji: '🚗' },
  { name: '日常购物', value: 645, emoji: '🛒' },
  { name: '休闲娱乐', value: 399, emoji: '🎬' },
  { name: '其他', value: 200, emoji: '💰' },
];

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

export function Statistics({ onNavigate }: StatisticsProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-blue-50/30 to-white">
      {/* 导航栏 */}
      <div className="px-6 pt-6 pb-4 flex items-center gap-4 border-b border-blue-100">
        <button 
          onClick={() => onNavigate('home')}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center"
        >
          <ArrowLeft size={20} className="text-blue-600" />
        </button>
        <h1 className="text-xl text-gray-800">统计分析</h1>
      </div>

      <div className="flex-1 overflow-auto pb-6">
        {/* 时间选择 */}
        <div className="px-6 py-4">
          <button className="w-full h-12 px-4 rounded-2xl bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-between shadow-sm">
            <span className="text-blue-900">2026年3月</span>
            <ChevronDown size={20} className="text-blue-600" />
          </button>
        </div>

        {/* 总支出 */}
        <div className="px-6 mb-6">
          <p className="text-sm text-gray-500 mb-1">总支出</p>
          <p className="text-4xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">¥{total.toLocaleString()}</p>
        </div>

        {/* 饼图 */}
        <div className="h-64 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => `¥${value.toLocaleString()}`}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid #e5e7eb',
                  fontSize: '14px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 分类明细 */}
        <div className="px-6">
          <h2 className="text-lg mb-4 text-gray-700">分类明细</h2>
          <div className="space-y-3">
            {data.map((item, index) => {
              const percentage = ((item.value / total) * 100).toFixed(1);
              return (
                <div key={item.name} className="flex items-center gap-3 p-4 rounded-2xl bg-white shadow-sm border border-gray-100">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-gradient-to-br from-blue-100 to-purple-100 shadow-sm">
                    {item.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{item.name}</span>
                      <span className="text-sm text-gray-500">{percentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: COLORS[index]
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-lg">¥{item.value.toLocaleString()}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 成员统计 */}
        <div className="px-6 mt-8">
          <h2 className="text-lg mb-4 text-gray-700">成员统计</h2>
          <div className="space-y-3">
            {[
              { name: '小明', amount: 4856, avatar: '👨' },
              { name: '小红', amount: 3600, avatar: '👩' },
            ].map((member) => {
              const percentage = ((member.amount / total) * 100).toFixed(1);
              return (
                <div key={member.name} className="flex items-center gap-3 p-4 rounded-2xl bg-white shadow-sm border border-gray-100">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-200 to-pink-300 flex items-center justify-center text-2xl shadow-sm">
                    {member.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-800">{member.name}</span>
                      <span className="text-sm text-gray-500">{percentage}%</span>
                    </div>
                    <div className="h-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-lg">¥{member.amount.toLocaleString()}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
