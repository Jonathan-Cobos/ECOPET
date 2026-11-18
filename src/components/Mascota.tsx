import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import type { ServiceType } from '@/theme/colors';
import { useTheme } from '@/theme/ThemeContext';
import type { AccesorioId, AccesoriosEquipados, EstadoMascota } from '@/store/types';

interface Props {
  servicio: ServiceType;
  estado: EstadoMascota;
  size?: number;
  /** Etapa de evolución, de 1 (Bebé) a 4 (Legendario). */
  etapa?: number;
  accesorios?: Partial<AccesoriosEquipados>;
  /** false = dibujo estático (vistas previas). */
  animado?: boolean;
  /** true = reacciona al tocarla. */
  interactivo?: boolean;
}

type Punto = readonly [number, number];

// Caras y puntos de anclaje por servicio (coordenadas del viewBox 120x120 de los mockups).
const CARAS = {
  agua: {
    ojos: [
      [48, 70],
      [72, 70],
    ] as Punto[],
    boca: {
      feliz: 'M46 84 Q60 94 74 84',
      neutral: 'M48 88 L72 88',
      decaido: 'M46 90 Q60 80 74 90',
    },
    mejillas: [
      [38, 82],
      [82, 82],
    ] as Punto[],
    radioGafas: 9,
    bigote: { x: 60, y: 81, escala: 1 },
    cabeza: { x: 60, y: 33 },
  },
  luz: {
    ojos: [
      [52, 66],
      [70, 66],
    ] as Punto[],
    boca: {
      feliz: 'M50 76 Q60 84 70 76',
      neutral: 'M52 78 L68 78',
      decaido: 'M50 80 Q60 74 70 80',
    },
    mejillas: [
      [45, 73],
      [77, 72],
    ] as Punto[],
    radioGafas: 7.5,
    bigote: { x: 61, y: 73, escala: 0.75 },
    cabeza: { x: 63, y: 28 },
  },
} as const;

const CUERPO_AGUA =
  'M60 24 C60 24 34 56 34 74 C34 89 46 100 60 100 C74 100 86 89 86 74 C86 56 60 24 60 24 Z';
const CUERPO_LUZ = 'M64 20 L40 68 L58 68 L52 104 L84 58 L64 58 Z';

// Cada etapa de evolución hace crecer un poco a la mascota.
const ESCALA_ETAPA = [0.78, 0.9, 1, 1];
const ORIGEN = { x: 60, y: 66 };

function Sombrero({ id, x, y }: { id: AccesorioId; x: number; y: number }) {
  const t = `translate(${x} ${y})`;
  switch (id) {
    case 'gorra':
      return (
        <G transform={t}>
          <Path d="M-15 0 A15 13 0 0 1 15 0 Z" fill="#D9473F" />
          <Path d="M8 -1 Q27 -2 27 3 Q18 5 8 3 Z" fill="#A8322C" />
          <Circle cx={0} cy={-13} r={2.2} fill="#A8322C" />
        </G>
      );
    case 'corona':
      return (
        <G transform={t}>
          <Path
            d="M-14 0 L-14 -14 L-7 -7 L0 -18 L7 -7 L14 -14 L14 0 Z"
            fill="#F2C230"
            stroke="#B8860B"
            strokeWidth={1.2}
            strokeLinejoin="round"
          />
          <Circle cx={0} cy={-4} r={2.4} fill="#D9473F" />
          <Circle cx={-8} cy={-3} r={1.6} fill="#378ADD" />
          <Circle cx={8} cy={-3} r={1.6} fill="#378ADD" />
        </G>
      );
    case 'mono':
      return (
        <G transform={t}>
          <Path d="M0 -4 L-13 -12 L-13 4 Z" fill="#E86FA6" stroke="#C2457F" strokeWidth={1} />
          <Path d="M0 -4 L13 -12 L13 4 Z" fill="#E86FA6" stroke="#C2457F" strokeWidth={1} />
          <Circle cx={0} cy={-4} r={3.5} fill="#C2457F" />
        </G>
      );
    default:
      return null;
  }
}

