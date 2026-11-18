import type { ServiceType } from '@/theme/colors';

export type { ServiceType };
export type EstadoMascota = 'feliz' | 'neutral' | 'decaido';
export type PreferenciaTema = 'claro' | 'oscuro' | 'sistema';
export type SlotAccesorio = 'cabeza' | 'cara';
export type AccesorioId = 'mono' | 'gorra' | 'corona' | 'gafas' | 'bigote';
export type AccesoriosEquipados = Record<SlotAccesorio, AccesorioId | null>;

export interface Registro {
  id: number;
  periodo: string; // 'YYYY-MM-01'
  valor: number;
}

/** Respuestas de la encuesta inicial del hogar. */
export interface PerfilHogar {
  nombre: string;
  personas: number;
  vivienda: 'apartamento' | 'casa';
  tamano: number; // m² aproximados
  habitaciones: number;
  banos: number;
  estrato: number; // 1 a 6
  lavadora: boolean;
  jardin: boolean;
  aireAcondicionado: boolean;
  calentador: 'electrico' | 'gas' | 'ninguno';
  teletrabajo: boolean;
}

export interface Datos {
  registros: Record<ServiceType, Registro[]>;
  recomendaciones: Record<ServiceType, string | null>;
  perfil: PerfilHogar | null;
  /** Tarifa por unidad en pesos; null = automática según el estrato. */
  tarifas: Record<ServiceType, number | null>;
  accesorios: Record<ServiceType, AccesoriosEquipados>;
  preferencias: { tema: PreferenciaTema };
  cuestionarioRespondido: boolean;
  /** Logros ya anunciados; null = aún no se ha inicializado (no anunciar los existentes). */
  logrosVistos: string[] | null;
}

export interface RespuestasCuestionario {
  [pregunta: string]: string | number;
}

export interface Analisis {
  actual: Registro | null;
  anterior: Registro | null;
  variacionPorc: number | null;
  estado: EstadoMascota;
  excedeEstandar: boolean;
  fuga: boolean;
}
