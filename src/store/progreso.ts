import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';
import type {
  AccesorioId,
  Analisis,
  Datos,
  Registro,
  ServiceType,
  SlotAccesorio,
} from './types';
import { indiceMes, ordenarCronologico } from './consumo';

type Icono = ComponentProps<typeof Ionicons>['name'];

// ---------- Rachas y meses buenos ----------

export interface Etapa {
  nivel: number;
  nombre: string;
  minimo: number; // meses buenos necesarios
}

// La mascota evoluciona según los meses buenos acumulados.
export const ETAPAS: Etapa[] = [
  { nivel: 1, nombre: 'Bebé', minimo: 0 },
  { nivel: 2, nombre: 'Joven', minimo: 2 },
  { nivel: 3, nombre: 'Adulto', minimo: 5 },
  { nivel: 4, nombre: 'Legendario', minimo: 9 },
];

export interface ProgresoServicio {
  mesesBuenos: number;
  idsBuenos: number[];
  rachaActual: number;
  mejorRacha: number;
  mayorBajaPorc: number; // mayor reducción entre dos meses seguidos
  etapa: Etapa;
  siguiente: Etapa | null;
  progresoEtapa: number; // 0..1 hacia la siguiente etapa
}

/**
 * Un mes es "bueno" si quedó dentro del estándar o bajó respecto al mes
 * anterior. La racha cuenta meses buenos seguidos; un mes sin registro la corta.
 */
export function calcularProgreso(registros: Registro[], estandar: number): ProgresoServicio {
  let racha = 0;
  let mejor = 0;
  let mayorBaja = 0;
  const idsBuenos: number[] = [];
  let previo: Registro | null = null;
  let previoBueno = false;

  for (const r of ordenarCronologico(registros)) {
    const consecutivo = previo !== null && indiceMes(r.periodo) - indiceMes(previo.periodo) === 1;
    const bajo = consecutivo && previo !== null && r.valor <= previo.valor;
    const bueno = r.valor <= estandar || bajo;

    if (consecutivo && previo && previo.valor > 0) {
      mayorBaja = Math.max(mayorBaja, ((previo.valor - r.valor) / previo.valor) * 100);
    }

    if (bueno) {
      idsBuenos.push(r.id);
      racha = consecutivo && previoBueno ? racha + 1 : 1;
    } else {
      racha = 0;
    }
    mejor = Math.max(mejor, racha);
    previo = r;
    previoBueno = bueno;
  }

  const mesesBuenos = idsBuenos.length;
  const etapa = [...ETAPAS].reverse().find((e) => mesesBuenos >= e.minimo) ?? ETAPAS[0];
  const siguiente = ETAPAS.find((e) => e.nivel === etapa.nivel + 1) ?? null;
  const progresoEtapa = siguiente
    ? (mesesBuenos - etapa.minimo) / (siguiente.minimo - etapa.minimo)
    : 1;

  return {
    mesesBuenos,
    idsBuenos,
    rachaActual: racha,
    mejorRacha: mejor,
    mayorBajaPorc: mayorBaja,
    etapa,
    siguiente,
    progresoEtapa,
  };
}

// ---------- Logros ----------

export interface ContextoLogros {
  datos: Datos;
  estandares: Record<ServiceType, number>;
  analisis: Record<ServiceType, Analisis>;
  progreso: Record<ServiceType, ProgresoServicio>;
}

interface Logro {
  id: string;
  titulo: string;
  descripcion: string;
  icono: Icono;
  meta: number;
  valor: (c: ContextoLogros) => number;
}

export interface EstadoLogro extends Omit<Logro, 'valor'> {
  actual: number;
  desbloqueado: boolean;
}

const SERVICIOS: ServiceType[] = ['agua', 'luz'];
const maxPor = (fn: (s: ServiceType) => number) => Math.max(...SERVICIOS.map(fn));

