/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7ff',
          100: '#d9edff',
          200: '#bce0ff',
          300: '#8ecdff',
          400: '#59b0ff',
          500: '#308cff',
          600: '#186cf5',
          700: '#1257e0',
          800: '#1547b5',
          900: '#173f8f',
          950: '#122756',
        },
      },
    },
  },
  plugins: [],
}
