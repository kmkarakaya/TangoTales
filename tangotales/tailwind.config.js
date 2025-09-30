/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        tango: {
          red: '#C41E3A',
          gold: '#FFD700',
          'dark-red': '#A11729',
          'light-red': '#E85D75'
        }
      }
    },
  },
  plugins: [],
}