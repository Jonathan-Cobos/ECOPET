import type { Analisis, Datos, Registro, ServiceType } from './types';

// Aumento (%) respecto al periodo anterior que dispara la alerta de posible fuga.
// Mismo umbral que usa el backend (consumo.service.js).
export const UMBRAL_FUGA = 60;

export const UNIDADES: Record<ServiceType, string> = { agua: 'm³', luz: 'kWh' };

export function ordenarRecientesPrimero(registros: Registro[]): Registro[] {
  return [...registros].sort((a, b) => (a.periodo < b.periodo ? 1 : -1));
}

/**
 * Compara el último registro con el anterior y con el estándar:
 * - bajó o se mantuvo            -> mascota feliz
 * - subió y supera el estándar    -> mascota decaída
 * - subió pero sigue en estándar  -> neutral
 * - aumento >= UMBRAL_FUGA        -> alerta de posible fuga
 */
export function analizar(registros: Registro[], estandar: number): Analisis {
  const [actual = null, anterior = null] = ordenarRecientesPrimero(registros);

  const variacionPorc =
    actual && anterior && anterior.valor > 0
      ? ((actual.valor - anterior.valor) / anterior.valor) * 100
      : null;

  const excedeEstandar = actual !== null && actual.valor > estandar;

  let estado: Analisis['estado'] = 'neutral';
  if (variacionPorc !== null) {
    if (variacionPorc <= 0) estado = 'feliz';
    else if (excedeEstandar) estado = 'decaido';
  }

  const fuga = variacionPorc !== null && variacionPorc >= UMBRAL_FUGA;

  return { actual, anterior, variacionPorc, estado, excedeEstandar, fuga };
}

export function periodoActual(ahora = new Date()): string {
  const mm = String(ahora.getMonth() + 1).padStart(2, '0');
  return `${ahora.getFullYear()}-${mm}-01`;
}

/** Agrega el registro del mes actual; si ya existe uno de ese mes, lo reemplaza. */
export function agregarRegistro(
  datos: Datos,
  servicio: ServiceType,
  valor: number,
  ahora = new Date()
): Datos {
  const periodo = periodoActual(ahora);
  const existentes = datos.registros[servicio];
  const mismoMes = existentes.find((r) => r.periodo === periodo);

  let registros: Registro[];
  if (mismoMes) {
    registros = existentes.map((r) => (r.id === mismoMes.id ? { ...r, valor } : r));
  } else {
    const nuevoId = existentes.reduce((max, r) => Math.max(max, r.id), 0) + 1;
    registros = [...existentes, { id: nuevoId, periodo, valor }];
  }

  return {
    ...datos,
    registros: { ...datos.registros, [servicio]: registros },
    // Un registro nuevo invalida la recomendación anterior.
    recomendaciones: { ...datos.recomendaciones, [servicio]: null },
  };
}

/**
 * Datos de ejemplo: cinco meses terminando en el mes actual. Reproducen los
 * mockups: agua baja un 12 % (mascota feliz) y luz sube un 27 % por encima del
 * estándar (mascota decaída + banner del cuestionario).
 */
export function datosDemo(ahora = new Date()): Datos {
  const agua = [11.6, 12.4, 10.9, 10.45, 9.2];
  const luz = [92, 100, 115, 132, 168];

  const construir = (valores: number[]): Registro[] =>
    valores.map((valor, i) => {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - (valores.length - 1 - i), 1);
      return { id: i + 1, periodo: periodoActual(fecha), valor };
    });

  return {
    registros: { agua: construir(agua), luz: construir(luz) },
    estandares: { agua: 10, luz: 150 },
    recomendaciones: { agua: null, luz: null },
  };
}
