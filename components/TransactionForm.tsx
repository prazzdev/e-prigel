import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';
import { getDb, fromRupiah } from '../lib/db';
import { useFinanceStore } from '../store/useFinanceStore';
import { BrutalCard } from './BrutalCard';

// Definisi Schema Validasi
const schema = z.object({
  amount: z.string().min(1, "MASUKKAN NOMINAL"),
  note: z.string().min(1, "MASUKKAN KETERANGAN"),
  type: z.enum(['income', 'expense']),
  category_id: z.string().min(1, "PILIH KATEGORI"),
  account_id: z.string().min(1, "PILIH SUMBER DANA"),
});

type TransactionFormData = z.infer<typeof schema>;

export default function TransactionForm() {
  const { refreshData, categories, accounts } = useFinanceStore();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<TransactionFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: '',
      note: '',
      type: 'expense',
      category_id: '',
      account_id: accounts.length > 0 ? accounts[0].id : '',
    }
  });

  const onSubmit = async (data: TransactionFormData) => {
    try {
      const db = await getDb();
      const amountInCents = fromRupiah(parseFloat(data.amount.replace(/\./g, '')));
      
      // Mengikuti skema tabel transactions di db.ts terbaru
      await db.runAsync(
        "INSERT INTO transactions (id, amount, type, category_id, account_id, note, date) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          uuidv4(), 
          amountInCents, 
          data.type, 
          data.category_id, 
          data.account_id, 
          data.note.toUpperCase(), 
          new Date().toISOString()
        ]
      );
      
      // Sync ulang data ke Zustand
      await refreshData();
      
      Alert.alert("SUKSES", "TRANSAKSI BERHASIL DICATAT!");
      reset();
    } catch (error) {
      console.error(error);
      Alert.alert("ERROR", "GAGAL MENYIMPAN TRANSAKSI.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>NOMINAL</Text>
      <Controller
        control={control}
        name="amount"
        render={({ field: { onChange, value } }) => (
          <BrutalCard bgColor="#FFF">
            <TextInput
              style={styles.input}
              placeholder="0"
              keyboardType="numeric"
              value={value}
              onChangeText={onChange}
            />
          </BrutalCard>
        )}
      />
      {errors.amount && <Text style={styles.errorText}>{errors.amount.message}</Text>}

      <Text style={styles.label}>KETERANGAN</Text>
      <Controller
        control={control}
        name="note"
        render={({ field: { onChange, value } }) => (
          <BrutalCard bgColor="#FFF">
            <TextInput
              style={styles.input}
              placeholder="CONTOH: BELI KOPI"
              value={value}
              onChangeText={onChange}
            />
          </BrutalCard>
        )}
      />

      <TouchableOpacity 
        style={styles.submitBtn} 
        onPress={handleSubmit(onSubmit)}
      >
        <Text style={styles.submitText}>SIMPAN TRANSAKSI</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
  label: { fontFamily: 'PJS-ExtraBold', fontSize: 12, marginBottom: 8, marginTop: 15 },
  input: { fontFamily: 'PJS-Bold', fontSize: 16, padding: 5 },
  errorText: { color: 'red', fontSize: 10, fontFamily: 'PJS-Bold', marginTop: 5 },
  submitBtn: { 
    backgroundColor: '#0057FF', 
    padding: 18, 
    marginTop: 30, 
    borderWidth: 4, 
    borderColor: '#000',
    alignItems: 'center'
  },
  submitText: { color: '#FFF', fontFamily: 'PJS-ExtraBold', fontSize: 14 }
});