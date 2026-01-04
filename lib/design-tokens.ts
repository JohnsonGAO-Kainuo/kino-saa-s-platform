/**
 * Design Tokens for Kino Platform
 * 
 * This file defines the core design system tokens including colors, spacing,
 * typography, shadows, and other visual properties.
 * 
 * Updated: Stripe-inspired Enterprise Theme
 */

export const designTokens = {
  // Color System
  colors: {
    // Brand Colors - Clean & Professional
    brand: {
      primary: {
        50: '#f2f0ff',
        100: '#e5e1ff',
        200: '#cec4ff',
        300: '#b09eff',
        400: '#8e72ff',
        500: '#635bff', // Stripe-like Blurple (Main)
        600: '#523df2',
        700: '#432ac9',
        800: '#3823a3',
        900: '#2f1f82',
      },
      secondary: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
      },
    },

    // Semantic Colors
    semantic: {
      success: {
        light: '#dcfce7',
        DEFAULT: '#22c55e',
        dark: '#15803d',
      },
      warning: {
        light: '#fef3c7',
        DEFAULT: '#f59e0b',
        dark: '#b45309',
      },
      error: {
        light: '#fee2e2',
        DEFAULT: '#ef4444',
        dark: '#b91c1c',
      },
      info: {
        light: '#dbeafe',
        DEFAULT: '#3b82f6',
        dark: '#1d4ed8',
      },
    },

    // Neutral Colors - Slate/Gray for cleaner look
    neutral: {
      0: '#ffffff',
      50: '#f7f9fc', // Main Background
      100: '#f1f5f9',
      200: '#e2e8f0', // Borders
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b', // Muted Text
      600: '#475569',
      700: '#334155', // Secondary Text
      800: '#1e293b',
      900: '#0f172a', // Primary Text
      950: '#020617',
    },

    // Document Status Colors - Pastels for badges
    status: {
      draft: {
        bg: '#f1f5f9',
        text: '#475569',
        border: '#cbd5e1',
      },
      sent: {
        bg: '#eff6ff',
        text: '#2563eb',
        border: '#bfdbfe',
      },
      accepted: {
        bg: '#f0fdf4',
        text: '#16a34a',
        border: '#bbf7d0',
      },
      rejected: {
        bg: '#fef2f2',
        text: '#dc2626',
        border: '#fecaca',
      },
      paid: {
        bg: '#f0fdf4',
        text: '#16a34a',
        border: '#bbf7d0',
      },
      archived: {
        bg: '#f8fafc',
        text: '#64748b',
        border: '#e2e8f0',
      },
    },
  },

  // Spacing System (unchanged, standard 4px grid)
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
  },

  // Typography System
  typography: {
    fontFamily: {
      sans: 'var(--font-geist-sans)',
      mono: 'var(--font-geist-mono)',
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },

  // Border Radius - Standardized
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    DEFAULT: '0.375rem', // 6px - Stripe-like
    md: '0.375rem',    // 6px
    lg: '0.5rem',   // 8px
    xl: '0.75rem',      // 12px
    '2xl': '1rem', // 16px
    full: '9999px',
  },

  // Shadows - Softer, more diffuse
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    card: '0 2px 5px -1px rgba(50, 50, 93, 0.25), 0 1px 3px -1px rgba(0, 0, 0, 0.3)', // Stripe-like card shadow
  },

  // Z-Index Scale (unchanged)
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modalBackdrop: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
  },

  // Breakpoints (unchanged)
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const

// Type exports for TypeScript
export type DesignTokens = typeof designTokens
export type ColorScale = keyof typeof designTokens.colors.brand.primary
export type SemanticColor = keyof typeof designTokens.colors.semantic
export type StatusColor = keyof typeof designTokens.colors.status
