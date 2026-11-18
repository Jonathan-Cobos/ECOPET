import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { Palette, ServiceType } from '@/theme/colors';
import { useStyles, useTheme } from '@/theme/ThemeContext';

interface Props {
  servicioActivo: ServiceType;
  onChange: (s: ServiceType) => void;
}

const ICONOS: Record<ServiceType, string> = {
  agua: 'M12 3 C12 3 5.5 11 5.5 15.5 C5.5 19.1 8.4 21.5 12 21.5 C15.6 21.5 18.5 19.1 18.5 15.5 C18.5 11 12 3 12 3 Z',
  luz: 'M13 3 L5 13.5 H11 L10 21 L19 10 H13 Z',
};

const ETIQUETAS: Record<ServiceType, string> = { agua: 'Agua', luz: 'Luz' };

function Item({
  servicio,
  activo,
  onPress,
}: {
  servicio: ServiceType;
  activo: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles(crearEstilos);
  const color = activo ? colors[servicio].text : colors.textMuted;
  return (
    <Pressable
      style={styles.item}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: activo }}
      accessibilityLabel={`Ver mascota de ${servicio}`}
    >
      <Svg width={24} height={24} viewBox="0 0 24 24">
        <Path
          d={ICONOS[servicio]}
          stroke={color}
          strokeWidth={1.8}
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
      <Text style={[styles.label, { color }, activo && styles.labelActivo]}>
        {ETIQUETAS[servicio]}
      </Text>
    </Pressable>
  );
}

// Toolbar inferior: elige qué mascota (agua o luz) se ve en la pantalla principal.
export function ServiceToggle({ servicioActivo, onChange }: Props) {
  const styles = useStyles(crearEstilos);
  return (
    <View style={styles.bar} accessibilityRole="tablist">
      <Item servicio="agua" activo={servicioActivo === 'agua'} onPress={() => onChange('agua')} />
      <Item servicio="luz" activo={servicioActivo === 'luz'} onPress={() => onChange('luz')} />
    </View>
  );
}

const crearEstilos = (c: Palette) =>
  StyleSheet.create({
    bar: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.textMuted,
      paddingTop: 10,
    },
    item: {
      flex: 1,
      alignItems: 'center',
      gap: 2,
      paddingVertical: 2,
    },
    label: {
      fontSize: 11,
    },
    labelActivo: {
      fontWeight: '600',
    },
  });
