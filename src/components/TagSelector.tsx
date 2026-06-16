import { Plus } from 'lucide-react';
import { ExpenseTag } from '../types';

interface TagSelectorProps {
  tags: ExpenseTag[];
  selectedId: string | null;
  onSelect: (tag: ExpenseTag) => void;
  onAddCustom: () => void;
}

export function TagSelector({ tags, selectedId, onSelect, onAddCustom }: TagSelectorProps) {
  return (
    <div>
      <div className="grid grid-cols-4 gap-2">
        {tags.map((tag) => {
          const isSelected = selectedId === tag.id;
          return (
            <button
              key={tag.id}
              onClick={() => onSelect(tag)}
              className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border transition-all ${
                isSelected
                  ? 'border-2 shadow-sm scale-[1.02]'
                  : 'border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              style={{
                borderColor: isSelected ? tag.color : undefined,
                backgroundColor: isSelected ? `${tag.color}15` : undefined,
              }}
            >
              <div
                className="w-5 h-5 rounded-full flex-shrink-0"
                style={{ backgroundColor: tag.color }}
              />
              <span
                className={`text-xs leading-tight text-center ${
                  isSelected ? 'font-semibold' : 'text-gray-600'
                }`}
                style={{ color: isSelected ? tag.color : undefined }}
              >
                {tag.name}
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={onAddCustom}
        className="w-full mt-3 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-gray-300 text-gray-500 text-sm hover:border-[#4A90D9] hover:text-[#4A90D9] hover:bg-[#4A90D9]5 transition-all"
      >
        <Plus className="w-4 h-4" />
        <span>添加自定义标签</span>
      </button>
    </div>
  );
}
