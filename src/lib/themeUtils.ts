// Theme utility functions for dynamic Tailwind & CSS variables styling

export interface ThemePreset {
  id: string;
  name: string;
  category: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  description: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'ocean',
    name: 'Azul Safira & Céu',
    category: 'Clínica Geral & Diagnóstico',
    primaryColor: '#2563eb', // Tailwind Blue 600
    secondaryColor: '#0ea5e9', // Sky 500
    accentColor: '#38bdf8',
    description: 'Transmite confiança médica, credibilidade e tecnologia hospitalar.',
  },
  {
    id: 'teal',
    name: 'Teal & Esmeralda Suave',
    category: 'Fisioterapia & Pilates',
    primaryColor: '#0d9488', // Teal 600
    secondaryColor: '#14b8a6', // Teal 500
    accentColor: '#5eead4',
    description: 'Equilíbrio natural, movimento, reabilitação e saúde integral.',
  },
  {
    id: 'rose',
    name: 'Rose Quartz & Coral',
    category: 'Estética & Dermatologia',
    primaryColor: '#e11d48', // Rose 600
    secondaryColor: '#f43f5e', // Rose 500
    accentColor: '#fda4af',
    description: 'Sofisticação, acolhimento, beleza e estética avançada.',
  },
  {
    id: 'indigo',
    name: 'Índigo & Lavanda',
    category: 'Neurologia & Psicoterapia',
    primaryColor: '#4f46e5', // Indigo 600
    secondaryColor: '#818cf8', // Indigo 400
    accentColor: '#c7d2fe',
    description: 'Foco mental, serenidade, acolhimento clínico e inovação.',
  },
  {
    id: 'emerald',
    name: 'Verde Botânico',
    category: 'Nutrição & Bem-Estar',
    primaryColor: '#059669', // Emerald 600
    secondaryColor: '#10b981', // Emerald 500
    accentColor: '#6ee7b7',
    description: 'Vitalidade orgânica, regeneração e acompanhamento integrativo.',
  },
  {
    id: 'amber',
    name: 'Âmbar Solar & Laranja',
    category: 'Ortopedia & Esportes',
    primaryColor: '#d97706', // Amber 600
    secondaryColor: '#f59e0b', // Amber 500
    accentColor: '#fde68a',
    description: 'Energia, alta performance física, motivação e dinamismo.',
  },
  {
    id: 'violet',
    name: 'Ametista & Violeta',
    category: 'Odontologia & Harmonização',
    primaryColor: '#7c3aed', // Violet 600
    secondaryColor: '#a855f7', // Purple 500
    accentColor: '#d8b4fe',
    description: 'Modernidade estética, exclusividade e precisão clínica.',
  },
  {
    id: 'slate',
    name: 'Grafite & Titânio',
    category: 'Centro Corporativo',
    primaryColor: '#334155', // Slate 700
    secondaryColor: '#64748b', // Slate 500
    accentColor: '#cbd5e1',
    description: 'Estilo executivo, minimalismo, sobriedade e alto rigor corporativo.',
  },
];

export const LOGO_ICON_OPTIONS = [
  { id: 'activity', name: 'Atividade / Pulso', iconName: 'Activity' },
  { id: 'heart', name: 'Coração / Cuidado', iconName: 'Heart' },
  { id: 'sparkles', name: 'Estética / Brilho', iconName: 'Sparkles' },
  { id: 'cross', name: 'Cruz Médica', iconName: 'Cross' },
  { id: 'shield', name: 'Proteção / Saúde', iconName: 'ShieldCheck' },
  { id: 'leaf', name: 'Nutrição / Natureza', iconName: 'Leaf' },
  { id: 'smile', name: 'Sorriso / Odonto', iconName: 'Smile' },
  { id: 'flame', name: 'Performance / Força', iconName: 'Flame' },
];

/**
 * Helper to convert hex (#RRGGBB) to RGB object
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!hex) return null;
  const cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return { r, g, b };
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

/**
 * Adjust color brightness (percent: -100 to 100)
 */
export function adjustBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const factor = percent / 100;
  const r = Math.min(255, Math.max(0, Math.round(rgb.r + (factor < 0 ? rgb.r * factor : (255 - rgb.r) * factor))));
  const g = Math.min(255, Math.max(0, Math.round(rgb.g + (factor < 0 ? rgb.g * factor : (255 - rgb.g) * factor))));
  const b = Math.min(255, Math.max(0, Math.round(rgb.b + (factor < 0 ? rgb.b * factor : (255 - rgb.b) * factor))));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Calculate contrast text color (black or white)
 */
export function getContrastTextColor(hex: string): '#ffffff' | '#0f172a' {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#ffffff';
  // Standard relative luminance formula
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.6 ? '#0f172a' : '#ffffff';
}

/**
 * Injects dynamic CSS Custom Properties onto document.documentElement for Tailwind & layout usage
 */
export function applyThemeToDOM(config: {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}): void {
  if (typeof document === 'undefined') return;

  const primary = config.primaryColor || '#2563eb';
  const secondary = config.secondaryColor || '#0ea5e9';
  const accent = config.accentColor || '#38bdf8';

  const primaryRgb = hexToRgb(primary) || { r: 37, g: 99, b: 235 };
  const secondaryRgb = hexToRgb(secondary) || { r: 14, g: 165, b: 233 };

  const primaryHover = adjustBrightness(primary, -15);
  const primaryLight = adjustBrightness(primary, 88);
  const primaryBorder = adjustBrightness(primary, 60);

  const secondaryHover = adjustBrightness(secondary, -15);
  const secondaryLight = adjustBrightness(secondary, 88);
  const secondaryBorder = adjustBrightness(secondary, 60);

  const root = document.documentElement;

  // Primary Variables
  root.style.setProperty('--color-brand-primary', primary);
  root.style.setProperty('--color-brand-primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);
  root.style.setProperty('--color-brand-primary-hover', primaryHover);
  root.style.setProperty('--color-brand-primary-light', primaryLight);
  root.style.setProperty('--color-brand-primary-border', primaryBorder);
  root.style.setProperty('--color-brand-primary-text', getContrastTextColor(primary));

  // Secondary Variables
  root.style.setProperty('--color-brand-secondary', secondary);
  root.style.setProperty('--color-brand-secondary-rgb', `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}`);
  root.style.setProperty('--color-brand-secondary-hover', secondaryHover);
  root.style.setProperty('--color-brand-secondary-light', secondaryLight);
  root.style.setProperty('--color-brand-secondary-border', secondaryBorder);
  root.style.setProperty('--color-brand-secondary-text', getContrastTextColor(secondary));

  // Accent Variables
  root.style.setProperty('--color-brand-accent', accent);
}
