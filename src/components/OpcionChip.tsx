import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import type { Palette } from '@/theme/colors';
import { useStyles } from '@/theme/ThemeContext';

interface Props {
  label: string;
  seleccionada: boolean;
  onPress: () => void;
  colorActivo: string;
  colorTextoActivo: string;
}

export function OpcionChip({ label, seleccionada, onPress, colorActivo, colorTextoActivo }: Props) {
  const styles = useStyles(crearEstilos);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: seleccionada }}
      style={[styles.chip, seleccionada && { backgroundColor: colorActivo }]}
    >
      <Text style={[styles.texto, seleccionada && { color: colorTextoActivo, fontWeight: '500' }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const crearEstilos = (c: Palette) =>
  StyleSheet.create({
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 999,
      backgroundColor: c.background,
    },
    texto: {
      fontSize: 13,
      color: c.textPrimary,
    },
  });
