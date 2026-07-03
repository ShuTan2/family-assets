import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingDown, ChevronLeft, ChevronRight, Calendar, Tags } from 'lucide-react';
import dayjs from 'dayjs';
import { useExpenseStore } from '../hooks/useExpenses';
import { ExpenseItem } from '../components/ExpenseItem';
import { ExpensePieChart } from '../components/ExpensePieChart';
import { calculateExpenseStatistics, getTagExpenseDistribution, formatCurrency } from '../utils/calculations';
import { Expense, ExpenseTag } from '../types';

interface GroupedExpenses {
  label: string;
  dateKey: string;
  expenses: Expense[];
}

export function ExpenseList() {
  const navigate = useNavigate();
  const { expenses, tags, loadExpenses, loadTags, deleteExpense, getTagById } = useExpenseStore();
  const [selectedMonth, setSelectedMonth] = useState<string>(() => dayjs().format('YYYY-MM')); // 'all' 表示全部
  const [selectedTagId, setSelectedTagId] = useState<string>('all'); // 'all' 表示全部标签

  useEffect(() => {
    loadExpenses();
    loadTags();
  }, [loadExpenses, loadTags]);

  const stats = useMemo(() => calculateExpenseStatistics(expenses), [expenses]);

  // 根据选中的月份和标签过滤支出
  const filteredExpenses = useMemo(() => {
    let result = expenses;
    if (selectedMonth !== 'all') {
      result = result.filter((e) => dayjs(e.date).format('YYYY-MM') === selectedMonth);
    }
    if (selectedTagId !== 'all') {
      result = result.filter((e) => e.tagId === selectedTagId);
    }
    return result;
  }, [expenses, selectedMonth, selectedTagId]);

  const isAll = selectedMonth === 'all';
  const isCurrentMonth = selectedMonth === dayjs().format('YYYY-MM');
  const currentMonthLabel = isAll ? '全部时间' : dayjs(selectedMonth + '-01').format('YYYY年M月');

  const selectedTag = selectedTagId === 'all' ? null : tags.find((t) => t.id === selectedTagId);

  const pieChartData = useMemo(() => getTagExpenseDistribution(filteredExpenses), [filteredExpenses]);

  const groupedExpenses = useMemo<GroupedExpenses[]>(() => {
    const sorted = [...filteredExpenses].sort((a, b) => {
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
  }, [filteredExpenses]);

  const handlePrevMonth = () => {
    if (isAll) {
      setSelectedMonth(dayjs().format('YYYY-MM'));
      return;
    }
    setSelectedMonth(dayjs(selectedMonth + '-01').subtract(1, 'month').format('YYYY-MM'));
  };

  const handleNextMonth = () => {
    if (isAll) return;
    setSelectedMonth(dayjs(selectedMonth + '-01').add(1, 'month').format('YYYY-MM'));
  };

  // 收集所有有支出的月份 + 当月
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    set.add(dayjs().format('YYYY-MM'));
    expenses.forEach((e) => set.add(dayjs(e.date).format('YYYY-MM')));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
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

  const filteredTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const daysInMonth = isAll ? Math.max(1, dayjs().date()) : dayjs(selectedMonth + '-01').daysInMonth();
  const averageDaily = filteredExpenses.length > 0 ? filteredTotal / (isAll ? Math.max(1, dayjs().date()) : daysInMonth) : 0;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-28">
      <header className="bg-white px-4 py-4 border-b border-gray-100">
        <h1 className="text-lg font-semibold text-[#2C3E50]">支出记录</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {currentMonthLabel} · 共 {filteredExpenses.length} 条记录
        </p>
      </header>

      {/* 年月选择器 */}
      {hasAnyExpense && (
        <div className="bg-white px-4 py-3 border-b border-gray-100 sticky top-0 z-10">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
              aria-label="上个月"
            >
              <ChevronLeft className="w-5 h-5 text-[#2C3E50]" />
            </button>

            <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
              <Calendar className="w-4 h-4 text-[#4A90D9] flex-shrink-0" />
              <div className="relative flex-1 max-w-[200px]">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  aria-label="选择月份"
                >
                  <option value="all">全部时间</option>
                  {availableMonths.map((m) => (
                    <option key={m} value={m}>
                      {dayjs(m + '-01').format('YYYY年M月')}
                      {m === dayjs().format('YYYY-MM') ? '（当月）' : ''}
                    </option>
                  ))}
                </select>
                <div className="bg-gradient-to-r from-[#4A90D9] to-[#2C5282] text-white text-sm font-semibold py-2 px-3 rounded-xl text-center flex items-center justify-center gap-1 pointer-events-none">
                  <span className="truncate">{currentMonthLabel}</span>
                  <ChevronRight className="w-3.5 h-3.5 rotate-90 flex-shrink-0" />
                </div>
              </div>
            </div>

            <button
              onClick={handleNextMonth}
              disabled={isAll || isCurrentMonth}
              className={`p-2 rounded-lg transition-colors ${
                isAll || isCurrentMonth
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'hover:bg-gray-100 active:bg-gray-200 text-[#2C3E50]'
              }`}
              aria-label="下个月"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* 标签筛选器 */}
      {hasAnyExpense && tags.length > 0 && (
        <div className="bg-white px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Tags className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">筛选标签</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTagId('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedTagId === 'all'
                  ? 'bg-[#1E3A5F] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部标签
            </button>
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => setSelectedTagId(tag.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                  selectedTagId === tag.id
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={{
                  backgroundColor: selectedTagId === tag.id ? tag.color : undefined,
                }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: selectedTagId === tag.id ? 'rgba(255,255,255,0.8)' : tag.color }}
                />
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

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
      ) : filteredExpenses.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Calendar className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-[#2C3E50] mb-2">
            {selectedTag
              ? `${currentMonthLabel} · ${selectedTag.name} 暂无支出`
              : `${currentMonthLabel}暂无支出`
            }
          </h3>
          <p className="text-sm text-gray-500 mb-4">切换月份或标签查看记录</p>
          <button
            onClick={() => {
              setSelectedMonth(dayjs().format('YYYY-MM'));
              setSelectedTagId('all');
            }}
            className="px-6 py-2.5 bg-[#4A90D9] text-white rounded-xl font-medium text-sm"
          >
            重置筛选
          </button>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-4">
          <div className="bg-gradient-to-br from-[#1E3A5F] to-[#4A90D9] rounded-2xl p-4 text-white shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm opacity-90">
                {selectedTag
                  ? `${currentMonthLabel} · ${selectedTag.name}支出`
                  : `${currentMonthLabel}支出`
                }
              </p>
              <TrendingDown className="w-4 h-4 opacity-80" />
            </div>
            <p className="text-3xl font-bold tracking-tight">{formatCurrency(filteredTotal)}</p>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-xs opacity-80 mb-1">{isAll ? '本月日均' : '日均支出'}</p>
                <p className="text-base font-semibold">{formatCurrency(averageDaily)}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-xs opacity-80 mb-1">{isAll ? '总笔数' : '本月笔数'}</p>
                <p className="text-base font-semibold">{filteredExpenses.length} 笔</p>
              </div>
            </div>
          </div>

          {pieChartData.length > 0 && (
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
