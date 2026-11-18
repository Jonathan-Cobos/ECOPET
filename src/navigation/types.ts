import type { ServiceType } from '@/theme/colors';

export type RootStackParamList = {
  Portada: undefined;
  Home: undefined;
  RegistrarConsumo: { servicio: ServiceType };
  Cuestionario: { servicio: ServiceType };
};
