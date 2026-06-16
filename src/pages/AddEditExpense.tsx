import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, Plus, X } from 'lucide-react';
import { useExpenseStore } from '../hooks/useExpenses';
import { TagSelector } from '../components/TagSelector';
import { ExpenseTag } from '../types';

export function AddEditExpense() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    tags,
    expenses,
    loadTags,
    loadExpenses,
    addExpense,
    updateExpense,
    addCustomTag,
  } = useExpenseStore();

  const isEdit = Boolean(id);

  const [amount, setAmount] = useState('');
  const [selectedTag, setSelectedTag] = useState<ExpenseTag | null>(null);
  const [date, setDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [note, setNote] = useState('');

  const [showCustomTagInput, setShowCustomTagInput] = useState(false);
  const [customTagName, setCustomTagName] = useState('');

  useEffect(() => {
    loadTags();
    loadExpenses();
  }, [loadTags, loadExpenses]);

  useEffect(() => {
    if (isEdit && id) {
      const expense = expenses.find((e) => e.id === id);
      if (expense) {
        setAmount(expense.amount.toString());
        setDate(expense.date);
        setNote(expense.note || '');
        const tag = tags.find((t) => t.id === expense.tagId);
        if (tag) {
          setSelectedTag(tag);
        } else {
          setSelectedTag({
            id: expense.tagId,
            name: expense.tagName,
            icon: 'tag',
            color: '#4A90D9',
            isDefault: false,
            isSystem: false,
          });
        }
      }
    }
  }, [isEdit, id, expenses, tags]);

  const handleAmountChange = (value: string) => {
    const regex = /^\d*\.?\d{0,2}$/;
    if (value === '' || regex.test(value)) {
      setAmount(value);
    }
  };

  const handleTagSelect = (tag: ExpenseTag) => {
    setSelectedTag(tag);
  };

  const handleAddCustomTag = () => {
    setShowCustomTagInput(true);
    setCustomTagName('');
  };

  const handleCancelCustomTag = () => {
    setShowCustomTagInput(false);
    setCustomTagName('');
  };

  const handleConfirmCustomTag = () => {
    const name = customTagName.trim();
    if (!name) {
      alert('请输入标签名称');
      return;
    }
    const exists = tags.some((t) => t.name === name);
    if (exists) {
      alert('该标签已存在');
      return;
    }
    addCustomTag(name);
    setShowCustomTagInput(false);
    setCustomTagName('');
  };

  const handleSubmit = () => {
    const amountNum = parseFloat(amount);

    if (!amountNum || amountNum <= 0) {
      alert('请输入有效的金额（必须大于 0）');
      return;
    }
    if (!selectedTag) {
      alert('请选择标签');
      return;
    }
    if (!date) {
      alert('请选择日期');
      return;
    }

    const expenseData = {
      amount: amountNum,
      tagId: selectedTag.id,
      tagName: selectedTag.name,
      note: note.trim(),
      date,
    };

    if (isEdit && id) {
      updateExpense(id, expenseData);
    } else {
      addExpense(expenseData);
    }

    navigate('/expenses');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      <header className="bg-white px-4 py-4 border-b border-gray-100 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#2C3E50]" />
        </button>
        <h1 className="text-lg font-semibold text-[#2C3E50]">
          {isEdit ? '编辑支出' : '添加支出'}
        </h1>
      </header>

      <div className="px-4 py-6 space-y-5">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <label className="block text-sm font-medium text-gray-500 mb-2 text-center">
            支出金额
          </label>
          <div className="flex items-center justify-center gap-1">
            <span className="text-3xl font-semibold text-[#2C3E50]">¥</span>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              className="flex-1 text-5xl font-bold text-[#1E3A5F] text-center outline-none bg-transparent tracking-tight placeholder:text-gray-300 min-w-0"
            />
          </div>
          <div className="h-px bg-gray-100 mt-4" />
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-[#4A90D9]" />
              <label className="text-sm font-medium text-[#2C3E50]">
                选择标签
              </label>
            </div>
            <TagSelector
              tags={tags}
              selectedId={selectedTag?.id ?? null}
              onSelect={handleTagSelect}
              onAddCustom={handleAddCustomTag}
            />
          </div>

          {showCustomTagInput && (
            <div className="bg-[#4A90D9]5 rounded-xl p-3 border border-[#4A90D9] border-opacity-20">
              <label className="block text-xs text-[#4A90D9] font-medium mb-2">
                新标签名称
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTagName}
                  onChange={(e) => setCustomTagName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleConfirmCustomTag();
                    }
                  }}
                  placeholder="请输入标签名称"
                  autoFocus
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-[#4A90D9] focus:ring-2 focus:ring-[#4A90D9] focus:ring-opacity-20 outline-none transition-all"
                  maxLength={10}
                />
                <button
                  type="button"
                  onClick={handleCancelCustomTag}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCustomTag}
                  className="p-2 rounded-lg bg-[#4A90D9] text-white hover:bg-[#3A7FC9] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-[#4A90D9]" />
            <label className="text-sm font-medium text-[#2C3E50]">
              日期
            </label>
          </div>
          <div className="relative">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4A90D9] focus:ring-2 focus:ring-[#4A90D9] focus:ring-opacity-20 outline-none transition-all text-[#2C3E50]"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <label className="block text-sm font-medium text-[#2C3E50] mb-3">
            备注
            <span className="text-gray-400 font-normal ml-2 text-xs">
              （可选）
            </span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="添加备注..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4A90D9] focus:ring-2 focus:ring-[#4A90D9] focus:ring-opacity-20 outline-none transition-all text-[#2C3E50] text-sm resize-none"
            maxLength={100}
          />
          <div className="text-right text-xs text-gray-400 mt-1">
            {note.length}/100
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-4 bg-[#1E3A5F] text-white rounded-xl font-semibold text-base active:scale-[0.98] transition-transform shadow-sm"
        >
          {isEdit ? '保存修改' : '确认添加'}
        </button>
      </div>
    </div>
  );
}
