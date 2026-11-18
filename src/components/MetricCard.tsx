import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Palette } from '@/theme/colors';
import { useStyles } from '@/theme/ThemeContext';

interface Props {
  label: string;
  value: string;
  valueColor?: string;
  /** Texto pequeño bajo el valor. */
  nota?: string;
}

export function MetricCard({ label, value, valueColor, nota }: Props) {
  const styles = useStyles(crearEstilos);
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, valueColor ? { color: valueColor } : null]} numberOfLines={1}>
        {value}
      </Text>
      {nota ? (
        <Text style={styles.nota} numberOfLines={1}>
          {nota}
        </Text>
      ) : null}
    </View>
  );
}

const crearEstilos = (c: Palette) =>
  StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: c.background,
      borderRadius: 8,
      padding: 12,
    },
    label: {
      fontSize: 12,
      color: c.textSecondary,
    },
    value: {
      fontSize: 22,
      fontWeight: '500',
      color: c.textPrimary,
      marginTop: 2,
    },
    nota: {
      fontSize: 10,
      color: c.textSecondary,
      marginTop: 2,
    },
  });
