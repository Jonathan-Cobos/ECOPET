import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '@/theme/colors';
import { PortadaScreen } from '@/screens/PortadaScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { RegistrarConsumoScreen } from '@/screens/RegistrarConsumoScreen';
import { CuestionarioScreen } from '@/screens/CuestionarioScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
