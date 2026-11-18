import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Palette } from '@/theme/colors';
import { useStyles, useTheme } from '@/theme/ThemeContext';

interface Props {
  etiqueta: string;
  valor: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}

// Selector numérico con botones − y +.
export function Contador({ etiqueta, valor, min, max, onChange }: Props) {
  const { colors } = useTheme();
  const styles = useStyles(crearEstilos);

  const boton = (icono: 'remove' | 'add', destino: number, deshabilitado: boolean) => (
    <Pressable
      onPress={() => onChange(destino)}
      disabled={deshabilitado}
      style={[styles.boton, deshabilitado && styles.deshabilitado]}
      accessibilityRole="button"
      accessibilityLabel={`${icono === 'add' ? 'Aumentar' : 'Disminuir'} ${etiqueta}`}
      hitSlop={6}
    >
      <Ionicons name={icono} size={20} color={colors.textPrimary} />
    </Pressable>
  );

  return (
    <View style={styles.fila}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <View style={styles.controles}>
        {boton('remove', valor - 1, valor <= min)}
        <Text style={styles.valor} accessibilityLiveRegion="polite">
          {valor}
        </Text>
        {boton('add', valor + 1, valor >= max)}
      </View>
    </View>
  );
}

const crearEstilos = (c: Palette) =>
  StyleSheet.create({
    fila: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    etiqueta: {
      fontSize: 14,
      color: c.textPrimary,
      flex: 1,
    },
    controles: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    boton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: c.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    deshabilitado: {
      opacity: 0.35,
    },
    valor: {
      fontSize: 20,
      fontWeight: '500',
      color: c.textPrimary,
      minWidth: 28,
      textAlign: 'center',
    },
  });
