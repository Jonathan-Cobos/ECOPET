import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { Palette, ServiceType } from '@/theme/colors';
import { useStyles, useTheme } from '@/theme/ThemeContext';
import { useApp } from '@/context/AppContext';
import { Mascota } from '@/components/Mascota';
import { MetricCard } from '@/components/MetricCard';
import { ServiceToggle } from '@/components/ServiceToggle';
import { AlertBanner } from '@/components/AlertBanner';
import { HistorialBarras } from '@/components/HistorialBarras';
import { LogroToast } from '@/components/LogroToast';
import { Avatar, MenuUsuario, OpcionMenu } from '@/components/MenuUsuario';
import { UNIDADES } from '@/store/consumo';
import { formatPesos, formatValor, formatVariacion } from '@/utils/format';
import { avisar, confirmar } from '@/utils/dialogo';
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
  const { colors } = useTheme();
  const styles = useStyles(crearEstilos);
  const {
    servicioActivo,
    setServicioActivo,
    datos,
    analisis,
    estandares,
    tarifas,
    progreso,
    logrosNuevos,
    marcarLogroVisto,
    restablecerDemo,
    borrarTodo,
  } = useApp();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const palette = colors[servicioActivo];
  const a = analisis[servicioActivo];
  const prog = progreso[servicioActivo];
  const unidad = UNIDADES[servicioActivo];
  const tarifa = tarifas[servicioActivo];
  const recomendacion = datos.recomendaciones[servicioActivo];
  const nombre = datos.perfil?.nombre;

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

  // Costo del mes y diferencia en pesos contra el mes anterior.
  const costoActual = a.actual ? a.actual.valor * tarifa : null;
  const diferencia = a.actual && a.anterior ? (a.actual.valor - a.anterior.valor) * tarifa : null;

  const hayAlertas = (['agua', 'luz'] as ServiceType[]).some(
    (s) => analisis[s].excedeEstandar || analisis[s].fuga
  );

  function verAlertas() {
    const lineas = (['agua', 'luz'] as ServiceType[]).flatMap((s) => {
      const x = analisis[s];
      const out: string[] = [];
      if (x.fuga) out.push(`Posible fuga en ${s}: el consumo subió ${Math.round(x.variacionPorc ?? 0)}% de golpe.`);
      if (x.excedeEstandar) out.push(`Consumo de ${s} por encima del estándar (${formatValor(estandares[s])} ${UNIDADES[s]}).`);
      return out;
    });
    avisar('Alertas', lineas.length ? lineas.join('\n\n') : 'No tienes alertas. ¡Buen trabajo!');
  }

  function alElegirMenu(opcion: OpcionMenu) {
    switch (opcion) {
      case 'perfil':
        navigation.navigate('EncuestaHogar', { modo: 'editar' });
        break;
      case 'historial':
        navigation.navigate('Historial', { servicio: servicioActivo });
        break;
      case 'logros':
        navigation.navigate('Logros');
        break;
      case 'evolucion':
        navigation.navigate('Evolucion', { servicio: servicioActivo });
        break;
      case 'tarifas':
        navigation.navigate('Tarifas');
        break;
      case 'restablecer':
        confirmar('Restablecer datos', 'Se borrarán tus registros y volverán los datos de ejemplo.', 'Restablecer', restablecerDemo);
        break;
      case 'borrar':
        confirmar(
          'Borrar todo',
          'Se borrarán tus registros, los datos del hogar, las tarifas y los accesorios. Esta acción no se puede deshacer.',
          'Borrar todo',
          () => {
            borrarTodo();
            navigation.reset({ index: 0, routes: [{ name: 'Portada' }] });
          }
        );
        break;
    }
  }

  const logroAnunciado = logrosNuevos[0];

  return (
    <SafeAreaView style={styles.marco} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.tarjeta}>
        {logroAnunciado && (
          <LogroToast
            logro={logroAnunciado}
            onTerminar={() => marcarLogroVisto(logroAnunciado.id)}
            onPress={() => {
              marcarLogroVisto(logroAnunciado.id);
              navigation.navigate('Logros');
            }}
          />
        )}

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contenido}>
          <View style={styles.encabezado}>
            <View>
              <Text style={styles.appNombre}>{NOMBRE_APP[servicioActivo]}</Text>
              {nombre ? <Text style={styles.saludo}>Hola, {nombre}</Text> : null}
            </View>
            <View style={styles.acciones}>
              <Pressable onPress={verAlertas} hitSlop={10} accessibilityLabel="Ver alertas">
                <Ionicons name="notifications-outline" size={22} color={colors.textSecondary} />
                {hayAlertas && <View style={styles.punto} />}
              </Pressable>
              <Pressable onPress={() => setMenuAbierto(true)} hitSlop={6} accessibilityLabel="Abrir menú de usuario">
                <Avatar nombre={nombre} size={32} />
              </Pressable>
            </View>
          </View>

          <View style={styles.zonaMascota}>
            <Mascota
              key={servicioActivo}
              servicio={servicioActivo}
              estado={a.estado}
              size={150}
              etapa={prog.etapa.nivel}
              accesorios={datos.accesorios[servicioActivo]}
              interactivo
            />
            <Text style={[styles.estado, { color: colorEstado }]}>
              {NOMBRE_MASCOTA[servicioActivo]} {ESTADO_TEXTO[a.estado]}
            </Text>
            <Text style={styles.estadoSub}>{subtitulo}</Text>

            <View style={styles.insignias}>
              <Pressable
                style={styles.insignia}
                onPress={() => navigation.navigate('Evolucion', { servicio: servicioActivo })}
                accessibilityRole="button"
              >
                <Ionicons name="star" size={13} color={palette.primary} />
                <Text style={styles.insigniaTexto}>
                  Etapa {prog.etapa.nivel} · {prog.etapa.nombre}
                </Text>
              </Pressable>
              <Pressable
                style={styles.insignia}
                onPress={() => navigation.navigate('Logros')}
                accessibilityRole="button"
              >
                <Ionicons name="flame" size={13} color={prog.rachaActual > 0 ? colors.oro : colors.textMuted} />
                <Text style={styles.insigniaTexto}>
                  Racha {prog.rachaActual} {prog.rachaActual === 1 ? 'mes' : 'meses'}
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.metricas}>
            <MetricCard
              label="Consumo actual"
              value={a.actual ? `${formatValor(a.actual.valor)} ${unidad}` : '—'}
              nota={`Estándar: ${formatValor(estandares[servicioActivo])} ${unidad}`}
            />
            <MetricCard
              label="Vs. mes anterior"
              value={formatVariacion(a.variacionPorc)}
              valueColor={colorVariacion}
            />
          </View>

          <View style={styles.metricas}>
            <MetricCard
              label="Costo estimado"
              value={costoActual !== null ? formatPesos(costoActual) : '—'}
              nota={`${formatPesos(tarifa)} por ${unidad}`}
            />
            <MetricCard
              label={diferencia !== null && diferencia > 0 ? 'Gasto extra' : 'Ahorro del mes'}
              value={diferencia !== null ? formatPesos(Math.abs(diferencia)) : '—'}
              valueColor={
                diferencia === null || diferencia === 0
                  ? undefined
                  : diferencia > 0
                  ? colors.danger
                  : colors.success
              }
              nota="vs. mes anterior"
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

          <HistorialBarras
            servicio={servicioActivo}
            registros={datos.registros[servicioActivo]}
            onVerTodo={() => navigation.navigate('Historial', { servicio: servicioActivo })}
          />

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
        </ScrollView>

        <ServiceToggle servicioActivo={servicioActivo} onChange={setServicioActivo} />
      </View>

      <MenuUsuario
        visible={menuAbierto}
        onCerrar={() => setMenuAbierto(false)}
        onSeleccionar={alElegirMenu}
      />
    </SafeAreaView>
  );
}

const crearEstilos = (c: Palette) =>
  StyleSheet.create({
    marco: {
      flex: 1,
      backgroundColor: c.background,
      padding: 12,
    },
    tarjeta: {
      flex: 1,
      backgroundColor: c.surface,
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
      color: c.textPrimary,
    },
    saludo: {
      fontSize: 12,
      color: c.textSecondary,
      marginTop: 1,
    },
    acciones: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    punto: {
      position: 'absolute',
      top: 0,
      right: 1,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: c.danger,
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
      color: c.textSecondary,
      marginTop: 2,
      textAlign: 'center',
    },
    insignias: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 10,
    },
    insignia: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: c.background,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    insigniaTexto: {
      fontSize: 11,
      color: c.textPrimary,
      fontWeight: '500',
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
      color: c.textPrimary,
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
      fontWeight: '500',
      fontSize: 14,
    },
  });
