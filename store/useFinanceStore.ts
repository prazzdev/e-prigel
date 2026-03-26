import { create } from 'zustand';
import { getDb } from '../lib/db';
import * as Crypto from 'expo-crypto';
import { Alert } from 'react-native';

interface Transaction {
  amount: number;
  type: 'income' | 'expense';
  note: string;
  category_id?: string;
  account_id?: string;
}

interface FinanceState {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  recentTransactions: any[];
  categories: any[];
  accounts: any[];
  budgets: any[]; 
  pieData: any[];
  barData: any[];
  isSecurityActive: boolean;
  isLocked: boolean;
  setSecurity: (status: boolean) => void;
  setLocked: (status: boolean) => void;
  refreshData: () => Promise<void>;
  addTransaction: (tx: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (name: string, type: 'income' | 'expense') => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  updateCategoryBudget: (id: string, amount: number) => Promise<void>;
  addAccount: (name: string, color: string) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  resetDatabase: () => Promise<void>;
  exportTransactions: () => Promise<any[]>; // Fungsi baru untuk ekspor
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  balance: 0,
  totalIncome: 0,
  totalExpense: 0,
  recentTransactions: [],
  categories: [],
  accounts: [],
  budgets: [],
  pieData: [],
  barData: [],
  isSecurityActive: false,
  isLocked: false,

  setSecurity: (status) => set({ isSecurityActive: status }),
  setLocked: (status) => set({ isLocked: status }),

  refreshData: async () => {
    try {
      const db = await getDb();
      if (!db) return;

      let accs: any[] = await db.getAllAsync("SELECT * FROM accounts");
      if (accs.length === 0) {
        await db.execAsync(`
          INSERT INTO accounts (id, name, color_hex) VALUES ('acc_1', 'CASH', '#DBFF00');
          INSERT INTO accounts (id, name, color_hex) VALUES ('acc_2', 'BANK', '#00E1FF');
        `);
        accs = await db.getAllAsync("SELECT * FROM accounts");
      }

      const accountsWithBalance = await Promise.all(accs.map(async (acc) => {
        const res: any = await db.getFirstAsync(
          "SELECT COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE -amount END), 0) as ball FROM transactions WHERE account_id = ?",
          [acc.id]
        );
        return { ...acc, balance: res.ball };
      }));

      const balRes: any = await db.getFirstAsync("SELECT COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE -amount END), 0) as total FROM transactions");
      const statsRes: any = await db.getFirstAsync("SELECT SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as inc, SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as exp FROM transactions");
      const txs = await db.getAllAsync("SELECT * FROM transactions ORDER BY date DESC LIMIT 15");
      
      const days = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];
      const last7DaysData = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const res: any = await db.getFirstAsync(
          "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type='expense' AND date LIKE ?",
          [`${dateStr}%`]
        );
        last7DaysData.push({
          value: res.total / 100,
          label: days[d.getDay()],
          frontColor: i === 0 ? '#0057FF' : '#FF90E8',
        });
      }

      let cats: any[] = await db.getAllAsync("SELECT * FROM categories");
      if (cats.length === 0) {
        await db.execAsync(`
          INSERT INTO categories (id, name, type) VALUES ('1', 'MAKAN', 'expense');
          INSERT INTO categories (id, name, type) VALUES ('2', 'TRANSPORT', 'expense');
          INSERT INTO categories (id, name, type) VALUES ('3', 'GAJI', 'income');
        `);
        cats = await db.getAllAsync("SELECT * FROM categories");
      }

      const currentMonth = new Date().toISOString().substring(0, 7);
      const budgetsWithProgress = await Promise.all(
        cats.filter(c => c.type === 'expense' && c.budget_amount > 0).map(async (cat) => {
          const res: any = await db.getFirstAsync(
            "SELECT COALESCE(SUM(amount), 0) as spent FROM transactions WHERE category_id = ? AND date LIKE ?",
            [cat.id, `${currentMonth}%`]
          );
          return {
            ...cat,
            spent: res.spent,
            progress: Math.min(res.spent / cat.budget_amount, 1)
          };
        })
      );

      const pieRes: any[] = await db.getAllAsync(`
        SELECT c.name as text, SUM(t.amount) as value FROM transactions t 
        JOIN categories c ON t.category_id = c.id WHERE t.type = 'expense' GROUP BY c.id
      `);

      const colors = ['#FF90E8', '#00E1FF', '#DBFF00', '#FF5C00', '#5CFF5C'];
      const formattedPie = pieRes.map((item, index) => ({
        ...item, value: item.value / 100, color: colors[index % colors.length]
      }));
      
      set({ 
        balance: balRes?.total || 0, 
        totalIncome: statsRes?.inc || 0,
        totalExpense: statsRes?.exp || 0,
        recentTransactions: txs || [],
        categories: cats || [],
        accounts: accountsWithBalance,
        budgets: budgetsWithProgress,
        pieData: formattedPie.length > 0 ? formattedPie : [{value: 1, color: '#F0F0F0', text: 'KOSONG'}],
        barData: last7DaysData
      });
    } catch (e) { console.log("⚠️ Refresh Error:", e); }
  },

  exportTransactions: async () => {
    try {
      const db = await getDb();
      if (!db) return [];
      // Join untuk dapet data lengkap
      const data = await db.getAllAsync(`
        SELECT t.date, t.note, t.type, t.amount, c.name as category, a.name as account 
        FROM transactions t 
        LEFT JOIN categories c ON t.category_id = c.id 
        LEFT JOIN accounts a ON t.account_id = a.id 
        ORDER BY t.date DESC
      `);
      return data;
    } catch (e) { console.error(e); return []; }
  },

  addTransaction: async (tx: Transaction) => {
    try {
      const db = await getDb();
      const id = Crypto.randomUUID();
      const date = new Date().toISOString();
      await db.runAsync(
        "INSERT INTO transactions (id, amount, type, note, date, category_id, account_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [id, tx.amount, tx.type, tx.note, date, tx.category_id || null, tx.account_id || null]
      );
      await get().refreshData();
    } catch (e) { console.error(e); throw e; }
  },

  deleteTransaction: async (id: string) => {
    try {
      const db = await getDb();
      await db.runAsync("DELETE FROM transactions WHERE id = ?", [id]);
      await get().refreshData();
    } catch (e) { console.error(e); throw e; }
  },

  addCategory: async (name: string, type: 'income' | 'expense') => {
    try {
      const db = await getDb();
      await db.runAsync("INSERT INTO categories (id, name, type) VALUES (?, ?, ?)", [Crypto.randomUUID(), name.toUpperCase(), type]);
      await get().refreshData();
    } catch (e) { console.error(e); }
  },

  deleteCategory: async (id: string) => {
    try {
      const db = await getDb();
      await db.runAsync("UPDATE transactions SET category_id = NULL WHERE category_id = ?", [id]);
      await db.runAsync("DELETE FROM categories WHERE id = ?", [id]);
      await get().refreshData();
    } catch (e) { console.error(e); }
  },

  updateCategoryBudget: async (id: string, amount: number) => {
    try {
      const db = await getDb();
      await db.runAsync("UPDATE categories SET budget_amount = ? WHERE id = ?", [amount, id]);
      await get().refreshData();
    } catch (e) { console.error(e); }
  },

  addAccount: async (name: string, color: string) => {
    try {
      const db = await getDb();
      await db.runAsync("INSERT INTO accounts (id, name, color_hex) VALUES (?, ?, ?)", [Crypto.randomUUID(), name.toUpperCase(), color]);
      await get().refreshData();
    } catch (e) { console.error(e); }
  },

  deleteAccount: async (id: string) => {
    try {
      const db = await getDb();
      const txCount: any = await db.getFirstAsync("SELECT COUNT(*) as count FROM transactions WHERE account_id = ?", [id]);
      if (txCount.count > 0) {
        Alert.alert("GAGAL", "DOMPET INI MASIH PUNYA DATA TRANSAKSI!");
        return;
      }
      await db.runAsync("DELETE FROM accounts WHERE id = ?", [id]);
      await get().refreshData();
    } catch (e) { console.error(e); }
  },

  resetDatabase: async () => {
    try {
      const db = await getDb();
      await db.execAsync("DELETE FROM transactions;");
      await get().refreshData();
    } catch (e) { console.error(e); }
  }
}));