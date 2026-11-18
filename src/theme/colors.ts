// Paleta alineada con los mockups de referencia (misma de la portada y las pantallas).
export const colors = {
  background: '#F1EFE8', // marco exterior y tarjetas internas
  surface: '#FFFFFF', // tarjeta principal
  border: '#E4E1D8',
  textPrimary: '#2C2C2A',
  textSecondary: '#5F5E5A',
  textMuted: '#B4B2A9',

  agua: {
    primary: '#378ADD',
    light: '#85B7EB',
    soft: '#B5D4F4',
    dark: '#042C53',
    text: '#185FA5',
    bars: ['#85B7EB', '#85B7EB', '#85B7EB', '#378ADD', '#378ADD'],
  },
  luz: {
    primary: '#EF9F27',
    light: '#FAC775',
    soft: '#FAC775',
    dark: '#412402',
    text: '#854F0B',
    bars: ['#FAC775', '#FAC775', '#EF9F27', '#BA7517', '#854F0B'],
  },

  success: '#0F6E56',
  warning: '#854F0B',
  warningBg: '#FAEEDA',
  danger: '#A32D2D',
  dangerBg: '#FCEBEB',
};

export type ServiceType = 'agua' | 'luz';

export function colorsFor(service: ServiceType) {
  return service === 'agua' ? colors.agua : colors.luz;
}
