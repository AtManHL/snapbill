import { useState } from 'react';
import { Login } from './components/Login';
import { Home } from './components/Home';
import { AddRecord } from './components/AddRecord';
import { ConfirmRecord } from './components/ConfirmRecord';
import { Statistics } from './components/Statistics';
import { History } from './components/History';
import { BookManagement } from './components/BookManagement';
import { Profile } from './components/Profile';

type Page = 'home' | 'add' | 'confirm' | 'statistics' | 'history' | 'books' | 'profile';

export interface RecordData {
  amount: string;
  time: string;
  category: string;
  merchant?: string;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [pendingRecord, setPendingRecord] = useState<RecordData | null>(null);

  const navigateTo = (page: Page, data?: RecordData) => {
    if (data) {
      setPendingRecord(data);
    }
    setCurrentPage(page);
  };

  const handleLogin = () => {
    // 模拟登录成功
    setIsLoggedIn(true);
  };

  const renderPage = () => {
    // 如果未登录，显示登录页
    if (!isLoggedIn) {
      return <Login onLogin={handleLogin} />;
    }

    switch (currentPage) {
      case 'home':
        return <Home onNavigate={navigateTo} />;
      case 'add':
        return <AddRecord onNavigate={navigateTo} />;
      case 'confirm':
        return <ConfirmRecord data={pendingRecord} onNavigate={navigateTo} />;
      case 'statistics':
        return <Statistics onNavigate={navigateTo} />;
      case 'history':
        return <History onNavigate={navigateTo} />;
      case 'books':
        return <BookManagement onNavigate={navigateTo} />;
      case 'profile':
        return <Profile onNavigate={navigateTo} />;
      default:
        return <Home onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      {/* 手机模拟器容器 */}
      <div className="w-full max-w-[375px] h-[812px] bg-white shadow-2xl rounded-[40px] overflow-hidden relative">
        {/* 状态栏 */}
        <div className="h-11 bg-white flex items-center justify-between px-6 text-sm">
          <span>9:41</span>
          <div className="flex gap-1 items-center">
            <div className="w-4 h-3 border border-gray-900 rounded-sm relative">
              <div className="absolute inset-0.5 bg-gray-900 rounded-[1px]"></div>
            </div>
          </div>
        </div>

        {/* 页面内容 */}
        <div className="h-[calc(812px-44px)] overflow-auto">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}