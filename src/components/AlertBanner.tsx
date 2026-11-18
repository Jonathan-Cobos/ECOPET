import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Palette } from '@/theme/colors';
import { useStyles, useTheme } from '@/theme/ThemeContext';

interface Props {
  tipo: 'estandar' | 'fuga';
  titulo: string;
  mensaje: string;
  onPress?: () => void;
}

export function AlertBanner({ tipo, titulo, mensaje, onPress }: Props) {
  const { colors } = useTheme();
  const styles = useStyles(crearEstilos);
  const esFuga = tipo === 'fuga';
  const tinta = esFuga ? colors.danger : colors.warning;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[styles.banner, { backgroundColor: esFuga ? colors.dangerBg : colors.warningBg }]}
      accessibilityRole={onPress ? 'button' : 'alert'}
    >
      <Ionicons
        name={esFuga ? 'alert-circle-outline' : 'warning-outline'}
        size={20}
        color={tinta}
      />
      <View style={styles.textos}>
        <Text style={[styles.titulo, { color: tinta }]}>{titulo}</Text>
        <Text style={styles.mensaje}>{mensaje}</Text>
      </View>
      {onPress && <Ionicons name="chevron-forward" size={16} color={tinta} />}
    </Pressable>
  );
}

const crearEstilos = (c: Palette) =>
  StyleSheet.create({
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 12,
    },
    textos: {
      flex: 1,
    },
    titulo: {
      fontSize: 12,
      fontWeight: '500',
    },
    mensaje: {
      fontSize: 11,
      color: c.textSecondary,
      marginTop: 2,
    },
  });
