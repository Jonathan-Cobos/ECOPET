import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { Palette, ServiceType } from '@/theme/colors';
import { useStyles, useTheme } from '@/theme/ThemeContext';
import { useApp } from '@/context/AppContext';
import { BarraProgreso } from '@/components/BarraProgreso';

const NOMBRE_MASCOTA: Record<ServiceType, string> = { agua: 'Gotín', luz: 'Voltín' };

export function LogrosScreen() {
  const { colors } = useTheme();
  const styles = useStyles(crearEstilos);
  const { logros, progreso } = useApp();
  const desbloqueados = logros.filter((l) => l.desbloqueado).length;

  return (
    <ScrollView style={styles.pantalla} contentContainerStyle={styles.contenido}>
      <View style={styles.resumen}>
        <Ionicons name="trophy" size={36} color={colors.oro} />
        <Text style={styles.resumenTitulo}>
          {desbloqueados} de {logros.length} logros
        </Text>
        <View style={{ alignSelf: 'stretch' }}>
          <BarraProgreso progreso={desbloqueados / logros.length} color={colors.oro} alto={8} />
        </View>
      </View>

      <View style={styles.rachas}>
        {(['agua', 'luz'] as ServiceType[]).map((s) => (
          <View key={s} style={styles.racha}>
            <Ionicons name="flame" size={22} color={progreso[s].rachaActual > 0 ? colors.oro : colors.textMuted} />
            <Text style={styles.rachaValor}>{progreso[s].rachaActual}</Text>
            <Text style={styles.rachaTexto}>
              {progreso[s].rachaActual === 1 ? 'mes' : 'meses'} de racha · {NOMBRE_MASCOTA[s]}
            </Text>
            <Text style={styles.rachaMejor}>Mejor: {progreso[s].mejorRacha}</Text>
          </View>
        ))}
      </View>

      {logros.map((l) => (
        <View key={l.id} style={[styles.logro, l.desbloqueado && { borderColor: colors.oro }]}>
          <View style={[styles.icono, { backgroundColor: l.desbloqueado ? colors.oro : colors.background }]}>
            <Ionicons
              name={l.desbloqueado ? l.icono : 'lock-closed'}
              size={20}
              color={l.desbloqueado ? '#FFFFFF' : colors.textMuted}
            />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[styles.titulo, !l.desbloqueado && { color: colors.textSecondary }]}>{l.titulo}</Text>
            <Text style={styles.descripcion}>{l.descripcion}</Text>
            {!l.desbloqueado && l.meta > 1 && (
              <View style={styles.progreso}>
                <View style={{ flex: 1 }}>
                  <BarraProgreso progreso={l.actual / l.meta} color={colors.agua.primary} alto={5} />
                </View>
                <Text style={styles.progresoTexto}>
                  {l.actual}/{l.meta}
                </Text>
              </View>
            )}
          </View>
          {l.desbloqueado && <Ionicons name="checkmark-circle" size={20} color={colors.success} />}
        </View>
      ))}
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
      gap: 8,
      paddingBottom: 32,
    },
    resumen: {
      backgroundColor: c.surface,
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
      gap: 10,
    },
    resumenTitulo: {
      fontSize: 18,
      fontWeight: '600',
      color: c.textPrimary,
    },
    rachas: {
      flexDirection: 'row',
      gap: 8,
    },
    racha: {
      flex: 1,
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 14,
      alignItems: 'center',
      gap: 2,
    },
    rachaValor: {
      fontSize: 26,
      fontWeight: '600',
      color: c.textPrimary,
    },
    rachaTexto: {
      fontSize: 11,
      color: c.textSecondary,
      textAlign: 'center',
    },
    rachaMejor: {
      fontSize: 11,
      color: c.textMuted,
      marginTop: 2,
    },
    logro: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: c.surface,
      borderRadius: 14,
      padding: 14,
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    icono: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titulo: {
      fontSize: 15,
      fontWeight: '600',
      color: c.textPrimary,
    },
    descripcion: {
      fontSize: 12,
      color: c.textSecondary,
    },
    progreso: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 2,
    },
    progresoTexto: {
      fontSize: 11,
      color: c.textSecondary,
    },
  });
