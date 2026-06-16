import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, DollarSign, Target } from 'lucide-react';
import { useDepositStore } from '../hooks/useDeposits';
import { MonthlyReturnCurve } from '../components/MonthlyReturnCurve';
import { AnnualComparisonChart } from '../components/AnnualComparisonChart';
import { formatCurrency, getMonthlyReturnCurve, getAnnualComparison } from '../utils/calculations';

export function Statistics() {
  const navigate = useNavigate();
  const { loadDeposits, getSortedDeposits } = useDepositStore();

  useEffect(() => {
    loadDeposits();
  }, [loadDeposits]);

  const sortedDeposits = getSortedDeposits();
  const monthlyData = getMonthlyReturnCurve(sortedDeposits);
  const annualData = getAnnualComparison(sortedDeposits);

  // 计算总计
  const totalExpectedReturn = monthlyData.reduce((sum, d) => sum + d.expectedReturn, 0);
  const totalHistoricalReturn = monthlyData.reduce((sum, d) => sum + d.historicalReturn, 0);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-6">
      <header className="bg-white px-4 py-4 border-b border-gray-100 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#2C3E50]" />
        </button>
        <h1 className="text-lg font-semibold text-[#2C3E50]">数据统计</h1>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* 收益概览卡片 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-[#4A90D9] to-[#2C5282] rounded-2xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 opacity-80" />
              <span className="text-xs opacity-80">未来收益</span>
            </div>
            <p className="text-xl font-bold">{formatCurrency(totalExpectedReturn)}</p>
            <p className="text-xs opacity-70 mt-1">各月到期预计收益合计</p>
          </div>
          <div className="bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-2xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 opacity-80" />
              <span className="text-xs opacity-80">历史收益</span>
            </div>
            <p className="text-xl font-bold">{formatCurrency(totalHistoricalReturn)}</p>
            <p className="text-xs opacity-70 mt-1">已到期存款实际收益</p>
          </div>
        </div>

        {/* 月度收益曲线 */}
        <MonthlyReturnCurve
          data={monthlyData}
          title="月度收益曲线（近6月 → 未来6月）"
        />

        {/* 年度对比 */}
        {annualData.length > 0 && (
          <AnnualComparisonChart
            data={annualData}
            title="年度新增存款与收益对比"
          />
        )}

        {/* 年度统计列表 */}
        {annualData.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-[#2C3E50] mb-3 flex items-center gap-1.5">
              <Target className="w-4 h-4" />
              各年度明细
            </h3>
            <div className="space-y-3">
              {annualData.map((item) => (
                <div
                  key={item.year}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-[#2C3E50]">{item.year}年</p>
                    <p className="text-xs text-gray-500">
                      新增{item.totalDeposits}笔 · 新增{formatCurrency(item.newAmount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[#4A90D9]">
                      预计 {formatCurrency(item.totalExpectedReturn)}
                    </p>
                    {item.totalHistoricalReturn > 0 && (
                      <p className="text-xs text-[#D4AF37]">
                        历史 {formatCurrency(item.totalHistoricalReturn)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {sortedDeposits.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#1E3A5F] bg-opacity-10 flex items-center justify-center">
              <TrendingUp className="w-10 h-10 text-[#1E3A5F] opacity-50" />
            </div>
            <h3 className="text-lg font-semibold text-[#2C3E50] mb-2">暂无数据</h3>
            <p className="text-sm text-gray-500 mb-4">添加存款后查看数据统计</p>
            <button
              onClick={() => navigate('/add')}
              className="px-6 py-2.5 bg-[#1E3A5F] text-white rounded-xl font-medium text-sm"
            >
              添加存款
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
