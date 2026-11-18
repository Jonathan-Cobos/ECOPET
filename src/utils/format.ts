export function formatVariacion(porc: number | null): string {
  if (porc === null) return '—';
  const redondeado = Math.round(porc);
  const signo = redondeado > 0 ? '+' : '';
  return `${signo}${redondeado}%`;
}

export function formatValor(valor: number): string {
  // 9.2 -> "9.2", 168 -> "168", 10.45 -> "10.5"
  return Number.isInteger(valor) ? String(valor) : valor.toFixed(1);
}

/** 47840 -> "$47.840" */
export function formatPesos(valor: number): string {
  const redondeado = Math.round(valor);
  const miles = String(Math.abs(redondeado)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${redondeado < 0 ? '-' : ''}$${miles}`;
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MESES_LARGOS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export function formatMes(periodoIso: string): string {
  const mes = Number(periodoIso.split('-')[1]);
  return MESES[mes - 1] ?? periodoIso;
}

/** '2026-11-01' -> "noviembre 2026" */
export function formatMesLargo(periodoIso: string): string {
  const [anio, mes] = periodoIso.split('-').map(Number);
  return `${MESES_LARGOS[mes - 1] ?? periodoIso} ${anio}`;
}
