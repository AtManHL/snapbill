import { ArrowLeft, Search, Filter, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface HistoryProps {
  onNavigate: (page: string) => void;
}

export function History({ onNavigate }: HistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<number | null>(null);

  const records = [
    { id: 1, emoji: '🍽', category: '餐饮美食', amount: '45.80', time: '今天 12:30', merchant: '美团外卖', user: '小明', date: '2026-03-05' },
    { id: 2, emoji: '🚗', category: '交通出行', amount: '18.50', time: '今天 09:15', merchant: '滴滴出行', user: '小红', date: '2026-03-05' },
    { id: 3, emoji: '🛒', category: '日常购物', amount: '128.00', time: '昨天 19:20', merchant: '盒马鲜生', user: '小明', date: '2026-03-04' },
    { id: 4, emoji: '🏠', category: '居家住房', amount: '3500.00', time: '昨天 10:00', merchant: '房租', user: '小红', date: '2026-03-04' },
    { id: 5, emoji: '🍽', category: '餐饮美食', amount: '89.00', time: '3月3日 18:45', merchant: '海底捞', user: '小明', date: '2026-03-03' },
    { id: 6, emoji: '🎬', category: '休闲娱乐', amount: '156.00', time: '3月3日 14:20', merchant: '电影票', user: '小红', date: '2026-03-03' },
    { id: 7, emoji: '📱', category: '通讯数码', amount: '50.00', time: '3月2日 10:00', merchant: '话费充值', user: '小明', date: '2026-03-02' },
  ];

  // 按日期分组
  const groupedRecords = records.reduce((acc, record) => {
    const date = record.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(record);
    return acc;
  }, {} as Record<string, typeof records>);

  const getDateLabel = (date: string) => {
    const today = '2026-03-05';
    const yesterday = '2026-03-04';
    if (date === today) return '今天';
    if (date === yesterday) return '昨天';
    return date.slice(5); // 显示月-日
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-blue-50/30 to-white">
      {/* 导航栏 */}
      <div className="px-6 pt-6 pb-4 border-b border-blue-100">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={() => onNavigate('home')}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center"
          >
            <ArrowLeft size={20} className="text-blue-600" />
          </button>
          <h1 className="text-xl text-gray-800">历史记录</h1>
        </div>

        {/* 搜索栏 */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索金额、商户或分类"
              className="w-full h-11 pl-10 pr-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-800 placeholder:text-gray-400"
            />
          </div>
          <button className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center shadow-sm">
            <Filter size={18} className="text-blue-600" />
          </button>
        </div>
      </div>

      {/* 记录列表 */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {Object.entries(groupedRecords).map(([date, dateRecords]) => (
          <div key={date} className="mb-6">
            {/* 日期标题 */}
            <div className="flex items-center justify-between mb-3 px-2">
              <span className="text-sm text-gray-500">{getDateLabel(date)}</span>
              <span className="text-sm text-gray-500">
                共 {dateRecords.length} 笔
              </span>
            </div>

            {/* 当日记录 */}
            <div className="space-y-2">
              {dateRecords.map((record) => (
                <div key={record.id} className="relative">
                  <button
                    onClick={() => setSelectedRecord(selectedRecord === record.id ? null : record.id)}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white shadow-sm border border-gray-100 active:shadow-md"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-2xl shadow-sm">
                      {record.emoji}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm">{record.category}</p>
                        <span className="text-xs text-gray-400">·</span>
                        <p className="text-xs text-gray-500">{record.user}</p>
                      </div>
                      <p className="text-xs text-gray-400">{record.merchant} · {record.time.split(' ')[1]}</p>
                    </div>
                    <p className="text-lg">-¥{record.amount}</p>
                  </button>

                  {/* 操作按钮 */}
                  {selectedRecord === record.id && (
                    <div className="mt-2 flex gap-2">
                      <button className="flex-1 h-11 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 flex items-center justify-center gap-2 shadow-sm">
                        <Edit2 size={16} />
                        <span className="text-sm">编辑</span>
                      </button>
                      <button className="flex-1 h-11 rounded-xl bg-gradient-to-r from-red-50 to-red-100 text-red-600 flex items-center justify-center gap-2 shadow-sm">
                        <Trash2 size={16} />
                        <span className="text-sm">删除</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
