import { Trash2, Calendar } from 'lucide-react';
import { Expense, ExpenseTag } from '../types';
import { formatCurrency } from '../utils/calculations';

interface ExpenseItemProps {
  expense: Expense;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  tag?: ExpenseTag;
}

export function ExpenseItem({ expense, onEdit, onDelete, tag }: ExpenseItemProps) {
  const tagColor = tag?.color || '#6B7280';
  const tagIcon = tag?.icon;
  const tagName = tag?.name || expense.tagName;

  return (
    <div
      className="rounded-xl p-4 border border-gray-200 bg-white transition-all active:scale-[0.98] hover:shadow-md hover:border-gray-300 cursor-pointer"
      onClick={() => onEdit(expense.id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className="p-2 rounded-lg flex-shrink-0"
            style={{ backgroundColor: `${tagColor}20` }}
          >
            {tagIcon ? (
              <span className="text-base leading-none" style={{ color: tagColor }}>{tagIcon}</span>
            ) : (
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tagColor }} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-semibold text-[#2C3E50] truncate">{tagName}</h3>
              <p className="text-base font-bold text-[#2C3E50] flex-shrink-0">
                -{formatCurrency(expense.amount)}
              </p>
            </div>

            {expense.note && (
              <p className="text-sm text-gray-500 mt-1 truncate">{expense.note}</p>
            )}

            <div className="flex items-center gap-1.5 mt-2">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">{expense.date}</span>
            </div>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(expense.id);
          }}
          className="p-1.5 rounded-lg transition-colors hover:bg-gray-100 flex-shrink-0 ml-2"
        >
          <Trash2 className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
}
