import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { Palette, ServiceType } from '@/theme/colors';
import { useStyles, useTheme } from '@/theme/ThemeContext';
import { useApp } from '@/context/AppContext';
import { OpcionChip } from '@/components/OpcionChip';
import { Contador } from '@/components/Contador';
import { BarraProgreso } from '@/components/BarraProgreso';
import { calcularEstandares, desgloseEstandar } from '@/store/perfil';
import { UNIDADES } from '@/store/consumo';
import { formatValor } from '@/utils/format';
import type { PerfilHogar } from '@/store/types';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'EncuestaHogar'>;

const PERFIL_INICIAL: PerfilHogar = {
  nombre: '',
  personas: 3,
  vivienda: 'apartamento',
  tamano: 65,
  habitaciones: 2,
  banos: 1,
  estrato: 3,
  lavadora: true,
  jardin: false,
  aireAcondicionado: false,
  calentador: 'gas',
  teletrabajo: false,
};

const TAMANOS = [
  { valor: 40, label: 'Menos de 50 m²' },
  { valor: 65, label: '50 – 80 m²' },
  { valor: 100, label: '80 – 120 m²' },
  { valor: 160, label: '120 – 200 m²' },
  { valor: 240, label: 'Más de 200 m²' },
];

interface Paso {
  titulo: string;
  subtitulo?: string;
  contenido: React.ReactNode;
  valido: boolean;
}

