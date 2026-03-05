import { ArrowLeft, Plus, Users, Share2, Settings, Trash2, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface BookManagementProps {
  onNavigate: (page: string) => void;
}

export function BookManagement({ onNavigate }: BookManagementProps) {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteCode] = useState('A8K9M2');

  const books = [
    { id: 1, name: '我们的小家账本', members: 2, amount: 8456, isActive: true },
    { id: 2, name: '旅行账本', members: 4, amount: 12350, isActive: false },
  ];

  const members = [
    { id: 1, name: '小明', avatar: '👨', role: '创建者' },
    { id: 2, name: '小红', avatar: '👩', role: '成员' },
  ];

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
        <h1 className="text-xl text-gray-800">账本管理</h1>
      </div>

      <div className="flex-1 overflow-auto px-6 py-6">
        {/* 我的账本 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg text-gray-700">我的账本</h2>
            <button className="h-9 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm flex items-center gap-1 shadow-md">
              <Plus size={16} />
              <span>创建</span>
            </button>
          </div>

          <div className="space-y-3">
            {books.map((book) => (
              <div
                key={book.id}
                className={`p-4 rounded-2xl border-2 shadow-sm ${
                  book.isActive ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-purple-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base mb-1 text-gray-800">{book.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users size={14} />
                      <span>{book.members}位成员</span>
                    </div>
                  </div>
                  {book.isActive && (
                    <span className="px-2 py-1 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs shadow-sm">
                      当前
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    总支出 <span className="text-gray-900 ml-1">¥{book.amount.toLocaleString()}</span>
                  </p>
                  <button className="text-sm text-gray-500 flex items-center gap-1">
                    <span>管理</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 账本成员 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg text-gray-700">账本成员</h2>
            <button 
              onClick={() => setShowInvite(!showInvite)}
              className="h-9 px-4 rounded-xl border-2 border-blue-200 text-blue-600 text-sm flex items-center gap-1 shadow-sm"
            >
              <Share2 size={16} />
              <span>邀请</span>
            </button>
          </div>

          {/* 邀请码 */}
          {showInvite && (
            <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 shadow-sm">
              <p className="text-sm text-blue-900 mb-3">分享邀请码给微信好友加入账本</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-12 px-4 rounded-xl bg-white flex items-center justify-center text-2xl tracking-widest shadow-sm border border-blue-100">
                  {inviteCode}
                </div>
                <button className="h-12 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md">
                  复制
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-4 rounded-2xl bg-white shadow-sm border border-gray-100"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-200 to-pink-300 flex items-center justify-center text-2xl shadow-sm">
                  {member.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-base mb-1">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 账本设置 */}
        <div>
          <h2 className="text-lg mb-4 text-gray-700">账本设置</h2>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white shadow-sm border border-gray-100 active:shadow-md">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-sm">
                <Settings size={18} className="text-blue-600" />
              </div>
              <span className="flex-1 text-left text-gray-700">账本信息</span>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

            <button className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white shadow-sm border border-gray-100 active:shadow-md">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center shadow-sm">
                <Users size={18} className="text-purple-600" />
              </div>
              <span className="flex-1 text-left text-gray-700">分类管理</span>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

            <button className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-red-50 to-red-100 text-red-600 active:from-red-100 active:to-red-200 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center shadow-sm">
                <Trash2 size={18} />
              </div>
              <span className="flex-1 text-left">删除账本</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
