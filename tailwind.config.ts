import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ---------------------------------------------------------------
        // CENTRO DE CONTROL — tema oscuro.
        //
        // Superficies frías y apagadas para que el único color saturado
        // de la pantalla sea el que comunica un estado. Si todo brilla,
        // nada destaca: la alerta tiene que ser lo más luminoso que hay.
        //
        // Contraste verificado: todo el texto >=4.5:1, la mayoría >=7:1.
        // ---------------------------------------------------------------
        base: {
          900: "#080D14", // fondo de la aplicación
          800: "#0F1720", // tarjeta / superficie
          700: "#16212D", // superficie elevada, hover
          600: "#1E2C3B", // superficie presionada
          500: "#243447", // borde sutil (decorativo)
          400: "#4E6C8F", // borde marcado (3.3:1, portador de significado)
        },
        // Texto sobre superficies oscuras
        ink: {
          DEFAULT: "#F1F6FA", // principal — 16.6:1
          muted: "#A8BDCF", // secundario — 9.3:1
          faint: "#8199AE", // terciario — 6.1:1
        },
        // Acento primario: cian. Es la "señal viva" del sistema.
        signal: {
          DEFAULT: "#22D3EE", // 10.0:1 sobre superficie
          dim: "#0E7490",
          deep: "#08131A", // texto sobre botón cian
        },
        // Estados. Cada uno tiene el tono luminoso (texto/icono) y un
        // fondo tenue del mismo matiz para las píldoras.
        ok: {
          DEFAULT: "#34D399", // 9.4:1
          bg: "#0C2A22",
        },
        warn: {
          DEFAULT: "#FBBF24", // 10.8:1
          bg: "#2E2410",
        },
        danger: {
          DEFAULT: "#FB7185", // 6.7:1 — para texto e iconos
          solid: "#B4232E", // 6.5:1 con blanco — para botones
          bg: "#2B1117",
        },
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        // En oscuro la elevación se lee por luz, no por sombra: cada
        // superficie lleva un filo superior claro de 1px.
        card: "inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 8px rgba(0,0,0,0.4)",
        raised:
          "inset 0 1px 0 rgba(255,255,255,0.07), 0 8px 28px rgba(0,0,0,0.55)",
        // Halos: el único uso de "glow", reservado a estados.
        "glow-signal": "0 0 0 1px rgba(34,211,238,0.35), 0 0 24px -6px rgba(34,211,238,0.5)",
        "glow-danger": "0 0 0 1px rgba(251,113,133,0.4), 0 0 28px -4px rgba(251,113,133,0.45)",
        "glow-ok": "0 0 0 1px rgba(52,211,153,0.3), 0 0 20px -8px rgba(52,211,153,0.4)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        // Los números de telemetría van en monoespaciada tabular: no
        // bailan al actualizarse y se comparan en columna.
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Escala elevada: el usuario objetivo es un cuidador que revisa
        // en movimiento. Nada por debajo de 13px.
        xs: ["0.8125rem", { lineHeight: "1.15rem" }],
        sm: ["0.9375rem", { lineHeight: "1.4rem" }],
        base: ["1.0625rem", { lineHeight: "1.6rem" }],
        lg: ["1.1875rem", { lineHeight: "1.75rem" }],
        xl: ["1.375rem", { lineHeight: "1.9rem" }],
        "2xl": ["1.75rem", { lineHeight: "2.15rem" }],
        "3xl": ["2.25rem", { lineHeight: "2.5rem" }],
        // Cifras de telemetría, grandes y ajustadas.
        "metric": ["2.75rem", { lineHeight: "1", letterSpacing: "-0.03em" }],
        "hero": ["3.5rem", { lineHeight: "1", letterSpacing: "-0.035em" }],
      },
      letterSpacing: {
        label: "0.14em",
      },
      transitionDuration: {
        DEFAULT: "180ms",
      },
    },
  },
  plugins: [],
};

export default config;
