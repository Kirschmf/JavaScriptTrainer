// Theme configuration for JSRunner

// Theme interface definition
export interface Theme {
  id: string;
  name: string;
  description: string;
  editorTheme: string; // Monaco editor theme
  colors: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    border: string;
    card: string;
    muted: string;
  };
}

// Available themes
export const themes: Theme[] = [
  {
    id: 'dark-default',
    name: 'Dark (Default)',
    description: 'Default dark theme with blue accents',
    editorTheme: 'vs-dark',
    colors: {
      background: '#1c1c1c',
      foreground: '#e2e2e2',
      primary: '#3b82f6', // Blue
      secondary: '#10b981', // Green
      accent: '#6366f1', // Indigo
      border: '#2d2d2d',
      card: '#252525',
      muted: '#6b7280',
    }
  },
  {
    id: 'dark-purple',
    name: 'Purple Haze',
    description: 'Dark theme with purple accents',
    editorTheme: 'vs-dark',
    colors: {
      background: '#1a1a2e',
      foreground: '#e2e2e2',
      primary: '#9333ea', // Purple
      secondary: '#ec4899', // Pink
      accent: '#8b5cf6', // Violet
      border: '#2d2d3d',
      card: '#252538',
      muted: '#6b7280',
    }
  },
  {
    id: 'dark-green',
    name: 'Matrix',
    description: 'Dark theme with green accents',
    editorTheme: 'vs-dark',
    colors: {
      background: '#0f1a14',
      foreground: '#e2e2e2',
      primary: '#10b981', // Green
      secondary: '#84cc16', // Lime
      accent: '#14b8a6', // Teal
      border: '#1e2a23',
      card: '#1a2a21',
      muted: '#6b7280',
    }
  },
  {
    id: 'dark-orange',
    name: 'Night Fire',
    description: 'Dark theme with orange and red accents',
    editorTheme: 'vs-dark',
    colors: {
      background: '#1a1717',
      foreground: '#e2e2e2',
      primary: '#f97316', // Orange
      secondary: '#ef4444', // Red
      accent: '#f59e0b', // Amber
      border: '#2d2929',
      card: '#252222',
      muted: '#6b7280',
    }
  },
  {
    id: 'dark-blue',
    name: 'Ocean Deep',
    description: 'Dark theme with blue and cyan accents',
    editorTheme: 'vs-dark',
    colors: {
      background: '#0f172a',
      foreground: '#e2e2e2',
      primary: '#0ea5e9', // Sky
      secondary: '#06b6d4', // Cyan
      accent: '#3b82f6', // Blue
      border: '#1e293b',
      card: '#1e293b',
      muted: '#6b7280',
    }
  }
];

// Get a theme by ID
export function getThemeById(id: string): Theme {
  return themes.find(theme => theme.id === id) || themes[0];
}

// Default theme ID
export const DEFAULT_THEME_ID = 'dark-default';