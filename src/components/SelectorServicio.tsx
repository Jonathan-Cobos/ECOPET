import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Palette, ServiceType } from '@/theme/colors';
import { useStyles, useTheme } from '@/theme/ThemeContext';

interface Props {
  valor: ServiceType;
  onChange: (s: ServiceType) => void;
}

const OPCIONES: { servicio: ServiceType; label: string; icono: 'water' | 'flash' }[] = [
  { servicio: 'agua', label: 'Agua', icono: 'water' },
  { servicio: 'luz', label: 'Luz', icono: 'flash' },
];

// Control segmentado Agua / Luz para las pantallas secundarias.
export function SelectorServicio({ valor, onChange }: Props) {
  const { colors } = useTheme();
  const styles = useStyles(crearEstilos);
  return (
    <View style={styles.contenedor} accessibilityRole="tablist">
      {OPCIONES.map(({ servicio, label, icono }) => {
        const activo = servicio === valor;
        const p = colors[servicio];
        return (
          <Pressable
            key={servicio}
            onPress={() => onChange(servicio)}
            style={[styles.opcion, activo && { backgroundColor: p.primary }]}
            accessibilityRole="tab"
            accessibilityState={{ selected: activo }}
          >
            <Ionicons name={icono} size={14} color={activo ? p.dark : colors.textSecondary} />
            <Text style={[styles.texto, activo && { color: p.dark, fontWeight: '600' }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const crearEstilos = (c: Palette) =>
  StyleSheet.create({
    contenedor: {
      flexDirection: 'row',
      backgroundColor: c.background,
      borderRadius: 999,
      padding: 3,
    },
    opcion: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 8,
      borderRadius: 999,
    },
    texto: {
      fontSize: 13,
      color: c.textSecondary,
    },
  });
