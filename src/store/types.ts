import type { ServiceType } from '@/theme/colors';

export type { ServiceType };
export type EstadoMascota = 'feliz' | 'neutral' | 'decaido';

export interface Registro {
  id: number;
  periodo: string; // 'YYYY-MM-01'
  valor: number;
}

export interface Datos {
  registros: Record<ServiceType, Registro[]>;
  estandares: Record<ServiceType, number>;
  recomendaciones: Record<ServiceType, string | null>;
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
