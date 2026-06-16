import { create } from 'zustand';
import { Deposit } from '../types';
import { enrichDeposit, sortByExpireDate, calculateStatistics } from '../utils/calculations';

const STORAGE_KEY = 'family_assets_deposits';

interface DepositState {
  deposits: Deposit[];
  loadDeposits: () => void;
  addDeposit: (deposit: Omit<Deposit, 'id'>) => void;
  updateDeposit: (id: string, deposit: Omit<Deposit, 'id'>) => void;
  deleteDeposit: (id: string) => void;
  getSortedDeposits: () => ReturnType<typeof sortByExpireDate>;
  getStatistics: () => ReturnType<typeof calculateStatistics>;
}

export const useDepositStore = create<DepositState>((set, get) => ({
  deposits: [],

  loadDeposits: () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        set({ deposits: JSON.parse(stored) });
      } catch {
        set({ deposits: [] });
      }
    }
  },

  addDeposit: (deposit) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
    const newDeposit = { ...deposit, id };
    const updated = [...get().deposits, newDeposit];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ deposits: updated });
  },

  updateDeposit: (id, deposit) => {
    const updated = get().deposits.map((d) => (d.id === id ? { ...deposit, id } : d));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ deposits: updated });
  },

  deleteDeposit: (id) => {
    const updated = get().deposits.filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ deposits: updated });
  },

  getSortedDeposits: () => {
    const enriched = get().deposits.map(enrichDeposit);
    return sortByExpireDate(enriched);
  },

  getStatistics: () => {
    const enriched = get().deposits.map(enrichDeposit);
    return calculateStatistics(enriched);
  },
}));
