import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider, useApp } from '@/context/AppContext';
import { ThemeProvider, useTheme } from '@/theme/ThemeContext';
import { RootNavigator } from '@/navigation/RootNavigator';

function BarraEstado() {
  const { esOscuro } = useTheme();
  return <StatusBar style={esOscuro ? 'light' : 'dark'} />;
}

// El tema depende de la preferencia guardada, por eso va dentro de AppProvider.
function ConTema() {
  const { datos } = useApp();
  return (
    <ThemeProvider preferencia={datos.preferencias.tema}>
      <BarraEstado />
      <RootNavigator />
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <ConTema />
      </AppProvider>
    </SafeAreaProvider>
  );
}
