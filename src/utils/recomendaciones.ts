import type { ServiceType, RespuestasCuestionario } from '@/store/types';

// Generador de recomendación por reglas simples, a partir de las respuestas
// del cuestionario de hábitos. Mismas reglas que recomendacion.service.js
// del backend, para que ambos lados den el mismo resultado.
export function generarRecomendacion(
  servicio: ServiceType,
  respuestas: RespuestasCuestionario
): string {
  const tips: string[] = [];

  if (servicio === 'agua') {
    if (Number(respuestas.tiempoDucha) > 10) {
      tips.push('reducir el tiempo de ducha a menos de 10 minutos');
    }
    if (Number(respuestas.vecesLavadora) > 4) {
      tips.push('agrupar la ropa para usar la lavadora con carga completa');
    }
    if (respuestas.fugaVisible === 'si') {
      tips.push('revisar grifos y sanitarios: podría haber una fuga activa');
    }
    if (respuestas.riegoFrecuente === 'si') {
      tips.push('regar plantas temprano en la mañana para reducir evaporación');
    }
  } else {
    if (Number(respuestas.horasClimatizacion) > 6) {
      tips.push('bajar las horas de aire acondicionado/calefacción o subir 2°C el termostato');
    }
    if (respuestas.electrodomesticosAntiguos === 'si') {
      tips.push('considerar reemplazar electrodomésticos antiguos por modelos eficientes');
    }
    if (respuestas.lucesEncendidas === 'si') {
      tips.push('apagar luces en espacios sin uso');
    }
    if (Number(respuestas.horasPantallas) > 6) {
      tips.push('activar el modo ahorro de energía en TV y PC');
    }
  }

  if (tips.length === 0) {
    return 'Tus hábitos no muestran un punto crítico claro; revisa el historial para identificar el mes donde subió el consumo.';
  }

  return `Te recomendamos: ${tips.join('; ')}.`;
}
