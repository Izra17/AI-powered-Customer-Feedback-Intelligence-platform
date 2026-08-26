/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f7f4',
          100: '#e4ebe3',
          200: '#c8d6c6',
          300: '#a3bb9f',
          400: '#7a9c75',
          500: '#587f52',
          600: '#446540',
          700: '#375134',
          800: '#2e412c',
          900: '#273625',
          950: '#131d11',
        },
        ink: {
          50: '#f6f7f6',
          100: '#e2e5e1',
          200: '#c5cbc3',
          300: '#9fa89c',
          400: '#767f73',
          500: '#5b635a',
          600: '#474e46',
          700: '#3a403a',
          800: '#282c27',
          900: '#1a1c19',
          950: '#0f100e',
        },
        sand: {
          50: '#fbf9f6',
          100: '#f4efe7',
          200: '#e8ddcc',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(15, 16, 14, 0.04), 0 1px 6px -1px rgba(15, 16, 14, 0.06)',
        popover: '0 10px 40px -8px rgba(15, 16, 14, 0.18)',
      },
      borderRadius: {
        xl2: '1.15rem',
      },
    },
  },
  plugins: [],
}
