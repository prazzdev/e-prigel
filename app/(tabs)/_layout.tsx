import { Tabs } from 'expo-router';
import { LayoutDashboard, History, Settings, PieChart } from 'lucide-react-native';
import { View, StyleSheet, Platform } from 'react-native';

export default function TabLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontFamily: 'PJS-Bold',
            fontSize: 10,
            marginBottom: 8,
          },
          tabBarActiveTintColor: '#0057FF',
          tabBarInactiveTintColor: '#121212',
          tabBarStyle: styles.tabBar,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'BERANDA',
            tabBarIcon: ({ color, focused }) => (
              <LayoutDashboard size={24} color={color} strokeWidth={focused ? 3 : 2} />
            ),
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: 'STATISTIK',
            tabBarIcon: ({ color, focused }) => (
              <PieChart size={24} color={color} strokeWidth={focused ? 3 : 2} />
            ),
          }}
        />
        <Tabs.Screen
          name="transactions"
          options={{
            title: 'RIWAYAT',
            tabBarIcon: ({ color, focused }) => (
              <History size={24} color={color} strokeWidth={focused ? 3 : 2} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'SETELAN',
            tabBarIcon: ({ color, focused }) => (
              <Settings size={24} color={color} strokeWidth={focused ? 3 : 2} />
            ),
          }}
        />
      </Tabs>
      <View style={styles.tabBarShadow} />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 30,
    marginHorizontal: 20, 
    height: 75,
    backgroundColor: '#F4FF4D',
    borderWidth: 4,
    borderColor: '#000000',
    elevation: 0,
    borderRadius: 0,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    zIndex: 10,
    left: 0,
    right: 0,
  },
  tabBarShadow: {
    position: 'absolute',
    bottom: 22,
    marginLeft: 28,
    marginRight: 12,
    left: 0,
    right: 0,
    height: 75,
    backgroundColor: '#000000',
    zIndex: 5,
  },
});