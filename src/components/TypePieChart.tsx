import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartDataItem } from '../types';

interface TypePieChartProps {
  data: ChartDataItem[];
  title: string;
}

const COLORS = ['#4A90D9', '#D4AF37'];

export function TypePieChart({ data, title }: TypePieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <h3 className="text-sm font-semibold text-[#2C3E50] mb-3">{title}</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `¥${value.toLocaleString()}`}
              contentStyle={{
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-4 mt-2">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
            <span className="text-xs text-gray-600">{item.name}</span>
            <span className="text-xs font-medium text-[#2C3E50]">{item.percentage}</span>
          </div>
        ))}
      </div>
      {total > 0 && (
        <p className="text-center text-xs text-gray-400 mt-2">
          总计: ¥{total.toLocaleString()}
        </p>
      )}
    </div>
  );
}
