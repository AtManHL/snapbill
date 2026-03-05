import { ArrowLeft, Upload, Camera, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';

interface AddRecordProps {
  onNavigate: (page: string, data?: any) => void;
}

export function AddRecord({ onNavigate }: AddRecordProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = () => {
    setIsUploading(true);
    // 模拟AI识别过程
    setTimeout(() => {
      setIsUploading(false);
      onNavigate('confirm', {
        amount: '45.80',
        time: '2026-03-05 12:30',
        category: '餐饮美食',
        merchant: '美团外卖'
      });
    }, 2000);
  };

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
        <h1 className="text-xl text-gray-800">添加记账</h1>
      </div>

      {/* 上传区域 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        {isUploading ? (
          <div className="text-center">
            <div className="w-24 h-24 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin mb-6"></div>
            <p className="text-lg mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI识别中...</p>
            <p className="text-sm text-gray-500">正在提取支付信息</p>
          </div>
        ) : (
          <>
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-8 shadow-md">
              <ImageIcon size={48} className="text-blue-500" />
            </div>
            
            <h2 className="text-xl mb-2 text-gray-800">上传支付截图</h2>
            <p className="text-sm text-gray-500 mb-12 text-center">
              AI将自动识别金额、时间和分类
            </p>

            <div className="w-full space-y-4">
              <button 
                onClick={handleUpload}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center gap-2 active:from-blue-600 active:to-purple-700 shadow-md"
              >
                <Upload size={20} />
                <span>从相册选择</span>
              </button>
              
              <button 
                onClick={handleUpload}
                className="w-full h-14 rounded-2xl border-2 border-blue-200 bg-white flex items-center justify-center gap-2 active:bg-blue-50 text-blue-600"
              >
                <Camera size={20} />
                <span>拍照上传</span>
              </button>
            </div>

            <div className="mt-12 text-center">
              <button 
                onClick={() => onNavigate('confirm', {
                  amount: '',
                  time: new Date().toISOString().slice(0, 16).replace('T', ' '),
                  category: '其他支出',
                  merchant: ''
                })}
                className="text-sm text-gray-500 underline"
              >
                手动输入
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
