/**
 * FISCAL.MZ 2.0 - Tailwind Configuration
 * Linear-inspired Design System
 */

import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      /* --------------------------------------------------------------------------
         COLORS
         -------------------------------------------------------------------------- */
      colors: {
        /* Background scale */
        background: {
          primary: '#0F1115',
          secondary: '#161922',
          tertiary: '#1E2028',
          elevated: '#252830',
          overlay: 'rgba(15, 17, 21, 0.85)',
        },
        
        /* Accent colors */
        accent: {
          DEFAULT: '#5E6AD2',
          hover: '#4F5BC0',
          active: '#404CAD',
          secondary: '#8B5CF6',
          'secondary-hover': '#7C3AED',
        },
        
        /* Semantic colors */
        success: {
          DEFAULT: '#10B981',
          dim: 'rgba(16, 185, 129, 0.15)',
          glow: 'rgba(16, 185, 129, 0.4)',
        },
        warning: {
          DEFAULT: '#F59E0B',
          dim: 'rgba(245, 158, 11, 0.15)',
          glow: 'rgba(245, 158, 11, 0.4)',
        },
        error: {
          DEFAULT: '#EF4444',
          dim: 'rgba(239, 68, 68, 0.15)',
          glow: 'rgba(239, 68, 68, 0.4)',
        },
        info: {
          DEFAULT: '#3B82F6',
          dim: 'rgba(59, 130, 246, 0.15)',
        },
        
        /* Text colors */
        foreground: {
          primary: '#F7F8F8',
          secondary: '#8B949E',
          muted: '#6E7681',
          inverse: '#0F1115',
        },
        
        /* Border colors */
        border: {
          DEFAULT: '#2E3038',
          hover: '#3E4048',
          active: '#5E6AD2',
        },
      },
      
      /* --------------------------------------------------------------------------
         TYPOGRAPHY
         -------------------------------------------------------------------------- */
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'SF Mono', 'Consolas', 'monospace'],
      },
      
      fontSize: {
        'display': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
        'headline': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'title': ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['0.9375rem', { lineHeight: '1.5' }],
        'caption': ['0.8125rem', { lineHeight: '1.5', fontWeight: '500' }],
        'small': ['0.75rem', { lineHeight: '1.5' }],
      },
      
      /* --------------------------------------------------------------------------
         SPACING
         -------------------------------------------------------------------------- */
      spacing: {
        '0': '0',
        '1': '0.25rem',   // 4px
        '2': '0.5rem',    // 8px
        '3': '0.75rem',   // 12px
        '4': '1rem',      // 16px
        '5': '1.25rem',   // 20px
        '6': '1.5rem',    // 24px
        '8': '2rem',      // 32px
        '10': '2.5rem',   // 40px
        '12': '3rem',     // 48px
        '16': '4rem',     // 64px
        '20': '5rem',     // 80px
        'sidebar': '200px',
        'sidebar-collapsed': '64px',
        'header': '64px',
        'right-sidebar': '400px',
      },
      
      /* --------------------------------------------------------------------------
         BORDER RADIUS
         -------------------------------------------------------------------------- */
      borderRadius: {
        'sm': '0.375rem',   // 6px
        'md': '0.5rem',     // 8px
        'lg': '0.75rem',    // 12px
        'xl': '1rem',       // 16px
        '2xl': '1.25rem',   // 20px
        'full': '9999px',
      },
      
      /* --------------------------------------------------------------------------
         SHADOWS
         -------------------------------------------------------------------------- */
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.3)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
        'glow-accent': '0 0 20px rgba(94, 106, 210, 0.3)',
        'glow-success': '0 0 20px rgba(16, 185, 129, 0.3)',
        'glow-warning': '0 0 20px rgba(245, 158, 11, 0.3)',
        'glow-error': '0 0 20px rgba(239, 68, 68, 0.3)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.5)',
        'input-focus': '0 0 0 2px rgba(94, 106, 210, 0.3)',
      },
      
      /* --------------------------------------------------------------------------
         Z-INDEX
         -------------------------------------------------------------------------- */
      zIndex: {
        'hide': '-1',
        'dropdown': '100',
        'sticky': '200',
        'fixed': '300',
        'drawer': '400',
        'modal-backdrop': '500',
        'modal': '510',
        'popover': '600',
        'tooltip': '700',
        'toast': '800',
      },
      
      /* --------------------------------------------------------------------------
         TRANSITIONS & ANIMATIONS
         -------------------------------------------------------------------------- */
      transitionDuration: {
        'instant': '0ms',
        'fast': '150ms',
        'normal': '200ms',
        'slow': '300ms',
        'slower': '500ms',
      },
      
      transitionTimingFunction: {
        'linear': 'linear',
        'in': 'cubic-bezier(0.4, 0, 1, 1)',
        'out': 'cubic-bezier(0, 0, 0.2, 1)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      
      keyframes: {
        /* Fade animations */
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        
        /* Slide animations */
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        
        /* Scale animations */
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'scale-out': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        
        /* Pulse for loading/waiting states */
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        
        /* Shimmer for skeletons */
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        
        /* Glow pulse for success states */
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(16, 185, 129, 0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.6)' },
        },
        
        /* Bounce for attention */
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        
        /* Spin for loading */
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        
        /* Checkmark draw */
        'check-draw': {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        },
        
        /* Dot pulse for timeline */
        'dot-pulse': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.3)', opacity: '0.7' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'fade-out': 'fade-out 150ms ease-in',
        'slide-up': 'slide-up 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-down': 'slide-down 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-in-right': 'slide-in-right 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in': 'scale-in 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'scale-out': 'scale-out 150ms ease-in',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'bounce-soft': 'bounce-soft 2s ease-in-out infinite',
        'spin-slow': 'spin-slow 3s linear infinite',
        'check-draw': 'check-draw 400ms ease-out forwards',
        'dot-pulse': 'dot-pulse 2s ease-in-out infinite',
      },
      
      /* --------------------------------------------------------------------------
         BACKDROP BLUR
         -------------------------------------------------------------------------- */
      backdropBlur: {
        'xs': '2px',
      },
      
      /* --------------------------------------------------------------------------
         MAX WIDTH
         -------------------------------------------------------------------------- */
      maxWidth: {
        'content': '1440px',
      },
    },
  },
  
  /* --------------------------------------------------------------------------
     VARIANTS
     -------------------------------------------------------------------------- */
  variants: {
    extend: {
      backgroundColor: ['active', 'disabled'],
      textColor: ['active', 'disabled'],
      opacity: ['disabled'],
      cursor: ['disabled'],
      boxShadow: ['active'],
      transform: ['active', 'hover'],
      scale: ['active', 'hover'],
    },
  },
  
  /* --------------------------------------------------------------------------
     PLUGINS
     -------------------------------------------------------------------------- */
  plugins: [
    // Custom plugin for scrollbar styling
    function({ addUtilities }: { addUtilities: Function }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.text-balance': {
          'text-wrap': 'balance',
        },
      });
    },
  ],
};

export default config;
