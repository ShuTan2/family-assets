import { create } from 'zustand';
import { Expense, ExpenseTag } from '../types';

const EXPENSE_STORAGE_KEY = 'family_assets_expenses';
const TAG_STORAGE_KEY = 'family_assets_expense_tags';

const DEFAULT_TAGS: ExpenseTag[] = [
  { id: 'tag_food', name: '吃饭', icon: 'utensils', color: '#EF4444', isDefault: true, isSystem: true },
  { id: 'tag_clothes', name: '衣服', icon: 'shirt', color: '#F97316', isDefault: true, isSystem: true },
  { id: 'tag_house', name: '房租/房贷', icon: 'home', color: '#EAB308', isDefault: true, isSystem: true },
  { id: 'tag_property', name: '物业费', icon: 'building', color: '#22C55E', isDefault: true, isSystem: true },
  { id: 'tag_supplies', name: '生活用品', icon: 'shopping-bag', color: '#14B8A6', isDefault: true, isSystem: true },
  { id: 'tag_transport', name: '交通出行', icon: 'car', color: '#3B82F6', isDefault: true, isSystem: true },
  { id: 'tag_medical', name: '医疗健康', icon: 'heart-pulse', color: '#EC4899', isDefault: true, isSystem: true },
  { id: 'tag_education', name: '学习教育', icon: 'book-open', color: '#8B5CF6', isDefault: true, isSystem: true },
  { id: 'tag_entertainment', name: '娱乐休闲', icon: 'film', color: '#06B6D4', isDefault: false, isSystem: true },
  { id: 'tag_phone', name: '通讯网络', icon: 'smartphone', color: '#64748B', isDefault: false, isSystem: true },
  { id: 'tag_other', name: '其他', icon: 'more-horizontal', color: '#94A3B8', isDefault: false, isSystem: true },
];

interface ExpenseState {
  expenses: Expense[];
  tags: ExpenseTag[];
  loadExpenses: () => void;
  addExpense: (data: { amount: number; tagId: string; tagName: string; note?: string; date?: string }) => void;
  updateExpense: (id: string, data: { amount: number; tagId: string; tagName: string; note?: string; date?: string }) => void;
  deleteExpense: (id: string) => void;
  addCustomTag: (name: string, color?: string) => void;
  deleteCustomTag: (id: string) => void;
  getExpensesByMonth: (dateStr?: string) => Expense[];
  getTagById: (id: string) => ExpenseTag | undefined;
  loadTags: () => void;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  tags: [],

  loadTags: () => {
    const stored = localStorage.getItem(TAG_STORAGE_KEY);
    let tagsList: ExpenseTag[] = [];
    if (stored) {
      try {
        tagsList = JSON.parse(stored);
      } catch {
        tagsList = [];
      }
    }
    const systemTags = DEFAULT_TAGS;
    const customTags = tagsList.filter((t) => !t.isSystem);
    const allTags = [...systemTags, ...customTags];
    set({ tags: allTags });
    const onlyCustom = allTags.filter((t) => !t.isSystem);
    if (onlyCustom.length > 0) {
      localStorage.setItem(TAG_STORAGE_KEY, JSON.stringify(onlyCustom));
    }
  },

  loadExpenses: () => {
    const stored = localStorage.getItem(EXPENSE_STORAGE_KEY);
    if (stored) {
      try {
        set({ expenses: JSON.parse(stored) });
      } catch {
        set({ expenses: [] });
      }
    }
  },

  addExpense: (data) => {
    const now = new Date().toISOString();
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
    const expense: Expense = {
      id,
      amount: data.amount,
      tagId: data.tagId,
      tagName: data.tagName,
      note: data.note || '',
      date: data.date || new Date().toISOString().split('T')[0],
      createdAt: now,
    };
    const updated = [...get().expenses, expense];
    localStorage.setItem(EXPENSE_STORAGE_KEY, JSON.stringify(updated));
    set({ expenses: updated });
  },

  updateExpense: (id, data) => {
    const updated = get().expenses.map((e) =>
      e.id === id ? {
        ...e,
        amount: data.amount,
        tagId: data.tagId,
        tagName: data.tagName,
        note: data.note || '',
        date: data.date || e.date,
      } : e
    );
    localStorage.setItem(EXPENSE_STORAGE_KEY, JSON.stringify(updated));
    set({ expenses: updated });
  },

  deleteExpense: (id) => {
    const updated = get().expenses.filter((e) => e.id !== id);
    localStorage.setItem(EXPENSE_STORAGE_KEY, JSON.stringify(updated));
    set({ expenses: updated });
  },

  addCustomTag: (name, color) => {
    const id = 'custom_' + Date.now().toString(36);
    const newTag: ExpenseTag = {
      id,
      name,
      icon: 'tag',
      color: color || getRandomColor(),
      isDefault: false,
      isSystem: false,
    };
    const updatedTags = [...get().tags, newTag];
    const customTags = updatedTags.filter((t) => !t.isSystem);
    localStorage.setItem(TAG_STORAGE_KEY, JSON.stringify(customTags));
    set({ tags: updatedTags });
  },

  deleteCustomTag: (id) => {
    const updatedTags = get().tags.filter((t) => t.id !== id);
    const customTags = updatedTags.filter((t) => !t.isSystem);
    localStorage.setItem(TAG_STORAGE_KEY, JSON.stringify(customTags));
    set({ tags: updatedTags });
  },

  getExpensesByMonth: (dateStr) => {
    const expenses = get().expenses;
    if (!dateStr) return expenses;
    const targetDate = dateStr.split('-').slice(0, 2).join('-');
    return expenses.filter((e) => e.date.startsWith(targetDate));
  },

  getTagById: (id) => {
    return get().tags.find((t) => t.id === id);
  },
}));

function getRandomColor(): string {
  const colors = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#14B8A6', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];
  return colors[Math.floor(Math.random() * colors.length)];
}
