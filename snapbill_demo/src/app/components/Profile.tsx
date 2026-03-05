import { ArrowLeft, Bell, FileText, HelpCircle, ChevronRight, LogOut } from 'lucide-react';

interface ProfileProps {
  onNavigate: (page: string) => void;
}

export function Profile({ onNavigate }: ProfileProps) {
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
        <h1 className="text-xl text-gray-800">个人中心</h1>
      </div>

      <div className="flex-1 overflow-auto px-6 py-6">
        {/* 用户信息 */}
        <div className="mb-8 p-6 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-3xl shadow-md">
              👨
            </div>
            <div>
              <p className="text-xl mb-1">小明</p>
              <p className="text-sm opacity-80">微信用户</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm opacity-80 mb-1">记账天数</p>
              <p className="text-2xl">28</p>
            </div>
            <div>
              <p className="text-sm opacity-80 mb-1">总笔数</p>
              <p className="text-2xl">156</p>
            </div>
            <div>
              <p className="text-sm opacity-80 mb-1">总支出</p>
              <p className="text-2xl">8.5k</p>
            </div>
          </div>
        </div>

        {/* 我的统计 */}
        <div className="mb-8">
          <h2 className="text-lg mb-4 text-gray-700">我的统计</h2>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white shadow-sm border border-gray-100 active:shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-sm">
                  <span className="text-xl">📊</span>
                </div>
                <span className="text-gray-700">我的消费统计</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

            <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white shadow-sm border border-gray-100 active:shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center shadow-sm">
                  <span className="text-xl">📝</span>
                </div>
                <span className="text-gray-700">我的记账记录</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* 设置 */}
        <div className="mb-8">
          <h2 className="text-lg mb-4 text-gray-700">设置</h2>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white shadow-sm border border-gray-100 active:shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center shadow-sm">
                  <Bell size={18} className="text-yellow-600" />
                </div>
                <span className="text-gray-700">记账提醒</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">每晚21:00</span>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            </button>

            <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white shadow-sm border border-gray-100 active:shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center shadow-sm">
                  <FileText size={18} className="text-green-600" />
                </div>
                <span className="text-gray-700">数据导出</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* 关于 */}
        <div className="mb-8">
          <h2 className="text-lg mb-4 text-gray-700">关于</h2>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white shadow-sm border border-gray-100 active:shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center shadow-sm">
                  <HelpCircle size={18} className="text-indigo-600" />
                </div>
                <span className="text-gray-700">使用帮助</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

            <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white shadow-sm border border-gray-100 active:shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center shadow-sm">
                  <FileText size={18} className="text-teal-600" />
                </div>
                <span className="text-gray-700">隐私政策</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* 退出登录 */}
        <button className="w-full h-14 rounded-2xl border-2 border-gray-200 flex items-center justify-center gap-2 active:bg-gray-50 text-gray-600 shadow-sm">
          <LogOut size={18} />
          <span>退出登录</span>
        </button>

        {/* 版本信息 */}
        <p className="text-center text-sm text-gray-400 mt-8">
          秒拍帐 v1.0.0
        </p>
      </div>
    </div>
  );
}
