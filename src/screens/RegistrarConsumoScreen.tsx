import React, { useLayoutEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { Palette } from '@/theme/colors';
import { useStyles, useTheme } from '@/theme/ThemeContext';
import { useApp } from '@/context/AppContext';
import { UNIDADES, desplazarPeriodo, periodoActual } from '@/store/consumo';
import { formatMesLargo, formatPesos } from '@/utils/format';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'RegistrarConsumo'>;

// Se pueden registrar o corregir hasta 3 años hacia atrás.
const MESES_ATRAS = 35;

export function RegistrarConsumoScreen({ route, navigation }: Props) {
  const { servicio, periodo: periodoInicial } = route.params;
  const { colors } = useTheme();
  const styles = useStyles(crearEstilos);
  const { registrar, datos, tarifas } = useApp();
  const palette = colors[servicio];
  const unidad = UNIDADES[servicio];

  const hoy = periodoActual();
  const minimo = desplazarPeriodo(hoy, -MESES_ATRAS);
  const valorDe = (p: string) => {
    const r = datos.registros[servicio].find((x) => x.periodo === p);
    return r ? String(r.valor) : '';
  };

  const [periodo, setPeriodo] = useState(periodoInicial ?? hoy);
  const [valor, setValor] = useState(() => valorDe(periodoInicial ?? hoy));
  const [error, setError] = useState<string | null>(null);
  const existente = datos.registros[servicio].some((r) => r.periodo === periodo);

  useLayoutEffect(() => {
    navigation.setOptions({ title: periodoInicial ? 'Editar registro' : 'Nuevo registro' });
  }, [navigation, periodoInicial]);

  function cambiarMes(delta: number) {
    const nuevo = desplazarPeriodo(periodo, delta);
    if (nuevo > hoy || nuevo < minimo) return;
    setPeriodo(nuevo);
    setValor(valorDe(nuevo));
    setError(null);
  }

  const numero = Number(valor.trim().replace(',', '.'));
  const valido = valor.trim() !== '' && !Number.isNaN(numero) && numero >= 0;

  function guardar() {
    if (!valido) {
      setError('Ingresa un número mayor o igual a 0.');
      return;
    }

    const resultado = registrar(servicio, numero, periodo);

    // Si el mes actual excede el estándar, se pasa directo al cuestionario de hábitos.
    if (periodo === hoy && resultado.excedeEstandar) {
      navigation.replace('Cuestionario', { servicio });
    } else {
      navigation.goBack();
    }
  }

  return (
    <View style={styles.pantalla}>
      <View style={styles.tarjeta}>
        <Text style={styles.titulo}>Consumo de {servicio}</Text>
        <Text style={styles.subtitulo}>
          Ingresa el valor de tu recibo o medidor. Si el mes ya tiene registro, se reemplaza.
        </Text>

        <View style={styles.selectorMes}>
          <Pressable
            onPress={() => cambiarMes(-1)}
            disabled={periodo <= minimo}
            hitSlop={10}
            style={periodo <= minimo && styles.deshabilitado}
            accessibilityLabel="Mes anterior"
          >
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.mes}>{formatMesLargo(periodo)}</Text>
            {periodo === hoy && <Text style={styles.mesNota}>Mes actual</Text>}
          </View>
          <Pressable
            onPress={() => cambiarMes(1)}
            disabled={periodo >= hoy}
            hitSlop={10}
            style={periodo >= hoy && styles.deshabilitado}
            accessibilityLabel="Mes siguiente"
          >
            <Ionicons name="chevron-forward" size={22} color={colors.textPrimary} />
          </Pressable>
        </View>

        <View style={[styles.campo, error ? styles.campoError : null]}>
          <TextInput
            value={valor}
            onChangeText={(t) => {
              setValor(t);
              setError(null);
            }}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            style={styles.input}
            autoFocus
            onSubmitEditing={guardar}
            accessibilityLabel={`Consumo de ${servicio} en ${unidad}`}
          />
          <Text style={styles.unidad}>{unidad}</Text>
        </View>
        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.costo}>
          <Ionicons name="cash-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.costoTexto}>
            Costo estimado:{' '}
            <Text style={styles.costoValor}>{valido ? formatPesos(numero * tarifas[servicio]) : '—'}</Text>
          </Text>
        </View>
        {existente && <Text style={styles.aviso}>Este mes ya tiene un registro: se reemplazará.</Text>}

        <Pressable
          style={[styles.boton, { backgroundColor: palette.primary }]}
          onPress={guardar}
          accessibilityRole="button"
        >
          <Text style={[styles.botonTexto, { color: palette.dark }]}>Guardar registro</Text>
        </Pressable>

        <Pressable onPress={() => navigation.goBack()} style={styles.cancelar}>
          <Text style={styles.cancelarTexto}>Cancelar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const crearEstilos = (c: Palette) =>
  StyleSheet.create({
    pantalla: {
      flex: 1,
      backgroundColor: c.background,
      padding: 12,
    },
    tarjeta: {
      backgroundColor: c.surface,
      borderRadius: 20,
      padding: 20,
    },
    titulo: {
      fontSize: 18,
      fontWeight: '500',
      color: c.textPrimary,
    },
    subtitulo: {
      fontSize: 13,
      color: c.textSecondary,
      marginTop: 4,
      marginBottom: 16,
      lineHeight: 18,
    },
    selectorMes: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: c.background,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 12,
    },
    mes: {
      fontSize: 15,
      fontWeight: '500',
      color: c.textPrimary,
      textTransform: 'capitalize',
    },
    mesNota: {
      fontSize: 11,
      color: c.textSecondary,
    },
    deshabilitado: {
      opacity: 0.3,
    },
    campo: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'transparent',
      paddingHorizontal: 14,
    },
    campoError: {
      borderColor: c.danger,
    },
    input: {
      flex: 1,
      fontSize: 26,
      paddingVertical: 14,
      color: c.textPrimary,
    },
    unidad: {
      fontSize: 14,
      color: c.textSecondary,
    },
    error: {
      fontSize: 12,
      color: c.danger,
      marginTop: 6,
    },
    costo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 12,
    },
    costoTexto: {
      fontSize: 13,
      color: c.textSecondary,
    },
    costoValor: {
      fontWeight: '600',
      color: c.textPrimary,
    },
    aviso: {
      fontSize: 12,
      color: c.warning,
      marginTop: 6,
    },
    boton: {
      borderRadius: 8,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 20,
    },
    botonTexto: {
      fontWeight: '500',
      fontSize: 14,
    },
    cancelar: {
      marginTop: 14,
      alignItems: 'center',
    },
    cancelarTexto: {
      color: c.textSecondary,
      fontSize: 13,
    },
  });
