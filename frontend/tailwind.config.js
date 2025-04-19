/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9e8',
          100: '#dcf0cb',
          200: '#bce299',
          300: '#97d067',
          400: '#75bb3f',
          500: '#5ca121',
          600: '#4a821b',
          700: '#3a6417',
          800: '#2e4d14',
          900: '#233a13',
          950: '#0f1f08',
        },
        secondary: {
          50: '#f5f8e9',
          100: '#eaf1d1',
          200: '#d7e4a7',
          300: '#c2d579',
          400: '#adc549',
          500: '#94a830',
          600: '#758625',
          700: '#5a681e',
          800: '#45511a',
          900: '#364017',
          950: '#1c230c',
        },
        earth: {
          50: '#f9f7f1',
          100: '#f1ece0',
          200: '#e4d8c0',
          300: '#d4bf99',
          400: '#c3a573',
          500: '#b38c54',
          600: '#a57347',
          700: '#875b3a',
          800: '#6f4a33',
          900: '#5c3f2d',
          950: '#302018',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
      },
      animation: {
        'grow-up': 'grow-up 0.8s ease-out forwards',
        'fade-in': 'fade-in 0.5s ease-out forwards',
      },
      keyframes: {
        'grow-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}