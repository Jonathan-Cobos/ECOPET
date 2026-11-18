import React, { useMemo } from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useTheme } from '@/theme/ThemeContext';
import { PortadaScreen } from '@/screens/PortadaScreen';
import { EncuestaHogarScreen } from '@/screens/EncuestaHogarScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { RegistrarConsumoScreen } from '@/screens/RegistrarConsumoScreen';
import { CuestionarioScreen } from '@/screens/CuestionarioScreen';
import { HistorialScreen } from '@/screens/HistorialScreen';
import { LogrosScreen } from '@/screens/LogrosScreen';
import { EvolucionScreen } from '@/screens/EvolucionScreen';
import { TarifasScreen } from '@/screens/TarifasScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { colors, esOscuro } = useTheme();

  const tema = useMemo(() => {
    const base = esOscuro ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: colors.background,
        card: colors.surface,
        text: colors.textPrimary,
        border: colors.border,
      },
    };
  }, [colors, esOscuro]);

  return (
    <NavigationContainer theme={tema}>
      <Stack.Navigator
        initialRouteName="Portada"
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTitleStyle: { color: colors.textPrimary, fontWeight: '500' },
          headerTintColor: colors.textPrimary,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Portada" component={PortadaScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="EncuestaHogar"
          component={EncuestaHogarScreen}
          options={({ route }) => ({
            headerShown: route.params.modo === 'editar',
            title: 'Datos del hogar',
            animation: route.params.modo === 'inicial' ? 'fade' : 'default',
          })}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false, animation: 'fade' }}
        />
        <Stack.Screen
          name="RegistrarConsumo"
          component={RegistrarConsumoScreen}
          options={{ title: 'Nuevo registro', presentation: 'modal' }}
        />
        <Stack.Screen
          name="Cuestionario"
          component={CuestionarioScreen}
          options={{ title: 'Cuestionario de hábitos' }}
        />
        <Stack.Screen name="Historial" component={HistorialScreen} options={{ title: 'Historial' }} />
        <Stack.Screen name="Logros" component={LogrosScreen} options={{ title: 'Logros' }} />
        <Stack.Screen
          name="Evolucion"
          component={EvolucionScreen}
          options={{ title: 'Mascota y accesorios' }}
        />
        <Stack.Screen name="Tarifas" component={TarifasScreen} options={{ title: 'Tarifas y costos' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
