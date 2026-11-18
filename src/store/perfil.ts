import type { Datos, PerfilHogar, ServiceType } from './types';

// Estándares cuando aún no se ha respondido la encuesta del hogar.
export const ESTANDARES_POR_DEFECTO: Record<ServiceType, number> = { agua: 10, luz: 150 };

export interface ConceptoEstandar {
  concepto: string;
  valor: number;
}

/**
 * Consumo mensual de referencia según el hogar. Valores aproximados:
 * - agua: ~100 L por persona al día (3 m³/mes) más extras por baños, lavadora y riego.
 * - luz: consumo base (nevera, router...) más personas, iluminación y equipos grandes.
 */
export function desgloseEstandar(p: PerfilHogar, servicio: ServiceType): ConceptoEstandar[] {
  const items: ConceptoEstandar[] = [];
  if (servicio === 'agua') {
    items.push({ concepto: `${p.personas} persona${p.personas === 1 ? '' : 's'}`, valor: p.personas * 3 });
    if (p.banos > 1) items.push({ concepto: `${p.banos - 1} baño(s) adicional(es)`, valor: (p.banos - 1) * 0.4 });
    if (p.lavadora) items.push({ concepto: 'Lavadora', valor: 0.8 });
    if (p.jardin) items.push({ concepto: 'Jardín o plantas', valor: 1.5 });
  } else {
    items.push({ concepto: 'Consumo base del hogar', valor: 60 });
    items.push({ concepto: `${p.personas} persona${p.personas === 1 ? '' : 's'}`, valor: p.personas * 25 });
    items.push({ concepto: `Iluminación (${p.tamano} m²)`, valor: p.tamano * 0.25 });
    items.push({ concepto: `${p.habitaciones} habitación(es)`, valor: p.habitaciones * 6 });
    if (p.lavadora) items.push({ concepto: 'Lavadora', valor: 15 });
    if (p.aireAcondicionado) items.push({ concepto: 'Aire acondicionado', valor: 120 });
    if (p.calentador === 'electrico') items.push({ concepto: 'Calentador eléctrico', valor: 70 });
    if (p.teletrabajo) items.push({ concepto: 'Trabajo o estudio en casa', valor: 40 });
  }
  return items;
}

export function calcularEstandares(p: PerfilHogar): Record<ServiceType, number> {
  const suma = (s: ServiceType) => desgloseEstandar(p, s).reduce((t, i) => t + i.valor, 0);
  return {
    agua: Math.round(suma('agua') * 10) / 10,
    luz: Math.round(suma('luz')),
  };
}

export function estandaresDe(datos: Datos): Record<ServiceType, number> {
  return datos.perfil ? calcularEstandares(datos.perfil) : ESTANDARES_POR_DEFECTO;
}

export function describirPerfil(p: PerfilHogar): string {
  const personas = `${p.personas} persona${p.personas === 1 ? '' : 's'}`;
  const vivienda = p.vivienda === 'casa' ? 'Casa' : 'Apartamento';
  return `${personas} · ${vivienda} · ${p.tamano} m²`;
}
