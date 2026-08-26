import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta cálida y tranquilizadora
        // Base: azul-verde suave (confianza, calma)
        brand: {
          50: "#f0f7f9",
          100: "#d9ecf0",
          200: "#b8dce3",
          300: "#88c3ce",
          400: "#54a3b3",
          500: "#3a8798",
          600: "#336d7f",
          700: "#2f5a68",
          800: "#2d4b57",
          900: "#29404a",
        },
        // Acento cálido (calidez humana, no clínico)
        warm: {
          50: "#fdf6f0",
          100: "#fae8d9",
          200: "#f4ceb0",
          300: "#edac7d",
          400: "#e58a51",
          500: "#dd6f34",
        },
        // Estados
        calm: "#5b9e7d", // verde tranquilo (todo bien)
        alert: {
          DEFAULT: "#e05d44", // rojo-coral para emergencias (visible pero no estridente)
          bg: "#fdece8",
          dark: "#c0402c",
        },
        warning: "#e0a83a",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 2px 12px rgba(45, 75, 87, 0.06)",
        card: "0 1px 3px rgba(45, 75, 87, 0.08), 0 4px 16px rgba(45, 75, 87, 0.04)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
