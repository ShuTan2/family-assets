import { useLocation, useNavigate } from 'react-router-dom';
import { Home, List, TrendingDown, User } from 'lucide-react';

export function TabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/deposits', icon: List, label: '存款' },
    { path: '/expenses', icon: TrendingDown, label: '支出' },
    { path: '/profile', icon: User, label: '我的' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-inset-bottom">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center py-1 px-4 rounded-xl transition-all ${
                isActive ? 'text-[#1E3A5F]' : 'text-gray-400'
              }`}
            >
              <div
                className={`p-2 rounded-xl transition-all ${
                  isActive ? 'bg-[#1E3A5F] bg-opacity-10' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs mt-0.5 font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
