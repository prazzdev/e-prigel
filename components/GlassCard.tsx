import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

export const GlassCard = ({ children, style }: { children: React.ReactNode, style?: ViewStyle | ViewStyle[] }) => {
  return (
    <View style={[styles.outerContainer, style]}>
      {/* Gunakan tint "dark" atau "light" dengan intensitas rendah untuk kesan premium */}
      <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
        {children}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    // Garis tepi sangat tipis dan halus
    borderColor: 'rgba(255, 255, 255, 0.1)', 
    backgroundColor: 'rgba(255, 255, 255, 0.03)', 
    marginVertical: 10,
  },
  blurContainer: {
    padding: 24,
    width: '100%',
  },
});