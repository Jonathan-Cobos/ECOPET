import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

interface Props {
  /** 0 a 1 */
  progreso: number;
  color: string;
  alto?: number;
}

export function BarraProgreso({ progreso, color, alto = 6 }: Props) {
  const { colors } = useTheme();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: Math.max(0, Math.min(1, progreso)),
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progreso, anim]);

  return (
    <View
      style={{ height: alto, borderRadius: alto / 2, backgroundColor: colors.border, overflow: 'hidden' }}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(progreso * 100) }}
    >
      <Animated.View
        style={{
          height: '100%',
          borderRadius: alto / 2,
          backgroundColor: color,
          width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
        }}
      />
    </View>
  );
}
