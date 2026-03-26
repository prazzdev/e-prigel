import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, StyleSheet, TextInput, Switch } from 'react-native';
import { supabase } from '../../lib/supabase';
import { syncService } from '../../services/syncService';
import { BrutalCard } from '../../components/BrutalCard';
import { useFinanceStore } from '../../store/useFinanceStore';
import { CloudUpload, CloudDownload, LogOut, User, Trash2, Info, Wallet, Plus, X, ChevronDown, ChevronUp, Tag, ShieldCheck, FileSpreadsheet } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function SettingsScreen() {
  const [session, setSession] = useState<any>(null);
  const { resetDatabase, accounts, addAccount, deleteAccount, refreshData, isSecurityActive, setSecurity, exportTransactions } = useFinanceStore();
  const router = useRouter();

  const [isAddingAcc, setIsAddingAcc] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#DBFF00');
  const neobrutalColors = ['#FF90E8', '#00E1FF', '#DBFF00', '#FF5C00', '#5CFF5C', '#0057FF'];
  const [showAllAccounts, setShowAllAccounts] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    refreshData();
  }, []);

  const handleExport = async () => {
    try {
      const data = await exportTransactions();
      if (data.length === 0) return Alert.alert("KOSONG", "TIDAK ADA TRANSAKSI UNTUK DIEKSPOR.");

      let csvContent = "Tanggal,Keterangan,Tipe,Kategori,Dompet,Nominal\n";
      
      data.forEach((tx) => {
        const row = [
          new Date(tx.date).toLocaleDateString('id-ID'),
          tx.note.replace(/,/g, ' '), 
          tx.type.toUpperCase(),
          tx.category || '-',
          tx.account || '-',
          tx.amount / 100
        ];
        csvContent += row.join(",") + "\n";
      });

      const fileName = `Laporan_Keuangan_${new Date().getTime()}.csv`;
      // Fix: Gunakan fallback jika documentDirectory undefined (jarang terjadi di mobile)
      const baseDir = (FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory || "";
      const fileUri = baseDir + fileName;

      // Fix: Gunakan string literal untuk EncodingType agar lebih aman dari error type
      await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: 'utf8' });
      await Sharing.shareAsync(fileUri);
    } catch (e) {
      Alert.alert("ERROR", "GAGAL MEMBUAT LAPORAN.");
    }
  };

  const toggleSecurity = async () => {
    if (!isSecurityActive) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) return Alert.alert("ERROR", "PERANGKAT TIDAK MENDUKUNG BIOMETRIK");
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) return Alert.alert("ERROR", "SILAKAN SETEL FINGERPRINT/PIN DI PENGATURAN HP");
      const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'VERIFIKASI KEAMANAN' });
      if (result.success) setSecurity(true);
    } else {
      setSecurity(false);
    }
  };

  const handleBackup = async () => {
    if (!session) return router.push('/auth/login');
    try {
      await syncService.backupData();
      Alert.alert("✅ SUKSES", "BACKUP BERHASIL.");
    } catch (e: any) { Alert.alert("❌ GAGAL", e.message); }
  };

  const handleRestore = async () => {
    if (!session) return router.push('/auth/login');
    Alert.alert("PULIHKAN DATA", "LANJUTKAN?", [
      { text: "BATAL", style: "cancel" },
      { text: "LANJUT", onPress: async () => {
          await syncService.restoreData(session.user.id);
          Alert.alert("BERHASIL", "DATA DIPULIHKAN.");
      }}
    ]);
  };

  const handleReset = () => {
    Alert.alert("MEMBERSIHKAN DATA", "YAKIN?", [
      { text: "BATAL", style: "cancel" },
      { text: "YA", style: "destructive", onPress: () => resetDatabase() }
    ]);
  };

  const onAddAccount = async () => {
    if (!newAccName.trim()) return setIsAddingAcc(false);
    await addAccount(newAccName, selectedColor);
    setNewAccName('');
    setIsAddingAcc(false);
  };

  const visibleAccounts = showAllAccounts ? accounts : accounts.slice(0, 1);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}><Text style={styles.brand}>SETELAN.PRIBADI</Text></View>

        <BrutalCard bgColor="#DBFF00">
          <View style={styles.profileRow}>
            <View style={styles.avatarBox}><User color="#000" size={32} strokeWidth={3} /></View>
            <View>
              <Text style={styles.profileName}>PENGGUNA AKTIF</Text>
              <Text style={styles.profileEmail}>{session ? session.user.email : 'DATA TERSIMPAN SECARA LOKAL'}</Text>
            </View>
          </View>
        </BrutalCard>

        <Text style={styles.label}>PENGELOLAAN DOMPET</Text>
        {visibleAccounts.map((acc) => (
          <BrutalCard key={acc.id} bgColor={acc.color_hex}>
            <View style={styles.menuItem}>
              <Wallet color="#000" size={24} strokeWidth={3} />
              <Text style={{ fontFamily: 'PJS-ExtraBold', flex: 1, marginLeft: 15 }}>{acc.name}</Text>
              <TouchableOpacity onPress={() => deleteAccount(acc.id)}><X color="#000" size={20} strokeWidth={3} /></TouchableOpacity>
            </View>
          </BrutalCard>
        ))}

        {accounts.length > 1 && (
          <TouchableOpacity style={styles.toggleBtn} onPress={() => setShowAllAccounts(!showAllAccounts)}>
            <Text style={styles.toggleText}>{showAllAccounts ? 'LIHAT LEBIH SEDIKIT' : `LIHAT LAINNYA (${accounts.length - 1})`}</Text>
            {showAllAccounts ? <ChevronUp size={16} color="#000" /> : <ChevronDown size={16} color="#000" />}
          </TouchableOpacity>
        )}

        <View style={{ marginTop: 10 }}>
          {isAddingAcc ? (
            <BrutalCard bgColor="#FFFFFF">
              <TextInput style={styles.accInput} placeholder="NAMA DOMPET..." value={newAccName} onChangeText={setNewAccName} autoFocus />
              <View style={styles.colorRow}>
                {neobrutalColors.map(c => (
                  <TouchableOpacity key={c} onPress={() => setSelectedColor(c)} style={[styles.colorBox, { backgroundColor: c, borderWidth: selectedColor === c ? 4 : 2 }]} />
                ))}
              </View>
              <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.saveAccBtn, { backgroundColor: '#FF4D4D', flex: 0.4 }]} onPress={() => setIsAddingAcc(false)}><Text style={styles.saveAccText}>BATAL</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.saveAccBtn, { flex: 1 }]} onPress={onAddAccount}><Text style={styles.saveAccText}>SIMPAN DOMPET</Text></TouchableOpacity>
              </View>
            </BrutalCard>
          ) : (
            <TouchableOpacity onPress={() => setIsAddingAcc(true)}>
              <BrutalCard bgColor="#FFFFFF" style={{ borderStyle: 'dashed' }}>
                <View style={styles.menuItem}><Plus color="#000" size={24} strokeWidth={3} /><Text style={styles.menuText}>TAMBAH DOMPET BARU</Text></View>
              </BrutalCard>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.label}>KONFIGURASI KAS</Text>
        <TouchableOpacity onPress={() => router.push('/categories')}>
          <BrutalCard bgColor="#0057FF">
            <View style={styles.menuItem}><Tag color="#FFF" size={24} strokeWidth={3} /><Text style={[styles.menuText, { color: '#FFF' }]}>KELOLA KATEGORI & ANGGARAN</Text></View>
          </BrutalCard>
        </TouchableOpacity>

        <BrutalCard bgColor="#FFFFFF">
          <View style={styles.menuItem}>
            <ShieldCheck color="#000" size={24} strokeWidth={3} />
            <Text style={[styles.menuText, { flex: 1 }]}>KEAMANAN BIOMETRIK</Text>
            <Switch 
              value={isSecurityActive} 
              onValueChange={toggleSecurity}
              trackColor={{ false: "#767577", true: "#B4FF4D" }}
              thumbColor={isSecurityActive ? "#000" : "#f4f3f4"}
            />
          </View>
        </BrutalCard>

        <Text style={styles.label}>LAPORAN & CADANGAN</Text>
        <TouchableOpacity onPress={handleExport}>
          <BrutalCard bgColor="#FF90E8">
            <View style={styles.menuItem}>
              <FileSpreadsheet color="#000" size={24} strokeWidth={3} />
              <Text style={styles.menuText}>EKSPOR TRANSAKSI (.CSV)</Text>
            </View>
          </BrutalCard>
        </TouchableOpacity>

        {session && (
          <View style={{ marginTop: 10 }}>
            <TouchableOpacity onPress={handleBackup}><BrutalCard bgColor="#FFFFFF"><View style={styles.menuItem}><CloudUpload color="#000" size={24} strokeWidth={3} /><Text style={styles.menuText}>CADANGKAN DATA (BACKUP)</Text></View></BrutalCard></TouchableOpacity>
            <TouchableOpacity onPress={handleRestore}><BrutalCard bgColor="#FFFFFF"><View style={styles.menuItem}><CloudDownload color="#000" size={24} strokeWidth={3} /><Text style={styles.menuText}>AMBIL CADANGAN (RESTORE)</Text></View></BrutalCard></TouchableOpacity>
          </View>
        )}

        <Text style={styles.label}>PENGELOLAAN DATABASE</Text>
        <TouchableOpacity onPress={handleReset}><BrutalCard bgColor="#FF4D4D"><View style={styles.menuItem}><Trash2 color="#000" size={24} strokeWidth={3} /><Text style={styles.menuText}>KOSONGKAN SELURUH DATA</Text></View></BrutalCard></TouchableOpacity>

        {!session ? (
          <TouchableOpacity onPress={() => router.push('/auth/login')} style={{ marginTop: 10 }}><BrutalCard bgColor="#00E1FF"><View style={styles.menuItem}><LogOut color="#000" size={24} strokeWidth={3} /><Text style={styles.menuText}>MASUK UNTUK SINKRONISASI</Text></View></BrutalCard></TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => supabase.auth.signOut().then(() => setSession(null))} style={{ marginTop: 10 }}><BrutalCard bgColor="#FFFFFF"><View style={styles.menuItem}><LogOut color="#FF4D4D" size={24} strokeWidth={3} /><Text style={[styles.menuText, { color: '#FF4D4D' }]}>KELUAR AKUN</Text></View></BrutalCard></TouchableOpacity>
        )}

        <Text style={styles.label}>INFORMASI APLIKASI</Text>
        <BrutalCard bgColor="#FFFFFF"><View style={styles.menuItem}><Info color="#000" size={24} strokeWidth={3} /><Text style={styles.menuText}>CATAT.KAS v1.0.0 (BETA)</Text></View></BrutalCard>
        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { paddingHorizontal: 20 },
  header: { marginTop: 20, marginBottom: 20 },
  brand: { fontFamily: 'PJS-ExtraBold', fontSize: 24, color: '#000', letterSpacing: -1 },
  label: { fontFamily: 'PJS-ExtraBold', fontSize: 13, color: '#000', marginTop: 25, marginBottom: 10, opacity: 0.6 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  avatarBox: { width: 60, height: 60, backgroundColor: '#FFF', borderWidth: 3, borderColor: '#000', alignItems: 'center', justifyContent: 'center' },
  profileName: { fontFamily: 'PJS-ExtraBold', fontSize: 18, color: '#000' },
  profileEmail: { fontFamily: 'PJS-Bold', fontSize: 11, color: '#000', opacity: 0.6 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 15, paddingVertical: 5 },
  menuText: { fontFamily: 'PJS-ExtraBold', fontSize: 14, color: '#000' },
  toggleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, gap: 5 },
  toggleText: { fontFamily: 'PJS-ExtraBold', fontSize: 12, color: '#000', textDecorationLine: 'underline' },
  accInput: { fontFamily: 'PJS-ExtraBold', fontSize: 16, borderBottomWidth: 3, borderColor: '#000', marginBottom: 15, padding: 5 },
  colorRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  colorBox: { width: 35, height: 35, borderColor: '#000' },
  actionRow: { flexDirection: 'row', gap: 10 },
  saveAccBtn: { backgroundColor: '#000', padding: 15, alignItems: 'center' },
  saveAccText: { color: '#FFF', fontFamily: 'PJS-ExtraBold' }
});