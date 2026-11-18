import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';

// Logo de EcoPet: una gota (agua) y un rayo (luz) unidos, igual que en la portada.
export function Logo({ size = 128 }: { size?: number }) {
  const { colors } = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 128 128" accessibilityLabel="Logo de EcoPet">
      <Circle cx={64} cy={64} r={60} fill={colors.background} />
      <Path
        d="M50 30 C50 30 30 56 30 72 C30 85 39 94 50 94 C61 94 70 85 70 72 C70 56 50 30 50 30 Z"
        fill={colors.agua.primary}
      />
      <Path d="M84 34 L64 76 L80 76 L74 106 L100 62 L84 62 Z" fill={colors.luz.primary} />
    </Svg>
  );
}
