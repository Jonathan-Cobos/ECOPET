import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { Palette } from '@/theme/colors';
import { useStyles, useTheme } from '@/theme/ThemeContext';
import { useApp } from '@/context/AppContext';
import { describirPerfil } from '@/store/perfil';
import type { PreferenciaTema } from '@/store/types';

export type OpcionMenu =
  | 'perfil'
  | 'historial'
  | 'logros'
  | 'evolucion'
  | 'tarifas'
  | 'restablecer'
  | 'borrar';

type Icono = React.ComponentProps<typeof Ionicons>['name'];

export function Avatar({ nombre, size = 34 }: { nombre?: string; size?: number }) {
  const { colors } = useTheme();
  const inicial = nombre?.trim().charAt(0).toUpperCase();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.agua.soft,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {inicial ? (
        <Text style={{ fontSize: size * 0.45, fontWeight: '600', color: colors.agua.dark }}>{inicial}</Text>
      ) : (
        <Ionicons name="person" size={size * 0.5} color={colors.agua.dark} />
      )}
    </View>
  );
}

const TEMAS: { valor: PreferenciaTema; label: string; icono: Icono }[] = [
  { valor: 'claro', label: 'Claro', icono: 'sunny-outline' },
  { valor: 'oscuro', label: 'Oscuro', icono: 'moon-outline' },
  { valor: 'sistema', label: 'Sistema', icono: 'phone-portrait-outline' },
];

interface Props {
  visible: boolean;
  onCerrar: () => void;
  onSeleccionar: (opcion: OpcionMenu) => void;
}

// Menú desplegable del usuario: datos del hogar, secciones de la app y tema.
export function MenuUsuario({ visible, onCerrar, onSeleccionar }: Props) {
  const { colors } = useTheme();
  const styles = useStyles(crearEstilos);
  const insets = useSafeAreaInsets();
  const { datos, logros, setTema } = useApp();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [visible, anim]);

  const perfil = datos.perfil;
  const desbloqueados = logros.filter((l) => l.desbloqueado).length;

  const elegir = (o: OpcionMenu) => {
    onCerrar();
    onSeleccionar(o);
  };

  const Item = ({ icono, texto, opcion, extra, peligro }: { icono: Icono; texto: string; opcion: OpcionMenu; extra?: string; peligro?: boolean }) => (
    <Pressable
      onPress={() => elegir(opcion)}
      style={({ pressed }) => [styles.item, pressed && { backgroundColor: colors.background }]}
      accessibilityRole="menuitem"
    >
      <Ionicons name={icono} size={19} color={peligro ? colors.danger : colors.textSecondary} />
      <Text style={[styles.itemTexto, peligro && { color: colors.danger }]}>{texto}</Text>
      {extra ? <Text style={styles.extra}>{extra}</Text> : null}
    </Pressable>
  );

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onCerrar}>
      <Pressable style={[styles.fondo, { backgroundColor: colors.overlay }]} onPress={onCerrar} accessibilityLabel="Cerrar menú" />
      <Animated.View
        style={[
          styles.menu,
          {
            top: insets.top + 58,
            opacity: anim,
            transform: [
              { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) },
              { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
            ],
          },
        ]}
        accessibilityRole="menu"
      >
        <Pressable style={styles.cabecera} onPress={() => elegir('perfil')}>
          <Avatar nombre={perfil?.nombre} size={44} />
          <View style={{ flex: 1 }}>
            <Text style={styles.nombre} numberOfLines={1}>
              {perfil?.nombre ? `Hola, ${perfil.nombre}` : 'Tu hogar'}
            </Text>
            <Text style={styles.descripcion} numberOfLines={1}>
              {perfil ? describirPerfil(perfil) : 'Completa los datos de tu hogar'}
            </Text>
          </View>
          <Ionicons name="create-outline" size={18} color={colors.textSecondary} />
        </Pressable>

        <View style={styles.separador} />
        <Item icono="home-outline" texto="Datos del hogar" opcion="perfil" />
        <Item icono="time-outline" texto="Historial de consumo" opcion="historial" />
        <Item icono="trophy-outline" texto="Logros" opcion="logros" extra={`${desbloqueados}/${logros.length}`} />
        <Item icono="paw-outline" texto="Mascota y accesorios" opcion="evolucion" />
        <Item icono="cash-outline" texto="Tarifas y costos" opcion="tarifas" />

        <View style={styles.separador} />
        <Text style={styles.seccion}>Tema</Text>
        <View style={styles.temas} accessibilityRole="radiogroup">
          {TEMAS.map((t) => {
            const activo = datos.preferencias.tema === t.valor;
            return (
              <Pressable
                key={t.valor}
                onPress={() => setTema(t.valor)}
                style={[styles.tema, activo && { backgroundColor: colors.textPrimary }]}
                accessibilityRole="radio"
                accessibilityState={{ selected: activo }}
              >
                <Ionicons name={t.icono} size={16} color={activo ? colors.surface : colors.textSecondary} />
                <Text style={[styles.temaTexto, activo && { color: colors.surface, fontWeight: '600' }]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.separador} />
        <Item icono="refresh-outline" texto="Restablecer datos de ejemplo" opcion="restablecer" />
        <Item icono="trash-outline" texto="Borrar todo y empezar de cero" opcion="borrar" peligro />
      </Animated.View>
    </Modal>
  );
}

const crearEstilos = (c: Palette) =>
  StyleSheet.create({
    fondo: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    menu: {
      position: 'absolute',
      right: 20,
      width: 290,
      maxWidth: '90%',
      backgroundColor: c.surface,
      borderRadius: 16,
      paddingVertical: 8,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
      elevation: 8,
    },
    cabecera: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    nombre: {
      fontSize: 15,
      fontWeight: '600',
      color: c.textPrimary,
    },
    descripcion: {
      fontSize: 12,
      color: c.textSecondary,
      marginTop: 1,
    },
    separador: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: c.border,
      marginVertical: 6,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    itemTexto: {
      flex: 1,
      fontSize: 14,
      color: c.textPrimary,
    },
    extra: {
      fontSize: 12,
      color: c.textSecondary,
    },
    seccion: {
      fontSize: 11,
      color: c.textSecondary,
      paddingHorizontal: 16,
      paddingTop: 4,
      paddingBottom: 6,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    temas: {
      flexDirection: 'row',
      gap: 6,
      paddingHorizontal: 12,
      paddingBottom: 6,
    },
    tema: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: c.background,
    },
    temaTexto: {
      fontSize: 12,
      color: c.textSecondary,
    },
  });
