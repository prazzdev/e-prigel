import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { BrutalCard } from '../../components/BrutalCard';
import { useFinanceStore } from '../../store/useFinanceStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Check, ArrowDownCircle, ArrowUpCircle, Tag, Plus, Wallet } from 'lucide-react-native';

export default function AddTransaction() {
  const router = useRouter();
  const { addTransaction, categories, accounts, refreshData, addCategory } = useFinanceStore();
  
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [selectedAcc, setSelectedAcc] = useState<string | null>(null);

  const [newCatName, setNewCatName] = useState('');
  const [isAddingCat, setIsAddingCat] = useState(false);

  const filteredCategories = categories.filter(c => c.type === type);

  useEffect(() => {
    refreshData();
    if (accounts.length > 0) setSelectedAcc(accounts[0].id);
  }, [accounts.length]);

  // Fungsi Format Ribuan
  const formatNumber = (num: string) => {
    const value = num.replace(/\D/g, "");
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleAmountChange = (val: string) => {
    const cleanValue = val.replace(/\D/g, "");
    setAmount(formatNumber(cleanValue));
  };

  const handleSaveNewCategory = async () => {
    if (!newCatName.trim()) {
      setIsAddingCat(false);
      return;
    }
    await addCategory(newCatName, type);
    setNewCatName('');
    setIsAddingCat(false);
  };

  const handleSave = async () => {
    const rawAmount = amount.replace(/\./g, "");
    if (!rawAmount || parseInt(rawAmount) <= 0) return Alert.alert('WADUH!', 'NOMINAL HARUS DIISI!');
    if (!note.trim()) return Alert.alert('KOSONG?', 'KETERANGAN HARUS DIISI!');
    if (!selectedAcc) return Alert.alert('PILIH AKUN!', 'UANGNYA DARI MANA?');

    try {
      await addTransaction({
        amount: parseInt(rawAmount) * 100, 
        type: type,
        note: note.trim(),
        category_id: selectedCat,
        account_id: selectedAcc
      });
      router.back();
    } catch (error) {
      Alert.alert('ERROR', 'GAGAL SIMPAN.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><X color="#000" size={30} strokeWidth={3} /></TouchableOpacity>
        <Text style={styles.headerTitle}>INPUT TRANSAKSI</Text>
        <TouchableOpacity onPress={handleSave}><Check color="#0057FF" size={30} strokeWidth={4} /></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>NOMINAL (RP)</Text>
        <BrutalCard bgColor="#DBFF00">
          <TextInput
            style={styles.amountInput}
            placeholder="0"
            keyboardType="numeric"
            value={amount}
            onChangeText={handleAmountChange}
            autoFocus
          />
        </BrutalCard>

        <Text style={styles.label}>JENIS ARUS KAS</Text>
        <View style={styles.typeRow}>
          <TouchableOpacity onPress={() => { setType('expense'); setSelectedCat(null); }} style={[styles.typeBtn, type === 'expense' && styles.activeExpense]}>
            <ArrowUpCircle color="#000" size={20} strokeWidth={3} /><Text style={styles.typeText}>PENGELUARAN</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setType('income'); setSelectedCat(null); }} style={[styles.typeBtn, type === 'income' && styles.activeIncome]}>
            <ArrowDownCircle color="#000" size={20} strokeWidth={3} /><Text style={styles.typeText}>PEMASUKAN</Text>
          </TouchableOpacity>
        </View>

        {/* PILIHAN DOMPET/AKUN - SEKARANG BISA SCROLL */}
        <Text style={styles.label}>PILIH SUMBER DANA</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.accScroll}>
          {accounts.map((acc) => (
            <TouchableOpacity 
              key={acc.id} 
              onPress={() => setSelectedAcc(acc.id)}
              style={[styles.accBtn, selectedAcc === acc.id && { backgroundColor: acc.color_hex || '#FFF' }]}
            >
              <Wallet size={16} color="#000" />
              <Text style={styles.accText}>{acc.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.catHeader}>
          <Text style={styles.label}>KATEGORI</Text>
          {!isAddingCat && (
            <TouchableOpacity onPress={() => setIsAddingCat(true)} style={styles.addCatMini}>
              <Plus size={16} color="#000" strokeWidth={3} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {isAddingCat && (
            <View style={styles.inlineInputWrapper}>
              <TextInput style={styles.inlineInput} placeholder="NAMA..." value={newCatName} onChangeText={setNewCatName} autoFocus onBlur={handleSaveNewCategory} onSubmitEditing={handleSaveNewCategory}/>
              <TouchableOpacity onPress={handleSaveNewCategory} style={styles.inlineCheck}><Check size={14} color="#000" strokeWidth={4} /></TouchableOpacity>
            </View>
          )}
          {filteredCategories.map((cat) => (
            <TouchableOpacity key={cat.id} onPress={() => setSelectedCat(cat.id)} style={[styles.catBtn, selectedCat === cat.id && styles.activeCat]}>
              <Tag size={14} color="#000" /><Text style={styles.catText}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>KETERANGAN</Text>
        <BrutalCard bgColor="#FFF">
          <TextInput style={styles.noteInput} placeholder="CONTOH: BAYAR INTERNET" value={note} onChangeText={setNote} multiline />
        </BrutalCard>

        <TouchableOpacity style={styles.bigSaveBtn} onPress={handleSave}>
          <Text style={styles.bigSaveText}>SIMPAN DATA SEKARANG!</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 4, borderColor: '#000' },
  headerTitle: { fontFamily: 'PJS-ExtraBold', fontSize: 18 },
  label: { fontFamily: 'PJS-ExtraBold', fontSize: 14, marginBottom: 8, marginTop: 15 },
  amountInput: { fontFamily: 'PJS-ExtraBold', fontSize: 40, textAlign: 'center' },
  typeRow: { flexDirection: 'row', gap: 12 },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 55, borderWidth: 3, borderColor: '#000', backgroundColor: '#FFF' },
  activeExpense: { backgroundColor: '#FF4D4D', transform: [{translateX: 4}, {translateY: 4}] },
  activeIncome: { backgroundColor: '#B4FF4D', transform: [{translateX: 4}, {translateY: 4}] },
  typeText: { fontFamily: 'PJS-ExtraBold', fontSize: 12 },
  
  // Acc Styles Updated to Horizontal Scroll Friendly
  accScroll: { flexDirection: 'row', marginBottom: 5 },
  accBtn: { paddingHorizontal: 20, paddingVertical: 12, marginRight: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 50, borderWidth: 3, borderColor: '#000', backgroundColor: '#FFF' },
  accText: { fontFamily: 'PJS-ExtraBold', fontSize: 12 },

  catHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  addCatMini: { marginTop: 8, padding: 4, borderWidth: 2, borderColor: '#000', backgroundColor: '#DBFF00' },
  catScroll: { flexDirection: 'row', marginBottom: 5 },
  inlineInputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: '#000', backgroundColor: '#FFF', paddingHorizontal: 8, marginRight: 10, height: 45, borderStyle: 'dashed' },
  inlineInput: { fontFamily: 'PJS-Bold', fontSize: 12, width: 80, color: '#000' },
  inlineCheck: { marginLeft: 5, padding: 2, backgroundColor: '#B4FF4D', borderWidth: 1, borderColor: '#000' },
  catBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 15, paddingVertical: 10, borderWidth: 2, borderColor: '#000', marginRight: 10, backgroundColor: '#FFF', height: 45 },
  activeCat: { backgroundColor: '#F4FF4D', transform: [{translateY: 2}] },
  catText: { fontFamily: 'PJS-Bold', fontSize: 12 },
  noteInput: { fontFamily: 'PJS-Bold', fontSize: 16, minHeight: 60 },
  bigSaveBtn: { backgroundColor: '#000', height: 65, marginTop: 30, borderWidth: 3, borderColor: '#000', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 6, height: 6 }, shadowOpacity: 1, shadowRadius: 0 },
  bigSaveText: { fontFamily: 'PJS-ExtraBold', fontSize: 16, color: '#DBFF00' }
});