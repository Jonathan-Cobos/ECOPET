import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors, colorsFor, ServiceType } from '@/theme/colors';
import { useApp } from '@/context/AppContext';
import { Mascota } from '@/components/Mascota';
import { MetricCard } from '@/components/MetricCard';
import { ServiceToggle } from '@/components/ServiceToggle';
import { AlertBanner } from '@/components/AlertBanner';
import { HistorialBarras } from '@/components/HistorialBarras';
import { UNIDADES } from '@/store/consumo';
import { formatValor, formatVariacion } from '@/utils/format';
import type { RootStackParamList } from '@/navigation/types';
import type { EstadoMascota } from '@/store/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const NOMBRE_APP: Record<ServiceType, string> = { agua: 'AquaPet', luz: 'VoltPet' };
const NOMBRE_MASCOTA: Record<ServiceType, string> = { agua: 'Gotín', luz: 'Voltín' };
const ESTADO_TEXTO: Record<EstadoMascota, string> = {
  feliz: 'está feliz',
  neutral: 'está tranquilo',
  decaido: 'está decaído',
};

export function HomeScreen({ navigation }: Props) {
  const { servicioActivo, setServicioActivo, datos, analisis, restablecerDemo } = useApp();
  const palette = colorsFor(servicioActivo);
  const a = analisis[servicioActivo];
  const unidad = UNIDADES[servicioActivo];
  const recomendacion = datos.recomendaciones[servicioActivo];

  const subtitulo = (() => {
    if (!a.actual) return `Registra tu primer consumo para conocer a ${NOMBRE_MASCOTA[servicioActivo]}`;
    if (a.variacionPorc === null) return 'Aún no hay un mes anterior para comparar';
    if (a.variacionPorc < 0) return 'Tu consumo bajó este mes';
    if (a.variacionPorc === 0) return 'Tu consumo se mantiene igual que el mes pasado';
    return a.excedeEstandar
      ? 'Tu consumo subió este mes'
      : 'Tu consumo subió, pero sigue dentro del estándar';
  })();

  const colorEstado =
    a.estado === 'decaido' ? colors.warning : a.estado === 'feliz' ? palette.text : colors.textSecondary;

  const colorVariacion =
    a.variacionPorc === null || a.variacionPorc === 0
      ? colors.textPrimary
      : a.variacionPorc > 0
      ? colors.danger
      : colors.success;

  const hayAlertas = (['agua', 'luz'] as ServiceType[]).some(
    (s) => analisis[s].excedeEstandar || analisis[s].fuga
  );

  function verAlertas() {
    const lineas = (['agua', 'luz'] as ServiceType[]).flatMap((s) => {
      const x = analisis[s];
      const out: string[] = [];
      if (x.fuga) out.push(`Posible fuga en ${s}: el consumo subió ${Math.round(x.variacionPorc ?? 0)}% de golpe.`);
      if (x.excedeEstandar) out.push(`Consumo de ${s} por encima del estándar (${datos.estandares[s]} ${UNIDADES[s]}).`);
      return out;
    });
    Alert.alert('Alertas', lineas.length ? lineas.join('\n\n') : 'No tienes alertas. ¡Buen trabajo!');
  }

  function confirmarRestablecer() {
    Alert.alert('Restablecer datos', 'Se borrarán tus registros y volverán los datos de ejemplo.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Restablecer', style: 'destructive', onPress: restablecerDemo },
    ]);
  }

  return (
    <SafeAreaView style={styles.marco} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.tarjeta}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contenido}>
          <View style={styles.encabezado}>
            <Text style={styles.appNombre}>{NOMBRE_APP[servicioActivo]}</Text>
            <Pressable onPress={verAlertas} hitSlop={10} accessibilityLabel="Ver alertas">
              <Ionicons name="notifications-outline" size={22} color={colors.textSecondary} />
              {hayAlertas && <View style={styles.punto} />}
            </Pressable>
          </View>

          <View style={styles.zonaMascota}>
            <Mascota servicio={servicioActivo} estado={a.estado} size={150} />
            <Text style={[styles.estado, { color: colorEstado }]}>
              {NOMBRE_MASCOTA[servicioActivo]} {ESTADO_TEXTO[a.estado]}
            </Text>
            <Text style={styles.estadoSub}>{subtitulo}</Text>
          </View>

          <View style={styles.metricas}>
            <MetricCard
              label="Consumo actual"
              value={a.actual ? `${formatValor(a.actual.valor)} ${unidad}` : '—'}
            />
            <MetricCard
              label="Vs. mes anterior"
              value={formatVariacion(a.variacionPorc)}
              valueColor={colorVariacion}
            />
          </View>

          {a.fuga && (
            <AlertBanner
              tipo="fuga"
              titulo="Posible fuga detectada"
              mensaje={`El consumo subió ${Math.round(a.variacionPorc ?? 0)}% de golpe. Revisa ${
                servicioActivo === 'agua' ? 'llaves, tuberías y sanitarios' : 'equipos que queden encendidos'
              }.`}
            />
          )}

          {a.excedeEstandar && !recomendacion && (
            <AlertBanner
              tipo="estandar"
              titulo="Consumo por encima del estándar"
              mensaje="Responde el cuestionario de hábitos"
              onPress={() => navigation.navigate('Cuestionario', { servicio: servicioActivo })}
            />
          )}

          {a.excedeEstandar && recomendacion && (
            <View style={[styles.recomendacion, { borderColor: palette.primary }]}>
              <Text style={[styles.recomendacionTitulo, { color: palette.text }]}>
                Tu recomendación
              </Text>
              <Text style={styles.recomendacionTexto}>{recomendacion}</Text>
              <Pressable
                onPress={() => navigation.navigate('Cuestionario', { servicio: servicioActivo })}
              >
                <Text style={[styles.enlace, { color: palette.text }]}>Volver a responder</Text>
              </Pressable>
            </View>
          )}

          <HistorialBarras servicio={servicioActivo} registros={datos.registros[servicioActivo]} />

          <Pressable
            style={[styles.boton, { backgroundColor: palette.primary }]}
            onPress={() => navigation.navigate('RegistrarConsumo', { servicio: servicioActivo })}
            accessibilityRole="button"
          >
            <Ionicons name="add" size={18} color={palette.dark} />
            <Text style={[styles.botonTexto, { color: palette.dark }]}>
              Registrar consumo de {servicioActivo}
            </Text>
          </Pressable>

          <Pressable onPress={confirmarRestablecer} style={styles.restablecer}>
            <Text style={styles.restablecerTexto}>Restablecer datos de ejemplo</Text>
          </Pressable>
        </ScrollView>

        <ServiceToggle servicioActivo={servicioActivo} onChange={setServicioActivo} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  marco: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 12,
  },
  tarjeta: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
  },
  contenido: {
    gap: 14,
    paddingBottom: 12,
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appNombre: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  punto: {
    position: 'absolute',
    top: 0,
    right: 1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
  zonaMascota: {
    alignItems: 'center',
    paddingTop: 4,
  },
  estado: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 6,
  },
  estadoSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  metricas: {
    flexDirection: 'row',
    gap: 10,
  },
  recomendacion: {
    borderWidth: 1.5,
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  recomendacionTitulo: {
    fontSize: 12,
    fontWeight: '500',
  },
  recomendacionTexto: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textPrimary,
  },
  enlace: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  boton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    paddingVertical: 13,
  },
  botonTexto: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
  },
  restablecer: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  restablecerTexto: {
    fontSize: 11,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
