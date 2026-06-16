import { User, Settings, HelpCircle, Download, Upload, Trash2, Info } from 'lucide-react';
import { useDepositStore } from '../hooks/useDeposits';
import { formatCurrency } from '../utils/calculations';

export function Profile() {
  const { deposits, loadDeposits } = useDepositStore();

  const totalAmount = deposits.reduce((sum, d) => sum + d.amount, 0);
  const totalExpectedReturn = deposits.reduce((sum, d) => sum + d.expectedReturn, 0);

  const handleExportData = () => {
    const dataStr = JSON.stringify(deposits, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `family_assets_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alert('数据已导出');
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const importedData = JSON.parse(event.target?.result as string);
            if (Array.isArray(importedData)) {
              localStorage.setItem('family_assets_deposits', JSON.stringify(importedData));
              loadDeposits();
              alert('数据导入成功');
            } else {
              alert('无效的数据格式');
            }
          } catch {
            alert('数据解析失败');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClearAll = () => {
    if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
      localStorage.removeItem('family_assets_deposits');
      loadDeposits();
      alert('所有数据已清空');
    }
  };

  const menuItems = [
    { icon: Download, label: '导出数据', action: handleExportData, color: 'text-[#4A90D9]' },
    { icon: Upload, label: '导入数据', action: handleImportData, color: 'text-[#27AE60]' },
    { icon: Settings, label: '设置', action: () => alert('设置功能开发中'), color: 'text-[#9B59B6]' },
    { icon: HelpCircle, label: '帮助与反馈', action: () => alert('帮助功能开发中'), color: 'text-[#3498DB]' },
    { icon: Info, label: '关于我们', action: () => alert('家庭资产记账 v1.0'), color: 'text-[#1E3A5F]' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      <header className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] text-white px-4 py-8 rounded-b-3xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold">家庭资产记账</h1>
            <p className="text-sm text-blue-200">管理您的家庭财务</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-xs text-blue-200 mb-1">资产总额</p>
            <p className="text-xl font-bold">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-xs text-blue-200 mb-1">累计收益</p>
            <p className="text-xl font-bold text-[#D4AF37]">+{formatCurrency(totalExpectedReturn)}</p>
          </div>
        </div>
      </header>

      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#2C3E50]">数据管理</h2>
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              清空数据
            </button>
          </div>

          <div className="space-y-3">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${item.color} bg-opacity-10`}>
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <span className="text-sm font-medium text-[#2C3E50]">{item.label}</span>
                  <div className="flex-1" />
                  <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-[#2C3E50] mb-3">数据统计</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">存款笔数</span>
              <span className="text-sm font-medium text-[#2C3E50]">{deposits.length}笔</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">定期存款</span>
              <span className="text-sm font-medium text-[#2C3E50]">
                {deposits.filter((d) => d.type === 'fixed').length}笔
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">活期存款</span>
              <span className="text-sm font-medium text-[#2C3E50]">
                {deposits.filter((d) => d.type === 'current').length}笔
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] rounded-2xl p-4 text-white">
          <p className="text-sm opacity-90 mb-1">温馨提示</p>
          <p className="text-xs opacity-80 leading-relaxed">
            您的数据存储在浏览器本地，建议定期导出备份。清空浏览器数据会导致存款记录丢失。
          </p>
        </div>
      </div>
    </div>
  );
}
