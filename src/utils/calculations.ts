import dayjs from 'dayjs';
import { Deposit, DepositWithExtras, Expense, ExpenseStatistics, ExpireStatus, Statistics, ChartDataItem } from '../types';

export function calculateReturn(amount: number, annualRate: number, termMonths: number): number {
  return amount * (annualRate / 100 / 12) * termMonths;
}

export function getEndDate(startDate: string, termMonths: number): string {
  return dayjs(startDate).add(termMonths, 'month').format('YYYY-MM-DD');
}

export function getDaysUntilExpire(startDate: string, termMonths: number): number {
  const endDate = dayjs(startDate).add(termMonths, 'month');
  return endDate.diff(dayjs(), 'day');
}

export function getExpireStatus(startDate: string, termMonths: number): ExpireStatus {
  const daysUntilExpire = getDaysUntilExpire(startDate, termMonths);

  if (daysUntilExpire < 0) return 'expired';
  if (daysUntilExpire <= 30) return 'red';
  if (daysUntilExpire <= 90) return 'orange';
  return 'normal';
}

export function enrichDeposit(deposit: Deposit): DepositWithExtras {
  return {
    ...deposit,
    endDate: getEndDate(deposit.startDate, deposit.termMonths),
    daysUntilExpire: getDaysUntilExpire(deposit.startDate, deposit.termMonths),
    expireStatus: getExpireStatus(deposit.startDate, deposit.termMonths),
  };
}

export function sortByExpireDate(deposits: DepositWithExtras[]): DepositWithExtras[] {
  return [...deposits].sort((a, b) => a.daysUntilExpire - b.daysUntilExpire);
}

export function calculateStatistics(deposits: DepositWithExtras[]): Statistics {
  const activeDeposits = deposits.filter((d) => d.expireStatus !== 'expired');
  const expiredDeposits = deposits.filter((d) => d.expireStatus === 'expired');

  const totalAssets = activeDeposits.reduce((sum, d) => sum + d.amount, 0);
  const currentDeposits = activeDeposits.filter((d) => d.type === 'current').reduce((sum, d) => sum + d.amount, 0);
  const fixedDeposits = activeDeposits.filter((d) => d.type === 'fixed').reduce((sum, d) => sum + d.amount, 0);
  const totalExpectedReturn = activeDeposits.reduce((sum, d) => sum + d.expectedReturn, 0);
  const historicalReturn = expiredDeposits.reduce((sum, d) => sum + d.expectedReturn, 0);
  const expiringWithin30Days = activeDeposits.filter((d) => d.expireStatus === 'red').length;
  const expiringWithin90Days = activeDeposits.filter((d) => d.expireStatus === 'orange').length;
  const expiredCount = expiredDeposits.length;

  return {
    totalAssets,
    currentDeposits,
    fixedDeposits,
    totalDeposits: deposits.length,
    activeDeposits: activeDeposits.length,
    totalExpectedReturn,
    historicalReturn,
    expiringWithin30Days,
    expiringWithin90Days,
    expiredCount,
  };
}

export function getBankDistribution(deposits: DepositWithExtras[]): ChartDataItem[] {
  const activeDeposits = deposits.filter((d) => d.expireStatus !== 'expired');
  const totalAssets = activeDeposits.reduce((sum, d) => sum + d.amount, 0);
  const bankMap = new Map<string, number>();

  activeDeposits.forEach((d) => {
    bankMap.set(d.bankName, (bankMap.get(d.bankName) || 0) + d.amount);
  });

  return Array.from(bankMap.entries())
    .map(([name, value]) => ({
      name,
      value,
      percentage: totalAssets > 0 ? ((value / totalAssets) * 100).toFixed(1) + '%' : '0%',
    }))
    .sort((a, b) => b.value - a.value);
}