export function Mascota({
  servicio,
  estado,
  size = 120,
  etapa = 2,
  accesorios,
  animado = true,
  interactivo = false,
}: Props) {
  const { colors } = useTheme();
  const palette = colors[servicio];
  const cara = CARAS[servicio];
  const nivel = Math.min(Math.max(Math.round(etapa), 1), 4);
  const k = ESCALA_ETAPA[nivel - 1];
  const cabeza = accesorios?.cabeza ?? null;
  const caraAcc = accesorios?.cara ?? null;

  const movimiento = useRef(new Animated.Value(0)).current;
  const entrada = useRef(new Animated.Value(animado ? 0 : 1)).current;
  const salto = useRef(new Animated.Value(0)).current;
  const corazon = useRef(new Animated.Value(0)).current;
  const lagrima = useRef(new Animated.Value(0)).current;
  const brillo = useRef(new Animated.Value(0)).current;
  const [parpadeo, setParpadeo] = useState(false);
  const [mimado, setMimado] = useState(false);

  // Aparece con un pequeño rebote (al abrir o al cambiar de servicio).
  useEffect(() => {
    if (!animado) return;
    Animated.spring(entrada, { toValue: 1, friction: 5, tension: 70, useNativeDriver: true }).start();
  }, [animado, entrada]);

  // Feliz: salta contento. Neutral: respira. Decaído: se balancea despacio.
  useEffect(() => {
    if (!animado) return;
    const duracion = estado === 'feliz' ? 650 : estado === 'neutral' ? 1400 : 2200;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(movimiento, {
          toValue: 1,
          duration: duracion,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(movimiento, {
          toValue: 0,
          duration: duracion,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [animado, estado, movimiento]);

  // Parpadea cada pocos segundos.
  useEffect(() => {
    if (!animado) return;
    let abrir: ReturnType<typeof setTimeout>;
    let cerrar: ReturnType<typeof setTimeout>;
    const programar = () => {
      cerrar = setTimeout(() => {
        setParpadeo(true);
        abrir = setTimeout(() => {
          setParpadeo(false);
          programar();
        }, 140);
      }, 2500 + Math.random() * 2500);
    };
    programar();
    return () => {
      clearTimeout(abrir);
      clearTimeout(cerrar);
    };
  }, [animado]);

  // Decaído: le cae una lágrima.
  useEffect(() => {
    if (!animado || estado !== 'decaido') return;
    lagrima.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(lagrima, { toValue: 1, duration: 1500, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.delay(900),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [animado, estado, lagrima]);

  // Etapas Adulto y Legendario: destellos alrededor.
  useEffect(() => {
    if (!animado || nivel < 3) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(brillo, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(brillo, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [animado, nivel, brillo]);

  function acariciar() {
    setMimado(true);
    salto.setValue(0);
    corazon.setValue(0);
    Animated.parallel([
      Animated.sequence([
        Animated.timing(salto, { toValue: 1, duration: 140, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.spring(salto, { toValue: 0, friction: 3, tension: 120, useNativeDriver: true }),
      ]),
      Animated.timing(corazon, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start(() => setMimado(false));
  }

  const translateY = movimiento.interpolate({
    inputRange: [0, 1],
    outputRange: estado === 'feliz' ? [0, -8] : estado === 'neutral' ? [0, -3] : [0, 2],
  });
  const rotate = movimiento.interpolate({
    inputRange: [0, 1],
    outputRange: estado === 'decaido' ? ['-3deg', '3deg'] : ['0deg', '0deg'],
  });

  const rellenoCuerpo =
    servicio === 'agua' ? palette.primary : estado === 'decaido' ? '#BA7517' : palette.primary;
  const boca = mimado ? cara.boca.feliz : cara.boca[estado];

  // Posición en pantalla de un punto del dibujo, teniendo en cuenta la escala de la etapa.
  const enPantalla = ([x, y]: Punto) => ({
    left: ((ORIGEN.x + (x - ORIGEN.x) * k) / 120) * size,
    top: ((ORIGEN.y + (y - ORIGEN.y) * k) / 120) * size,
  });
  const ojoIzq = enPantalla(cara.ojos[0]);

  const dibujo = (
    <View style={{ width: size, height: size }}>
      {/* La sombra queda fija en el suelo mientras la mascota se mueve. */}
      <Svg width={size} height={size} viewBox="0 0 120 120" style={StyleSheet.absoluteFill}>
        <Ellipse cx={60} cy={112} rx={34 * k} ry={4} fill={colors.border} />
      </Svg>

      <Animated.View
        style={{
          opacity: entrada,
          transform: [
            { translateY: salto.interpolate({ inputRange: [0, 1], outputRange: [0, -16] }) },
            { scale: entrada.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
            { scale: salto.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) },
          ],
        }}
      >
        <Animated.View style={{ transform: [{ translateY }, { rotate }] }}>
          <Svg
            width={size}
            height={size}
            viewBox="0 0 120 120"
            accessibilityLabel={`Mascota de ${servicio}, estado ${estado}`}
          >
            <G scale={k} origin={`${ORIGEN.x}, ${ORIGEN.y}`}>
              {nivel >= 4 && (
                <Circle
                  cx={60}
                  cy={66}
                  r={48}
                  fill="none"
                  stroke={colors.oro}
                  strokeWidth={3}
                  strokeDasharray="6 5"
                  strokeOpacity={0.8}
                />
              )}
              <Circle
                cx={60}
                cy={66}
                r={42}
                fill={servicio === 'agua' ? palette.soft : palette.light}
                fillOpacity={servicio === 'agua' ? 1 : 0.5}
              />
              <Path d={servicio === 'agua' ? CUERPO_AGUA : CUERPO_LUZ} fill={rellenoCuerpo} />

              {nivel >= 2 &&
                cara.mejillas.map(([x, y]) => (
                  <Ellipse key={x} cx={x} cy={y} rx={4.5} ry={3} fill="#F28BA8" fillOpacity={0.55} />
                ))}

              {cara.ojos.map(([x, y]) =>
                mimado ? (
                  <Path
                    key={x}
                    d={`M${x - 5} ${y + 1} Q${x} ${y - 5} ${x + 5} ${y + 1}`}
                    stroke={palette.dark}
                    strokeWidth={2.5}
                    fill="none"
                    strokeLinecap="round"
                  />
                ) : (
                  <Ellipse
                    key={x}
                    cx={x}
                    cy={y}
                    rx={estado === 'decaido' ? 4.5 : 5}
                    ry={parpadeo ? 0.8 : estado === 'decaido' ? 4.5 : 5}
                    fill={palette.dark}
                  />
                )
              )}

              <Path d={boca} stroke={palette.dark} strokeWidth={3} fill="none" strokeLinecap="round" />

              {caraAcc === 'gafas' && (
                <G>
                  {cara.ojos.map(([x, y]) => (
                    <G key={x}>
                      <Circle cx={x} cy={y} r={cara.radioGafas} fill="#1F1F1F" stroke="#111111" strokeWidth={1.5} />
                      <Circle cx={x - 3} cy={y - 3} r={2} fill="#FFFFFF" fillOpacity={0.55} />
                    </G>
                  ))}
                  <Line
                    x1={cara.ojos[0][0] + cara.radioGafas}
                    y1={cara.ojos[0][1]}
                    x2={cara.ojos[1][0] - cara.radioGafas}
                    y2={cara.ojos[1][1]}
                    stroke="#111111"
                    strokeWidth={2}
                  />
                </G>
              )}
              {caraAcc === 'bigote' && (
                <Path
                  transform={`translate(${cara.bigote.x} ${cara.bigote.y}) scale(${cara.bigote.escala})`}
                  d="M0 0 Q-6 -6 -14 -1 Q-9 1 -4 3 Q-1 3 0 1 Q1 3 4 3 Q9 1 14 -1 Q6 -6 0 0 Z"
                  fill="#4A2F1B"
                />
              )}
              {cabeza && <Sombrero id={cabeza} x={cara.cabeza.x} y={cara.cabeza.y} />}
            </G>
          </Svg>

          {animado && estado === 'decaido' && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.lagrima,
                {
                  left: ojoIzq.left - 3,
                  top: ojoIzq.top + 4,
                  opacity: lagrima.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.9, 0.9, 0] }),
                  transform: [{ translateY: lagrima.interpolate({ inputRange: [0, 1], outputRange: [0, size * 0.14] }) }],
                },
              ]}
            >
              <Svg width={7} height={10} viewBox="0 0 7 10">
                <Path d="M3.5 0 C3.5 0 0 5 0 6.5 C0 8.4 1.6 10 3.5 10 C5.4 10 7 8.4 7 6.5 C7 5 3.5 0 3.5 0 Z" fill={colors.agua.light} />
              </Svg>
            </Animated.View>
          )}
        </Animated.View>
      </Animated.View>

      {animado && nivel >= 3 && (
        <>
          <Animated.View pointerEvents="none" style={[styles.destello, { left: size * 0.06, top: size * 0.12, opacity: brillo }]}>
            <Ionicons name="sparkles" size={size * 0.13} color={colors.oro} />
          </Animated.View>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.destello,
              { right: size * 0.04, top: size * 0.3, opacity: brillo.interpolate({ inputRange: [0, 1], outputRange: [1, 0.15] }) },
            ]}
          >
            <Ionicons name="sparkles" size={size * 0.1} color={colors.oro} />
          </Animated.View>
        </>
      )}

      {interactivo && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.corazon,
            {
              left: size / 2 - 11,
              opacity: corazon.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 0] }),
              transform: [
                { translateY: corazon.interpolate({ inputRange: [0, 1], outputRange: [size * 0.15, -size * 0.12] }) },
                { scale: corazon.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.4, 1.1, 0.9] }) },
              ],
            },
          ]}
        >
          <Ionicons name="heart" size={22} color="#E8577A" />
        </Animated.View>
      )}
    </View>
  );

  if (!interactivo) return dibujo;

  return (
    <Pressable onPress={acariciar} accessibilityRole="button" accessibilityHint="Toca para acariciar a tu mascota">
      {dibujo}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  lagrima: {
    position: 'absolute',
  },
  destello: {
    position: 'absolute',
  },
  corazon: {
    position: 'absolute',
    top: 0,
  },
});
