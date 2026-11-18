import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, Text, Pressable, StyleSheet } from 'react-native';
import type { Palette, ServiceType } from '@/theme/colors';
import { useStyles, useTheme } from '@/theme/ThemeContext';
import type { Registro } from '@/store/types';
import { ordenarRecientesPrimero } from '@/store/consumo';
import { formatMes } from '@/utils/format';

interface Props {
  servicio: ServiceType;
  registros: Registro[];
  onVerTodo?: () => void;
}

export function HistorialBarras({ servicio, registros, onVerTodo }: Props) {
  const { colors } = useTheme();
  const styles = useStyles(crearEstilos);
  const rampa = colors[servicio].bars;

  // Los últimos 5 registros en orden cronológico (el más reciente a la derecha).
  const ultimos = ordenarRecientesPrimero(registros).slice(0, 5).reverse();
  const max = Math.max(...ultimos.map((r) => r.valor), 0);
  // Si hay menos de 5, se usan los tonos más intensos de la rampa.
  const tonos = rampa.slice(rampa.length - ultimos.length);

  // Las barras crecen desde abajo cada vez que cambian los datos o el servicio.
  const crecer = useRef(new Animated.Value(0)).current;
  const firma = `${servicio}|${ultimos.map((r) => `${r.periodo}:${r.valor}`).join('|')}`;
  useEffect(() => {
    crecer.setValue(0);
    Animated.timing(crecer, {
      toValue: 1,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [firma, crecer]);

  return (
    <View style={styles.tarjeta}>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>Últimos registros</Text>
        {onVerTodo && (
          <Pressable onPress={onVerTodo} hitSlop={8} accessibilityRole="link">
            <Text style={[styles.verTodo, { color: colors[servicio].text }]}>Ver todo ›</Text>
          </Pressable>
        )}
      </View>
      {ultimos.length === 0 ? (
        <Text style={styles.vacio}>Aún no hay registros. Agrega el primero abajo.</Text>
      ) : (
        <View style={styles.barras}>
          {ultimos.map((r, i) => {
            const porcentaje = max > 0 ? Math.max((r.valor / max) * 100, 8) : 8;
            return (
              <View key={r.id} style={styles.columna}>
                <View style={styles.pista}>
                  <Animated.View
                    style={[
                      styles.barra,
                      {
                        height: crecer.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', `${porcentaje}%`],
                        }),
                        backgroundColor: tonos[i],
                      },
                    ]}
                  />
                </View>
                <Text style={styles.mes}>{formatMes(r.periodo)}</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const crearEstilos = (c: Palette) =>
  StyleSheet.create({
    tarjeta: {
      backgroundColor: c.background,
      borderRadius: 8,
      padding: 12,
    },
    encabezado: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    titulo: {
      fontSize: 12,
      color: c.textSecondary,
    },
    verTodo: {
      fontSize: 12,
      fontWeight: '500',
    },
    barras: {
      flexDirection: 'row',
      gap: 6,
    },
    columna: {
      flex: 1,
      alignItems: 'center',
    },
    pista: {
      width: '100%',
      height: 56,
      justifyContent: 'flex-end',
    },
    barra: {
      width: '100%',
      borderTopLeftRadius: 3,
      borderTopRightRadius: 3,
    },
    mes: {
      fontSize: 10,
      color: c.textSecondary,
      marginTop: 4,
    },
    vacio: {
      fontSize: 12,
      color: c.textSecondary,
      paddingVertical: 8,
    },
  });
