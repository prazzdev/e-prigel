import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { BrutalCard } from '../../components/BrutalCard';
import { useFinanceStore } from '../../store/useFinanceStore';
import { ArrowDownLeft, ArrowUpRight, Search, Calendar } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TransactionsScreen() {
  const { recentTransactions, refreshData, deleteTransaction } = useFinanceStore();
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  
  // State baru untuk Pencarian dan Waktu
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'month'>('all');

  useEffect(() => {
    refreshData();
  }, []);

  const handleDelete = (id: string, note: string) => {
    Alert.alert(
      'HAPUS DATA',
      `YAKIN INGIN MENGHAPUS "${note.toUpperCase()}"?`,
      [
        { text: 'BATAL', style: 'cancel' },
        { 
          text: 'HAPUS', 
          onPress: () => deleteTransaction(id),
          style: 'destructive' 
        },
      ]
    );
  };

  // Fungsi Helper untuk format nominal ke rb atau jt
  const formatCompact = (amount: number) => {
    const value = Math.abs(amount / 100);
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}jt`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`;
    return value.toString();
  };

  // Logika Filtering Berlapis
  const filteredData = recentTransactions.filter(item => {
    // 1. Filter Tipe (Masuk/Keluar)
    const matchType = filter === 'all' || item.type === filter;
    
    // 2. Filter Pencarian (Teks)
    const matchSearch = item.note.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 3. Filter Waktu (Bulan ini saja)
    let matchTime = true;
    if (timeFilter === 'month') {
      const txDate = new Date(item.date);
      const now = new Date();
      matchTime = txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    }

    return matchType && matchSearch && matchTime;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>LOG.AKTIVITAS</Text>
      </View>

      {/* INPUT PENCARIAN NEOBRUTAL */}
      <View style={styles.searchContainer}>
        <BrutalCard bgColor="#FFFFFF" style={{ marginVertical: 0 }}>
          <View style={styles.searchRow}>
            <Search color="#000" size={20} strokeWidth={3} />
            <TextInput 
              placeholder="CARI TRANSAKSI..."
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </BrutalCard>
      </View>

      {/* FILTER BUTTONS */}
      <View style={styles.filterRow}>
        <TouchableOpacity 
          onPress={() => setFilter('all')}
          style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]}
        >
          <Text style={styles.filterText}>SEMUA</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => setFilter('income')}
          style={[styles.filterBtn, { backgroundColor: '#B4FF4D' }, filter === 'income' && styles.filterBtnActive]}
        >
          <Text style={styles.filterText}>MASUK</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setFilter('expense')}
          style={[styles.filterBtn, { backgroundColor: '#FF4D4D' }, filter === 'expense' && styles.filterBtnActive]}
        >
          <Text style={styles.filterText}>KELUAR</Text>
        </TouchableOpacity>

        {/* Tombol Filter Waktu (Bulan Ini) */}
        <TouchableOpacity 
          onPress={() => setTimeFilter(timeFilter === 'all' ? 'month' : 'all')}
          style={[styles.filterBtn, timeFilter === 'month' && { backgroundColor: '#DBFF00' }, timeFilter === 'month' && styles.filterBtnActive]}
        >
          <Calendar color="#000" size={16} strokeWidth={3} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {filteredData.length === 0 ? (
          <BrutalCard bgColor="#FFF">
            <Text style={styles.emptyText}>DATA TIDAK DITEMUKAN.</Text>
          </BrutalCard>
        ) : (
          filteredData.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              onLongPress={() => handleDelete(item.id, item.note)}
              activeOpacity={0.9}
            >
              <BrutalCard bgColor="#FFFFFF">
                <View style={styles.txRow}>
                  <View style={[styles.iconBox, { backgroundColor: item.type === 'expense' ? '#FF4D4D' : '#B4FF4D' }]}>
                    {item.type === 'expense' ? <ArrowUpRight color="#000" size={20} strokeWidth={3} /> : <ArrowDownLeft color="#000" size={20} strokeWidth={3} />}
                  </View>
                  
                  <View style={styles.txInfo}>
                    <Text style={styles.txNote}>{item.note.toUpperCase()}</Text>
                    <Text style={styles.txDate}>
                      {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </Text>
                  </View>

                  <View style={styles.txAmountContainer}>
                    <Text style={styles.txAmount}>
                      {item.type === 'expense' ? '-' : '+'} {formatCompact(item.amount)}
                    </Text>
                  </View>
                </View>
              </BrutalCard>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 150 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { 
    paddingHorizontal: 20, 
    marginTop: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 10
  },
  brand: { fontFamily: 'PJS-ExtraBold', fontSize: 24, color: '#000', letterSpacing: -1 },
  scroll: { paddingHorizontal: 20 },
  
  // Search Styles
  searchContainer: { paddingHorizontal: 20, marginBottom: 15 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 40 },
  searchInput: { flex: 1, fontFamily: 'PJS-Bold', fontSize: 14, color: '#000' },

  filterRow: { 
    flexDirection: 'row', 
    paddingHorizontal: 20, 
    marginBottom: 20,
    gap: 8
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#000',
    backgroundColor: '#FFF',
  },
  filterBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    transform: [{ translateX: -2 }, { translateY: -2 }]
  },
  filterText: { fontFamily: 'PJS-ExtraBold', fontSize: 10, color: '#000' },

  txRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 45, height: 45, borderWidth: 3, borderColor: '#000', alignItems: 'center', justifyContent: 'center' },
  txInfo: { flex: 1, marginLeft: 15 },
  txNote: { fontFamily: 'PJS-ExtraBold', fontSize: 16, color: '#000' },
  txDate: { fontFamily: 'PJS-Bold', fontSize: 11, color: '#000', opacity: 0.5, marginTop: 2 },
  txAmountContainer: { alignItems: 'flex-end' },
  txAmount: { fontFamily: 'PJS-ExtraBold', fontSize: 18, color: '#000' },
  emptyText: { fontFamily: 'PJS-ExtraBold', textAlign: 'center', fontSize: 14 },
});