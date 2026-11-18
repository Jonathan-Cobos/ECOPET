import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { Palette, ServiceType } from '@/theme/colors';
import { useStyles, useTheme } from '@/theme/ThemeContext';
import { useApp } from '@/context/AppContext';
import { Mascota } from '@/components/Mascota';
import { SelectorServicio } from '@/components/SelectorServicio';
import { BarraProgreso } from '@/components/BarraProgreso';
import { ACCESORIOS, ETAPAS, accesorioDesbloqueado, textoRequisito } from '@/store/progreso';
import type { SlotAccesorio } from '@/store/types';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Evolucion'>;

const NOMBRE_MASCOTA: Record<ServiceType, string> = { agua: 'Gotín', luz: 'Voltín' };
const SLOTS: { slot: SlotAccesorio; titulo: string }[] = [
  { slot: 'cabeza', titulo: 'Cabeza' },
  { slot: 'cara', titulo: 'Cara' },
];

export function EvolucionScreen({ route }: Props) {
  const { colors } = useTheme();
  const styles = useStyles(crearEstilos);
  const { datos, analisis, progreso, logros, equiparAccesorio } = useApp();
  const [servicio, setServicio] = useState<ServiceType>(route.params.servicio);

  const palette = colors[servicio];
  const prog = progreso[servicio];
  const equipados = datos.accesorios[servicio];
  const faltan = prog.siguiente ? prog.siguiente.minimo - prog.mesesBuenos : 0;

  return (
    <ScrollView style={styles.pantalla} contentContainerStyle={styles.contenido}>
      <View style={styles.tarjeta}>
        <SelectorServicio valor={servicio} onChange={setServicio} />
        <View style={styles.mascota}>
          <Mascota
            key={servicio}
            servicio={servicio}
            estado={analisis[servicio].estado}
            size={170}
            etapa={prog.etapa.nivel}
            accesorios={equipados}
            interactivo
          />
          <Text style={styles.nombre}>{NOMBRE_MASCOTA[servicio]}</Text>
          <Text style={[styles.etapa, { color: palette.text }]}>
            Etapa {prog.etapa.nivel} · {prog.etapa.nombre}
          </Text>
        </View>

        <View style={{ gap: 6 }}>
          <BarraProgreso progreso={prog.progresoEtapa} color={palette.primary} alto={8} />
          <Text style={styles.nota}>
            {prog.siguiente
              ? `${prog.mesesBuenos} meses buenos · ${faltan} más para evolucionar a ${prog.siguiente.nombre}`
              : `${prog.mesesBuenos} meses buenos · ¡Etapa máxima alcanzada!`}
          </Text>
        </View>

        <View style={styles.rachas}>
          <View style={styles.dato}>
            <Ionicons name="flame" size={18} color={prog.rachaActual > 0 ? colors.oro : colors.textMuted} />
            <Text style={styles.datoValor}>{prog.rachaActual}</Text>
            <Text style={styles.datoTexto}>Racha actual</Text>
          </View>
          <View style={styles.dato}>
            <Ionicons name="ribbon-outline" size={18} color={colors.oro} />
            <Text style={styles.datoValor}>{prog.mejorRacha}</Text>
            <Text style={styles.datoTexto}>Mejor racha</Text>
          </View>
          <View style={styles.dato}>
            <Ionicons name="checkmark-circle-outline" size={18} color={colors.success} />
            <Text style={styles.datoValor}>{prog.mesesBuenos}</Text>
            <Text style={styles.datoTexto}>Meses buenos</Text>
          </View>
        </View>
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.seccion}>Evolución</Text>
        <View style={styles.etapas}>
          {ETAPAS.map((e) => {
            const alcanzada = prog.etapa.nivel >= e.nivel;
            return (
              <View key={e.nivel} style={styles.etapaItem}>
                <View style={!alcanzada && styles.bloqueado}>
                  <Mascota servicio={servicio} estado="feliz" size={64} etapa={e.nivel} animado={false} />
                </View>
                {!alcanzada && (
                  <View style={styles.candado}>
                    <Ionicons name="lock-closed" size={14} color={colors.textSecondary} />
                  </View>
                )}
                <Text style={[styles.etapaNombre, alcanzada && { color: colors.textPrimary, fontWeight: '600' }]}>
                  {e.nombre}
                </Text>
                <Text style={styles.etapaMinimo}>{e.minimo} meses</Text>
              </View>
            );
          })}
        </View>
      </View>

      {SLOTS.map(({ slot, titulo }) => (
        <View key={slot} style={styles.tarjeta}>
          <Text style={styles.seccion}>Accesorios · {titulo}</Text>
          <View style={styles.accesorios}>
            {ACCESORIOS.filter((a) => a.slot === slot).map((a) => {
              const libre = accesorioDesbloqueado(a, prog, logros);
              const puesto = equipados[slot] === a.id;
              return (
                <Pressable
                  key={a.id}
                  disabled={!libre}
                  onPress={() => equiparAccesorio(servicio, slot, puesto ? null : a.id)}
                  style={[styles.accesorio, puesto && { borderColor: palette.primary }]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: puesto, disabled: !libre }}
                  accessibilityLabel={`${a.nombre}${libre ? '' : ', bloqueado'}`}
                >
                  <View style={!libre && styles.bloqueado}>
                    <Mascota
                      servicio={servicio}
                      estado="feliz"
                      size={68}
                      etapa={prog.etapa.nivel}
                      accesorios={{ [slot]: a.id }}
                      animado={false}
                    />
                  </View>
                  <Text style={styles.accesorioNombre}>{a.nombre}</Text>
                  {libre ? (
                    <Text style={[styles.accesorioEstado, puesto && { color: palette.text, fontWeight: '600' }]}>
                      {puesto ? 'Puesto ✓' : 'Toca para poner'}
                    </Text>
                  ) : (
                    <View style={styles.requisito}>
                      <Ionicons name="lock-closed" size={10} color={colors.textSecondary} />
                      <Text style={styles.accesorioEstado}>{textoRequisito(a)}</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
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
      gap: 12,
      paddingBottom: 32,
    },
    tarjeta: {
      backgroundColor: c.surface,
      borderRadius: 20,
      padding: 16,
      gap: 12,
    },
    mascota: {
      alignItems: 'center',
    },
    nombre: {
      fontSize: 20,
      fontWeight: '600',
      color: c.textPrimary,
      marginTop: 4,
    },
    etapa: {
      fontSize: 13,
      fontWeight: '500',
    },
    nota: {
      fontSize: 12,
      color: c.textSecondary,
      textAlign: 'center',
    },
    rachas: {
      flexDirection: 'row',
      gap: 8,
    },
    dato: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: c.background,
      borderRadius: 12,
      paddingVertical: 10,
      gap: 2,
    },
    datoValor: {
      fontSize: 20,
      fontWeight: '600',
      color: c.textPrimary,
    },
    datoTexto: {
      fontSize: 11,
      color: c.textSecondary,
    },
    seccion: {
      fontSize: 15,
      fontWeight: '600',
      color: c.textPrimary,
    },
    etapas: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    etapaItem: {
      alignItems: 'center',
      flex: 1,
    },
    candado: {
      position: 'absolute',
      top: 24,
    },
    etapaNombre: {
      fontSize: 12,
      color: c.textSecondary,
    },
    etapaMinimo: {
      fontSize: 10,
      color: c.textMuted,
    },
    bloqueado: {
      opacity: 0.3,
    },
    accesorios: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    accesorio: {
      width: '30%',
      minWidth: 96,
      flexGrow: 1,
      alignItems: 'center',
      backgroundColor: c.background,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: 'transparent',
      paddingVertical: 10,
      paddingHorizontal: 6,
      gap: 2,
    },
    accesorioNombre: {
      fontSize: 13,
      fontWeight: '500',
      color: c.textPrimary,
    },
    accesorioEstado: {
      fontSize: 10,
      color: c.textSecondary,
      textAlign: 'center',
    },
    requisito: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
  });
