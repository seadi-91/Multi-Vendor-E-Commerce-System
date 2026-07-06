/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        forest: {
          50: '#F0F7F4',
          100: '#D9EFE6',
          200: '#B3DFCC',
          300: '#8CCFB3',
          400: '#66BF99',
          500: '#40AF80',
          600: '#0C5A30',
          700: '#0A4A28',
          800: '#083A20',
          900: '#062A18',
          950: '#041A10',
        },
        mint: {
          50: '#F0FDF9',
          100: '#CCFCE6',
          200: '#99F9D2',
          300: '#5BF6BE',
          400: '#2CE3A8',
          500: '#10B981',
          600: '#0D9A6C',
          700: '#0A7D57',
          800: '#076042',
          900: '#05432D',
          950: '#032218',
        },
        slate: {
          50: '#F4F7F6',
          100: '#E8EFE9',
          200: '#D4DFD3',
          300: '#B0C0B7',
          400: '#8CA09B',
          500: '#68807F',
          600: '#546666',
          700: '#404C4D',
          800: '#2C3334',
          900: '#181A1B',
          950: '#0C0D0E',
        },
      },
      animation: {
        'blob': 'blob 7s infinite',
        'fade-in-down': 'fadeInDown 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
}
