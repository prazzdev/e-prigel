import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';

const schema = z.object({
  amount: z.string().min(1, "Masukkan nominal"),
  type: z.enum(['income', 'expense']),
  category_id: z.string(),
});

// Di dalam komponen:
const onSubmit = async (data) => {
  const db = await getDb();
  const amountInCents = fromRupiah(parseFloat(data.amount));
  
  await db.runAsync(
    "INSERT INTO transactions (id, amount, type, category_id, date, is_synced) VALUES (?, ?, ?, ?, ?, 0)",
    [uuidv4(), amountInCents, data.type, data.category_id, new Date().toISOString()]
  );
  
  // Refresh Zustand Store
  refreshData();
};