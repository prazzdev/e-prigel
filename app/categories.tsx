import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { BrutalCard } from '../components/BrutalCard';
import { useFinanceStore } from '../store/useFinanceStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Plus, Trash2, Target, ArrowUpCircle, ArrowDownCircle, Check } from 'lucide-react-native';

export default function CategoriesScreen() {
  const router = useRouter();
  const { categories, addCategory, deleteCategory, updateCategoryBudget, refreshData } = useFinanceStore();
  
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [newCatName, setNewCatName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // State untuk Modal Budget
  const [budgetModal, setBudgetModal] = useState({ visible: false, id: '', name: '', value: '' });

  useEffect(() => {
    refreshData();
  }, []);

  const formatNumber = (num: string | number) => {
    const value = num.toString().replace(/\D/g, "");
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleAdd = async () => {
    if (!newCatName.trim()) return setIsAdding(false);
    await addCategory(newCatName, type);
    setNewCatName('');
    setIsAdding(false);
  };

  const openBudgetModal = (id: string, name: string, currentBudget: number) => {
    setBudgetModal({
      visible: true,
      id,
      name,
      value: currentBudget > 0 ? (currentBudget / 100).toString() : ''
    });
  };

  const saveBudget = async () => {
    const rawAmount = budgetModal.value.replace(/\./g, "");
    await updateCategoryBudget(budgetModal.id, parseInt(rawAmount || "0") * 100);
    setBudgetModal({ ...budgetModal, visible: false });
  };

  const filteredCats = categories.filter(c => c.type === type);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X color="#000" size={30} strokeWidth={3} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KELOLA KATEGORI</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.typeRow}>
        <TouchableOpacity 
          onPress={() => setType('expense')} 
          style={[styles.typeBtn, type === 'expense' && { backgroundColor: '#FF4D4D' }]}
        >
          <ArrowUpCircle color="#000" size={20} strokeWidth={3} />
          <Text style={styles.typeText}>PENGELUARAN</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setType('income')} 
          style={[styles.typeBtn, type === 'income' && { backgroundColor: '#B4FF4D' }]}
        >
          <ArrowDownCircle color="#000" size={20} strokeWidth={3} />
          <Text style={styles.typeText}>PEMASUKAN</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        {isAdding ? (
          <BrutalCard bgColor="#FFFFFF">
            <TextInput 
              style={styles.input} 
              placeholder="NAMA KATEGORI BARU..." 
              value={newCatName} 
              onChangeText={setNewCatName}
              autoFocus
              onSubmitEditing={handleAdd}
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
              <Text style={styles.saveBtnText}>TAMBAHKAN</Text>
            </TouchableOpacity>
          </BrutalCard>
        ) : (
          <TouchableOpacity onPress={() => setIsAdding(true)}>
            <BrutalCard bgColor="#FFFFFF" style={{ borderStyle: 'dashed' }}>
              <View style={styles.addPlaceholder}>
                <Plus color="#000" size={24} strokeWidth={3} />
                <Text style={styles.addText}>BUAT KATEGORI BARU</Text>
              </View>
            </BrutalCard>
          </TouchableOpacity>
        )}

        <Text style={styles.label}>DAFTAR KATEGORI {type === 'expense' ? 'PENGELUARAN' : 'PEMASUKAN'}</Text>
        
        {filteredCats.map((cat) => (
          <BrutalCard key={cat.id} bgColor="#FFFFFF">
            <View style={styles.catRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.catName}>{cat.name}</Text>
                {type === 'expense' && (
                  <Text style={styles.catBudget}>
                    Budget: Rp {formatNumber(cat.budget_amount / 100 || 0)}
                  </Text>
                )}
              </View>
              
              <View style={styles.actionIcons}>
                {type === 'expense' && (
                  <TouchableOpacity 
                    style={styles.budgetBtn}
                    onPress={() => openBudgetModal(cat.id, cat.name, cat.budget_amount)}
                  >
                    <Target color="#000" size={20} strokeWidth={3} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => deleteCategory(cat.id)}>
                  <Trash2 color="#FF4D4D" size={20} strokeWidth={3} />
                </TouchableOpacity>
              </View>
            </View>
          </BrutalCard>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* MODAL INPUT BUDGET NEOBRUTAL */}
      <Modal visible={budgetModal.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <BrutalCard bgColor="#FFF" style={{ width: '85%' }}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>SET BUDGET: {budgetModal.name}</Text>
              <TouchableOpacity onPress={() => setBudgetModal({ ...budgetModal, visible: false })}>
                <X color="#000" size={24} strokeWidth={3} />
              </TouchableOpacity>
            </View>
            
            <TextInput 
              style={styles.modalInput}
              keyboardType="numeric"
              placeholder="0"
              value={formatNumber(budgetModal.value)}
              onChangeText={(val) => setBudgetModal({ ...budgetModal, value: val.replace(/\./g, '') })}
              autoFocus
            />
            
            <TouchableOpacity style={styles.modalSaveBtn} onPress={saveBudget}>
              <Check color="#DBFF00" size={24} strokeWidth={4} />
              <Text style={styles.modalSaveText}>SIMPAN ANGGARAN</Text>
            </TouchableOpacity>
          </BrutalCard>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 4, borderColor: '#000' },
  headerTitle: { fontFamily: 'PJS-ExtraBold', fontSize: 18 },
  typeRow: { flexDirection: 'row', padding: 20, gap: 10 },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 50, borderWidth: 3, borderColor: '#000', backgroundColor: '#FFF' },
  typeText: { fontFamily: 'PJS-ExtraBold', fontSize: 12 },
  input: { fontFamily: 'PJS-ExtraBold', fontSize: 16, borderBottomWidth: 3, borderColor: '#000', marginBottom: 15, padding: 5 },
  saveBtn: { backgroundColor: '#000', padding: 12, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontFamily: 'PJS-ExtraBold' },
  addPlaceholder: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 5 },
  addText: { fontFamily: 'PJS-ExtraBold', fontSize: 14 },
  label: { fontFamily: 'PJS-ExtraBold', fontSize: 13, color: '#000', marginTop: 25, marginBottom: 10, opacity: 0.6 },
  catRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  catName: { fontFamily: 'PJS-ExtraBold', fontSize: 16 },
  catBudget: { fontFamily: 'PJS-Bold', fontSize: 12, opacity: 0.5, marginTop: 2 },
  actionIcons: { flexDirection: 'row', gap: 15, alignItems: 'center' },
  budgetBtn: { padding: 8, backgroundColor: '#DBFF00', borderWidth: 2, borderColor: '#000' },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontFamily: 'PJS-ExtraBold', fontSize: 14 },
  modalInput: { fontFamily: 'PJS-ExtraBold', fontSize: 32, borderBottomWidth: 4, borderColor: '#000', marginBottom: 25, textAlign: 'center', paddingBottom: 10 },
  modalSaveBtn: { backgroundColor: '#000', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 15 },
  modalSaveText: { color: '#DBFF00', fontFamily: 'PJS-ExtraBold', fontSize: 14 }
});