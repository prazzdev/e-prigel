import { getDb } from '../lib/db';
import { supabase } from '../lib/supabase';

export const syncService = {
  backupData: async () => {
    const db = await getDb();
    
    // Ambil semua data yang belum disinkronkan
    const unsynced: any[] = await db.getAllAsync(
      "SELECT * FROM transactions WHERE is_synced = 0"
    );

    if (unsynced.length === 0) return { status: 'empty', message: 'Semua data sudah di cloud' };

    // Bersihkan objek dari properti 'is_synced' sebelum dikirim ke Supabase
    // Karena Supabase tidak butuh kolom lokal ini
    const dataToUpload = unsynced.map(({ is_synced, ...rest }) => rest);

    const { error } = await supabase
      .from('transactions')
      .upsert(dataToUpload, { onConflict: 'id' });

    if (error) throw error;

    // Jika sukses, tandai di lokal sebagai tersinkron
    await db.runAsync("UPDATE transactions SET is_synced = 1 WHERE is_synced = 0");
    
    return { status: 'success', count: unsynced.length };
  },

  restoreData: async (userId: string) => {
    const db = await getDb();
    
    // Ambil data dari Supabase milik user tertentu
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId); // Pastikan tabel Supabase Anda punya kolom user_id

    if (error) throw error;

    if (data) {
      for (const row of data) {
        await db.runAsync(
          `INSERT OR REPLACE INTO transactions (id, amount, type, category_id, account_id, note, date, is_synced) 
           VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
          [row.id, row.amount, row.type, row.category_id, row.account_id, row.note, row.date]
        );
      }
    }
    return { status: 'success', count: data?.length || 0 };
  }
};