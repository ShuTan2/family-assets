import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp } from 'lucide-react';
import { useDepositStore } from '../hooks/useDeposits';
import { DepositItem } from '../components/DepositItem';

export function DepositList() {
  const navigate = useNavigate();
  const { loadDeposits, getSortedDeposits, deleteDeposit } = useDepositStore();

  useEffect(() => {
    loadDeposits();
  }, [loadDeposits]);

  const sortedDeposits = getSortedDeposits();
  const activeDeposits = sortedDeposits.filter((d) => d.expireStatus !== 'expired');
  const expiredDeposits = sortedDeposits.filter((d) => d.expireStatus === 'expired');

  const handleEdit = (id: string) => {
    navigate(`/edit/${id}`);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条存款记录吗？')) {
      deleteDeposit(id);
    }
  };

  const hasAnyDeposit = activeDeposits.length + expiredDeposits.length > 0;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      <header className="bg-white px-4 py-4 border-b border-gray-100">
        <h1 className="text-lg font-semibold text-[#2C3E50]">存款列表</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {activeDeposits.length}笔进行中 · {expiredDeposits.length}笔已到期 · 按到期日排序
        </p>
      </header>

      <div className="px-4 py-4">
        {!hasAnyDeposit ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#1E3A5F] bg-opacity-10 flex items-center justify-center">
              <Plus className="w-10 h-10 text-[#1E3A5F] opacity-50" />
            </div>
            <h3 className="text-lg font-semibold text-[#2C3E50] mb-2">暂无存款记录</h3>
            <p className="text-sm text-gray-500 mb-4">点击右下角按钮添加您的第一笔存款</p>
            <button
              onClick={() => navigate('/add')}
              className="px-6 py-2.5 bg-[#1E3A5F] text-white rounded-xl font-medium text-sm"
            >
              添加存款
            </button>
          </div>
        ) : (
          <>
            {activeDeposits.length > 0 && (
              <div className="mb-6">
                <div className="space-y-3">
                  {activeDeposits.map((deposit) => (
                    <DepositItem
                      key={deposit.id}
                      deposit={deposit}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}

            {expiredDeposits.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  历史记录（已到期）
                </h2>
                <div className="space-y-3">
                  {expiredDeposits.map((deposit) => (
                    <DepositItem
                      key={deposit.id}
                      deposit={deposit}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
    </div>

    <button
      onClick={() => navigate('/add')}
      className="fixed bottom-24 right-4 w-14 h-14 bg-[#1E3A5F] text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
    >
      <Plus className="w-6 h-6" />
    </button>
  </div>
);
}
