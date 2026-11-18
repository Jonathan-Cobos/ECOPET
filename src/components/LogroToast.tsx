import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Palette } from '@/theme/colors';
import { useStyles, useTheme } from '@/theme/ThemeContext';
import type { EstadoLogro } from '@/store/progreso';

interface Props {
  logro: EstadoLogro;
  onTerminar: () => void;
  onPress?: () => void;
}

// Aviso que baja desde arriba cuando se desbloquea un logro.
export function LogroToast({ logro, onTerminar, onPress }: Props) {
  const { colors } = useTheme();
  const styles = useStyles(crearEstilos);
  const anim = useRef(new Animated.Value(0)).current;
  const terminar = useRef(onTerminar);
  terminar.current = onTerminar;

  useEffect(() => {
    anim.setValue(0);
    const secuencia = Animated.sequence([
      Animated.spring(anim, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
      Animated.delay(2800),
      Animated.timing(anim, { toValue: 0, duration: 250, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]);
    secuencia.start(({ finished }) => {
      if (finished) terminar.current();
    });
    return () => secuencia.stop();
  }, [logro.id, anim]);

  return (
    <Animated.View
      style={[
        styles.contenedor,
        {
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-60, 0] }) }],
        },
      ]}
    >
      <Pressable style={styles.toast} onPress={onPress} accessibilityRole="alert">
        <View style={[styles.icono, { backgroundColor: colors.oro }]}>
          <Ionicons name={logro.icono} size={18} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.titulo}>¡Logro desbloqueado!</Text>
          <Text style={styles.nombre}>{logro.titulo}</Text>
        </View>
        <Ionicons name="trophy" size={18} color={colors.oro} />
      </Pressable>
    </Animated.View>
  );
}

const crearEstilos = (c: Palette) =>
  StyleSheet.create({
    contenedor: {
      position: 'absolute',
      top: 8,
      left: 8,
      right: 8,
      zIndex: 10,
    },
    toast: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: c.surface,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: c.oro,
      padding: 10,
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 4,
    },
    icono: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titulo: {
      fontSize: 11,
      color: c.textSecondary,
    },
    nombre: {
      fontSize: 14,
      fontWeight: '600',
      color: c.textPrimary,
    },
  });
