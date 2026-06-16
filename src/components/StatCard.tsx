import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  color?: string;
}

export function StatCard({ title, value, icon: Icon, trend, color = 'text-[#1E3A5F]' }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${color} bg-opacity-10`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 mb-0.5">{title}</p>
          <p className="text-lg font-bold text-[#2C3E50] truncate">{value}</p>
          {trend && <p className="text-xs text-gray-400 mt-0.5">{trend}</p>}
        </div>
      </div>
    </div>
  );
}
