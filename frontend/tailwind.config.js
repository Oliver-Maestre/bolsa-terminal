/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0e1a',
          secondary: '#111827',
          tertiary: '#1a2235',
          card: '#0f1623',
        },
        border: {
          DEFAULT: '#1e2d45',
          light: '#243552',
        },
        text: {
          primary: '#e2e8f0',
          secondary: '#94a3b8',
          muted: '#475569',
        },
        accent: {
          DEFAULT: '#3b82f6',
          light: '#60a5fa',
          dark: '#2563eb',
        },
        green: {
          DEFAULT: '#22c55e',
          light: '#4ade80',
          dark: '#16a34a',
          dim: '#14532d',
        },
        red: {
          DEFAULT: '#ef4444',
          light: '#f87171',
          dark: '#dc2626',
          dim: '#7f1d1d',
        },
        orange: {
          DEFAULT: '#f97316',
          dim: '#7c2d12',
        },
        yellow: {
          DEFAULT: '#eab308',
          dim: '#713f12',
        },
        purple: {
          DEFAULT: '#a855f7',
          dim: '#581c87',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': '0.65rem',
        xs: '0.75rem',
      },
    },
  },
  plugins: [],
};
