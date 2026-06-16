import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, PiggyBank, Banknote, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { useDepositStore } from '../hooks/useDeposits';
import { useExpenseStore } from '../hooks/useExpenses';
import { StatCard } from '../components/StatCard';
import { TypePieChart } from '../components/TypePieChart';
import { BankPieChart } from '../components/BankPieChart';
import { TermBarChart } from '../components/TermBarChart';
import { ExpensePieChart } from '../components/ExpensePieChart';
import { DepositItem } from '../components/DepositItem';
import {
  formatCurrency,
  getBankDistribution,
  getTypeDistribution,
  getTermDistribution,
  calculateExpenseStatistics,
  getTagExpenseDistribution,
} from '../utils/calculations';

export function Home() {
  const navigate = useNavigate();
  const { loadDeposits, getStatistics, getSortedDeposits, deleteDeposit } = useDepositStore();
  const { expenses, loadExpenses, loadTags } = useExpenseStore();

  useEffect(() => {
    loadDeposits();
    loadExpenses();
    loadTags();
  }, [loadDeposits, loadExpenses, loadTags]);

  const stats = getStatistics();
  const sortedDeposits = getSortedDeposits();
  const bankData = getBankDistribution(sortedDeposits);
  const typeData = getTypeDistribution(sortedDeposits);
  const termData = getTermDistribution(sortedDeposits);
  const expiredDeposits = sortedDeposits.filter((d) => d.expireStatus === 'expired');
  const activeDeposits = sortedDeposits.filter((d) => d.expireStatus !== 'expired');

  const expenseStats = useMemo(() => calculateExpenseStatistics(expenses), [expenses]);
  const currentMonthExpenses = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return expenses.filter((e) => e.date.startsWith(currentMonth));
  }, [expenses]);
  const tagDistribution = useMemo(() => getTagExpenseDistribution(currentMonthExpenses), [currentMonthExpenses]);

  const daysInCurrentMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const currentDay = new Date().getDate();
  const daysForAverage = Math.min(currentDay, daysInCurrentMonth);
  const dailyAverage = daysForAverage > 0 ? expenseStats.monthlyExpense / daysForAverage : 0;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      <header className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] text-white px-4 py-6 rounded-b-3xl">
        <h1 className="text-lg font-semibold mb-1">家庭资产总览</h1>
        <p className="text-sm text-blue-200">实时掌握家庭财务状况</p>
        <div className="mt-4">
          <p className="text-xs text-blue-200 mb-1">总资产</p>
          <p className="text-3xl font-bold tracking-tight">{formatCurrency(stats.totalAssets)}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-blue-200 opacity-80">
            <p>历史累计收益：{formatCurrency(stats.historicalReturn)}</p>
            <p>本月支出：{formatCurrency(expenseStats.monthlyExpense)}</p>
          </div>
        </div>
      </header>

      <div className="px-4 -mt-4">
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            title="活期存款"
            value={formatCurrency(stats.currentDeposits)}
            icon={Wallet}
            color="text-[#4A90D9]"
          />
          <StatCard
            title="定期存款"
            value={formatCurrency(stats.fixedDeposits)}
            icon={PiggyBank}
            color="text-[#D4AF37]"
          />
          <StatCard
            title="存款笔数"
            value={`${stats.activeDeposits}笔`}
            icon={Banknote}
            color="text-[#1E3A5F]"
          />
          <StatCard
            title="即将到期"
            value={`${stats.expiringWithin30Days + stats.expiringWithin90Days}笔`}
            icon={AlertCircle}
            color={stats.expiringWithin30Days > 0 ? 'text-red-500' : 'text-orange-500'}
          />
          <StatCard
            title="历史收益"
            value={formatCurrency(stats.historicalReturn)}
            icon={TrendingUp}
            color={stats.historicalReturn > 0 ? 'text-[#D4AF37]' : 'text-gray-400'}
          />
          <StatCard
            title="已到期笔数"
            value={`${stats.expiredCount}笔`}
            icon={TrendingUp}
            color="text-gray-400"
          />
        </div>
      </div>

      <div className="px-4 mt-6">
        <div className="grid grid-cols-1 gap-4">
          <TypePieChart data={typeData} title="存款类型分布" />
          <BankPieChart data={bankData} title="银行分布" />
          <TermBarChart data={termData} title="定期存期分布" />
        </div>
      </div>

      {stats.totalExpectedReturn > 0 && (
        <div className="px-4 mt-6">
          <div className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] rounded-2xl p-4 text-white">
            <p className="text-sm opacity-90 mb-1">预计总收益</p>
            <p className="text-2xl font-bold">{formatCurrency(stats.totalExpectedReturn)}</p>
          </div>
        </div>
      )}

      {activeDeposits.length === 0 && expiredDeposits.length === 0 && (
        <div className="px-4 mt-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#1E3A5F] bg-opacity-10 flex items-center justify-center">
            <Banknote className="w-10 h-10 text-[#1E3A5F] opacity-50" />
          </div>
          <h3 className="text-lg font-semibold text-[#2C3E50] mb-2">暂无存款记录</h3>
          <p className="text-sm text-gray-500">点击底部"添加"按钮开始记录您的第一笔存款</p>
        </div>
      )}

      {expiredDeposits.length > 0 && (
        <div className="px-4 mt-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" />
            历史记录（已到期）
          </h2>
          <div className="space-y-3">
            {expiredDeposits.map((deposit) => (
              <DepositItem
                key={deposit.id}
                deposit={deposit}
                onEdit={(id) => navigate(`/edit/${id}`)}
                onDelete={deleteDeposit}
              />
            ))}
          </div>
        </div>
      )}

      <div className="px-4 mt-6">
        <h2 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-1.5">
          <TrendingDown className="w-4 h-4" />
          本月支出概览
        </h2>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">本月总支出</p>
              <p className="text-lg font-bold text-[#2C3E50]">{formatCurrency(expenseStats.monthlyExpense)}</p>
            </div>
            <div className="text-center border-x border-gray-100">
              <p className="text-xs text-gray-400 mb-1">日均支出</p>
              <p className="text-lg font-bold text-[#4A90D9]">{formatCurrency(dailyAverage)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">支出笔数</p>
              <p className="text-lg font-bold text-[#1E3A5F]">{expenseStats.expenseCount}笔</p>
            </div>
          </div>
          <ExpensePieChart data={tagDistribution} title="本月支出标签分布" />
        </div>
        <button
          onClick={() => navigate('/expenses')}
          className="w-full bg-[#1E3A5F] text-white py-3 rounded-2xl text-sm font-medium shadow-sm active:opacity-90"
        >
          查看全部支出记录
        </button>
      </div>
    </div>
  );
}
