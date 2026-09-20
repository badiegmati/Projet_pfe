/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark palette (comme l'image CRM)
        dark: {
          900: '#0D0D1A',
          800: '#12121F',
          700: '#1A1A2E',
          600: '#1E1E35',
          500: '#252540',
          400: '#2E2E50',
          300: '#3A3A60',
        },
        // Accents néon
        neon: {
          purple: '#A855F7',
          pink:   '#EC4899',
          cyan:   '#06B6D4',
          blue:   '#3B82F6',
          green:  '#10B981',
        },
        // Garder couleurs originales pour compatibilité
        primary: '#A855F7',
        danger:  '#EF4444',
        warning: '#F97316',
        caution: '#EAB308',
        success: '#10B981',
        surface: '#0D0D1A',
      },
      backgroundImage: {
        'gradient-neon':
          'linear-gradient(135deg, #A855F7, #EC4899)',
        'gradient-cyan':
          'linear-gradient(135deg, #06B6D4, #3B82F6)',
        'gradient-card':
          'linear-gradient(145deg, #1A1A2E, #12121F)',
        'gradient-aurora':
          'linear-gradient(135deg, #0D0D1A 0%, #1A0A2E 50%, #0A1A2E 100%)',
      },
      boxShadow: {
        'neon-purple': '0 0 20px rgba(168,85,247,0.4)',
        'neon-cyan':   '0 0 20px rgba(6,182,212,0.4)',
        'neon-pink':   '0 0 20px rgba(236,72,153,0.4)',
        'card-dark':   '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover':  '0 8px 40px rgba(168,85,247,0.2)',
        'glow-sm':     '0 0 10px rgba(168,85,247,0.3)',
      },
      animation: {
        'pulse-neon':   'pulse-neon 2s ease-in-out infinite',
        'slide-up':     'slide-up 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in':      'fade-in 0.4s ease-out forwards',
        'float':        'float 6s ease-in-out infinite',
        'shimmer-dark': 'shimmer-dark 2s infinite',
        'glow-pulse':   'glow-pulse 3s ease-in-out infinite',
        'spin-slow':    'spin-slow 8s linear infinite',
      },
      keyframes: {
        'pulse-neon': {
          '0%,100%': {
            boxShadow: '0 0 10px rgba(168,85,247,0.3)',
            opacity: 1
          },
          '50%': {
            boxShadow: '0 0 30px rgba(168,85,247,0.8)',
            opacity: 0.8
          },
        },
        'slide-up': {
          from: { opacity: 0, transform: 'translateY(24px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: 0 },
          to:   { opacity: 1 },
        },
        'float': {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-10px)' },
        },
        'shimmer-dark': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        'glow-pulse': {
          '0%,100%': { opacity: 0.6 },
          '50%':     { opacity: 1 },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}