export function EncuestaHogarScreen({ route, navigation }: Props) {
  const { modo } = route.params;
  const { colors } = useTheme();
  const styles = useStyles(crearEstilos);
  const { datos, guardarPerfil } = useApp();
  const acento = colors.agua;

  const [p, setP] = useState<PerfilHogar>(datos.perfil ?? PERFIL_INICIAL);
  const [paso, setPaso] = useState(0);

  const set = <K extends keyof PerfilHogar>(clave: K, valor: PerfilHogar[K]) =>
    setP((prev) => ({ ...prev, [clave]: valor }));

  const chip = (label: string, seleccionada: boolean, onPress: () => void) => (
    <OpcionChip
      key={label}
      label={label}
      seleccionada={seleccionada}
      onPress={onPress}
      colorActivo={acento.primary}
      colorTextoActivo={acento.dark}
    />
  );

  const siNo = (etiqueta: string, clave: 'lavadora' | 'jardin' | 'aireAcondicionado' | 'teletrabajo') => (
    <View style={styles.pregunta}>
      <Text style={styles.preguntaTexto}>{etiqueta}</Text>
      <View style={styles.opciones} accessibilityRole="radiogroup">
        {chip('Sí', p[clave], () => set(clave, true))}
        {chip('No', !p[clave], () => set(clave, false))}
      </View>
    </View>
  );

  const estandares = calcularEstandares(p);
  const resumenServicio = (s: ServiceType) => (
    <View key={s} style={styles.resumen}>
      <View style={styles.resumenCabecera}>
        <Ionicons name={s === 'agua' ? 'water' : 'flash'} size={18} color={colors[s].primary} />
        <Text style={styles.resumenTitulo}>{s === 'agua' ? 'Agua' : 'Luz'}</Text>
        <Text style={[styles.resumenValor, { color: colors[s].text }]}>
          {formatValor(estandares[s])} {UNIDADES[s]}/mes
        </Text>
      </View>
      {desgloseEstandar(p, s).map((item) => (
        <View key={item.concepto} style={styles.resumenFila}>
          <Text style={styles.resumenConcepto}>{item.concepto}</Text>
          <Text style={styles.resumenConcepto}>+{formatValor(item.valor)}</Text>
        </View>
      ))}
    </View>
  );

  const pasos: Paso[] = [
    {
      titulo: '¿Cómo te llamas?',
      subtitulo: 'Así te saludarán Gotín y Voltín.',
      valido: p.nombre.trim().length > 0,
      contenido: (
        <TextInput
          value={p.nombre}
          onChangeText={(t) => set('nombre', t)}
          placeholder="Tu nombre"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          autoCapitalize="words"
          maxLength={30}
          returnKeyType="next"
          onSubmitEditing={() => modo === 'inicial' && p.nombre.trim() && setPaso(1)}
          accessibilityLabel="Tu nombre"
        />
      ),
    },
    {
      titulo: '¿Cuántas personas viven en tu hogar?',
      subtitulo: 'Es lo que más influye en el consumo de agua y luz.',
      valido: true,
      contenido: <Contador etiqueta="Personas" valor={p.personas} min={1} max={15} onChange={(v) => set('personas', v)} />,
    },
    {
      titulo: '¿Cómo es tu vivienda?',
      valido: true,
      contenido: (
        <>
          <View style={styles.pregunta}>
            <Text style={styles.preguntaTexto}>Tipo</Text>
            <View style={styles.opciones}>
              {chip('Apartamento', p.vivienda === 'apartamento', () => set('vivienda', 'apartamento'))}
              {chip('Casa', p.vivienda === 'casa', () => set('vivienda', 'casa'))}
            </View>
          </View>
          <View style={styles.pregunta}>
            <Text style={styles.preguntaTexto}>Tamaño aproximado</Text>
            <View style={styles.opciones}>
              {TAMANOS.map((t) => chip(t.label, p.tamano === t.valor, () => set('tamano', t.valor)))}
            </View>
          </View>
        </>
      ),
    },
    {
      titulo: 'Espacios de la vivienda',
      valido: true,
      contenido: (
        <>
          <Contador etiqueta="Habitaciones" valor={p.habitaciones} min={1} max={10} onChange={(v) => set('habitaciones', v)} />
          <Contador etiqueta="Baños" valor={p.banos} min={1} max={8} onChange={(v) => set('banos', v)} />
        </>
      ),
    },
    {
      titulo: '¿En qué estrato está tu vivienda?',
      subtitulo: 'Lo usamos para estimar la tarifa de tus servicios. Puedes cambiarla después.',
      valido: true,
      contenido: (
        <View style={styles.opciones}>
          {[1, 2, 3, 4, 5, 6].map((e) => chip(`Estrato ${e}`, p.estrato === e, () => set('estrato', e)))}
        </View>
      ),
    },
    {
      titulo: 'Equipos y hábitos',
      valido: true,
      contenido: (
        <>
          {siNo('¿Tienen lavadora?', 'lavadora')}
          {siNo('¿Riegan jardín o plantas?', 'jardin')}
          {siNo('¿Usan aire acondicionado?', 'aireAcondicionado')}
          {siNo('¿Alguien trabaja o estudia desde casa?', 'teletrabajo')}
          <View style={styles.pregunta}>
            <Text style={styles.preguntaTexto}>Calentador de agua o ducha</Text>
            <View style={styles.opciones}>
              {chip('Eléctrico', p.calentador === 'electrico', () => set('calentador', 'electrico'))}
              {chip('A gas', p.calentador === 'gas', () => set('calentador', 'gas'))}
              {chip('No tenemos', p.calentador === 'ninguno', () => set('calentador', 'ninguno'))}
            </View>
          </View>
        </>
      ),
    },
    {
      titulo: 'Tu consumo de referencia',
      subtitulo: 'Con tus respuestas calculamos el consumo esperado para tu hogar. Si te pasas, tu mascota se pondrá triste.',
      valido: true,
      contenido: (
        <>
          {resumenServicio('agua')}
          {resumenServicio('luz')}
        </>
      ),
    },
  ];

  // Transición suave entre pasos.
  const transicion = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    transicion.setValue(0);
    Animated.timing(transicion, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [paso, transicion]);

  function guardar() {
    guardarPerfil({ ...p, nombre: p.nombre.trim() });
    if (modo === 'inicial') navigation.replace('Home');
    else navigation.goBack();
  }

  const todoValido = pasos.every((x) => x.valido);

  // Edición: todas las preguntas en una sola pantalla.
  if (modo === 'editar') {
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.pantalla} contentContainerStyle={styles.edicion}>
          {pasos.map((x) => (
            <View key={x.titulo} style={styles.tarjeta}>
              <Text style={styles.tituloSeccion}>{x.titulo}</Text>
              {x.contenido}
            </View>
          ))}
          <Pressable
            style={[styles.boton, { backgroundColor: acento.primary }, !todoValido && styles.inactivo]}
            onPress={guardar}
            disabled={!todoValido}
            accessibilityRole="button"
          >
            <Text style={[styles.botonTexto, { color: acento.dark }]}>
              {todoValido ? 'Guardar cambios' : 'Escribe tu nombre para guardar'}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  const actual = pasos[paso];
  const esUltimo = paso === pasos.length - 1;

  return (
    <SafeAreaView style={styles.pantalla}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.tarjeta, styles.asistente]}>
          <View style={styles.progreso}>
            <Text style={styles.pasoTexto}>
              Paso {paso + 1} de {pasos.length}
            </Text>
            <BarraProgreso progreso={(paso + 1) / pasos.length} color={acento.primary} />
          </View>

          <Animated.View
            style={{
              flex: 1,
              opacity: transicion,
              transform: [{ translateX: transicion.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
            }}
          >
            <ScrollView contentContainerStyle={{ paddingBottom: 12 }} keyboardShouldPersistTaps="handled">
              <Text style={styles.titulo}>{actual.titulo}</Text>
              {actual.subtitulo && <Text style={styles.subtitulo}>{actual.subtitulo}</Text>}
              <View style={{ marginTop: 16 }}>{actual.contenido}</View>
            </ScrollView>
          </Animated.View>

          <View style={styles.navegacion}>
            {paso > 0 && (
              <Pressable style={styles.botonSecundario} onPress={() => setPaso(paso - 1)} accessibilityRole="button">
                <Ionicons name="arrow-back" size={16} color={colors.textPrimary} />
                <Text style={styles.botonSecundarioTexto}>Atrás</Text>
              </Pressable>
            )}
            <Pressable
              style={[styles.boton, styles.botonPrincipal, { backgroundColor: acento.primary }, !actual.valido && styles.inactivo]}
              onPress={() => (esUltimo ? guardar() : setPaso(paso + 1))}
              disabled={!actual.valido}
              accessibilityRole="button"
            >
              <Text style={[styles.botonTexto, { color: acento.dark }]}>{esUltimo ? '¡Empezar!' : 'Siguiente'}</Text>
              {!esUltimo && <Ionicons name="arrow-forward" size={16} color={acento.dark} />}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const crearEstilos = (c: Palette) =>
  StyleSheet.create({
    pantalla: {
      flex: 1,
      backgroundColor: c.background,
      padding: 12,
    },
    edicion: {
      gap: 12,
      paddingBottom: 32,
    },
    tarjeta: {
      backgroundColor: c.surface,
      borderRadius: 20,
      padding: 20,
    },
    asistente: {
      flex: 1,
    },
    progreso: {
      gap: 6,
      marginBottom: 20,
    },
    pasoTexto: {
      fontSize: 12,
      color: c.textSecondary,
    },
    titulo: {
      fontSize: 22,
      fontWeight: '600',
      color: c.textPrimary,
    },
    tituloSeccion: {
      fontSize: 16,
      fontWeight: '600',
      color: c.textPrimary,
      marginBottom: 12,
    },
    subtitulo: {
      fontSize: 13,
      color: c.textSecondary,
      marginTop: 6,
      lineHeight: 19,
    },
    input: {
      fontSize: 20,
      color: c.textPrimary,
      backgroundColor: c.background,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 14,
    },
    pregunta: {
      marginBottom: 16,
    },
    preguntaTexto: {
      fontSize: 14,
      fontWeight: '500',
      color: c.textPrimary,
      marginBottom: 8,
    },
    opciones: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    resumen: {
      backgroundColor: c.background,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
      gap: 4,
    },
    resumenCabecera: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
    },
    resumenTitulo: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: c.textPrimary,
    },
    resumenValor: {
      fontSize: 16,
      fontWeight: '600',
    },
    resumenFila: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    resumenConcepto: {
      fontSize: 12,
      color: c.textSecondary,
    },
    navegacion: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 8,
    },
    boton: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
      borderRadius: 10,
      paddingVertical: 14,
    },
    botonPrincipal: {
      flex: 1,
    },
    botonTexto: {
      fontWeight: '600',
      fontSize: 15,
    },
    botonSecundario: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 18,
      borderRadius: 10,
      backgroundColor: c.background,
    },
    botonSecundarioTexto: {
      fontSize: 14,
      color: c.textPrimary,
    },
    inactivo: {
      opacity: 0.45,
    },
  });
