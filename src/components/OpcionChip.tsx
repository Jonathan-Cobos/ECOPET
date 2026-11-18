import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

interface Props {
  label: string;
  seleccionada: boolean;
  onPress: () => void;
  colorActivo: string;
  colorTextoActivo: string;
}

export function OpcionChip({ label, seleccionada, onPress, colorActivo, colorTextoActivo }: Props) {
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

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: colors.background,
  },
  texto: {
    fontSize: 13,
    color: colors.textPrimary,
  },
});
