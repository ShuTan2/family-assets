import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingDown } from 'lucide-react';
import dayjs from 'dayjs';
import { useExpenseStore } from '../hooks/useExpenses';
import { ExpenseItem } from '../components/ExpenseItem';
import { ExpensePieChart } from '../components/ExpensePieChart';
import { calculateExpenseStatistics, getTagExpenseDistribution, formatCurrency } from '../utils/calculations';
import { Expense } from '../types';

interface GroupedExpenses {
  label: string;
  dateKey: string;
  expenses: Expense[];
}

export function ExpenseList() {
  const navigate = useNavigate();
  const { expenses, tags, loadExpenses, loadTags, deleteExpense, getTagById } = useExpenseStore();

  useEffect(() => {
    loadExpenses();
    loadTags();
  }, [loadExpenses, loadTags]);

  const stats = useMemo(() => calculateExpenseStatistics(expenses), [expenses]);

  const currentMonthExpenses = useMemo(() => {
    const currentMonthStr = dayjs().format('YYYY-MM');
    return expenses.filter((e) => dayjs(e.date).format('YYYY-MM') === currentMonthStr);
  }, [expenses]);

  const pieChartData = useMemo(() => getTagExpenseDistribution(currentMonthExpenses), [currentMonthExpenses]);

  const groupedExpenses = useMemo<GroupedExpenses[]>(() => {
    const sorted = [...expenses].sort((a, b) => {
      if (a.date === b.date) {
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      }
      return b.date.localeCompare(a.date);
    });

    const today = dayjs().format('YYYY-MM-DD');
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');

    const groupMap = new Map<string, GroupedExpenses>();

    sorted.forEach((expense) => {
      let label = expense.date;
      let dateKey = expense.date;

      if (expense.date === today) {
        label = '今天';
        dateKey = 'today';
      } else if (expense.date === yesterday) {
        label = '昨天';
        dateKey = 'yesterday';
      }

      if (!groupMap.has(dateKey)) {
        groupMap.set(dateKey, { label, dateKey, expenses: [] });
      }
      groupMap.get(dateKey)!.expenses.push(expense);
    });

    return Array.from(groupMap.values());
  }, [expenses]);

  const handleEdit = (id: string) => {
    navigate(`/edit-expense/${id}`);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条支出记录吗？')) {
      deleteExpense(id);
    }
  };

  const hasAnyExpense = expenses.length > 0;

  const currentMonthLabel = dayjs().format('YYYY年M月');
  const daysInMonth = dayjs().daysInMonth();
  const averageDaily = currentMonthExpenses.length > 0 ? stats.monthlyExpense / daysInMonth : 0;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-28">
      <header className="bg-white px-4 py-4 border-b border-gray-100">
        <h1 className="text-lg font-semibold text-[#2C3E50]">支出记录</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {currentMonthLabel} · 共 {expenses.length} 条记录
        </p>
      </header>

      {!hasAnyExpense ? (
        <div className="text-center py-12 px-4">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#4A90D9] bg-opacity-10 flex items-center justify-center">
            <TrendingDown className="w-10 h-10 text-[#4A90D9] opacity-50" />
          </div>
          <h3 className="text-lg font-semibold text-[#2C3E50] mb-2">暂无支出记录</h3>
          <p className="text-sm text-gray-500 mb-4">点击右下角按钮添加您的第一笔支出</p>
          <button
            onClick={() => navigate('/add-expense')}
            className="px-6 py-2.5 bg-[#4A90D9] text-white rounded-xl font-medium text-sm"
          >
            添加支出
          </button>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-4">
          <div className="bg-gradient-to-br from-[#1E3A5F] to-[#4A90D9] rounded-2xl p-4 text-white shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm opacity-90">{currentMonthLabel}支出</p>
              <TrendingDown className="w-4 h-4 opacity-80" />
            </div>
            <p className="text-3xl font-bold tracking-tight">{formatCurrency(stats.monthlyExpense)}</p>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-xs opacity-80 mb-1">日均支出</p>
                <p className="text-base font-semibold">{formatCurrency(averageDaily)}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-xs opacity-80 mb-1">本月笔数</p>
                <p className="text-base font-semibold">{currentMonthExpenses.length} 笔</p>
              </div>
            </div>
          </div>

          {currentMonthExpenses.length > 0 && (
            <ExpensePieChart data={pieChartData} title={`${currentMonthLabel}标签分布`} />
          )}

          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4" />
              支出明细
            </h2>
            <div className="space-y-4">
              {groupedExpenses.map((group) => (
                <div key={group.dateKey} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-400">{group.label}</span>
                    <span className="text-xs text-gray-400">
                      {formatCurrency(group.expenses.reduce((sum, e) => sum + e.amount, 0))}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {group.expenses.map((expense) => (
                      <ExpenseItem
                        key={expense.id}
                        expense={expense}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        tag={getTagById(expense.tagId)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => navigate('/add-expense')}
        className="fixed bottom-24 right-4 w-14 h-14 bg-[#4A90D9] text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
