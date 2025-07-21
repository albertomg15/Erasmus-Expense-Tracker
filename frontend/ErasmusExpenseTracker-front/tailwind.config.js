/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"], // Asegúrate de incluir todos los archivos relevantes
  theme: {
    extend: {
      colors: {
        erasmus: {
          blue: "#0056B3",
          light: "#E6F0FA",
          green: "#10B981",
          red: "#EF4444",
        },
      },
    },
  },
  plugins: [],
};