const LOGROS: Logro[] = [
  {
    id: 'primer_registro',
    titulo: 'Primer paso',
    descripcion: 'Registra tu primer consumo.',
    icono: 'footsteps-outline',
    meta: 1,
    valor: (c) => SERVICIOS.reduce((t, s) => t + c.datos.registros[s].length, 0),
  },
  {
    id: 'encuesta',
    titulo: 'Hogar conocido',
    descripcion: 'Completa la encuesta de tu hogar.',
    icono: 'home-outline',
    meta: 1,
    valor: (c) => (c.datos.perfil ? 1 : 0),
  },
  {
    id: 'cuestionario',
    titulo: 'Autoevaluación',
    descripcion: 'Responde un cuestionario de hábitos.',
    icono: 'clipboard-outline',
    meta: 1,
    valor: (c) => (c.datos.cuestionarioRespondido ? 1 : 0),
  },
  {
    id: 'bajo_estandar',
    titulo: 'Dentro del límite',
    descripcion: 'Cierra un mes por debajo del estándar.',
    icono: 'checkmark-done-outline',
    meta: 1,
    valor: (c) =>
      SERVICIOS.some((s) => c.datos.registros[s].some((r) => r.valor <= c.estandares[s])) ? 1 : 0,
  },
  {
    id: 'ahorro_10',
    titulo: 'Ahorrador',
    descripcion: 'Baja tu consumo un 10 % de un mes a otro.',
    icono: 'trending-down-outline',
    meta: 10,
    valor: (c) => Math.min(10, Math.floor(maxPor((s) => c.progreso[s].mayorBajaPorc))),
  },
  {
    id: 'ahorro_25',
    titulo: 'Gran ahorrador',
    descripcion: 'Baja tu consumo un 25 % de un mes a otro.',
    icono: 'rocket-outline',
    meta: 25,
    valor: (c) => Math.min(25, Math.floor(maxPor((s) => c.progreso[s].mayorBajaPorc))),
  },
  {
    id: 'racha_3',
    titulo: 'Constante',
    descripcion: 'Logra una racha de 3 meses buenos.',
    icono: 'flame-outline',
    meta: 3,
    valor: (c) => Math.min(3, maxPor((s) => c.progreso[s].mejorRacha)),
  },
  {
    id: 'racha_6',
    titulo: 'Imparable',
    descripcion: 'Logra una racha de 6 meses buenos.',
    icono: 'flame',
    meta: 6,
    valor: (c) => Math.min(6, maxPor((s) => c.progreso[s].mejorRacha)),
  },
  {
    id: 'equipo_feliz',
    titulo: 'Equipo feliz',
    descripcion: 'Ten a Gotín y Voltín felices al mismo tiempo.',
    icono: 'happy-outline',
    meta: 2,
    valor: (c) => SERVICIOS.filter((s) => c.analisis[s].estado === 'feliz').length,
  },
  {
    id: 'anio_datos',
    titulo: 'Un año de datos',
    descripcion: 'Registra 12 meses de un mismo servicio.',
    icono: 'calendar-outline',
    meta: 12,
    valor: (c) => Math.min(12, maxPor((s) => c.datos.registros[s].length)),
  },
];

export function evaluarLogros(c: ContextoLogros): EstadoLogro[] {
  return LOGROS.map(({ valor, ...logro }) => {
    const actual = Math.min(logro.meta, valor(c));
    return { ...logro, actual, desbloqueado: actual >= logro.meta };
  });
}

// ---------- Accesorios ----------

type Requisito =
  | { tipo: 'libre' }
  | { tipo: 'etapa'; nivel: number }
  | { tipo: 'racha'; meses: number }
  | { tipo: 'logro'; id: string };

export interface Accesorio {
  id: AccesorioId;
  nombre: string;
  slot: SlotAccesorio;
  requisito: Requisito;
}

export const ACCESORIOS: Accesorio[] = [
  { id: 'mono', nombre: 'Moño', slot: 'cabeza', requisito: { tipo: 'libre' } },
  { id: 'gafas', nombre: 'Gafas de sol', slot: 'cara', requisito: { tipo: 'etapa', nivel: 2 } },
  { id: 'gorra', nombre: 'Gorra', slot: 'cabeza', requisito: { tipo: 'racha', meses: 3 } },
  { id: 'bigote', nombre: 'Bigote', slot: 'cara', requisito: { tipo: 'logro', id: 'ahorro_10' } },
  { id: 'corona', nombre: 'Corona', slot: 'cabeza', requisito: { tipo: 'etapa', nivel: 4 } },
];

export function accesorioDesbloqueado(
  a: Accesorio,
  progreso: ProgresoServicio,
  logros: EstadoLogro[]
): boolean {
  const r = a.requisito;
  switch (r.tipo) {
    case 'libre':
      return true;
    case 'etapa':
      return progreso.etapa.nivel >= r.nivel;
    case 'racha':
      return progreso.mejorRacha >= r.meses;
    case 'logro':
      return logros.some((l) => l.id === r.id && l.desbloqueado);
  }
}

export function textoRequisito(a: Accesorio): string {
  const r = a.requisito;
  switch (r.tipo) {
    case 'libre':
      return 'Disponible';
    case 'etapa':
      return `Etapa ${ETAPAS[r.nivel - 1].nombre}`;
    case 'racha':
      return `Racha de ${r.meses} meses`;
    case 'logro':
      return `Logro "${LOGROS.find((l) => l.id === r.id)?.titulo ?? r.id}"`;
  }
}
