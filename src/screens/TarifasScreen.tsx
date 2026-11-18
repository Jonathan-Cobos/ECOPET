import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { Palette, ServiceType } from '@/theme/colors';
import { useStyles, useTheme } from '@/theme/ThemeContext';
import { useApp } from '@/context/AppContext';
import { OpcionChip } from '@/components/OpcionChip';
import { UNIDADES } from '@/store/consumo';
import { tarifaAutomatica } from '@/store/costos';
import { formatPesos } from '@/utils/format';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Tarifas'>;

const SERVICIOS: ServiceType[] = ['agua', 'luz'];

export function TarifasScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useStyles(crearEstilos);
  const { datos, analisis, setTarifa } = useApp();
  const estrato = datos.perfil?.estrato;

  // Borrador local: null = automática; texto = tarifa personalizada.
  const [borrador, setBorrador] = useState<Record<ServiceType, string | null>>({
    agua: datos.tarifas.agua === null ? null : String(datos.tarifas.agua),
    luz: datos.tarifas.luz === null ? null : String(datos.tarifas.luz),
  });

  const numero = (t: string) => Number(t.trim().replace(/\./g, '').replace(',', '.'));
  const validoServicio = (s: ServiceType) => {
    const t = borrador[s];
    return t === null || (t.trim() !== '' && !Number.isNaN(numero(t)) && numero(t) > 0);
  };
  const todoValido = SERVICIOS.every(validoServicio);

  function guardar() {
    SERVICIOS.forEach((s) => {
      const t = borrador[s];
      setTarifa(s, t === null ? null : numero(t));
    });
    navigation.goBack();
  }

  return (
    <ScrollView style={styles.pantalla} contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
      <View style={styles.info}>
        <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
        <Text style={styles.infoTexto}>
          La tarifa automática es una aproximación según tu estrato
          {estrato ? ` (${estrato})` : ''}. Para un cálculo exacto, escribe el valor por unidad que aparece en tu recibo.
        </Text>
      </View>

      {SERVICIOS.map((s) => {
        const p = colors[s];
        const unidad = UNIDADES[s];
        const automatica = tarifaAutomatica(s, estrato);
        const t = borrador[s];
        const efectiva = t === null ? automatica : validoServicio(s) ? numero(t) : null;
        const actual = analisis[s].actual;
        return (
          <View key={s} style={styles.tarjeta}>
            <View style={styles.cabecera}>
              <Ionicons name={s === 'agua' ? 'water' : 'flash'} size={20} color={p.primary} />
              <Text style={styles.titulo}>{s === 'agua' ? 'Agua' : 'Luz'}</Text>
              <Text style={styles.porUnidad}>por {unidad}</Text>
            </View>

            <View style={styles.opciones}>
              <OpcionChip
                label={`Automática (${formatPesos(automatica)})`}
                seleccionada={t === null}
                onPress={() => setBorrador((b) => ({ ...b, [s]: null }))}
                colorActivo={p.primary}
                colorTextoActivo={p.dark}
              />
              <OpcionChip
                label="Personalizada"
                seleccionada={t !== null}
                onPress={() => setBorrador((b) => ({ ...b, [s]: b[s] ?? String(automatica) }))}
                colorActivo={p.primary}
                colorTextoActivo={p.dark}
              />
            </View>

            {t !== null && (
              <View style={[styles.campo, !validoServicio(s) && { borderColor: colors.danger }]}>
                <Text style={styles.prefijo}>$</Text>
                <TextInput
                  value={t}
                  onChangeText={(v) => setBorrador((b) => ({ ...b, [s]: v }))}
                  keyboardType="decimal-pad"
                  style={styles.input}
                  accessibilityLabel={`Tarifa de ${s} por ${unidad}`}
                />
                <Text style={styles.prefijo}>/{unidad}</Text>
              </View>
            )}

            {actual && efectiva !== null && (
              <Text style={styles.estimado}>
                Este mes: {actual.valor} {unidad} × {formatPesos(efectiva)} ={' '}
                <Text style={[styles.estimadoValor, { color: p.text }]}>{formatPesos(actual.valor * efectiva)}</Text>
              </Text>
            )}
          </View>
        );
      })}

      <Pressable
        style={[styles.boton, !todoValido && { opacity: 0.45 }]}
        onPress={guardar}
        disabled={!todoValido}
        accessibilityRole="button"
      >
        <Text style={styles.botonTexto}>Guardar tarifas</Text>
      </Pressable>
    </ScrollView>
  );
}

const crearEstilos = (c: Palette) =>
  StyleSheet.create({
    pantalla: {
      flex: 1,
      backgroundColor: c.background,
    },
    contenido: {
      padding: 12,
      gap: 12,
      paddingBottom: 32,
    },
    info: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 4,
    },
    infoTexto: {
      flex: 1,
      fontSize: 12,
      lineHeight: 17,
      color: c.textSecondary,
    },
    tarjeta: {
      backgroundColor: c.surface,
      borderRadius: 20,
      padding: 16,
      gap: 12,
    },
    cabecera: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    titulo: {
      fontSize: 16,
      fontWeight: '600',
      color: c.textPrimary,
    },
    porUnidad: {
      fontSize: 12,
      color: c.textSecondary,
    },
    opciones: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    campo: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'transparent',
      paddingHorizontal: 14,
      gap: 4,
    },
    prefijo: {
      fontSize: 14,
      color: c.textSecondary,
    },
    input: {
      flex: 1,
      fontSize: 20,
      paddingVertical: 10,
      color: c.textPrimary,
    },
    estimado: {
      fontSize: 12,
      color: c.textSecondary,
    },
    estimadoValor: {
      fontWeight: '600',
    },
    boton: {
      backgroundColor: c.textPrimary,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: 'center',
    },
    botonTexto: {
      color: c.surface,
      fontWeight: '600',
      fontSize: 15,
    },
  });
