import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  bgColor?: string;
  style?: ViewStyle;
  offset?: number; // Ketebalan bayangan samping
}

export const BrutalCard = ({ children, bgColor = '#FFFFFF', style, offset = 8 }: Props) => {
  return (
    <View style={[styles.container, style]}>
      {/* Layer Bayangan (Hitam Solid di Belakang) */}
      <View style={[styles.shadowLayer, { backgroundColor: '#000', borderRadius: 0 }]} />
      
      {/* Layer Konten (Warna di Depan) */}
      <View style={[styles.contentLayer, { backgroundColor: bgColor, borderRadius: 0 }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    position: 'relative',
  },
  shadowLayer: {
    position: 'absolute',
    top: 8, // Geser ke bawah
    left: 8, // Geser ke kanan
    right: -8,
    bottom: -8,
    borderWidth: 3,
    borderColor: '#000',
  },
  contentLayer: {
    borderWidth: 3,
    borderColor: '#000',
    padding: 20,
    zIndex: 1, // Pastikan di depan bayangan
  },
});