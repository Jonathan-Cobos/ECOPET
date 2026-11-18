import type { ServiceType } from '@/theme/colors';

export type RootStackParamList = {
  Portada: undefined;
  EncuestaHogar: { modo: 'inicial' | 'editar' };
  Home: undefined;
  RegistrarConsumo: { servicio: ServiceType; periodo?: string };
  Cuestionario: { servicio: ServiceType };
  Historial: { servicio: ServiceType };
  Logros: undefined;
  Evolucion: { servicio: ServiceType };
  Tarifas: undefined;
};
