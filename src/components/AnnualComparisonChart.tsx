import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from 'recharts';
import { AnnualData } from '../utils/calculations';

interface AnnualComparisonChartProps {
  data: AnnualData[];
  title: string;
}

export function AnnualComparisonChart({ data, title }: AnnualComparisonChartProps) {
  const formatYAxis = (value: number) => {
    if (value >= 10000) return `${(value / 10000).toFixed(0)}万`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}千`;
    return `¥${value}`;
  };

  const formatTooltip = (value: number) => `¥${value.toLocaleString()}`;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <h3 className="text-sm font-semibold text-[#2C3E50] mb-3">{title}</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="year"
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
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  newAmount: '新增存款',
                  totalExpectedReturn: '预计收益',
                  totalHistoricalReturn: '历史收益',
                };
                return [formatTooltip(value), labels[name] || name];
              }}
              contentStyle={{
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
              labelStyle={{ color: '#2C3E50', fontWeight: 600 }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
              formatter={(value) => {
                const labels: Record<string, string> = {
                  newAmount: '新增存款',
                  totalExpectedReturn: '预计收益',
                  totalHistoricalReturn: '历史收益',
                };
                return labels[value] || value;
              }}
            />
            <Bar dataKey="newAmount" fill="#1E3A5F" radius={[4, 4, 0, 0]} name="newAmount" />
            <Bar dataKey="totalExpectedReturn" fill="#4A90D9" radius={[4, 4, 0, 0]} name="totalExpectedReturn" />
            <Bar dataKey="totalHistoricalReturn" fill="#D4AF37" radius={[4, 4, 0, 0]} name="totalHistoricalReturn" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
