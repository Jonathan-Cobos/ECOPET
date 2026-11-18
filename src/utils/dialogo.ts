import { Alert, Platform } from 'react-native';

// En la web Alert.alert no muestra nada, así que se usan los diálogos del navegador.
const navegador = globalThis as unknown as {
  alert: (m: string) => void;
  confirm: (m: string) => boolean;
};

export function avisar(titulo: string, mensaje: string) {
  if (Platform.OS === 'web') {
    navegador.alert(`${titulo}\n\n${mensaje}`);
    return;
  }
  Alert.alert(titulo, mensaje);
}

export function confirmar(
  titulo: string,
  mensaje: string,
  textoAccion: string,
  onConfirmar: () => void
) {
  if (Platform.OS === 'web') {
    if (navegador.confirm(`${titulo}\n\n${mensaje}`)) onConfirmar();
    return;
  }
  Alert.alert(titulo, mensaje, [
    { text: 'Cancelar', style: 'cancel' },
    { text: textoAccion, style: 'destructive', onPress: onConfirmar },
  ]);
}
