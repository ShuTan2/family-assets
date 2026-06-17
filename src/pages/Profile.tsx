import { useState } from 'react';
import { User, Settings, HelpCircle, Download, Upload, Trash2, Info, X, Copy, Check, FileText, FolderOpen } from 'lucide-react';
import { useDepositStore } from '../hooks/useDeposits';
import { formatCurrency } from '../utils/calculations';

export function Profile() {
  const { deposits, loadDeposits } = useDepositStore();
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportInfo, setExportInfo] = useState<{ filename: string; content: string; size: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const totalAmount = deposits.reduce((sum, d) => sum + d.amount, 0);
  const totalExpectedReturn = deposits.reduce((sum, d) => sum + d.expectedReturn, 0);

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const handleExportData = () => {
    const dataStr = JSON.stringify(deposits, null, 2);
    const filename = `family_assets_backup_${new Date().toISOString().split('T')[0]}.json`;
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportInfo({ filename, content: dataStr, size: blob.size });
    setShowExportModal(true);
  };

  const handleCopyContent = async () => {
    if (exportInfo) {
      try {
        await navigator.clipboard.writeText(exportInfo.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        const textarea = document.createElement('textarea');
        textarea.value = exportInfo.content;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
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

      {showExportModal && exportInfo && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black bg-opacity-50 p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-[#27AE60] bg-opacity-10 flex items-center justify-center">
                  <Check className="w-5 h-5 text-[#27AE60]" />
                </div>
                <h3 className="text-base font-semibold text-[#2C3E50]">导出成功</h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="px-5 py-4 overflow-y-auto flex-1">
              <div className="bg-gradient-to-br from-[#F8F9FA] to-[#EFF2F5] rounded-xl p-4 border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <FileText className="w-5 h-5 text-[#4A90D9]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#2C3E50] truncate">{exportInfo.filename}</p>
                    <p className="text-xs text-gray-500 mt-0.5">JSON 格式 · {formatFileSize(exportInfo.size)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-[#FFF8E1] border border-[#FFE082] rounded-xl p-3">
                <div className="flex gap-2">
                  <FolderOpen className="w-4 h-4 text-[#F57C00] flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-[#5D4037] leading-relaxed">
                    {isMobile ? (
                      <>
                        <p className="font-medium mb-1">📱 文件已保存到手机</p>
                        <p>iPhone：进入「文件」App → 「下载」文件夹查找</p>
                        <p>安卓：进入「文件管理」/「下载」文件夹查找</p>
                        <p className="mt-1 text-[#F57C00]">💡 如果没找到，浏览器可能会让你选择保存位置</p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium mb-1">💻 文件已下载到电脑</p>
                        <p>默认保存到「下载」文件夹</p>
                        <p className="mt-1 text-[#F57C00]">💡 浏览器下载列表中也可以找到</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">数据预览（前 200 字符）：</p>
                <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto border border-gray-100">
                  <pre className="text-xs text-gray-600 font-mono whitespace-pre-wrap break-all">
                    {exportInfo.content.substring(0, 200)}
                    {exportInfo.content.length > 200 && '...'}
                  </pre>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={handleCopyContent}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#2C3E50] rounded-xl text-sm font-medium transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-[#27AE60]" />
                    <span>已复制</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>复制内容</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  if (exportInfo) {
                    const blob = new Blob([exportInfo.content], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = exportInfo.filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#1E3A5F] hover:bg-[#2C5282] text-white rounded-xl text-sm font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>重新下载</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
