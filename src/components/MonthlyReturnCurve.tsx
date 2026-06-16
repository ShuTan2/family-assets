import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { MonthlyData } from '../utils/calculations';

interface MonthlyReturnCurveProps {
  data: MonthlyData[];
  title: string;
}

export function MonthlyReturnCurve({ data, title }: MonthlyReturnCurveProps) {
  const formatYAxis = (value: number) => {
    if (value >= 10000) return `${(value / 10000).toFixed(1)}万`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}千`;
    return `¥${value}`;
  };

  const formatTooltip = (value: number) => `¥${value.toLocaleString()}`;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <h3 className="text-sm font-semibold text-[#2C3E50] mb-3">{title}</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
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
              formatter={(value: number, name: string) => [
                formatTooltip(value),
                name === 'expectedReturn' ? '预计收益' : '历史收益',
              ]}
              contentStyle={{
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
              labelStyle={{ color: '#2C3E50', fontWeight: 600 }}
            />
            <Line
              type="monotone"
              dataKey="expectedReturn"
              stroke="#4A90D9"
              strokeWidth={2}
              dot={{ fill: '#4A90D9', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: '#4A90D9' }}
            />
            <Line
              type="monotone"
              dataKey="historicalReturn"
              stroke="#D4AF37"
              strokeWidth={2}
              dot={{ fill: '#D4AF37', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: '#D4AF37' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-[#4A90D9]" />
          <span className="text-xs text-gray-600">预计收益</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-[#D4AF37]" />
          <span className="text-xs text-gray-600">历史收益</span>
        </div>
      </div>
    </div>
  );
}
