import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { Palette } from '@/theme/colors';
import { useStyles, useTheme } from '@/theme/ThemeContext';
import { useApp } from '@/context/AppContext';
import { Logo } from '@/components/Logo';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Portada'>;

function Chip({ icono, texto, color }: { icono: 'water-outline' | 'flash-outline'; texto: string; color: string }) {
  const styles = useStyles(crearEstilos);
  return (
    <View style={styles.chip}>
      <Ionicons name={icono} size={16} color={color} />
      <Text style={styles.chipTexto}>{texto}</Text>
    </View>
  );
}

export function PortadaScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useStyles(crearEstilos);
  const { cargando, datos } = useApp();
  const entrada = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrada, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entrada]);

  const escala = entrada.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });
  const subida = entrada.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });

  // La primera vez se pasa por la encuesta del hogar para calcular los estándares.
  function comenzar() {
    if (datos.perfil) navigation.replace('Home');
    else navigation.replace('EncuestaHogar', { modo: 'inicial' });
  }

  return (
    <SafeAreaView style={styles.marco}>
      <View style={styles.tarjeta}>
        <Animated.View style={{ opacity: entrada, transform: [{ scale: escala }] }}>
          <Logo size={150} />
        </Animated.View>

        <Animated.View style={[styles.textos, { opacity: entrada, transform: [{ translateY: subida }] }]}>
          <Text style={styles.titulo}>EcoPet</Text>
          <Text style={styles.lema}>Cuida tu consumo, cuida tu mascota</Text>

          <View style={styles.chips}>
            <Chip icono="water-outline" texto="Agua" color={colors.agua.primary} />
            <Chip icono="flash-outline" texto="Luz" color={colors.luz.primary} />
          </View>
        </Animated.View>

        <Animated.View style={[styles.accion, { opacity: entrada }]}>
          <Pressable
            style={[styles.boton, cargando && { opacity: 0.5 }]}
            onPress={comenzar}
            disabled={cargando}
            accessibilityRole="button"
          >
            <Text style={styles.botonTexto}>{datos.perfil ? 'Continuar' : 'Comenzar'}</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.surface} />
          </Pressable>
        </Animated.View>
      </View>
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
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 22,
      padding: 24,
    },
    textos: {
      alignItems: 'center',
    },
    titulo: {
      fontSize: 34,
      fontWeight: '500',
      color: c.textPrimary,
    },
    lema: {
      fontSize: 14,
      color: c.textSecondary,
      marginTop: 6,
      textAlign: 'center',
    },
    chips: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 20,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: c.background,
      paddingVertical: 7,
      paddingHorizontal: 14,
      borderRadius: 999,
    },
    chipTexto: {
      fontSize: 12,
      color: c.textSecondary,
    },
    accion: {
      position: 'absolute',
      bottom: 28,
      left: 24,
      right: 24,
    },
    boton: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      backgroundColor: c.textPrimary,
      borderRadius: 12,
      paddingVertical: 15,
    },
    botonTexto: {
      color: c.surface,
      fontSize: 15,
      fontWeight: '500',
    },
  });
