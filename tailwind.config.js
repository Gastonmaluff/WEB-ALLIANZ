/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        md: "1.5rem",
        xl: "2rem",
      },
      screens: {
        "2xl": "1320px",
      },
    },
    extend: {
      colors: {
        surface: "#f5f4f1",
        paper: "#fefdf9",
        ink: "#0e1728",
        navy: "#14213d",
        slate: "#5f6878",
        stone: "#d6d9df",
        accent: "#111827",
      },
      fontFamily: {
        display: ["Cormorant Garamond", "serif"],
        body: ["Manrope", "sans-serif"],
      },
      boxShadow: {
        editorial: "0 24px 70px -35px rgba(14, 23, 40, 0.28)",
      },
      letterSpacing: {
        editorial: "0.12em",
      },
      backgroundImage: {
        "hero-fade":
          "linear-gradient(90deg, rgba(254, 253, 249, 0.95) 0%, rgba(254, 253, 249, 0.65) 45%, rgba(254, 253, 249, 0) 100%)",
      },
    },
  },
  plugins: [],
};
