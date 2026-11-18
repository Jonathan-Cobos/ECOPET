import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { Palette, ServiceType } from '@/theme/colors';
import { useStyles, useTheme } from '@/theme/ThemeContext';
import { useApp } from '@/context/AppContext';
import { SelectorServicio } from '@/components/SelectorServicio';
import { MetricCard } from '@/components/MetricCard';
import { UNIDADES, ordenarCronologico } from '@/store/consumo';
import { formatMesLargo, formatPesos, formatValor, formatVariacion } from '@/utils/format';
import { confirmar } from '@/utils/dialogo';
import type { Registro } from '@/store/types';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Historial'>;

interface Fila {
  registro: Registro;
  variacion: number | null;
  bueno: boolean;
}

export function HistorialScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const styles = useStyles(crearEstilos);
  const { datos, tarifas, progreso, estandares, eliminarRegistro } = useApp();
  const [servicio, setServicio] = useState<ServiceType>(route.params.servicio);

  const palette = colors[servicio];
  const unidad = UNIDADES[servicio];
  const tarifa = tarifas[servicio];
  const cronologico = ordenarCronologico(datos.registros[servicio]);
  const buenos = new Set(progreso[servicio].idsBuenos);

  // Cada fila se compara con el registro anterior; la lista se muestra del más reciente al más antiguo.
  const filas: Fila[] = cronologico
    .map((r, i) => {
      const previo = cronologico[i - 1];
      return {
        registro: r,
        variacion: previo && previo.valor > 0 ? ((r.valor - previo.valor) / previo.valor) * 100 : null,
        bueno: buenos.has(r.id),
      };
    })
    .reverse();

  const total = cronologico.reduce((t, r) => t + r.valor, 0);
  const promedio = cronologico.length ? total / cronologico.length : null;
  const mejor = cronologico.length ? Math.min(...cronologico.map((r) => r.valor)) : null;

  function borrar(r: Registro) {
    confirmar(
      'Eliminar registro',
      `Se eliminará el consumo de ${formatMesLargo(r.periodo)} (${formatValor(r.valor)} ${unidad}).`,
      'Eliminar',
      () => eliminarRegistro(servicio, r.id)
    );
  }

  const encabezado = (
    <View style={styles.encabezado}>
      <SelectorServicio valor={servicio} onChange={setServicio} />
      <View style={styles.metricas}>
        <MetricCard label="Promedio" value={promedio !== null ? formatValor(promedio) : '—'} nota={`${unidad}/mes`} />
        <MetricCard label="Mejor mes" value={mejor !== null ? formatValor(mejor) : '—'} nota={unidad} />
      </View>
      <View style={styles.metricas}>
        <MetricCard label="Gasto total estimado" value={formatPesos(total * tarifa)} nota={`${cronologico.length} meses registrados`} />
      </View>
      <View style={styles.leyenda}>
        <View style={[styles.punto, { backgroundColor: colors.success }]} />
        <Text style={styles.leyendaTexto}>Mes bueno (dentro del estándar o bajó)</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.pantalla}>
      <FlatList
        data={filas}
        keyExtractor={(f) => String(f.registro.id)}
        ListHeaderComponent={encabezado}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={styles.vacio}>
            <Ionicons name="document-text-outline" size={32} color={colors.textMuted} />
            <Text style={styles.vacioTexto}>Aún no hay registros de {servicio}.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const { registro: r, variacion, bueno } = item;
          const colorVar =
            variacion === null || Math.round(variacion) === 0
              ? colors.textSecondary
              : variacion > 0
              ? colors.danger
              : colors.success;
          return (
            <View style={styles.fila}>
              <View style={[styles.punto, { backgroundColor: bueno ? colors.success : r.valor > estandares[servicio] ? colors.danger : colors.textMuted }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.mes}>{formatMesLargo(r.periodo)}</Text>
                <Text style={styles.detalle}>
                  {formatPesos(r.valor * tarifa)}
                  {'  ·  '}
                  <Text style={{ color: colorVar }}>{formatVariacion(variacion)}</Text>
                </Text>
              </View>
              <Text style={[styles.valor, { color: palette.text }]}>
                {formatValor(r.valor)} <Text style={styles.unidad}>{unidad}</Text>
              </Text>
              <Pressable
                onPress={() => navigation.navigate('RegistrarConsumo', { servicio, periodo: r.periodo })}
                hitSlop={8}
                accessibilityLabel={`Editar ${formatMesLargo(r.periodo)}`}
              >
                <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
              </Pressable>
              <Pressable onPress={() => borrar(r)} hitSlop={8} accessibilityLabel={`Eliminar ${formatMesLargo(r.periodo)}`}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </Pressable>
            </View>
          );
        }}
        ListFooterComponent={
          <Pressable
            style={[styles.boton, { backgroundColor: palette.primary }]}
            onPress={() => navigation.navigate('RegistrarConsumo', { servicio })}
            accessibilityRole="button"
          >
            <Ionicons name="add" size={18} color={palette.dark} />
            <Text style={[styles.botonTexto, { color: palette.dark }]}>Agregar registro</Text>
          </Pressable>
        }
      />
    </View>
  );
}

const crearEstilos = (c: Palette) =>
  StyleSheet.create({
    pantalla: {
      flex: 1,
      backgroundColor: c.background,
    },
    lista: {
      padding: 12,
      gap: 8,
    },
    encabezado: {
      backgroundColor: c.surface,
      borderRadius: 20,
      padding: 16,
      gap: 10,
      marginBottom: 4,
    },
    metricas: {
      flexDirection: 'row',
      gap: 10,
    },
    leyenda: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    leyendaTexto: {
      fontSize: 11,
      color: c.textSecondary,
    },
    punto: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    fila: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: c.surface,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    mes: {
      fontSize: 14,
      fontWeight: '500',
      color: c.textPrimary,
      textTransform: 'capitalize',
    },
    detalle: {
      fontSize: 12,
      color: c.textSecondary,
      marginTop: 2,
    },
    valor: {
      fontSize: 16,
      fontWeight: '600',
    },
    unidad: {
      fontSize: 11,
      fontWeight: '400',
    },
    vacio: {
      alignItems: 'center',
      gap: 8,
      paddingVertical: 32,
    },
    vacioTexto: {
      fontSize: 13,
      color: c.textSecondary,
    },
    boton: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
      borderRadius: 8,
      paddingVertical: 13,
      marginTop: 4,
    },
    botonTexto: {
      fontWeight: '500',
      fontSize: 14,
    },
  });
