import type { Datos, ServiceType } from './types';

// Tarifa aproximada en pesos (COP) por m³ de agua (acueducto + alcantarillado)
// y por kWh de luz, para estrato 4. Es una referencia: cada usuario puede
// poner la de su recibo en la pantalla de tarifas.
export const TARIFA_REFERENCIA: Record<ServiceType, number> = { agua: 5200, luz: 950 };

// Subsidio (estratos 1-3) o contribución (5-6) sobre la tarifa de referencia.
const FACTOR_ESTRATO = [0.5, 0.6, 0.85, 1, 1.2, 1.2];

export function tarifaAutomatica(servicio: ServiceType, estrato?: number): number {
  const factor = FACTOR_ESTRATO[(estrato ?? 4) - 1] ?? 1;
  return Math.round(TARIFA_REFERENCIA[servicio] * factor);
}

export function tarifasDe(datos: Datos): Record<ServiceType, number> {
  const estrato = datos.perfil?.estrato;
  return {
    agua: datos.tarifas.agua ?? tarifaAutomatica('agua', estrato),
    luz: datos.tarifas.luz ?? tarifaAutomatica('luz', estrato),
  };
}
