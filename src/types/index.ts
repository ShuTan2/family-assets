export type DepositType = 'fixed' | 'current';

export interface Deposit {
  id: string;
  bankName: string;
  type: DepositType;
  amount: number;
  annualRate: number;
  termMonths: number;
  startDate: string;
  expectedReturn: number;
}

export type ExpireStatus = 'expired' | 'red' | 'orange' | 'normal';

export interface DepositWithExtras extends Deposit {
  endDate: string;
  daysUntilExpire: number;
  expireStatus: ExpireStatus;
}

export interface Statistics {
  totalAssets: number;
  currentDeposits: number;
  fixedDeposits: number;
  totalDeposits: number;
  activeDeposits: number;
  totalExpectedReturn: number;
  historicalReturn: number;
  expiringWithin30Days: number;
  expiringWithin90Days: number;
  expiredCount: number;
}

export interface ChartDataItem {
  name: string;
  value: number;
  percentage: string;
}

// 支出标签
export interface ExpenseTag {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  isSystem: boolean;
}

// 支出记录
export interface Expense {
  id: string;
  amount: number;
  tagId: string;
  tagName: string;
  note?: string;
  date: string;
  createdAt: string;
}

// 支出统计
export interface ExpenseStatistics {
  totalExpense: number;
  monthlyExpense: number;
  dailyExpense: number;
  topTags: { name: string; amount: number; percentage: number }[];
  expenseCount: number;
  monthOverMonth: number;
  weekOverWeek: number;
}

// 月度支出数据
export interface MonthlyExpenseData {
  month: string;
  monthLabel: string;
  totalAmount: number;
  count: number;
  tags: { name: string; amount: number }[];
}

// 收入vs支出汇总
export interface IncomeVsExpense {
  period: string;
  income: number;
  expense: number;
  balance: number;
}

