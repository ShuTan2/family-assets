import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartDataItem } from '../types';

interface TermBarChartProps {
  data: ChartDataItem[];
  title: string;
}

export function TermBarChart({ data, title }: TermBarChartProps) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <h3 className="text-sm font-semibold text-[#2C3E50] mb-3">{title}</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}万`}
            />
            <Tooltip
              formatter={(value: number) => `¥${value.toLocaleString()}`}
              contentStyle={{
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            />
            <Bar dataKey="value" fill="#4A90D9" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {data.length === 0 && (
        <p className="text-center text-xs text-gray-400 mt-4">暂无定期存款</p>
      )}
    </div>
  );
}
