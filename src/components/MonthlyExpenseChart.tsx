import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { formatCurrency } from '../utils/calculations';

interface MonthlyExpenseChartProps {
  data: {
    month: string;
    monthLabel: string;
    amount: number;
    count: number;
  }[];
  title: string;
}

export function MonthlyExpenseChart({ data, title }: MonthlyExpenseChartProps) {
  const formatYAxis = (value: number) => {
    if (value >= 10000) return `${(value / 10000).toFixed(1)}万`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}千`;
    return `¥${value}`;
  };

  const formatTooltip = (value: number) => formatCurrency(value);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <h3 className="text-sm font-semibold text-[#2C3E50] mb-3">{title}</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="monthLabel"
              tick={{ fontSize: 11, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatYAxis}
            />
            <Tooltip
              formatter={(value: number) => formatTooltip(value)}
              labelFormatter={(label, items) => {
                const item = items?.[0]?.payload;
                return item?.count ? `${label} · ${item.count}笔` : label;
              }}
              contentStyle={{
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
              labelStyle={{ color: '#2C3E50', fontWeight: 600 }}
            />
            <Bar dataKey="amount" fill="#4A90D9" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {data.length === 0 && (
        <p className="text-center text-xs text-gray-400 mt-4">暂无支出数据</p>
      )}
    </div>
  );
}
