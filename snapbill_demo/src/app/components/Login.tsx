import { Camera, Zap, Users, Sparkles } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* 装饰性背景圆圈 */}
      <div className="absolute top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-blue-300/20 to-purple-300/20 blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-gradient-to-br from-purple-300/20 to-pink-300/20 blur-3xl"></div>
      
      {/* 主要内容 */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
        {/* Logo区域 */}
        <div className="mb-12">
          {/* App图标 */}
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-300/50 mb-6 mx-auto">
            <Camera size={48} className="text-white" strokeWidth={2.5} />
          </div>
          
          {/* App名称 */}
          <h1 className="text-4xl text-center mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            秒拍帐
          </h1>
          
          {/* Slogan */}
          <p className="text-center text-gray-500 text-sm">
            AI智能记账，让生活更简单
          </p>
        </div>

        {/* 特性展示 */}
        <div className="w-full max-w-xs space-y-4 mb-12">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm border border-white">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
              <Zap size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-800">AI识别截图</p>
              <p className="text-xs text-gray-500">一秒记账，准确高效</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm border border-white">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Users size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-800">多人共享</p>
              <p className="text-xs text-gray-500">家人朋友，账目清晰</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm border border-white">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center flex-shrink-0">
              <Sparkles size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-800">智能分析</p>
              <p className="text-xs text-gray-500">消费洞察，科学理财</p>
            </div>
          </div>
        </div>
      </div>

      {/* 底部登录区域 */}
      <div className="px-8 pb-12 relative z-10">
        {/* 微信登录按钮 */}
        <button
          onClick={onLogin}
          className="w-full h-14 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-xl shadow-purple-300/50 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform mb-4"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.405-.032zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
          </svg>
          <span className="text-base">微信一键登录</span>
        </button>

        {/* 协议文案 */}
        <p className="text-center text-xs text-gray-400 leading-relaxed">
          登录即表示同意
          <span className="text-purple-500"> 用户协议 </span>
          和
          <span className="text-purple-500"> 隐私政策</span>
        </p>
      </div>
    </div>
  );
}
