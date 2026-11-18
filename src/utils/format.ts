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

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function formatMes(periodoIso: string): string {
  const mes = Number(periodoIso.split('-')[1]);
  return MESES[mes - 1] ?? periodoIso;
}
