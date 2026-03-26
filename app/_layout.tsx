import { Stack } from 'expo-router';
import React, { useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, AppState, AppStateStatus, TouchableOpacity } from 'react-native';
import { useFonts, PlusJakartaSans_400Regular, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFinanceStore } from '../store/useFinanceStore';
import * as LocalAuthentication from 'expo-local-authentication';
import { ShieldCheck, Lock as LockIcon } from 'lucide-react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isSecurityActive, isLocked, setLocked } = useFinanceStore();
  const appState = useRef(AppState.currentState);

  const [fontsLoaded] = useFonts({
    'PJS-Regular': PlusJakartaSans_400Regular,
    'PJS-Bold': PlusJakartaSans_700Bold,
    'PJS-ExtraBold': PlusJakartaSans_800ExtraBold,
  });

  // Logika Lock saat aplikasi masuk ke Background/Inactive
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
        if (isSecurityActive) setLocked(true);
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, [isSecurityActive]);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const handleUnlock = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'VERIFIKASI IDENTITAS',
      disableDeviceFallback: false,
    });
    if (result.success) setLocked(false);
  };

  if (!fontsLoaded) return null;

  // LAYAR PENGUNCI (Jika Keamanan Aktif & Status Terkunci)
  if (isSecurityActive && isLocked) {
    return (
      <View style={styles.lockScreen} onLayout={onLayoutRootView}>
        <View style={styles.lockBox}>
          <View style={styles.iconCircle}>
            <LockIcon color="#000" size={60} strokeWidth={3} />
          </View>
          <Text style={styles.lockTitle}>AKSES TERBATAS</Text>
          <Text style={styles.lockSubtitle}>VERIFIKASI BIOMETRIK DIPERLUKAN</Text>
          
          <TouchableOpacity style={styles.unlockBtn} onPress={handleUnlock} activeOpacity={0.9}>
            <View style={styles.btnShadow} />
            <View style={styles.btnContent}>
              <ShieldCheck color="#FFF" size={24} strokeWidth={3} />
              <Text style={styles.btnText}>BUKA APLIKASI</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="categories" options={{ presentation: 'modal' }} />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="(modals)/add-transaction" options={{ presentation: 'modal' }} />
      </Stack>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  lockScreen: { flex: 1, backgroundColor: '#DBFF00', justifyContent: 'center', alignItems: 'center' },
  lockBox: { alignItems: 'center', width: '100%' },
  iconCircle: { width: 120, height: 120, backgroundColor: '#FFF', borderWidth: 5, borderColor: '#000', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  lockTitle: { fontFamily: 'PJS-ExtraBold', fontSize: 28, color: '#000', letterSpacing: -1 },
  lockSubtitle: { fontFamily: 'PJS-Bold', fontSize: 12, color: '#000', opacity: 0.5, marginTop: 5 },
  unlockBtn: { marginTop: 50, width: 240, height: 65 },
  btnShadow: { position: 'absolute', top: 8, left: 8, right: -8, bottom: -8, backgroundColor: '#000' },
  btnContent: { flex: 1, backgroundColor: '#0057FF', borderWidth: 4, borderColor: '#000', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  btnText: { color: '#FFF', fontFamily: 'PJS-ExtraBold', fontSize: 16 },
});