export type ServiceType = 'agua' | 'luz';

export interface PaletaServicio {
  primary: string;
  light: string;
  soft: string;
  dark: string; // texto sobre `primary`
  text: string; // texto de color sobre `surface`
  bars: string[]; // rampa del historial, de menos a más intenso
}

export interface Palette {
  background: string; // marco exterior y tarjetas internas
  surface: string; // tarjeta principal
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  agua: PaletaServicio;
  luz: PaletaServicio;
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  danger: string;
  dangerBg: string;
  oro: string; // logros, racha y etapa legendaria
  overlay: string;
}

// Paleta clara alineada con los mockups de referencia.
export const lightColors: Palette = {
  background: '#F1EFE8',
  surface: '#FFFFFF',
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
  successBg: '#E1F5EE',
  warning: '#854F0B',
  warningBg: '#FAEEDA',
  danger: '#A32D2D',
  dangerBg: '#FCEBEB',
  oro: '#D9A21B',
  overlay: 'rgba(0,0,0,0.25)',
};

// Misma estructura en tonos oscuros cálidos.
export const darkColors: Palette = {
  background: '#1C1C1A',
  surface: '#2A2A27',
  border: '#3B3A36',
  textPrimary: '#F1EFE8',
  textSecondary: '#B4B2A9',
  textMuted: '#6F6D66',

  agua: {
    primary: '#378ADD',
    light: '#85B7EB',
    soft: '#B5D4F4',
    dark: '#042C53',
    text: '#85B7EB',
    bars: ['#2B5E92', '#2B5E92', '#2B5E92', '#378ADD', '#378ADD'],
  },
  luz: {
    primary: '#EF9F27',
    light: '#FAC775',
    soft: '#FAC775',
    dark: '#412402',
    text: '#FAC775',
    bars: ['#6B4A12', '#6B4A12', '#A86D17', '#EF9F27', '#FAC775'],
  },

  success: '#4CC9A0',
  successBg: '#14352B',
  warning: '#F2B85C',
  warningBg: '#3D2F15',
  danger: '#F08A8A',
  dangerBg: '#3F1E1E',
  oro: '#F2C230',
  overlay: 'rgba(0,0,0,0.55)',
};
