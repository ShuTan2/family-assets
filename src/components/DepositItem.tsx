import { Banknote, Calendar, Percent, Clock, Trash2 } from 'lucide-react';
import { DepositWithExtras } from '../types';
import { formatCurrency } from '../utils/calculations';

interface DepositItemProps {
  deposit: DepositWithExtras;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function DepositItem({ deposit, onEdit, onDelete }: DepositItemProps) {
  const isCurrent = deposit.type === 'current';

  const getStatusStyle = () => {
    if (isCurrent) return 'bg-[#1E3A5F]';
    const styles = {
      normal: 'bg-[#1E3A5F]',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
      expired: 'bg-gray-400',
    };
    return styles[deposit.expireStatus];
  };

  const getStatusText = () => {
    if (isCurrent) return '随时可取';
    if (deposit.expireStatus === 'expired') return `${deposit.endDate}已到期`;
    return `${deposit.daysUntilExpire}天后到期`;
  };

  const getCardStyle = () => {
    if (isCurrent) return 'bg-white';
    const styles = {
      normal: 'bg-white',
      orange: 'bg-orange-50 border-orange-200',
      red: 'bg-red-50 border-red-200',
      expired: 'bg-gray-100 border-gray-200',
    };
    return styles[deposit.expireStatus];
  };

  const getTextStyle = () => {
    if (isCurrent) return 'text-[#2C3E50]';
    const styles = {
      normal: 'text-[#2C3E50]',
      orange: 'text-orange-700',
      red: 'text-red-700',
      expired: 'text-gray-500',
    };
    return styles[deposit.expireStatus];
  };

  const isExpired = deposit.expireStatus === 'expired';

  return (
    <div
      className={`rounded-xl p-4 border transition-all active:scale-[0.98] ${getCardStyle()}`}
      onClick={() => onEdit(deposit.id)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${isExpired ? 'bg-gray-300 bg-opacity-30' : 'bg-[#1E3A5F] bg-opacity-10'}`}>
            <Banknote className={`w-4 h-4 ${isExpired ? 'text-gray-400' : 'text-[#1E3A5F]'}`} />
          </div>
          <div>
            <h3 className={`font-semibold ${getTextStyle()}`}>{deposit.bankName}</h3>
            <p className={`text-xs ${isExpired ? 'text-gray-400' : 'text-gray-500'}`}>
              {deposit.type === 'fixed' ? '定期存款' : '活期存款'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusStyle()} text-white`}>
            {getStatusText()}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(deposit.id);
            }}
            className={`p-1.5 rounded-lg transition-colors ${isExpired ? 'hover:bg-gray-300' : 'hover:bg-gray-200'}`}
          >
            <Trash2 className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className={`text-xs mb-0.5 ${isExpired ? 'text-gray-400' : 'text-gray-500'}`}>存款金额</p>
          <p className={`text-base font-bold ${isExpired ? 'text-gray-500' : getTextStyle()}`}>
            {formatCurrency(deposit.amount)}
          </p>
        </div>
        <div>
          <p className={`text-xs mb-0.5 ${isExpired ? 'text-gray-400' : 'text-gray-500'}`}>
            {isExpired ? '历史收益' : isCurrent ? '活期收益' : '预计收益'}
          </p>
          <p className={`text-base font-bold ${isExpired ? 'text-gray-500' : 'text-[#D4AF37]'}`}>
            +{formatCurrency(deposit.expectedReturn)}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Percent className={`w-3.5 h-3.5 ${isExpired ? 'text-gray-300' : 'text-gray-400'}`} />
          <span className={`text-sm ${isExpired ? 'text-gray-400' : 'text-gray-600'}`}>
            {deposit.annualRate}%
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className={`w-3.5 h-3.5 ${isExpired ? 'text-gray-300' : 'text-gray-400'}`} />
          <span className={`text-sm ${isExpired ? 'text-gray-400' : 'text-gray-600'}`}>
            {isCurrent ? '活期' : `${deposit.termMonths}个月`}
          </span>
        </div>
      </div>

      <div className={`mt-3 pt-3 border-t flex items-center gap-1.5 ${isExpired ? 'border-gray-300' : 'border-gray-200'}`}>
        <Calendar className={`w-3.5 h-3.5 ${isExpired ? 'text-gray-300' : 'text-gray-400'}`} />
        <span className={`text-xs ${isExpired ? 'text-gray-400' : 'text-gray-500'}`}>
          {isCurrent ? `开户日期：${deposit.startDate}` : `${deposit.startDate} ~ ${deposit.endDate}`}
        </span>
      </div>
    </div>
  );
}
