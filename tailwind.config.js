/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          darkBg: '#0e1735',
          darkMedium: '#070b1a',
          darkDeep: '#020307',
        }
      }
    },
  },
  plugins: [],
}
