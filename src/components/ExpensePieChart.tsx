import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartDataItem } from '../types';
import { formatCurrency } from '../utils/calculations';

interface ExpensePieChartProps {
  data: ChartDataItem[];
  title: string;
}

const PIE_COLORS = ['#4A90D9', '#D4AF37', '#E67E22', '#27AE60', '#8E44AD', '#3498DB', '#E74C3C', '#16A085'];

export function ExpensePieChart({ data, title }: ExpensePieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const getColor = (index: number, item: ChartDataItem) => {
    const colorFromName = data[index]?.name;
    if (colorFromName && colorFromName.startsWith('#')) {
      return colorFromName;
    }
    return PIE_COLORS[index % PIE_COLORS.length];
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
  }) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <h3 className="text-sm font-semibold text-[#2C3E50] mb-3">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
              label={renderCustomizedLabel}
              labelLine={false}
            >
              {data.map((item, index) => (
                <Cell key={`cell-${index}`} fill={getColor(index, item)} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              formatter={(value: string, entry: any) => (
                <span className="text-xs text-gray-600">
                  {value}
                  <span className="ml-1 text-gray-400">
                    {entry?.payload?.percentage || ''}
                  </span>
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {total > 0 && (
        <p className="text-center text-xs text-gray-400 mt-2">总计: {formatCurrency(total)}</p>
      )}
      {data.length === 0 && (
        <p className="text-center text-xs text-gray-400 mt-4">暂无支出数据</p>
      )}
    </div>
  );
}
