/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        dark: {
          50: '#e8e8f0',
          100: '#c5c5d8',
          200: '#9595b4',
          300: '#6565909',
          400: '#454566',
          500: '#1a1a2e',
          600: '#16162a',
          700: '#121224',
          800: '#0e0e1e',
          900: '#0a0a18',
        },
        sidebar: {
          DEFAULT: '#0f0f1a',
          hover: '#1e1e35',
          active: '#252540',
          border: '#2a2a45',
        },
        accent: {
          DEFAULT: '#4f6ef7',
          hover: '#3d5ce5',
          light: '#7b94fa',
        },
        surface: {
          DEFAULT: '#1a1a2e',
          raised: '#1e1e35',
          border: '#2a2a45',
          muted: '#252540',
        },
        code: {
          bg: '#12121f',
          border: '#2a2a45',
          add: '#1a3320',
          remove: '#331a1a',
          addText: '#4ade80',
          removeText: '#f87171',
          lineNum: '#3d3d6b',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-in': 'slideIn 0.2s ease-out',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
    },
  },
  plugins: [],
}
