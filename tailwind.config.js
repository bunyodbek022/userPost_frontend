/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",       // App Router
    "./pages/**/*.{js,ts,jsx,tsx}",     // pages papkasi bo‘lsa
    "./components/**/*.{js,ts,jsx,tsx}",// komponentlar
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
