/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        head: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        accent: { DEFAULT: '#6366f1', light: '#818cf8', dark: '#4f46e5' },
        surface: 'rgba(255,255,255,0.04)',
        nexo: { bg: '#050508', bg2: '#0a0a10', bg3: '#0f0f18' },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
};