export function getTypeDistribution(deposits: DepositWithExtras[]): ChartDataItem[] {
  const activeDeposits = deposits.filter((d) => d.expireStatus !== 'expired');
  const totalAssets = activeDeposits.reduce((sum, d) => sum + d.amount, 0);
  const currentAmount = activeDeposits.filter((d) => d.type === 'current').reduce((sum, d) => sum + d.amount, 0);
  const fixedAmount = activeDeposits.filter((d) => d.type === 'fixed').reduce((sum, d) => sum + d.amount, 0);

  return [
    {
      name: '活期',
      value: currentAmount,
      percentage: totalAssets > 0 ? ((currentAmount / totalAssets) * 100).toFixed(1) + '%' : '0%',
    },
    {
      name: '定期',
      value: fixedAmount,
      percentage: totalAssets > 0 ? ((fixedAmount / totalAssets) * 100).toFixed(1) + '%' : '0%',
    },
  ];
}

export function getTermDistribution(deposits: DepositWithExtras[]): ChartDataItem[] {
  const activeDeposits = deposits.filter((d) => d.expireStatus !== 'expired');
  const termMap = new Map<number, number>();

  activeDeposits.forEach((d) => {
    if (d.type === 'fixed') {
      termMap.set(d.termMonths, (termMap.get(d.termMonths) || 0) + d.amount);
    }
  });

  const termLabels: Record<number, string> = {
    1: '1月',
    3: '3月',
    6: '6月',
    12: '1年',
    24: '2年',
    36: '3年',
    60: '5年',
  };

  return Array.from(termMap.entries())
    .map(([months, value]) => ({
      name: termLabels[months] || `${months}月`,
      value,
      percentage: '',
    }))
    .sort((a, b) => {
      const numA = parseInt(a.name) || 0;
      const numB = parseInt(b.name) || 0;
      return numA - numB;
    });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return dayjs(dateStr).format('YYYY-MM-DD');
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// 月度收益数据结构
export interface MonthlyData {
  month: string;       // '2024-01'
  monthLabel: string;   // '1月'
  expectedReturn: number;  // 预计收益
  historicalReturn: number; // 历史收益
  count: number;           // 笔数
}

// 年度数据统计
export interface AnnualData {
  year: number;
  totalAssets: number;       // 年度总资产（期末）
  totalDeposits: number;     // 年度新增存款笔数
  totalExpectedReturn: number; // 年度预计收益
  totalHistoricalReturn: number; // 年度历史收益
  newAmount: number;         // 年度新增存款金额
}

// 获取近12个月收益曲线数据
export function getMonthlyReturnCurve(deposits: DepositWithExtras[]): MonthlyData[] {
  const today = dayjs();
  const result: MonthlyData[] = [];

  // 获取未来12个月（含当月）的预计收益
  for (let i = -6; i <= 6; i++) {
    const month = today.add(i, 'month');
    const monthStr = month.format('YYYY-MM');
    const monthLabel = month.format('M月');

    // 计算该月到期的定期存款预计收益
    const expectedInMonth = deposits.filter((d) => {
      if (d.type !== 'fixed' || d.expireStatus === 'expired') return false;
      const endDate = dayjs(d.endDate);
      return endDate.format('YYYY-MM') === monthStr;
    }).reduce((sum, d) => sum + d.expectedReturn, 0);

    // 计算该月已到期的历史收益
    const historicalInMonth = deposits.filter((d) => {
      if (d.type !== 'fixed' || d.expireStatus !== 'expired') return false;
      const endDate = dayjs(d.endDate);
      return endDate.format('YYYY-MM') === monthStr;
    }).reduce((sum, d) => sum + d.expectedReturn, 0);

    const count = deposits.filter((d) => {
      if (d.type !== 'fixed') return false;
      const endDate = dayjs(d.endDate);
      return endDate.format('YYYY-MM') === monthStr;
    }).length;

    result.push({
      month: monthStr,
      monthLabel,
      expectedReturn: expectedInMonth,
      historicalReturn: historicalInMonth,
      count,
    });
  }

  return result;
}

// 获取年度对比数据
export function getAnnualComparison(deposits: DepositWithExtras[]): AnnualData[] {
  const today = dayjs();
  const years: number[] = [];

  // 收集所有涉及的年份（起息年份和到期年份）
  deposits.forEach((d) => {
    const startYear = dayjs(d.startDate).year();
    const endYear = dayjs(d.endDate).year();
    if (!years.includes(startYear)) years.push(startYear);
    if (!years.includes(endYear)) years.push(endYear);
  });

  // 确保包含近3年
  const currentYear = today.year();
  for (let y = currentYear - 2; y <= currentYear; y++) {
    if (!years.includes(y)) years.push(y);
  }

  years.sort((a, b) => a - b);

  return years.slice(-5).map((year) => {
    // 该年度新增的存款
    const newInYear = deposits.filter((d) => {
      const startYear = dayjs(d.startDate).year();
      return startYear === year;
    });

    // 该年度到期的存款（含已到期和当年度到期）
    const expiredInYear = deposits.filter((d) => {
      const endYear = dayjs(d.endDate).year();
      return endYear === year;
    });

    // 计算新增金额
    const newAmount = newInYear.reduce((sum, d) => sum + d.amount, 0);

    // 该年度的预计收益（当年度新增且未到期的）
    const totalExpectedReturn = newInYear
      .filter((d) => d.expireStatus !== 'expired')
      .reduce((sum, d) => sum + d.expectedReturn, 0);

    // 该年度的历史收益（已到期的）
    const totalHistoricalReturn = expiredInYear
      .filter((d) => d.expireStatus === 'expired')
      .reduce((sum, d) => sum + d.expectedReturn, 0);

    // 期末总资产（历年累计未到期）
    const totalAssets = deposits
      .filter((d) => d.expireStatus !== 'expired' && dayjs(d.startDate).year() <= year)
      .reduce((sum, d) => sum + d.amount, 0);

    return {
      year,
      totalAssets,
      totalDeposits: newInYear.length,
      totalExpectedReturn,
      totalHistoricalReturn,
      newAmount,
    };
  });
}

// 获取最近6个月的月度存款统计（用于柱状图）
export function getMonthlyDeposits(deposits: DepositWithExtras[]): MonthlyData[] {
  const today = dayjs();
  const result: MonthlyData[] = [];

  for (let i = -5; i <= 0; i++) {
    const month = today.add(i, 'month');
    const monthStr = month.format('YYYY-MM');
    const monthLabel = month.format('M月');

    const depositsInMonth = deposits.filter((d) => {
      const startYear = dayjs(d.startDate);
      return startYear.format('YYYY-MM') === monthStr;
    });

    const expectedReturn = depositsInMonth.reduce((sum, d) => sum + d.expectedReturn, 0);
    const historicalReturn = depositsInMonth
      .filter((d) => d.expireStatus === 'expired')
      .reduce((sum, d) => sum + d.expectedReturn, 0);

    result.push({
      month: monthStr,
      monthLabel,
      expectedReturn,
      historicalReturn,
      count: depositsInMonth.length,
    });
  }

  return result;
}

export function calculateExpenseStatistics(expenses: Expense[]): ExpenseStatistics {
  const today = dayjs();
  const currentMonthStr = today.format('YYYY-MM');
  const currentDateStr = today.format('YYYY-MM-DD');
  const lastMonthStr = today.subtract(1, 'month').format('YYYY-MM');

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  const monthlyExpenses = expenses.filter((e) => dayjs(e.date).format('YYYY-MM') === currentMonthStr);
  const monthlyExpense = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  const dailyExpenses = expenses.filter((e) => dayjs(e.date).format('YYYY-MM-DD') === currentDateStr);
  const dailyExpense = dailyExpenses.reduce((sum, e) => sum + e.amount, 0);

  const tagMap = new Map<string, number>();
  monthlyExpenses.forEach((e) => {
    tagMap.set(e.tagName, (tagMap.get(e.tagName) || 0) + e.amount);
  });

  const topTags = Array.from(tagMap.entries())
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: monthlyExpense > 0 ? (amount / monthlyExpense) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const expenseCount = monthlyExpenses.length;

  const lastMonthExpenses = expenses.filter((e) => dayjs(e.date).format('YYYY-MM') === lastMonthStr);
  const lastMonthExpense = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const monthOverMonth = lastMonthExpense > 0 ? ((monthlyExpense - lastMonthExpense) / lastMonthExpense) * 100 : 0;

  const currentWeekStart = today.startOf('week');
  const currentWeekEnd = today.endOf('week');
  const lastWeekStart = today.subtract(1, 'week').startOf('week');
  const lastWeekEnd = today.subtract(1, 'week').endOf('week');

  const currentWeekExpense = expenses
    .filter((e) => {
      const d = dayjs(e.date);
      return d.isAfter(currentWeekStart.subtract(1, 'day')) && d.isBefore(currentWeekEnd.add(1, 'day'));
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const lastWeekExpense = expenses
    .filter((e) => {
      const d = dayjs(e.date);
      return d.isAfter(lastWeekStart.subtract(1, 'day')) && d.isBefore(lastWeekEnd.add(1, 'day'));
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const weekOverWeek = lastWeekExpense > 0 ? ((currentWeekExpense - lastWeekExpense) / lastWeekExpense) * 100 : 0;

  return {
    totalExpense,
    monthlyExpense,
    dailyExpense,
    topTags,
    expenseCount,
    monthOverMonth,
    weekOverWeek,
  };
}

export function getTagExpenseDistribution(expenses: Expense[]): ChartDataItem[] {
  const tagMap = new Map<string, number>();
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  expenses.forEach((e) => {
    tagMap.set(e.tagName, (tagMap.get(e.tagName) || 0) + e.amount);
  });

  return Array.from(tagMap.entries())
    .map(([name, value]) => ({
      name,
      value,
      percentage: totalAmount > 0 ? ((value / totalAmount) * 100).toFixed(1) + '%' : '0%',
    }))
    .sort((a, b) => b.value - a.value);
}

export function getMonthlyExpenseCurve(
  expenses: Expense[],
): { month: string; monthLabel: string; amount: number; count: number }[] {
  const today = dayjs();
  const result: { month: string; monthLabel: string; amount: number; count: number }[] = [];

  for (let i = -5; i <= 0; i++) {
    const month = today.add(i, 'month');
    const monthStr = month.format('YYYY-MM');
    const monthLabel = month.format('M月');

    const expensesInMonth = expenses.filter((e) => dayjs(e.date).format('YYYY-MM') === monthStr);
    const amount = expensesInMonth.reduce((sum, e) => sum + e.amount, 0);

    result.push({
      month: monthStr,
      monthLabel,
      amount,
      count: expensesInMonth.length,
    });
  }

  return result;
}

export function getIncomeVsExpenseMonthly(
  deposits: Deposit[],
  expenses: Expense[],
): { period: string; income: number; expense: number; balance: number }[] {
  const today = dayjs();
  const result: { period: string; income: number; expense: number; balance: number }[] = [];

  for (let i = -5; i <= 0; i++) {
    const month = today.add(i, 'month');
    const monthStr = month.format('YYYY-MM');

    const income = deposits
      .filter((d) => dayjs(d.startDate).format('YYYY-MM') === monthStr)
      .reduce((sum, d) => sum + d.amount, 0);

    const expense = expenses
      .filter((e) => dayjs(e.date).format('YYYY-MM') === monthStr)
      .reduce((sum, e) => sum + e.amount, 0);

    result.push({
      period: monthStr,
      income,
      expense,
      balance: income - expense,
    });
  }

  return result;
}
