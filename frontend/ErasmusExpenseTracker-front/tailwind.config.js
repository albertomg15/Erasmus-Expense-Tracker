/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
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