import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors, colorsFor } from '@/theme/colors';
import { useApp } from '@/context/AppContext';
import { UNIDADES } from '@/store/consumo';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'RegistrarConsumo'>;

export function RegistrarConsumoScreen({ route, navigation }: Props) {
  const { servicio } = route.params;
  const { registrar } = useApp();
  const palette = colorsFor(servicio);
  const unidad = UNIDADES[servicio];

  const [valor, setValor] = useState('');
  const [error, setError] = useState<string | null>(null);

  function guardar() {
    const numero = Number(valor.trim().replace(',', '.'));
    if (valor.trim() === '' || Number.isNaN(numero) || numero < 0) {
      setError('Ingresa un número mayor o igual a 0.');
      return;
    }

    const resultado = registrar(servicio, numero);

    // Si excede el estándar, se pasa directo al cuestionario de hábitos.
    if (resultado.excedeEstandar) {
      navigation.replace('Cuestionario', { servicio });
    } else {
      navigation.goBack();
    }
  }

  return (
    <View style={styles.pantalla}>
      <View style={styles.tarjeta}>
        <Text style={styles.titulo}>Consumo de {servicio} de este mes</Text>
        <Text style={styles.subtitulo}>
          Ingresa el valor de tu recibo o medidor. Si ya registraste este mes, se reemplaza.
        </Text>

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

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 12,
  },
  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  subtitulo: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 20,
    lineHeight: 18,
  },
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 14,
  },
  campoError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    fontSize: 26,
    paddingVertical: 14,
    color: colors.textPrimary,
  },
  unidad: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  error: {
    fontSize: 12,
    color: colors.danger,
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
    color: colors.textSecondary,
    fontSize: 13,
  },
});
