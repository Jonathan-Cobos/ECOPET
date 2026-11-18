import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

interface Props {
  label: string;
  value: string;
  valueColor?: string;
}

export function MetricCard({ label, value, valueColor }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, valueColor ? { color: valueColor } : null]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  value: {
    fontSize: 22,
    fontWeight: '500',
    color: colors.textPrimary,
    marginTop: 2,
  },
});
