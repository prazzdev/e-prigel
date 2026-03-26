import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { BrutalCard } from '../../components/BrutalCard';
import { Mail, Lock, ArrowLeft, Zap, ShieldCheck } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    if (!email || !password) {
      return Alert.alert("WADUH!", "EMAIL & PASSWORD WAJIB DIISI!");
    }
    
    setLoading(true);
    try {
      if (isRegister) {
        // PROSES DAFTAR (SIGN UP)
        const { error, data } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        // Supabase biasanya butuh verifikasi email jika diaktifkan di dashboard
        Alert.alert("BERHASIL!", "AKUN DIBUAT. SILAKAN CEK EMAIL UNTUK VERIFIKASI!");
        setIsRegister(false); // Otomatis pindah ke mode login
        setPassword(''); // Reset password demi keamanan
      } else {
        // PROSES MASUK (SIGN IN)
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Jika sukses, lempar ke Dashboard
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      Alert.alert("GAGAL!", error.message.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Tombol Kembali */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color="#000" size={32} strokeWidth={3} />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <View style={styles.badge}>
            <Zap color="#000" size={14} fill="#000" />
            <Text style={styles.badgeText}>SINKRONISASI CLOUD</Text>
          </View>
          <Text style={styles.title}>
            {isRegister ? 'BUAT\nAKUN BARU' : 'SELAMAT\nDATANG'}
          </Text>
          <Text style={styles.subtitle}>
            {isRegister 
              ? 'Mulai amankan data keuangan di server cloud kami.' 
              : 'Masuk untuk sinkronisasi seluruh transaksi.'}
          </Text>
        </View>

        <View style={styles.form}>
          {/* Input Email */}
          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <BrutalCard bgColor="#FFFFFF" style={styles.inputCard}>
            <View style={styles.inputRow}>
              <Mail color="#000" size={20} strokeWidth={3} />
              <TextInput
                placeholder="email@sekolah.com"
                placeholderTextColor="#999"
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </BrutalCard>

          {/* Input Password */}
          <Text style={styles.label}>PASSWORD</Text>
          <BrutalCard bgColor="#FFFFFF" style={styles.inputCard}>
            <View style={styles.inputRow}>
              <Lock color="#000" size={20} strokeWidth={3} />
              <TextInput
                placeholder="******"
                placeholderTextColor="#999"
                secureTextEntry
                style={styles.input}
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </BrutalCard>

          {/* Tombol Utama */}
          <TouchableOpacity 
            onPress={handleAuth}
            disabled={loading}
            style={styles.mainBtn}
            activeOpacity={0.9}
          >
            <View style={styles.mainBtnShadow} />
            <View style={[styles.mainBtnContent, { backgroundColor: isRegister ? '#B4FF4D' : '#0057FF' }]}>
              {loading ? (
                <ActivityIndicator color={isRegister ? "#000" : "#FFF"} />
              ) : (
                <>
                  <Text style={[styles.mainBtnText, { color: isRegister ? '#000' : '#FFF' }]}>
                    {isRegister ? 'DAFTAR SEKARANG' : 'MASUK KE SISTEM'}
                  </Text>
                  <ShieldCheck color={isRegister ? '#000' : '#FFF'} size={24} strokeWidth={3} />
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Toggle Login/Register */}
        <TouchableOpacity onPress={() => setIsRegister(!isRegister)} style={styles.switchBtn}>
          <Text style={styles.switchText}>
            {isRegister ? 'SUDAH PUNYA AKUN? LOGIN' : 'BELUM PUNYA AKUN? DAFTAR GRATIS'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { padding: 25 },
  backBtn: { width: 50, height: 50, justifyContent: 'center', marginBottom: 10 },
  headerTextContainer: { marginTop: 10, marginBottom: 30 },
  badge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#DBFF00', 
    alignSelf: 'flex-start', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderWidth: 3, 
    borderColor: '#000', 
    gap: 6, 
    marginBottom: 15 
  },
  badgeText: { fontFamily: 'PJS-ExtraBold', fontSize: 10, color: '#000' },
  title: { fontFamily: 'PJS-ExtraBold', fontSize: 42, color: '#000', lineHeight: 45, letterSpacing: -2 },
  subtitle: { fontFamily: 'PJS-Bold', fontSize: 14, color: '#000', opacity: 0.6, marginTop: 10 },
  form: { marginTop: 10 },
  label: { fontFamily: 'PJS-ExtraBold', fontSize: 12, marginBottom: 8, marginTop: 15 },
  inputCard: { marginVertical: 0, paddingVertical: 5 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  input: { flex: 1, fontFamily: 'PJS-Bold', fontSize: 16, color: '#000' },
  mainBtn: { marginTop: 40, height: 65 },
  mainBtnShadow: { 
    position: 'absolute', 
    top: 6, 
    left: 6, 
    right: -6, 
    bottom: -6, 
    backgroundColor: '#000' 
  },
  mainBtnContent: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 12, 
    borderWidth: 4, 
    borderColor: '#000' 
  },
  mainBtnText: { fontFamily: 'PJS-ExtraBold', fontSize: 16 },
  switchBtn: { marginTop: 40, alignItems: 'center' },
  switchText: { fontFamily: 'PJS-ExtraBold', fontSize: 12, color: '#000', textDecorationLine: 'underline' }
});