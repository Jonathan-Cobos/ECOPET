import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { Palette } from '@/theme/colors';
import { useStyles, useTheme } from '@/theme/ThemeContext';
import { useApp } from '@/context/AppContext';
import { OpcionChip } from '@/components/OpcionChip';
import type { RootStackParamList } from '@/navigation/types';
import type { RespuestasCuestionario } from '@/store/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Cuestionario'>;

interface Pregunta {
  key: string;
  texto: string;
  opciones: { valor: string | number; label: string }[];
}

const SI_NO = [
  { valor: 'si', label: 'Sí' },
  { valor: 'no', label: 'No' },
];

// Las claves coinciden con las que usan recomendaciones.ts y el backend.
const PREGUNTAS: Record<'agua' | 'luz', Pregunta[]> = {
  agua: [
    {
      key: 'tiempoDucha',
      texto: '¿Cuánto dura cada ducha en tu casa, en promedio?',
      opciones: [
        { valor: 5, label: '5 min' },
        { valor: 10, label: '10 min' },
        { valor: 15, label: '15 min' },
        { valor: 20, label: '20+ min' },
      ],
    },
    {
      key: 'vecesLavadora',
      texto: '¿Cuántas veces a la semana usan la lavadora?',
      opciones: [
        { valor: 2, label: '1-2' },
        { valor: 4, label: '3-4' },
        { valor: 6, label: '5-6' },
        { valor: 7, label: 'Todos los días' },
      ],
    },
    { key: 'fugaVisible', texto: '¿Has notado goteos o fugas visibles?', opciones: SI_NO },
    { key: 'riegoFrecuente', texto: '¿Riegan plantas o jardín con frecuencia?', opciones: SI_NO },
  ],
  luz: [
    {
      key: 'horasClimatizacion',
      texto: '¿Cuántas horas al día usan aire acondicionado o calefacción?',
      opciones: [
        { valor: 0, label: '0' },
        { valor: 3, label: '1-3 h' },
        { valor: 6, label: '4-6 h' },
        { valor: 10, label: '7+ h' },
      ],
    },
    {
      key: 'electrodomesticosAntiguos',
      texto: '¿Tienen electrodomésticos de más de 10 años?',
      opciones: SI_NO,
    },
    {
      key: 'lucesEncendidas',
      texto: '¿Suelen quedar luces encendidas en espacios vacíos?',
      opciones: SI_NO,
    },
    {
      key: 'horasPantallas',
      texto: '¿Cuántas horas al día están encendidos TV y PC?',
      opciones: [
        { valor: 2, label: '0-2 h' },
        { valor: 5, label: '3-5 h' },
        { valor: 8, label: '6-8 h' },
        { valor: 10, label: '9+ h' },
      ],
    },
  ],
};

export function CuestionarioScreen({ route, navigation }: Props) {
  const { servicio } = route.params;
  const { responderCuestionario } = useApp();
  const { colors } = useTheme();
  const styles = useStyles(crearEstilos);
  const palette = colors[servicio];
  const preguntas = PREGUNTAS[servicio];

  const [respuestas, setRespuestas] = useState<RespuestasCuestionario>({});
  const [recomendacion, setRecomendacion] = useState<string | null>(null);

  const completo = preguntas.every((p) => respuestas[p.key] !== undefined);

  function enviar() {
    setRecomendacion(responderCuestionario(servicio, respuestas));
  }

  if (recomendacion) {
    return (
      <View style={styles.pantalla}>
        <View style={styles.tarjeta}>
          <Text style={[styles.tituloRecomendacion, { color: palette.text }]}>Tu recomendación</Text>
          <Text style={styles.textoRecomendacion}>{recomendacion}</Text>
          <Pressable
            style={[styles.boton, { backgroundColor: palette.primary }]}
            onPress={() => navigation.popToTop()}
            accessibilityRole="button"
          >
            <Text style={[styles.botonTexto, { color: palette.dark }]}>Volver al inicio</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.pantalla}>
      <ScrollView style={styles.tarjeta} contentContainerStyle={{ paddingBottom: 8 }}>
        <Text style={styles.titulo}>Hábitos de {servicio}</Text>
        <Text style={styles.subtitulo}>
          Tu consumo superó el estándar. Responde para recibir una recomendación personalizada.
        </Text>

        {preguntas.map((p) => (
          <View key={p.key} style={styles.pregunta}>
            <Text style={styles.preguntaTexto}>{p.texto}</Text>
            <View style={styles.opciones} accessibilityRole="radiogroup">
              {p.opciones.map((o) => (
                <OpcionChip
                  key={String(o.valor)}
                  label={o.label}
                  seleccionada={respuestas[p.key] === o.valor}
                  onPress={() => setRespuestas((prev) => ({ ...prev, [p.key]: o.valor }))}
                  colorActivo={palette.primary}
                  colorTextoActivo={palette.dark}
                />
              ))}
            </View>
          </View>
        ))}

        <Pressable
          style={[
            styles.boton,
            { backgroundColor: palette.primary },
            !completo && styles.botonInactivo,
          ]}
          onPress={enviar}
          disabled={!completo}
          accessibilityRole="button"
          accessibilityState={{ disabled: !completo }}
        >
          <Text style={[styles.botonTexto, { color: palette.dark }]}>
            {completo ? 'Ver mi recomendación' : 'Responde todas las preguntas'}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const crearEstilos = (c: Palette) =>
  StyleSheet.create({
    pantalla: {
      flex: 1,
      backgroundColor: c.background,
      padding: 12,
    },
    tarjeta: {
      backgroundColor: c.surface,
      borderRadius: 20,
      padding: 20,
    },
    titulo: {
      fontSize: 18,
      fontWeight: '500',
      color: c.textPrimary,
    },
    subtitulo: {
      fontSize: 13,
      color: c.textSecondary,
      marginTop: 4,
      marginBottom: 20,
      lineHeight: 18,
    },
    pregunta: {
      marginBottom: 20,
    },
    preguntaTexto: {
      fontSize: 14,
      fontWeight: '500',
      color: c.textPrimary,
      marginBottom: 10,
    },
    opciones: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    boton: {
      borderRadius: 8,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 8,
    },
    botonInactivo: {
      opacity: 0.45,
    },
    botonTexto: {
      fontWeight: '500',
      fontSize: 14,
    },
    tituloRecomendacion: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 8,
    },
    textoRecomendacion: {
      fontSize: 14,
      color: c.textPrimary,
      lineHeight: 21,
      marginBottom: 20,
    },
  });
