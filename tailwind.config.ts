import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7C3AED',
        secondary: '#6366F1',
        accent: '#06B6D4',
        success: '#10B981',
        danger: '#F43F5E',
        glass: {
          light: 'rgba(255,255,255,0.7)',
          dark: 'rgba(15,23,42,0.7)',
        }
      },
      backdropBlur: { glass: '25px' },
      boxShadow: {
        glass: '0 8px 32px rgba(124,58,237,0.12)',
        glow: '0 0 20px rgba(124,58,237,0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      }
    },
  },
  plugins: [],
};
export default config;
