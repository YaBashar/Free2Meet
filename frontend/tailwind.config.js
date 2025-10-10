/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
            'white': '#FFFFFF',
            'ghost-white': '#ECEEF9',
            'lavender': '#D8DDF3',
            'vista-blue': '#8C99D9',
            'byzantine-blue': '#4055BF',
            'marian-blue': '#2D3C86',
            'delft-blue': '#202B60'
          }
    },
  },
  plugins: [],
}