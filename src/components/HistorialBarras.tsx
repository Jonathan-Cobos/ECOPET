import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, colorsFor, ServiceType } from '@/theme/colors';
import type { Registro } from '@/store/types';
import { ordenarRecientesPrimero } from '@/store/consumo';
import { formatMes } from '@/utils/format';

interface Props {
  servicio: ServiceType;
  registros: Registro[];
}

export function HistorialBarras({ servicio, registros }: Props) {
  const rampa = colorsFor(servicio).bars;

  // Los últimos 5 registros en orden cronológico (el más reciente a la derecha).
  const ultimos = ordenarRecientesPrimero(registros).slice(0, 5).reverse();
  const max = Math.max(...ultimos.map((r) => r.valor), 0);
  // Si hay menos de 5, se usan los tonos más intensos de la rampa.
  const tonos = rampa.slice(rampa.length - ultimos.length);

  return (
    <View style={styles.tarjeta}>
      <Text style={styles.titulo}>Últimos registros</Text>
      {ultimos.length === 0 ? (
        <Text style={styles.vacio}>Aún no hay registros. Agrega el primero abajo.</Text>
      ) : (
        <View style={styles.barras}>
          {ultimos.map((r, i) => (
            <View key={r.id} style={styles.columna}>
              <View style={styles.pista}>
                <View
                  style={[
                    styles.barra,
                    {
                      height: `${max > 0 ? Math.max((r.valor / max) * 100, 8) : 8}%`,
                      backgroundColor: tonos[i],
                    },
                  ]}
                />
              </View>
              <Text style={styles.mes}>{formatMes(r.periodo)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
  },
  titulo: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
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
    color: colors.textSecondary,
    marginTop: 4,
  },
  vacio: {
    fontSize: 12,
    color: colors.textSecondary,
    paddingVertical: 8,
  },
});
