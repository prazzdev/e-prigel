import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export const toRupiah = (amount: number) => amount / 100;
export const fromRupiah = (amount: number) => Math.round(amount * 100);

export const getDb = async () => {
  if (dbInstance) return dbInstance;

  const db = await SQLite.openDatabaseAsync('finance_v1.db');

  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      -- Tabel Akun
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        balance INTEGER DEFAULT 0,
        color_hex TEXT
      );

      -- Tabel Kategori
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        type TEXT CHECK(type IN ('income', 'expense'))
      );

      -- Tabel Transaksi
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY NOT NULL,
        amount INTEGER NOT NULL,
        type TEXT CHECK(type IN ('income', 'expense')),
        category_id TEXT,
        account_id TEXT,
        note TEXT,
        date TEXT,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
      );
    `);

    // MIGRASI OTOMATIS: Tambah kolom budget_amount jika belum ada
    const tableInfo: any[] = await db.getAllAsync("PRAGMA table_info(categories)");
    const hasBudgetColumn = tableInfo.some(column => column.name === 'budget_amount');
    
    if (!hasBudgetColumn) {
      console.log("🛠 Migrating database: Adding budget_amount to categories...");
      await db.execAsync("ALTER TABLE categories ADD COLUMN budget_amount INTEGER DEFAULT 0;");
    }

    dbInstance = db;
    console.log("✅ Database and Tables ready.");
  } catch (error) {
    console.error("❌ SQL Initialization Error:", error);
    throw error;
  }

  return dbInstance;
};