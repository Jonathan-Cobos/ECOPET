import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { colors, ServiceType } from '@/theme/colors';
import type { EstadoMascota } from '@/store/types';

interface Props {
  servicio: ServiceType;
  estado: EstadoMascota;
  size?: number;
}

// Caras por servicio y estado (coordenadas del viewBox 120x120 de los mockups).
const CARAS = {
  agua: {
    ojos: [
      [48, 70],
      [72, 70],
    ],
    boca: {
      feliz: 'M46 84 Q60 94 74 84',
      neutral: 'M48 88 L72 88',
      decaido: 'M46 90 Q60 80 74 90',
    },
  },
  luz: {
    ojos: [
      [52, 66],
      [70, 66],
    ],
    boca: {
      feliz: 'M50 76 Q60 84 70 76',
      neutral: 'M52 78 L68 78',
      decaido: 'M50 80 Q60 74 70 80',
    },
  },
} as const;

const CUERPO_AGUA =
  'M60 24 C60 24 34 56 34 74 C34 89 46 100 60 100 C74 100 86 89 86 74 C86 56 60 24 60 24 Z';
const CUERPO_LUZ = 'M64 20 L40 68 L58 68 L52 104 L84 58 L64 58 Z';

export function Mascota({ servicio, estado, size = 120 }: Props) {
  const palette = servicio === 'agua' ? colors.agua : colors.luz;
  const cara = CARAS[servicio];
  const moVimiento = useRef(new Animated.Value(0)).current;

  // Feliz: salta contento. Neutral: respira. Decaído: se balancea despacio.
  useEffect(() => {
    const duracion = estado === 'feliz' ? 650 : estado === 'neutral' ? 1400 : 2200;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(moVimiento, {
          toValue: 1,
          duration: duracion,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(moVimiento, {
          toValue: 0,
          duration: duracion,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [estado, moVimiento]);

  const translateY = moVimiento.interpolate({
    inputRange: [0, 1],
    outputRange: estado === 'feliz' ? [0, -8] : estado === 'neutral' ? [0, -3] : [0, 2],
  });
  const rotate = moVimiento.interpolate({
    inputRange: [0, 1],
    outputRange: estado === 'decaido' ? ['-3deg', '3deg'] : ['0deg', '0deg'],
  });

  const rellenoCuerpo =
    servicio === 'agua' ? colors.agua.primary : estado === 'decaido' ? '#BA7517' : colors.luz.primary;

  return (
    <View style={{ width: size, height: size }}>
      {/* La sombra queda fija en el suelo mientras la mascota se mueve. */}
      <Svg width={size} height={size} viewBox="0 0 120 120" style={StyleSheet.absoluteFill}>
        <Ellipse cx={60} cy={112} rx={34} ry={4} fill={colors.border} />
      </Svg>
      <Animated.View style={{ transform: [{ translateY }, { rotate }] }}>
        <Svg
          width={size}
          height={size}
          viewBox="0 0 120 120"
          accessibilityLabel={`Mascota de ${servicio}, estado ${estado}`}
        >
        <Circle
          cx={60}
          cy={66}
          r={42}
          fill={servicio === 'agua' ? colors.agua.soft : colors.luz.light}
          fillOpacity={servicio === 'agua' ? 1 : 0.5}
        />
        <Path d={servicio === 'agua' ? CUERPO_AGUA : CUERPO_LUZ} fill={rellenoCuerpo} />
        {cara.ojos.map(([x, y]) => (
          <Circle key={x} cx={x} cy={y} r={estado === 'decaido' ? 4.5 : 5} fill={palette.dark} />
        ))}
        <Path
          d={cara.boca[estado]}
          stroke={palette.dark}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
        </Svg>
      </Animated.View>
    </View>
  );
}
