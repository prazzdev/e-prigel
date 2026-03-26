import React, { useCallback, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { BrutalCard } from '../../components/BrutalCard';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Plus, ArrowRight, Wallet, PieChart as PieIcon, Target, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function Dashboard() {
  const { recentTransactions, refreshData, totalIncome, totalExpense, accounts, budgets } = useFinanceStore();
  const router = useRouter();

  // State untuk Toggle Expand Anggaran
  const [expandBudget, setExpandBudget] = useState(false);

  useFocusEffect(useCallback(() => { refreshData(); }, []));

  const formatCompact = (amount: number) => {
    const value = Math.abs(amount / 100);
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}jt`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`;
    return value.toString();
  };

  // Helper untuk warna progress bar
  const getProgressBarColor = (progress: number) => {
    if (progress >= 0.85) return '#FF4D4D'; // Merah
    if (progress >= 0.5) return '#FFD600';  // Kuning
    return '#5CFF5C'; // Hijau Neon
  };

  // Filter anggaran yang ditampilkan (batas 2 jika tidak expand)
  const visibleBudgets = expandBudget ? budgets : budgets.slice(0, 2);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.brand}>CATAT.KAS v1</Text>
          <View style={styles.badge}><Text style={styles.badgeText}>GATHYA</Text></View>
        </View>

        <Text style={styles.labelTitle}>DOMPET & SALDO</Text>
        <ScrollView horizontal snapToInterval={width - 40} decelerationRate="fast" showsHorizontalScrollIndicator={false} style={styles.accScroll}>
          {accounts.map((acc) => (
            <View key={acc.id} style={{ width: width - 40, marginRight: 15 }}>
              <BrutalCard bgColor={acc.color_hex || '#DBFF00'}>
                <View style={styles.flexRow}>
                  <Text style={styles.label}>{acc.name} BALANCE</Text>
                  <Wallet color="#000" size={18} />
                </View>
                <Text style={styles.balanceText}>Rp {(acc.balance / 100).toLocaleString('id-ID')}</Text>
              </BrutalCard>
            </View>
          ))}
        </ScrollView>

        <View style={styles.statsRow}>
          <View style={{ flex: 1, marginRight: 16 }}>
             <BrutalCard bgColor="#FF90E8" style={{ marginVertical: 0 }}>
                <Text style={styles.miniLabel}>TOTAL KELUAR</Text>
                <Text style={styles.miniAmount}>{formatCompact(totalExpense)}</Text>
             </BrutalCard>
          </View>
          <View style={{ flex: 1 }}>
             <BrutalCard bgColor="#00E1FF" style={{ marginVertical: 0 }}>
                <Text style={styles.miniLabel}>TOTAL MASUK</Text>
                <Text style={styles.miniAmount}>{formatCompact(totalIncome)}</Text>
             </BrutalCard>
          </View>
        </View>

        {/* SECTION BUDGETING DENGAN EXPAND/COLLAPSE */}
        {budgets.length > 0 && (
          <View style={{ marginTop: 25 }}>
            <View style={styles.sectionHeaderBudget}>
              <Text style={styles.labelTitle}>ANGGARAN BULAN INI</Text>
              <Target color="#000" size={16} strokeWidth={3} />
            </View>
            
            {visibleBudgets.map((budget) => (
              <BrutalCard key={budget.id} bgColor="#FFFFFF">
                <View style={styles.budgetInfoRow}>
                  <Text style={styles.budgetName}>{budget.name}</Text>
                  <Text style={styles.budgetValue}>
                    {formatCompact(budget.spent)} / {formatCompact(budget.budget_amount)}
                  </Text>
                </View>
                <View style={styles.progressContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { 
                        width: `${budget.progress * 100}%`, 
                        backgroundColor: getProgressBarColor(budget.progress) 
                      }
                    ]} 
                  />
                </View>
              </BrutalCard>
            ))}

            {/* Tombol Toggle Expand Anggaran */}
            {budgets.length > 2 && (
              <TouchableOpacity 
                style={styles.toggleBudgetBtn} 
                onPress={() => setExpandBudget(!expandBudget)}
              >
                <Text style={styles.toggleBudgetText}>
                  {expandBudget ? 'TAMPILKAN SEDIKIT' : `LIHAT ${budgets.length - 2} ANGGARAN LAINNYA`}
                </Text>
                {expandBudget ? <ChevronUp size={16} color="#000" /> : <ChevronDown size={16} color="#000" />}
              </TouchableOpacity>
            )}
          </View>
        )}

        <TouchableOpacity onPress={() => router.push('/stats')} style={{ marginTop: 15 }}>
          <BrutalCard bgColor="#FFFFFF">
            <View style={styles.flexRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <PieIcon color="#000" size={20} strokeWidth={3} />
                <Text style={styles.miniLabel}>LIHAT ANALISIS GRAFIK</Text>
              </View>
              <ArrowRight color="#000" size={20} strokeWidth={3} />
            </View>
          </BrutalCard>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>RIWAYAT</Text>
          <TouchableOpacity onPress={() => router.push('/transactions')}>
            <ArrowRight color="#000" size={28} strokeWidth={3} />
          </TouchableOpacity>
        </View>
        
        {recentTransactions.map((item) => (
          <BrutalCard key={item.id} bgColor="#FFF">
             <View style={styles.txRow}>
                <View style={styles.txInfo}>
                  <Text style={styles.txNote}>{item.note.toUpperCase()}</Text>
                  <Text style={styles.txDate}>{new Date(item.date).toLocaleDateString('id-ID')}</Text>
                </View>
                <Text style={styles.txAmount}>
                  {item.type === 'expense' ? '-' : '+'} {formatCompact(item.amount)}
                </Text>
             </View>
          </BrutalCard>
        ))}
        <View style={{ height: 220 }} />
      </ScrollView>

      <View style={styles.fabContainer}>
         <View style={styles.fabShadow} />
         <TouchableOpacity activeOpacity={0.9} style={styles.fab} onPress={() => router.push('/(modals)/add-transaction')}>
            <Plus color="#000" size={40} strokeWidth={4} />
         </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { paddingHorizontal: 20 },
  header: { marginTop: 20, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontFamily: 'PJS-ExtraBold', fontSize: 20, color: '#000', letterSpacing: -1 },
  badge: { backgroundColor: '#000', paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: '#FFF', fontFamily: 'PJS-ExtraBold', fontSize: 12 },
  accScroll: { marginBottom: 10 },
  labelTitle: { fontFamily: 'PJS-ExtraBold', fontSize: 12, marginBottom: 8, opacity: 0.5 },
  flexRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontFamily: 'PJS-Bold', fontSize: 10, color: '#000' },
  balanceText: { fontFamily: 'PJS-ExtraBold', fontSize: 32, color: '#000', marginTop: 5 },
  statsRow: { flexDirection: 'row', marginTop: 10 },
  miniLabel: { fontFamily: 'PJS-Bold', fontSize: 10, color: '#000' },
  miniAmount: { fontFamily: 'PJS-ExtraBold', fontSize: 18, color: '#000', marginTop: 4 },
  
  // Budget Styles
  sectionHeaderBudget: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  budgetInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  budgetName: { fontFamily: 'PJS-ExtraBold', fontSize: 14, color: '#000' },
  budgetValue: { fontFamily: 'PJS-Bold', fontSize: 12, color: '#000', opacity: 0.6 },
  progressContainer: { height: 12, backgroundColor: '#EEEEEE', borderWidth: 2, borderColor: '#000' },
  progressBar: { height: '100%', borderWidth: 0 },
  toggleBudgetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, gap: 5 },
  toggleBudgetText: { fontFamily: 'PJS-ExtraBold', fontSize: 11, color: '#000', textDecorationLine: 'underline' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 30, marginBottom: 10 },
  sectionTitle: { fontFamily: 'PJS-ExtraBold', fontSize: 20, color: '#000' },
  txRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  txInfo: { flex: 1 },
  txNote: { fontFamily: 'PJS-ExtraBold', fontSize: 15, color: '#000' },
  txDate: { fontFamily: 'PJS-Bold', fontSize: 11, color: '#000', opacity: 0.4 },
  txAmount: { fontFamily: 'PJS-ExtraBold', fontSize: 18, color: '#000' },
  fabContainer: { position: 'absolute', bottom: 120, right: 20, width: 70, height: 70, zIndex: 999 },
  fabShadow: { position: 'absolute', top: 6, left: 6, width: 70, height: 70, backgroundColor: '#000' },
  fab: { width: 70, height: 70, backgroundColor: '#0057FF', borderWidth: 4, borderColor: '#000', alignItems: 'center', justifyContent: 'center' },
});