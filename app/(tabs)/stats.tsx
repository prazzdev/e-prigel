import React, { useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { BrutalCard } from '../../components/BrutalCard';
import { useFinanceStore } from '../../store/useFinanceStore';
import { PieChart as PieIcon, BarChart3, Info } from 'lucide-react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart, BarChart } from "react-native-gifted-charts";

export default function StatsScreen() {
  const { refreshData, pieData, barData } = useFinanceStore();

  useFocusEffect(useCallback(() => { refreshData(); }, []));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.brand}>ANALISIS.KAS</Text>
        </View>

        {/* GRAFIK MINGGUAN */}
        <BrutalCard bgColor="#FFFFFF">
          <View style={styles.flexRow}>
            <Text style={styles.label}>TREN PENGELUARAN 7 HARI</Text>
            <BarChart3 color="#000" size={18} strokeWidth={3} />
          </View>
          <View style={{ marginTop: 20, alignItems: 'center' }}>
            <BarChart
              data={barData}
              barWidth={22}
              spacing={15}
              roundedTop
              noOfSections={3}
              barBorderWidth={3}
              barBorderColor="#000"
              xAxisThickness={3}
              yAxisThickness={0}
              xAxisColor={'#000'}
              yAxisTextStyle={{ color: '#000', fontFamily: 'PJS-Bold', fontSize: 10 }}
              xAxisLabelTextStyle={{ color: '#000', fontFamily: 'PJS-Bold', fontSize: 10 }}
              hideRules
            />
          </View>
        </BrutalCard>

        {/* RINGKASAN KATEGORI */}
        <BrutalCard bgColor="#FFFFFF">
          <View style={styles.flexRow}>
            <Text style={styles.label}>DISTRIBUSI KATEGORI</Text>
            <PieIcon color="#000" size={18} strokeWidth={3} />
          </View>
          <View style={styles.chartWrapper}>
            <PieChart
              data={pieData.length > 0 ? pieData : [{ value: 1, color: '#EEEEEE' }]}
              donut radius={75} innerRadius={55} innerCircleColor={'#FFFFFF'}
              centerLabelComponent={() => <Text style={styles.chartCenterText}>{new Date().getFullYear()}</Text>}
            />
            <View style={styles.legendContainer}>
              {pieData.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendBox, { backgroundColor: item.color }]} />
                  <Text style={styles.legendLabel}>{item.text}</Text>
                </View>
              ))}
            </View>
          </View>
        </BrutalCard>

        <BrutalCard bgColor="#00E1FF">
          <View style={styles.flexRow}>
            <Text style={styles.label}>INFO</Text>
            <Info color="#000" size={18} />
          </View>
          <Text style={styles.infoText}>Data di atas berdasarkan pengeluaran riil yang tercatat di database lokal Anda.</Text>
        </BrutalCard>

        <View style={{ height: 150 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { paddingHorizontal: 20 },
  header: { marginTop: 20, marginBottom: 20 },
  brand: { fontFamily: 'PJS-ExtraBold', fontSize: 24, color: '#000', letterSpacing: -1 },
  flexRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontFamily: 'PJS-Bold', fontSize: 12, color: '#000' },
  chartWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginTop: 15 },
  chartCenterText: { fontFamily: 'PJS-ExtraBold', fontSize: 14, color: '#000' },
  legendContainer: { gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendBox: { width: 12, height: 12, borderWidth: 2, borderColor: '#000' },
  legendLabel: { fontFamily: 'PJS-Bold', fontSize: 10, color: '#000' },
  infoText: { fontFamily: 'PJS-Bold', fontSize: 12, marginTop: 10, lineHeight: 18 }
});