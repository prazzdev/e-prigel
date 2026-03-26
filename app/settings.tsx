import { backupToCloud } from '../services/syncService';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';
import { GlassCard } from '@/components/GlassCard';
import { Text, TouchableOpacity, View } from 'react-native';

export default function Settings() {
  const router = useRouter();

  const handleBackup = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/auth/login');
      return;
    }

    try {
      await backupToCloud();
      alert("Backup Berhasil!");
    } catch (err) {
      alert("Gagal Backup: " + err.message);
    }
  };

  return (
    <View className="p-5 flex-1 bg-slate-50">
      <GlassCard>
        <TouchableOpacity onPress={handleBackup} className="bg-blue-600 p-4 rounded-2xl">
          <Text className="text-white text-center font-bold">Backup ke Cloud</Text>
        </TouchableOpacity>
      </GlassCard>
    </View>
  );
}