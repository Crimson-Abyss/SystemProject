/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // This scans all your component files
  ],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
};