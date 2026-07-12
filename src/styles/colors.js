// styles/colors.js - Paleta de colores centralizada de Chiappital

/**
 * Paleta de colores oficial de Chiappital
 * 
 * Diseño: Elegante, profesional y moderno
 * Inspiración: Trading profesional con toques sofisticados
 */

export const colors = {
  // === COLORES PRINCIPALES ===
  primary: '#651D23',        // Rojo granate elegante - Botones principales, encabezados
  primaryDark: '#49151A',    // Rojo granate oscuro - Hover states, sombras
  secondary: '#D4AF37',      // Dorado elegante - Elementos secundarios, acentos

  // === PERSONAL HUB ===
  personal: {
    primary: '#2D6A4F',      // Esmeralda oscuro - Crecimiento, disciplina
    primaryLight: '#52B788', // Verde menta - Highlights, badges, accents
    primaryDark: '#1B4332',  // Esmeralda muy oscuro - Hover states
    accent: '#74C69D',       // Verde claro suave - Fondos activos
    surface: '#0a1f16',      // Fondo oscuro verdoso para cards
  },

  // === COLORES NEUTROS ===
  white: '#F2F2F2',         // Blanco suave - Fondos, tarjetas
  black: '#1a1a1a',         // Negro profundo - Textos principales
  
  // === GRISES ===
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717'
  },
  
  // === COLORES DE TRADING ===
  trading: {
    long: '#22c55e',         // Verde para posiciones LONG
    short: '#ef4444',        // Rojo para posiciones SHORT
    profit: '#16a34a',       // Verde para ganancias
    loss: '#dc2626',         // Rojo para pérdidas
    neutral: '#6b7280'       // Gris para neutral
  },
  
  // === COLORES DE ESTADO ===
  status: {
    success: '#10b981',      // Verde éxito
    warning: '#f59e0b',      // Amarillo advertencia
    error: '#ef4444',        // Rojo error
    info: '#3b82f6'          // Azul información
  },
  
  // === GRADIENTES ===
  gradients: {
    primary: `linear-gradient(135deg, #651D23 0%, #49151A 100%)`,
    secondary: `linear-gradient(135deg, #D4AF37 0%, #B58C1F 100%)`,
    success: `linear-gradient(135deg, #22c55e 0%, #16a34a 100%)`,
    danger: `linear-gradient(135deg, #ef4444 0%, #dc2626 100%)`,
    neutral: `linear-gradient(135deg, #6b7280 0%, #4b5563 100%)`
  },
  
  // === SOMBRAS ===
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    primary: '0 4px 15px rgba(101, 29, 35, 0.3)',
    secondary: '0 4px 15px rgba(212, 175, 55, 0.3)'
  }
};

/**
 * Helper functions para trabajar con colores
 */

// Función para agregar transparencia a un color
export const withOpacity = (color, opacity) => {
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
};

// Función para obtener color de trading basado en el valor
export const getTradingColor = (value, neutral = false) => {
  if (neutral || value === 0) return colors.trading.neutral;
  return value > 0 ? colors.trading.profit : colors.trading.loss;
};

// Función para obtener gradiente basado en el tipo
export const getGradient = (type = 'primary') => {
  return colors.gradients[type] || colors.gradients.primary;
};

// Función para obtener sombra basada en el color
export const getShadow = (type = 'base') => {
  return colors.shadows[type] || colors.shadows.base;
};

/**
 * Temas predefinidos
 */
export const themes = {
  default: {
    background: colors.white,
    text: colors.black,
    primary: colors.primary,
    secondary: colors.secondary
  },
  
  dark: {
    background: colors.black,
    text: colors.white,
    primary: colors.primary,
    secondary: colors.secondary
  }
};

/**
 * Colores específicos para componentes
 */
export const componentColors = {
  // Cards y contenedores
  card: {
    background: colors.white,
    border: colors.gray[200],
    shadow: colors.shadows.base
  },
  
  // Botones
  button: {
    primary: {
      background: colors.gradients.primary,
      text: colors.white,
      shadow: colors.shadows.primary
    },
    secondary: {
      background: colors.gradients.secondary,
      text: colors.white,
      shadow: colors.shadows.secondary
    },
    success: {
      background: colors.gradients.success,
      text: colors.white,
      shadow: colors.shadows.base
    },
    danger: {
      background: colors.gradients.danger,
      text: colors.white,
      shadow: colors.shadows.base
    }
  },
  
  // Headers
  header: {
    background: colors.gradients.primary,
    text: colors.white
  },
  
  // Trading específico
  position: {
    long: {
      background: withOpacity(colors.trading.long, 0.1),
      border: colors.trading.long,
      text: colors.trading.long
    },
    short: {
      background: withOpacity(colors.trading.short, 0.1),
      border: colors.trading.short,
      text: colors.trading.short
    }
  }
};

export default colors;
