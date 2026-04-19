/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff8ff",
          100: "#dbefff",
          200: "#bbe0ff",
          300: "#86c7ff",
          400: "#48a7ff",
          500: "#1988ff",
          600: "#0a6de0",
          700: "#0d57b0",
          800: "#124c8f",
          900: "#164176"
        }
      },
      boxShadow: {
        game: "0 12px 30px rgba(0, 0, 0, 0.28)"
      }
    }
  },
  plugins: []
};
