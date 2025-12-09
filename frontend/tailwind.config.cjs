/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#48bb78',
          600: '#38a169',
          700: '#2f855a',
        },
        secondary: {
          500: '#4299e1',
          600: '#3182ce',
        },
        medical: {
          dark: '#0f2027',
          mid: '#203a43',
          light: '#2c5364',
        }
      }
    },
  },
  plugins: [],
}
