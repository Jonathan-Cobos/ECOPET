import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { darkColors, lightColors, Palette } from './colors';
import type { PreferenciaTema } from '@/store/types';

interface ThemeValue {
  colors: Palette;
  esOscuro: boolean;
}

const ThemeContext = createContext<ThemeValue>({ colors: lightColors, esOscuro: false });

export function ThemeProvider({
  preferencia,
  children,
}: {
  preferencia: PreferenciaTema;
  children: React.ReactNode;
}) {
  const sistema = useColorScheme();
  const esOscuro = preferencia === 'oscuro' || (preferencia === 'sistema' && sistema === 'dark');
  const value = useMemo(
    () => ({ colors: esOscuro ? darkColors : lightColors, esOscuro }),
    [esOscuro]
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

/** Crea los estilos de un componente a partir de la paleta activa (clara u oscura). */
export function useStyles<T>(crear: (c: Palette) => T): T {
  const { colors } = useTheme();
  return useMemo(() => crear(colors), [crear, colors]);
}
