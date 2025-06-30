// src/config/iconConfig.ts

// Configuración de colores por defecto
export const iconColors = {
  primary: "#915A17",      // Color principal de iconos
  background: "#F8EDD2",   // Fondo de gota
  white: "#FFFFFF",
  black: "#000000",
  gray: "#666666",
  success: "#00B383",
  error: "#FF4444"
} as const;

// Tamaños estándar
export const iconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
  xxl: 64
} as const;

// Configuración para diferentes contextos
export const iconContexts = {
  header: {
    size: iconSizes.lg,
    color: iconColors.white
  },
  category: {
    size: iconSizes.xl,
    iconSize: iconSizes.md,
    color: iconColors.primary,
    background: iconColors.background
  },
  subcategory: {
    size: 40,
    iconSize: 20,
    color: iconColors.primary,
    background: iconColors.background
  },
  ui: {
    size: iconSizes.md,
    color: iconColors.black
  },
  floating: {
    size: iconSizes.sm,
    color: iconColors.white
  }
} as const;

// Tipos para TypeScript
export type IconColor = keyof typeof iconColors;
export type IconSize = keyof typeof iconSizes;
export type IconContext = keyof typeof iconContexts;

// Mapeo de iconos obsoletos a nuevos (para migración)
export const iconMigrationMap = {
  'arrow-left-bg.svg': 'arrow-left-bg',
  'menu-bg.svg': 'menu-bg',
  'land-layer-location.svg': 'land-layer-location'
} as const;